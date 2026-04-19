const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MOCK_USER_COUNT = 60;
const MOCK_PRODUCT_COUNT = 120;
const MIN_ORDERS_PER_USER = 3;
const MAX_ORDERS_PER_USER = 10;
const MOCK_CART_USERS = 20;
const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 5.99;
const UNIT_SCALE = 1000;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function pickOne(list) {
  return list[randomInt(0, list.length - 1)];
}

function pickManyUnique(list, count) {
  const unique = new Set();
  while (unique.size < count && unique.size < list.length) {
    unique.add(pickOne(list));
  }
  return [...unique];
}

function buildMockProducts() {
  const adjectives = ['Golden', 'Fresh', 'Artisan', 'Pure', 'Wild', 'Prime', 'Daily', 'Classic', 'Velvet', 'Royal'];
  const nouns = ['Olive Oil', 'Granola Mix', 'Cheddar Cubes', 'Herbal Tea', 'Protein Bites', 'Rice Bowl', 'Honey Jar', 'Nut Butter', 'Berry Mix', 'Sea Salt'];
  const tagPool = ['Organic', 'Premium', 'Fresh', 'Keto', 'Sugar-Free', 'Local', 'Vegan', 'Protein Rich', 'Daily Use'];

  const products = [];

  for (let i = 1; i <= MOCK_PRODUCT_COUNT; i += 1) {
    const id = `mprod-${String(i).padStart(3, '0')}`;
    const name = `${pickOne(adjectives)} ${pickOne(nouns)}`;
    const saleType = i % 5 === 0 ? 'variable' : 'fixed';
    const unit = saleType === 'variable' ? (i % 2 === 0 ? 'kg' : 'L') : 'g';
    const unitWeight = saleType === 'fixed' ? pickOne([100, 250, 500, 750]) : null;
    const tags = pickManyUnique(tagPool, randomInt(2, 4));

    products.push({
      id,
      name,
      description: `Mock catalog item ${i} for performance and pagination testing`,
      price: randomFloat(2.5, 95),
      image: `https://picsum.photos/seed/${id}/640/640`,
      calories: randomInt(20, 650),
      saleType,
      unit,
      unitWeight,
      recommended: i % 7 === 0,
      tags,
    });
  }

  return products;
}

function buildOrderNumber(orderId) {
  return `MK-${String(orderId).padStart(8, '0')}`;
}

function getMultiplier(saleType, quantity) {
  return saleType === 'variable' ? quantity / UNIT_SCALE : quantity;
}

async function ensureBaseSeed(connection) {
  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  await connection.query(seedSql);
}

