const { getConnection } = require('../../db');

const UNIT_SCALE = 1000;
const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 5.99;

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(status) {
  const supported = new Set(['placed', 'in-transit', 'delivered', 'cancelled']);
  return supported.has(status) ? status : 'placed';
}

function buildOrderNumber(orderId) {
  const base = String(orderId).padStart(4, '0');
  return `CZ-${base}`;
}

function getItemMultiplier(saleType, quantity) {
  return saleType === 'variable' ? quantity / UNIT_SCALE : quantity;
}

exports.listOrders = async (req, res, next) => {
  const connection = await getConnection();

  try {
    const userId = req.auth.userId;

    const [orders] = await connection.query(
      `SELECT id, order_number, status, subtotal, shipping, taxes, total,
              payment_method, delivery_notes, address_snapshot, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      res.json({ orders: [] });
      return;
    }

    const orderIds = orders.map((order) => order.id);
    const [items] = await connection.query(
      `SELECT id, order_id, product_id, product_name, quantity, unit_price, line_total,
              sale_type, unit, unit_weight, image
       FROM order_items
       WHERE order_id IN (?)
       ORDER BY id ASC`,
      [orderIds]
    );

    const itemsByOrderId = items.reduce((accumulator, item) => {
      const list = accumulator.get(item.order_id) || [];
      list.push({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: toNumber(item.quantity),
        unitPrice: toNumber(item.unit_price),
        lineTotal: toNumber(item.line_total),
        saleType: item.sale_type,
        unit: item.unit,
        unitWeight: item.unit_weight !== null ? toNumber(item.unit_weight) : null,
        image: item.image,
      });
      accumulator.set(item.order_id, list);
      return accumulator;
    }, new Map());

    const payload = orders.map((order) => {
      let addressSnapshot = null;
      if (order.address_snapshot) {
        if (typeof order.address_snapshot === 'string') {
          try {
            addressSnapshot = JSON.parse(order.address_snapshot);
          } catch (_error) {
            addressSnapshot = null;
          }
        } else {
          addressSnapshot = order.address_snapshot;
        }
      }

      const orderItems = itemsByOrderId.get(order.id) || [];
      const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: order.id,
        orderNumber: order.order_number,
        status: normalizeStatus(order.status),
        subtotal: toNumber(order.subtotal),
        shipping: toNumber(order.shipping),
        taxes: toNumber(order.taxes),
        total: toNumber(order.total),
        paymentMethod: order.payment_method,
        deliveryNotes: order.delivery_notes,
        addressSnapshot,
        createdAt: order.created_at,
        itemCount,
        items: orderItems,
      };
    });

    res.json({ orders: payload });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

exports.placeOrder = async (req, res, next) => {
  const connection = await getConnection();

  try {
    const userId = req.auth.userId;
    const { addressId, paymentMethod, deliveryNotes } = req.body;

    if (!addressId) {
      res.status(400).json({ message: 'Address is required to place an order' });
      return;
    }

    const [addresses] = await connection.query(
      `SELECT id, label, street_address, city, province, postal_code,
              phone_number, delivery_instructions, country, latitude, longitude, is_default
       FROM addresses
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [addressId, userId]
    );

    if (addresses.length === 0) {
      res.status(404).json({ message: 'Selected address was not found' });
      return;
    }

    const [cartItems] = await connection.query(
      `SELECT ci.product_id, ci.quantity,
              p.name, p.price, p.image, p.sale_type, p.unit, p.unit_weight
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at ASC`,
      [userId]
    );

    if (cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty. Add products before checkout.' });
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const quantity = toNumber(item.quantity);
      const price = toNumber(item.price);
      const multiplier = getItemMultiplier(item.sale_type, quantity);
      return sum + (multiplier * price);
    }, 0);

    const roundedSubtotal = Number(subtotal.toFixed(2));
    const shipping = roundedSubtotal === 0 || roundedSubtotal > FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING;
    const taxes = Number((roundedSubtotal * TAX_RATE).toFixed(2));
    const total = Number((roundedSubtotal + shipping + taxes).toFixed(2));

    const addressSnapshot = {
      id: addresses[0].id,
      label: addresses[0].label,
      streetAddress: addresses[0].street_address,
      city: addresses[0].city,
      province: addresses[0].province,
      postalCode: addresses[0].postal_code,
      phoneNumber: addresses[0].phone_number,
      deliveryInstructions: addresses[0].delivery_instructions,
      country: addresses[0].country,
      latitude: addresses[0].latitude,
      longitude: addresses[0].longitude,
      isDefault: Boolean(addresses[0].is_default),
    };

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (user_id, order_number, status, subtotal, shipping, taxes, total, payment_method, delivery_notes, address_snapshot)
       VALUES (?, ?, 'placed', ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'TEMP',
        roundedSubtotal,
        shipping,
        taxes,
        total,
        paymentMethod || null,
        deliveryNotes || null,
        JSON.stringify(addressSnapshot),
      ]
    );

    const orderId = orderResult.insertId;
    const orderNumber = buildOrderNumber(orderId);

    await connection.query('UPDATE orders SET order_number = ? WHERE id = ?', [orderNumber, orderId]);

    for (const item of cartItems) {
      const quantity = toNumber(item.quantity);
      const unitPrice = toNumber(item.price);
      const lineTotal = Number((getItemMultiplier(item.sale_type, quantity) * unitPrice).toFixed(2));

      await connection.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, quantity, unit_price, line_total, sale_type, unit, unit_weight, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.name,
          quantity,
          unitPrice,
          lineTotal,
          item.sale_type,
          item.unit,
          item.unit_weight,
          item.image,
        ]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await connection.commit();

    res.status(201).json({
      id: orderId,
      orderNumber,
      status: 'placed',
      subtotal: roundedSubtotal,
      shipping,
      taxes,
      total,
      paymentMethod: paymentMethod || null,
      deliveryNotes: deliveryNotes || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
      // Ignore rollback errors and return original failure.
    }
    next(error);
  } finally {
    connection.release();
  }
};
