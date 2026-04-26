const path = require('path');
const dotenv = require('dotenv');
const { execFileSync } = require('child_process');
const { query, closeDb } = require('../db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const users = [
  {
    firstName: 'Admin',
    lastName: 'Owner',
    email: 'admin@grocery.local',
    password: 'admin123',
    role: 'admin',
    createdDaysAgo: 40,
  },
  {
    firstName: 'Ayan',
    lastName: 'Khan',
    email: 'ayan@grocery.local',
    password: 'password123',
    role: 'customer',
    createdDaysAgo: 28,
  },
  {
    firstName: 'Sara',
    lastName: 'Ali',
    email: 'sara@grocery.local',
    password: 'password123',
    role: 'customer',
    createdDaysAgo: 24,
  },
  {
    firstName: 'Hamza',
    lastName: 'Iqbal',
    email: 'hamza@grocery.local',
    password: 'password123',
    role: 'customer',
    createdDaysAgo: 16,
  },
  {
    firstName: 'Noor',
    lastName: 'Fatima',
    email: 'noor@grocery.local',
    password: 'password123',
    role: 'customer',
    createdDaysAgo: 10,
  },
  {
    firstName: 'Umer',
    lastName: 'Raza',
    email: 'umer@grocery.local',
    password: 'password123',
    role: 'customer',
    createdDaysAgo: 4,
  },
];

const categories = [
  'Fresh Produce',
  'Bakery',
  'Dairy',
  'Pantry',
  'Frozen',
  'Beverages',
  'Protein',
  'Snacks',
];

const products = [
  {
    id: 'prd-avocado',
    name: 'Hass Avocado Pack',
    description: 'Fresh Hass avocados, rich and creamy.',
    price: 420,
    image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=1200&q=80',
    calories: 160,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 500,
    recommended: 'true',
    isActive: 'true',
    categories: ['Fresh Produce'],
  },
  {
    id: 'prd-bread',
    name: 'Rustic Sourdough',
    description: 'Stone-baked sourdough loaf.',
    price: 350,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    calories: 280,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 700,
    recommended: 'true',
    isActive: 'true',
    categories: ['Bakery'],
  },
  {
    id: 'prd-milk',
    name: 'Fresh Cow Milk',
    description: 'Farm fresh full cream milk.',
    price: 260,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    calories: 65,
    saleType: 'fixed',
    unit: 'l',
    unitWeight: 1,
    recommended: 'false',
    isActive: 'true',
    categories: ['Dairy', 'Beverages'],
  },
  {
    id: 'prd-rice',
    name: 'Premium Basmati Rice',
    description: 'Long grain aromatic rice.',
    price: 540,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
    calories: 130,
    saleType: 'fixed',
    unit: 'kg',
    unitWeight: 1,
    recommended: 'false',
    isActive: 'true',
    categories: ['Pantry'],
  },
  {
    id: 'prd-chicken',
    name: 'Boneless Chicken',
    description: 'Clean cut boneless chicken breast.',
    price: 890,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=80',
    calories: 165,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    recommended: 'true',
    isActive: 'true',
    categories: ['Protein'],
  },
  {
    id: 'prd-salmon',
    name: 'Atlantic Salmon Fillet',
    description: 'Fresh premium salmon cut.',
    price: 1680,
    image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=1200&q=80',
    calories: 208,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    recommended: 'true',
    isActive: 'true',
    categories: ['Protein'],
  },
  {
    id: 'prd-fries',
    name: 'Crispy Frozen Fries',
    description: 'Golden crispy fries ready to cook.',
    price: 430,
    image: 'https://images.unsplash.com/photo-1553787499-6f913324e47f?auto=format&fit=crop&w=1200&q=80',
    calories: 312,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 750,
    recommended: 'false',
    isActive: 'true',
    categories: ['Frozen', 'Snacks'],
  },
  {
    id: 'prd-orange-ju',
    name: 'Orange Juice',
    description: 'No sugar added juice blend.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=1200&q=80',
    calories: 90,
    saleType: 'fixed',
    unit: 'l',
    unitWeight: 1,
    recommended: 'false',
    isActive: 'true',
    categories: ['Beverages'],
  },
  {
    id: 'prd-almonds',
    name: 'Roasted Almonds',
    description: 'Dry roasted premium almonds.',
    price: 700,
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=80',
    calories: 579,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 400,
    recommended: 'true',
    isActive: 'true',
    categories: ['Snacks', 'Pantry'],
  },
  {
    id: 'prd-tomato',
    name: 'Vine Tomatoes',
    description: 'Fresh vine-ripened tomatoes.',
    price: 240,
    image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=1200&q=80',
    calories: 18,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    recommended: 'false',
    isActive: 'true',
    categories: ['Fresh Produce'],
  },
  {
    id: 'prd-cinnamon',
    name: 'Cinnamon Roll',
    description: 'Soft baked cinnamon swirl pastry.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1541782814458-d1f5b9f6f3f5?auto=format&fit=crop&w=1200&q=80',
    calories: 310,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 120,
    recommended: 'false',
    isActive: 'false',
    categories: ['Bakery'],
  },
  {
    id: 'prd-test-uncategor',
    name: 'Testing Product No Category',
    description: 'Seeded to validate optional category behavior in admin add flow.',
    price: 275,
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=1200&q=80',
    calories: 120,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 250,
    recommended: 'false',
    isActive: 'true',
    categories: [],
  },
];