async function seedLarge() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await ensureBaseSeed(connection);
    await connection.query(`USE ${process.env.DB_NAME || 'grocery_app'}`);

    const mockProducts = buildMockProducts();

    for (const product of mockProducts) {
      await connection.query(
        `INSERT INTO products
         (id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           price = VALUES(price),
           image = VALUES(image),
           calories = VALUES(calories),
           sale_type = VALUES(sale_type),
           unit = VALUES(unit),
           unit_weight = VALUES(unit_weight),
           recommended = VALUES(recommended),
           tags = VALUES(tags)`,
        [
          product.id,
          product.name,
          product.description,
          product.price,
          product.image,
          product.calories,
          product.saleType,
          product.unit,
          product.unitWeight,
          product.recommended ? 1 : 0,
          JSON.stringify(product.tags),
        ]
      );
    }

    const [categories] = await connection.query('SELECT id FROM categories ORDER BY id ASC');
    const categoryIds = categories.map((c) => c.id);

    await connection.query("DELETE FROM product_categories WHERE product_id LIKE 'mprod-%'");

    for (const product of mockProducts) {
      const assignmentCount = randomInt(1, Math.min(3, categoryIds.length));
      const assignedCategoryIds = pickManyUnique(categoryIds, assignmentCount);

      for (const categoryId of assignedCategoryIds) {
        await connection.query(
          `INSERT INTO product_categories (product_id, category_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)`,
          [product.id, categoryId]
        );
      }
    }

    const mockUsers = [];
    for (let i = 1; i <= MOCK_USER_COUNT; i += 1) {
      const firstName = `Mock${i}`;
      const lastName = 'User';
      const email = `mockuser${String(i).padStart(3, '0')}@cartzen.test`;

      await connection.query(
        `INSERT INTO users (first_name, last_name, email, password, role)
         VALUES (?, ?, ?, ?, 'customer')
         ON DUPLICATE KEY UPDATE
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           password = VALUES(password),
           role = VALUES(role)`,
        [firstName, lastName, email, 'password123']
      );

      mockUsers.push(email);
    }

    const [users] = await connection.query(
      'SELECT id, email FROM users WHERE email LIKE ? ORDER BY id ASC',
      ['mockuser%@cartzen.test']
    );

    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) {
      throw new Error('No mock users were created');
    }

    await connection.query('DELETE FROM cart_items WHERE user_id IN (?)', [userIds]);
    await connection.query('DELETE FROM orders WHERE user_id IN (?)', [userIds]);
    await connection.query('DELETE FROM addresses WHERE user_id IN (?)', [userIds]);

    const cityPool = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad'];
    const provincePool = ['Sindh', 'Punjab', 'Punjab', 'KPK'];

    for (const userId of userIds) {
      for (let i = 0; i < 2; i += 1) {
        const city = cityPool[i % cityPool.length];
        const province = provincePool[i % provincePool.length];

        await connection.query(
          `INSERT INTO addresses
           (user_id, label, street_address, city, province, postal_code, phone_number, delivery_instructions, country, latitude, longitude, is_default)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pakistan', ?, ?, ?)`,
          [
            userId,
            i === 0 ? 'Home' : 'Office',
            `${100 + userId + i} Mock Street`,
            city,
            province,
            `${75000 + ((userId + i) % 999)}`,
            `+92300${String(userId).padStart(7, '0')}`,
            i === 0 ? 'Ring bell once' : 'Leave at reception',
            Number((24.85 + Math.random() * 0.05).toFixed(8)),
            Number((67.00 + Math.random() * 0.05).toFixed(8)),
            i === 0 ? 1 : 0,
          ]
        );
      }
    }

    const [addressRows] = await connection.query(
      'SELECT id, user_id FROM addresses WHERE user_id IN (?) ORDER BY id ASC',
      [userIds]
    );

    const addressByUser = new Map();
    for (const row of addressRows) {
      const list = addressByUser.get(row.user_id) || [];
      list.push(row.id);
      addressByUser.set(row.user_id, list);
    }

    const [allProducts] = await connection.query(
      'SELECT id, name, price, sale_type, unit, unit_weight, image FROM products ORDER BY id ASC'
    );

    await connection.beginTransaction();

    let totalOrdersCreated = 0;
    let totalOrderItemsCreated = 0;

    for (const userId of userIds) {
      const orderCount = randomInt(MIN_ORDERS_PER_USER, MAX_ORDERS_PER_USER);
      const addressesForUser = addressByUser.get(userId) || [];
      const selectedAddressId = addressesForUser[0] || null;

      for (let i = 0; i < orderCount; i += 1) {
        const itemCount = randomInt(1, 6);
        const pickedProducts = pickManyUnique(allProducts, itemCount);

        let subtotal = 0;
        const computedItems = [];

        for (const product of pickedProducts) {
          let quantity;
          if (product.sale_type === 'variable') {
            quantity = pickOne([250, 500, 750, 1000, 1250, 1500]);
          } else {
            quantity = randomInt(1, 5);
          }

          const lineTotal = Number((getMultiplier(product.sale_type, quantity) * Number(product.price)).toFixed(2));
          subtotal += lineTotal;

          computedItems.push({
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: Number(product.price),
            lineTotal,
            saleType: product.sale_type,
            unit: product.unit,
            unitWeight: product.unit_weight,
            image: product.image,
          });
        }

        subtotal = Number(subtotal.toFixed(2));
        const shipping = subtotal === 0 || subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
        const taxes = Number((subtotal * TAX_RATE).toFixed(2));
        const total = Number((subtotal + shipping + taxes).toFixed(2));

        const status = pickOne(['placed', 'in-transit', 'delivered', 'cancelled']);
        const paymentMethod = pickOne(['cash', 'card', 'wallet']);

        const [orderResult] = await connection.query(
          `INSERT INTO orders
           (user_id, order_number, status, subtotal, shipping, taxes, total, payment_method, delivery_notes, address_snapshot)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            `TMP-${userId}-${i}`,
            status,
            subtotal,
            shipping,
            taxes,
            total,
            paymentMethod,
            'Generated by large seed dataset',
            JSON.stringify({
              addressId: selectedAddressId,
              label: selectedAddressId ? 'Home' : null,
            }),
          ]
        );

        const orderId = orderResult.insertId;
        await connection.query('UPDATE orders SET order_number = ? WHERE id = ?', [buildOrderNumber(orderId), orderId]);

        for (const item of computedItems) {
          await connection.query(
            `INSERT INTO order_items
             (order_id, product_id, product_name, quantity, unit_price, line_total, sale_type, unit, unit_weight, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              item.productId,
              item.productName,
              item.quantity,
              item.unitPrice,
              item.lineTotal,
              item.saleType,
              item.unit,
              item.unitWeight,
              item.image,
            ]
          );

          totalOrderItemsCreated += 1;
        }

        totalOrdersCreated += 1;
      }
    }

    await connection.commit();

    const cartUsers = pickManyUnique(userIds, Math.min(MOCK_CART_USERS, userIds.length));
    let cartItemsCreated = 0;

    for (const userId of cartUsers) {
      const cartItemCount = randomInt(1, 4);
      const pickedProducts = pickManyUnique(allProducts, cartItemCount);

      for (const product of pickedProducts) {
        const quantity = product.sale_type === 'variable'
          ? pickOne([250, 500, 1000, 1500])
          : randomInt(1, 3);

        await connection.query(
          `INSERT INTO cart_items (user_id, product_id, quantity)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
          [userId, product.id, quantity]
        );

        cartItemsCreated += 1;
      }
    }

    console.log('Large database seed completed successfully');
    console.log(`- Mock users: ${userIds.length}`);
    console.log(`- Mock products: ${mockProducts.length}`);
    console.log(`- Orders created: ${totalOrdersCreated}`);
    console.log(`- Order items created: ${totalOrderItemsCreated}`);
    console.log(`- Cart items created: ${cartItemsCreated}`);
    console.log('Test login credentials for mock users: password = password123');
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
      // Ignore rollback errors.
    }
    throw error;
  } finally {
    await connection.end();
  }
}

seedLarge().catch((error) => {
  console.error('Large seed failed:', error.message);
  process.exit(1);
});
