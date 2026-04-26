const { query, getConnection } = require('../../db');

const UNIT_SCALE = 1000;
const TAX_PERCENT = 5;
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 100;

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getItemMultiplier(saleType, quantity) {
  return saleType === 'variable' ? quantity / UNIT_SCALE : quantity;
}

function roundCurrency(value) {
  return Math.round(toNumber(value));
}

function buildOrderNumber() {
  const randomDigits = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0');
  return `O${randomDigits}`;
}

async function createUniqueOrderNumber(connection, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = buildOrderNumber();
    const existing = await connection.query(
      `SELECT id
       FROM orders
       WHERE order_number = ?
       FETCH FIRST 1 ROWS ONLY`,
      [candidate]
    );

    if (existing.length === 0) {
      return candidate;
    }
  }

  throw new Error('Failed to generate unique order number');
}

async function listOrdersByUser(userId) {
  const orders = await query(
    `SELECT id, order_number, status, subtotal, shipping, tax_rate, total_price,
            payment_method, notes, address_id, delivery_address_snapshot, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  if (orders.length === 0) {
    return [];
  }

  const items = await query(
    `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase,
            p.name AS product_name, p.image, p.sale_type, p.unit, p.unit_weight
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = ?
     ORDER BY oi.order_id ASC`,
    [userId]
  );

  const itemsByOrder = new Map();
  for (const item of items) {
    const list = itemsByOrder.get(item.order_id) || [];
    list.push({
      productId: item.product_id,
      productName: item.product_name,
      quantity: toNumber(item.quantity),
      priceAtPurchase: toNumber(item.price_at_purchase),
      saleType: item.sale_type,
      unit: item.unit,
      unitWeight: item.unit_weight !== null ? toNumber(item.unit_weight) : null,
      image: item.image,
    });
    itemsByOrder.set(item.order_id, list);
  }

  return orders.map((order) => {
    let addressSnapshot = null;
    if (order.delivery_address_snapshot) {
      try {
        addressSnapshot = JSON.parse(order.delivery_address_snapshot);
      } catch (_error) {
        addressSnapshot = order.delivery_address_snapshot;
      }
    }

    const itemList = itemsByOrder.get(order.id) || [];
    const taxes = roundCurrency(toNumber(order.subtotal) * (toNumber(order.tax_rate) / 100));

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      subtotal: toNumber(order.subtotal),
      shipping: toNumber(order.shipping),
      taxes,
      total: toNumber(order.total_price),
      paymentMethod: order.payment_method,
      notes: order.notes,
      addressId: order.address_id,
      addressSnapshot,
      createdAt: order.created_at,
      items: itemList,
      itemCount: itemList.length,
    };
  });
}

async function placeOrderForUser(userId, addressId, paymentMethod, notes) {
  const connection = await getConnection();

  try {
    const addresses = await connection.query(
      `SELECT id, label, type, address, city, province, postal_code,
              phone_number, delivery_instructions, latitude, longitude, is_default
       FROM addresses
       WHERE id = ? AND user_id = ?
       FETCH FIRST 1 ROWS ONLY`,
      [addressId, userId]
    );

    if (addresses.length === 0) {
      return { error: { code: 404, message: 'Selected address was not found' } };
    }

    const cartItems = await connection.query(
      `SELECT ci.product_id, ci.quantity,
              p.name, p.price, p.image, p.sale_type, p.unit, p.unit_weight, p.is_active
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at ASC`,
      [userId]
    );

    if (cartItems.length === 0) {
      return { error: { code: 400, message: 'Cart is empty. Add products before checkout.' } };
    }

    const inactiveItem = cartItems.find((item) => item.is_active !== 'true');
    if (inactiveItem) {
      return { error: { code: 400, message: 'Cart contains inactive products. Please refresh your cart.' } };
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const quantity = toNumber(item.quantity);
      const price = toNumber(item.price);
      return sum + (getItemMultiplier(item.sale_type, quantity) * price);
    }, 0);

    const roundedSubtotal = roundCurrency(subtotal);
    const shipping = roundedSubtotal === 0 || roundedSubtotal > FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING;
    const taxRatePercent = TAX_PERCENT;
    const taxes = roundCurrency((roundedSubtotal * TAX_PERCENT) / 100);
    const total = roundCurrency(roundedSubtotal + shipping + taxes);

    const addressSnapshot = {
      id: addresses[0].id,
      label: addresses[0].label,
      type: addresses[0].type,
      address: addresses[0].address,
      city: addresses[0].city,
      province: addresses[0].province,
      postalCode: addresses[0].postal_code,
      phoneNumber: addresses[0].phone_number,
      deliveryInstructions: addresses[0].delivery_instructions,
      latitude: addresses[0].latitude,
      longitude: addresses[0].longitude,
      isDefault: addresses[0].is_default === 'true',
    };

    const orderNumber = await createUniqueOrderNumber(connection);

    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO orders
       (user_id, order_number, status, subtotal, shipping, tax_rate, total_price, payment_method, notes, address_id, delivery_address_snapshot)
       VALUES (?, ?, 'placed', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        roundedSubtotal,
        shipping,
        taxRatePercent,
        total,
        paymentMethod || null,
        notes || null,
        addressId,
        JSON.stringify(addressSnapshot),
      ]
    );

    const createdOrders = await connection.query(
      `SELECT id, order_number, status, subtotal, shipping, tax_rate, total_price, payment_method, notes, created_at
       FROM orders
       WHERE order_number = ?
       FETCH FIRST 1 ROWS ONLY`,
      [orderNumber]
    );

    const createdOrder = createdOrders[0];

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [
          createdOrder.id,
          item.product_id,
          toNumber(item.quantity),
          toNumber(item.price),
        ]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await connection.commit();

    return {
      data: {
        id: createdOrder.id,
        orderNumber: createdOrder.order_number,
        status: createdOrder.status,
        subtotal: toNumber(createdOrder.subtotal),
        shipping: toNumber(createdOrder.shipping),
        taxes,
        total: toNumber(createdOrder.total_price),
        paymentMethod: createdOrder.payment_method,
        notes: createdOrder.notes,
        createdAt: createdOrder.created_at,
      },
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function transitionOrderStatuses() {
  // Run transitions in reverse direction so each order advances at most one stage per tick.
  const toArrived = await query(
    "UPDATE orders SET status = 'arrived' WHERE status = 'enroute'"
  );
  const toEnroute = await query(
    "UPDATE orders SET status = 'enroute' WHERE status = 'packaged'"
  );
  const toPackaged = await query(
    "UPDATE orders SET status = 'packaged' WHERE status = 'placed'"
  );

  return {
    placedToPackaged: toPackaged.affectedRows || 0,
    packagedToEnroute: toEnroute.affectedRows || 0,
    enrouteToArrived: toArrived.affectedRows || 0,
  };
}

module.exports = {
  listOrdersByUser,
  placeOrderForUser,
  transitionOrderStatuses,
};