const orderSeeds = [
  {
    email: 'ayan@grocery.local',
    orderNumber: 'O900000001',
    status: 'placed',
    subtotal: 1310,
    shipping: 0,
    taxRate: 5,
    total: 1376,
    paymentMethod: 'cash',
    notes: 'Ring bell once',
    addressLabel: 'Home',
    daysAgo: 9,
    items: [
      { productId: 'prd-avocado', quantity: 1, price: 420 },
      { productId: 'prd-milk', quantity: 1, price: 260 },
      { productId: 'prd-rice', quantity: 1, price: 540 },
      { productId: 'prd-cinnamon', quantity: 1, price: 180 },
    ],
  },
  {
    email: 'sara@grocery.local',
    orderNumber: 'O900000002',
    status: 'packaged',
    subtotal: 1850,
    shipping: 0,
    taxRate: 5,
    total: 1943,
    paymentMethod: 'card',
    notes: 'Leave at reception',
    addressLabel: 'Work',
    daysAgo: 8,
    items: [
      { productId: 'prd-chicken', quantity: 1, price: 890 },
      { productId: 'prd-fries', quantity: 1, price: 430 },
      { productId: 'prd-orange-ju', quantity: 1, price: 320 },
      { productId: 'prd-almonds', quantity: 1, price: 700 },
    ],
  },
  {
    email: 'hamza@grocery.local',
    orderNumber: 'O900000003',
    status: 'enroute',
    subtotal: 1160,
    shipping: 0,
    taxRate: 5,
    total: 1218,
    paymentMethod: 'digital',
    notes: 'Call on arrival',
    addressLabel: 'Home',
    daysAgo: 6,
    items: [
      { productId: 'prd-tomato', quantity: 2, price: 240 },
      { productId: 'prd-bread', quantity: 1, price: 350 },
      { productId: 'prd-milk', quantity: 1, price: 260 },
      { productId: 'prd-avocado', quantity: 1, price: 420 },
    ],
  },
  {
    email: 'noor@grocery.local',
    orderNumber: 'O900000004',
    status: 'arrived',
    subtotal: 2000,
    shipping: 0,
    taxRate: 5,
    total: 2100,
    paymentMethod: 'cash',
    notes: 'No plastic bag needed',
    addressLabel: 'Apartment',
    daysAgo: 4,
    items: [
      { productId: 'prd-salmon', quantity: 1, price: 1680 },
      { productId: 'prd-orange-ju', quantity: 1, price: 320 },
    ],
  },
  {
    email: 'umer@grocery.local',
    orderNumber: 'O900000005',
    status: 'arrived',
    subtotal: 695,
    shipping: 0,
    taxRate: 5,
    total: 730,
    paymentMethod: 'card',
    notes: 'Deliver before 8 PM',
    addressLabel: 'Home',
    daysAgo: 2,
    items: [
      { productId: 'prd-bread', quantity: 1, price: 350 },
      { productId: 'prd-test-uncategor', quantity: 1, price: 275 },
    ],
  },
  {
    email: 'ayan@grocery.local',
    orderNumber: 'O900000006',
    status: 'placed',
    subtotal: 320,
    shipping: 100,
    taxRate: 5,
    total: 436,
    paymentMethod: 'digital',
    notes: 'Small order for testing shipping threshold',
    addressLabel: 'Home',
    daysAgo: 1,
    items: [
      { productId: 'prd-orange-ju', quantity: 1, price: 320 },
    ],
  },
];

const cartSeeds = [
  { email: 'sara@grocery.local', productId: 'prd-rice', quantity: 1 },
  { email: 'hamza@grocery.local', productId: 'prd-orange-ju', quantity: 1 },
  { email: 'hamza@grocery.local', productId: 'prd-tomato', quantity: 2 },
];

function toMapBy(rows, keyName) {
  const output = new Map();
  rows.forEach((row) => output.set(row[keyName], row));
  return output;
}

async function clearData() {
  await query('DELETE FROM product_categories');
  await query('DELETE FROM order_items');
  await query('DELETE FROM orders');
  await query('DELETE FROM cart_items');
  await query('DELETE FROM addresses');
  await query('DELETE FROM products');
  await query('DELETE FROM categories');
  await query('DELETE FROM users');
}

async function seedUsers() {
  for (const user of users) {
    await query(
      `INSERT INTO users
       (first_name, last_name, email, password, role, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 'true', SYSTIMESTAMP - NUMTODSINTERVAL(?, 'DAY'))`,
      [user.firstName, user.lastName, user.email, user.password, user.role, user.createdDaysAgo]
    );
  }

  const rows = await query('SELECT id, email FROM users');
  return toMapBy(rows, 'email');
}

async function seedCategories() {
  for (const name of categories) {
    await query('INSERT INTO categories (name) VALUES (?)', [name]);
  }

  const rows = await query('SELECT id, name FROM categories');
  return toMapBy(rows, 'name');
}

async function seedProducts(categoryMap) {
  for (const product of products) {
    await query(
      `INSERT INTO products
       (id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        product.recommended,
        product.isActive,
      ]
    );

    for (const categoryName of product.categories) {
      const categoryId = categoryMap.get(categoryName)?.id;
      if (!categoryId) {
        throw new Error(`Unknown category referenced by seed product: ${categoryName}`);
      }
      await query(
        'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
        [product.id, categoryId]
      );
    }
  }
}

async function seedAddresses(userMap) {
  await query(
    `INSERT INTO addresses
     (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
     VALUES (?, 'Home', 'home', 'House 14, Street 6', 'Karachi', 'Sindh', '75400', '+92-300-1000001', 'Gate code 3312', 24.9011, 67.0892, 'true')`,
    [userMap.get('ayan@grocery.local').id]
  );

  await query(
    `INSERT INTO addresses
     (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
     VALUES (?, 'Work', 'work', 'Shahrah-e-Faisal Block C', 'Karachi', 'Sindh', '75530', '+92-300-1000002', 'Drop at front desk', 24.8656, 67.0732, 'true')`,
    [userMap.get('sara@grocery.local').id]
  );

  await query(
    `INSERT INTO addresses
     (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
     VALUES (?, 'Home', 'home', 'North Nazimabad Block H', 'Karachi', 'Sindh', '74600', '+92-300-1000003', 'Call before reaching', 24.9267, 67.0392, 'true')`,
    [userMap.get('hamza@grocery.local').id]
  );

  await query(
    `INSERT INTO addresses
     (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
     VALUES (?, 'Apartment', 'other', 'DHA Phase 6, Lane 4', 'Karachi', 'Sindh', '75500', '+92-300-1000004', 'Use service elevator', 24.8034, 67.0648, 'true')`,
    [userMap.get('noor@grocery.local').id]
  );

  await query(
    `INSERT INTO addresses
     (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
     VALUES (?, 'Home', 'home', 'Gulshan-e-Iqbal Block 11', 'Karachi', 'Sindh', '75300', '+92-300-1000005', 'Knock softly', 24.9187, 67.0921, 'true')`,
    [userMap.get('umer@grocery.local').id]
  );

  const rows = await query('SELECT id, user_id, label FROM addresses');
  const index = new Map();
  rows.forEach((row) => {
    index.set(`${row.user_id}:${row.label}`, row.id);
  });
  return index;
}

async function seedOrders(userMap, addressMap) {
  for (const order of orderSeeds) {
    const userId = userMap.get(order.email)?.id;
    if (!userId) {
      throw new Error(`Unknown order user: ${order.email}`);
    }

    const addressId = addressMap.get(`${userId}:${order.addressLabel}`) || null;

    await query(
      `INSERT INTO orders
       (user_id, order_number, status, subtotal, shipping, tax_rate, total_price, payment_method, notes, address_id, delivery_address_snapshot, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSTIMESTAMP - NUMTODSINTERVAL(?, 'DAY'))`,
      [
        userId,
        order.orderNumber,
        order.status,
        order.subtotal,
        order.shipping,
        order.taxRate,
        order.total,
        order.paymentMethod,
        order.notes,
        addressId,
        JSON.stringify({ label: order.addressLabel, seeded: true }),
        order.daysAgo,
      ]
    );

    const orderRows = await query('SELECT id FROM orders WHERE order_number = ? FETCH FIRST 1 ROWS ONLY', [order.orderNumber]);
    const orderId = orderRows[0]?.id;

    for (const item of order.items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    }
  }
}

async function seedCartItems(userMap) {
  for (const item of cartSeeds) {
    const userId = userMap.get(item.email)?.id;
    if (!userId) {
      throw new Error(`Unknown cart user: ${item.email}`);
    }

    await query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [userId, item.productId, item.quantity]
    );
  }
}

async function seedAdminData() {
  const setupSchemaScript = path.join(__dirname, 'create-schema.js');
  execFileSync(process.execPath, [setupSchemaScript], { stdio: 'inherit' });

  await clearData();
  const userMap = await seedUsers();
  const categoryMap = await seedCategories();
  await seedProducts(categoryMap);
  const addressMap = await seedAddresses(userMap);
  await seedOrders(userMap, addressMap);
  await seedCartItems(userMap);

  console.log('Admin seed completed successfully');
  console.log(`Users: ${users.length}, Categories: ${categories.length}, Products: ${products.length}`);
  console.log(`Orders: ${orderSeeds.length}, Cart items: ${cartSeeds.length}`);
}

seedAdminData()
  .catch((error) => {
    console.error('Admin seed failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });
