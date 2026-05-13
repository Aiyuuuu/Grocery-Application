const path = require('path');
const dotenv = require('dotenv');
const { execFileSync } = require('child_process');
const { query, closeDb } = require('../db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Single master seed script.
// Seeds: users, categories, products, product_categories, addresses, orders, order_items.
// Uses ONLY the “good image urls” provided by the user.

const CATEGORIES = [
  'Pantry',
  'Fresh Produce',
  'Grains',
  'Seafood',
  'Meat',
  'Eggs',
  'Dairy',
  'Beverages',
  'Oils',
  'Spreads',
  'Legumes',
  'Plant Based',
  'Nuts & Seeds',
  'Fruits',
  'Vegetables',
  'Bakery',
];

const PRODUCTS = [
  {
    id: 'prd-wheat',
    name: 'Wheat',
    description: 'Staple grain used for flour, bread, and roti.',
    price: 160,
    image: 'https://i0.wp.com/pam-main-website-media.s3.amazonaws.com/wp-content/uploads/2024/03/06110226/Wheat-Flour.jpg?fit=1200%2C800&ssl=1',
    calories: 340,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Grains', 'Pantry'],
  },
  {
    id: 'prd-rice',
    name: 'Rice',
    description: 'A versatile staple grain eaten globally. Comes in many varieties including basmati, jasmine, brown, arborio, and sticky rice.',
    price: 280,
    image: 'https://bmirror.net/wp-content/uploads/2024/11/ricew-1024x538-1-696x366.jpg',
    calories: 130,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Grains', 'Pantry'],
  },
  {
    id: 'prd-oats',
    name: 'Oats',
    description: 'Popular breakfast grain commonly eaten as oatmeal or granola. Known for heart-health benefits.',
    price: 700,
    image: 'https://calo.app/mobile/640/2025/05/2148604099.webp',
    calories: 389,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Grains', 'Pantry'],
  },
  {
    id: 'prd-barley',
    name: 'Barley',
    description: 'Nutty grain often used in soups, bread, and malt beverages. Rich in fiber.',
    price: 320,
    image: 'https://domf5oio6qrcr.cloudfront.net/medialibrary/6159/ff717f2b-8a5b-4862-a65f-25b59e3f57b8.jpg',
    calories: 354,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Grains', 'Pantry'],
  },
  {
    id: 'prd-quinoa',
    name: 'Quinoa',
    description: 'Protein-rich seed cooked like a grain. Popular in salads and healthy bowls.',
    price: 1800,
    image: 'https://alternativedish.com/wp-content/uploads/2023/07/popped-quinoa.jpg',
    calories: 368,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Grains', 'Pantry'],
  },
  {
    id: 'prd-salmon',
    name: 'Salmon',
    description: 'Fatty fish rich in omega-3 fatty acids. Commonly grilled, baked, smoked, or used in sushi.',
    price: 6500,
    image: 'https://static01.nyt.com/images/2024/08/01/multimedia/as-grilled-salmon-bvfk/as-grilled-salmon-bvfk-jumbo.jpg',
    calories: 208,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Seafood'],
  },
  {
    id: 'prd-shrimp',
    name: 'Shrimp',
    description: 'Popular shellfish used in stir-fries, curries, pasta, and grilled dishes.',
    price: 2800,
    image: 'https://wellfapack.com/wp-content/uploads/2023/11/%E5%86%B7%E5%86%BB%E8%A2%8B6-1.jpg',
    calories: 99,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Seafood'],
  },
  {
    id: 'prd-chicken',
    name: 'Chicken',
    description: 'Popular lean meat source used worldwide.',
    price: 820,
    image: 'https://www.omidmart.pk/images/product_gallery/1727869854_Whole_Chicken_Without_Skin.jpeg',
    calories: 165,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Meat'],
  },
  {
    id: 'prd-beef',
    name: 'Beef',
    description: 'Protein-rich red meat commonly used in curries and steaks.',
    price: 1100,
    image: 'https://i5.walmartimages.com/seo/Beef-Choice-Top-Sirloin-Steak-0-65-1-42-lb_688d25f2-6e3c-45a0-a3cd-6467bc50dd39.b8ecebf35f58cd00283d2823f456c5cf.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF',
    calories: 250,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Meat'],
  },
  {
    id: 'prd-egg',
    name: 'Eggs',
    description: 'Common protein source used in breakfast and baking.',
    price: 360,
    image: 'https://www.licious.in/blog/wp-content/uploads/2022/01/eggs-1.jpg',
    calories: 155,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 720,
    categories: ['Eggs', 'Pantry'],
  },
  {
    id: 'prd-milk',
    name: 'Milk',
    description: 'Nutrient-rich dairy drink high in calcium.',
    price: 220,
    image: 'https://aleaf.pk/wp-content/uploads/2024/04/milk-pak-full-cream.webp',
    calories: 61,
    saleType: 'fixed',
    unit: 'l',
    unitWeight: 1,
    categories: ['Dairy', 'Beverages'],
  },
  {
    id: 'prd-greek-yog',
    name: 'Greek Yogurt',
    description: 'Thick strained yogurt with high protein content and a tangy flavor.',
    price: 1100,
    image: 'https://kefir.pk/wp-content/uploads/2025/11/Greek-Yogurt-plain.png',
    calories: 97,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 500,
    categories: ['Dairy'],
  },
  {
    id: 'prd-cheddar',
    name: 'Cheddar Cheese',
    description: 'Firm cheese with rich savory flavor.',
    price: 2400,
    image: 'https://www.adamsestore.com/cdn/shop/files/003CheddarCheese200.jpg?v=1728032446',
    calories: 402,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 200,
    categories: ['Dairy'],
  },
  {
    id: 'prd-butter',
    name: 'Butter',
    description: 'Creamy dairy fat used for cooking and baking.',
    price: 1400,
    image: 'https://cdn.britannica.com/27/122027-050-EAA86783/Butter.jpg',
    calories: 717,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 200,
    categories: ['Dairy'],
  },
  {
    id: 'prd-olive-oil',
    name: 'Olive Oil',
    description: 'Premium oil used in salads and cooking.',
    price: 4200,
    image: 'https://royalsfoods.com/wp-content/uploads/2024/12/IMG_5156-scaled.webp',
    calories: 884,
    saleType: 'fixed',
    unit: 'l',
    unitWeight: 1,
    categories: ['Oils', 'Pantry'],
  },
  {
    id: 'prd-pnut-btr',
    name: 'Peanut Butter',
    description: 'Creamy or crunchy spread made from ground peanuts. Used in sandwiches and desserts.',
    price: 1400,
    image: 'https://arysahulatbazar.pk/wp-content/uploads/2026/01/pak-pure-chocolaty-peanut-butter-500gm-2.jpg',
    calories: 588,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 340,
    categories: ['Spreads', 'Pantry'],
  },
  {
    id: 'prd-honey',
    name: 'Honey',
    description: 'Natural sweetener produced by bees.',
    price: 2200,
    image: 'https://binromani.com/wp-content/uploads/2022/03/WhatsApp-Image-2025-11-15-at-7.19.55-PM.jpeg',
    calories: 304,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 500,
    categories: ['Spreads', 'Pantry'],
  },
  {
    id: 'prd-lentils',
    name: 'Lentils',
    description: 'Small protein-rich pulses available in red, green, brown, and black varieties.',
    price: 320,
    image: 'https://arrowheadmills.com/wp-content/uploads/2022/10/red-lentils-1-1024x684.jpg',
    calories: 116,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Legumes', 'Pantry'],
  },
  {
    id: 'prd-chickpea',
    name: 'Chickpeas',
    description: 'Popular legumes used in curries and hummus.',
    price: 250,
    image: 'https://cullensfoods.com/wp-content/uploads/2021/01/cullen-chickpea.jpg',
    calories: 164,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Legumes', 'Pantry'],
  },
  {
    id: 'prd-tofu',
    name: 'Tofu',
    description: 'Soybean curd with a soft texture that absorbs flavors well in savory dishes.',
    price: 850,
    image: 'https://sarahsvegankitchen.com/wp-content/uploads/2024/08/Homemade-Tofu-5.jpg',
    calories: 76,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 400,
    categories: ['Plant Based', 'Pantry'],
  },
  {
    id: 'prd-chia',
    name: 'Chia Seeds',
    description: 'Tiny nutrient-dense seeds often added to smoothies, yogurt, and puddings.',
    price: 2000,
    image: 'https://shop.alkhairnatural.com/cdn/shop/files/480615473_1040954071397671_7698227549788711817_n_1.jpg?v=1754660839',
    calories: 486,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 250,
    categories: ['Nuts & Seeds', 'Pantry'],
  },
  {
    id: 'prd-cashew',
    name: 'Cashews',
    description: 'Creamy nuts eaten roasted or blended into sauces and dairy alternatives.',
    price: 3200,
    image: 'https://img.drz.lazcdn.com/static/pk/p/6779227af91b005c7eae36ada03dba84.jpg_720x720q80.jpg',
    calories: 553,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Nuts & Seeds', 'Pantry'],
  },
  {
    id: 'prd-almond',
    name: 'Almonds',
    description: 'Nutrient-rich nuts high in healthy fats.',
    price: 2800,
    image: 'https://eatanytime.ae/cdn/shop/products/Eat_Almonds_Lifestyle-188921.jpg?v=1737197963&width=1445',
    calories: 579,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Nuts & Seeds', 'Pantry'],
  },
  {
    id: 'prd-avocado',
    name: 'Avocado',
    description: 'Creamy fruit rich in healthy fats. Used in guacamole, toast, and salads.',
    price: 650,
    image: 'https://www.ats-tanner.com/Product%20Pictures%20-%20ARCHIVE/7088/image-thumb__7088__contentImageLarge/banded-avocados-in-bagasse-tray.b2c743fa.png',
    calories: 160,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 250,
    categories: ['Fruits', 'Fresh Produce'],
  },
  {
    id: 'prd-apple',
    name: 'Apples',
    description: 'Crisp sweet fruit commonly eaten raw.',
    price: 380,
    image: 'https://img.lb.wbmdstatic.com/vim/live/webmd/consumer_assets/site_images/articles/health_tools/healing_foods_slideshow/1800ss_getty_rf_apples.jpg?resize=750px:*&output-quality=75',
    calories: 52,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Fruits', 'Fresh Produce'],
  },
  {
    id: 'prd-banana',
    name: 'Bananas',
    description: 'Soft sweet fruit rich in potassium.',
    price: 260,
    image: 'https://assets.woolworths.com.au/images/2010/802911.jpg?impolicy=wowcdxwbjbx&w=900&h=900',
    calories: 89,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 900,
    categories: ['Fruits', 'Fresh Produce'],
  },
  {
    id: 'prd-potato',
    name: 'Potatoes',
    description: 'Starchy vegetable used in many dishes.',
    price: 90,
    image: 'https://5.imimg.com/data5/SG/ZS/WB/SELLER-80273244/fresh-sweet-holland-potato-with-high-protein-500x500.jpg',
    calories: 77,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Vegetables', 'Fresh Produce'],
  },
  {
    id: 'prd-tomato',
    name: 'Tomatoes',
    description: 'Juicy vegetable used in salads and sauces.',
    price: 180,
    image: 'https://mojimall.pk/cdn/shop/files/tomato_long_-_f1_hybrid_-_seeds_packing.png?v=1748200165&width=1445',
    calories: 18,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Vegetables', 'Fresh Produce'],
  },
  {
    id: 'prd-mushroom',
    name: 'Mushrooms',
    description: 'Savory ingredient available in many varieties like shiitake, portobello, and oyster mushrooms.',
    price: 1200,
    image: 'http://catchnpack.pk/wp-content/uploads/2023/02/Mushrooms-Slice-Tin-400g.jpg',
    calories: 22,
    saleType: 'variable',
    unit: 'kg',
    unitWeight: null,
    categories: ['Vegetables', 'Fresh Produce'],
  },
  {
    id: 'prd-bread',
    name: 'Bread',
    description: 'Everyday baked staple made from flour.',
    price: 220,
    image: 'https://www.shutterstock.com/image-photo/top-view-bread-plastic-packet-600nw-2278337423.jpg',
    calories: 265,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 500,
    categories: ['Bakery'],
  },
  {
    id: 'prd-pasta',
    name: 'Pasta',
    description: 'Wheat-based noodles used in Italian dishes.',
    price: 450,
    image: 'https://restomart.pk/wp-content/uploads/2024/10/84.jpg',
    calories: 371,
    saleType: 'fixed',
    unit: 'g',
    unitWeight: 500,
    categories: ['Grains', 'Pantry'],
  },
];

function mulberry32(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(list, rng) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function toMapBy(rows, keyName) {
  const output = new Map();
  rows.forEach((row) => output.set(row[keyName], row));
  return output;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundCurrency(value) {
  return Math.round(Number(value) || 0);
}

function pickWeighted(rng, weightedItems) {
  const total = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of weightedItems) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }
  return weightedItems[weightedItems.length - 1].value;
}

function assertCatalogValid(products, categories) {
  const categorySet = new Set(categories);

  for (const category of categories) {
    if (category.length > 20) {
      throw new Error(`Category name too long for schema (max 20): ${category}`);
    }
  }

  for (const product of products) {
    if (!product.id || product.id.length > 20) {
      throw new Error(`Product id missing/too long (max 20): ${product.id}`);
    }

    if (!product.image || !/^https?:\/\//i.test(product.image)) {
      throw new Error(`Missing/invalid image URL for: ${product.name}`);
    }

    if (!['fixed', 'variable'].includes(product.saleType)) {
      throw new Error(`Invalid saleType for ${product.id}: ${product.saleType}`);
    }

    if (!['kg', 'l', 'g', 'ml'].includes(product.unit)) {
      throw new Error(`Invalid unit for ${product.id}: ${product.unit} (schema allows kg,l,g,ml)`);
    }

    if (product.saleType === 'variable' && product.unitWeight !== null) {
      throw new Error(`unitWeight must be null for variable saleType: ${product.id}`);
    }

    if (product.saleType === 'fixed') {
      if (product.unitWeight === null || product.unitWeight === undefined) {
        throw new Error(`unitWeight required for fixed saleType: ${product.id}`);
      }

      if (Number(product.unitWeight) > 999) {
        throw new Error(`unitWeight too large for NUMBER(3): ${product.id} (${product.unitWeight})`);
      }
    }

    for (const category of product.categories || []) {
      if (!categorySet.has(category)) {
        throw new Error(`Unknown category referenced by ${product.id}: ${category}`);
      }
    }
  }
}

function buildUsers() {
  // More realistic customer set + an admin account.
  return [
    { firstName: 'Admin', lastName: 'Owner', email: 'admin@grocery.local', password: 'admin123', role: 'admin', createdDaysAgo: 900 },

    { firstName: 'Ayan', lastName: 'Khan', email: 'ayan@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 740 },
    { firstName: 'Sara', lastName: 'Ali', email: 'sara@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 720 },
    { firstName: 'Hamza', lastName: 'Iqbal', email: 'hamza@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 700 },
    { firstName: 'Noor', lastName: 'Fatima', email: 'noor@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 680 },
    { firstName: 'Umer', lastName: 'Raza', email: 'umer@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 660 },

    { firstName: 'Hira', lastName: 'Sheikh', email: 'hira@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 640 },
    { firstName: 'Bilal', lastName: 'Ahmed', email: 'bilal@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 620 },
    { firstName: 'Zain', lastName: 'Malik', email: 'zain@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 600 },
    { firstName: 'Areeba', lastName: 'Hussain', email: 'areeba@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 580 },
    { firstName: 'Saad', lastName: 'Rafiq', email: 'saad@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 560 },

    { firstName: 'Maryam', lastName: 'Khalid', email: 'maryam@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 540 },
    { firstName: 'Fahad', lastName: 'Saeed', email: 'fahad@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 520 },
    { firstName: 'Laiba', lastName: 'Shah', email: 'laiba@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 500 },
    { firstName: 'Daniyal', lastName: 'Akram', email: 'daniyal@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 480 },
    { firstName: 'Iqra', lastName: 'Naeem', email: 'iqra@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 460 },

    { firstName: 'Huzaifa', lastName: 'Khan', email: 'huzaifa@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 440 },
    { firstName: 'Sana', lastName: 'Javed', email: 'sana@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 420 },
    { firstName: 'Ammar', lastName: 'Hassan', email: 'ammar@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 400 },
    { firstName: 'Mehak', lastName: 'Riaz', email: 'mehak@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 380 },
    { firstName: 'Osama', lastName: 'Farooq', email: 'osama@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 360 },

    { firstName: 'Nida', lastName: 'Arif', email: 'nida@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 340 },
    { firstName: 'Usman', lastName: 'Aziz', email: 'usman@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 320 },
    { firstName: 'Anum', lastName: 'Siddiqui', email: 'anum@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 300 },
    { firstName: 'Mahnoor', lastName: 'Aslam', email: 'mahnoor@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 280 },
    { firstName: 'Adeel', lastName: 'Qureshi', email: 'adeel@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 260 },

    { firstName: 'Rimsha', lastName: 'Saleem', email: 'rimsha@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 240 },
    { firstName: 'Shayan', lastName: 'Mirza', email: 'shayan@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 220 },
    { firstName: 'Muneeb', lastName: 'Butt', email: 'muneeb@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 200 },
    { firstName: 'Hafsa', lastName: 'Saeed', email: 'hafsa@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 180 },
    { firstName: 'Sameer', lastName: 'Khan', email: 'sameer@grocery.local', password: 'password123', role: 'customer', createdDaysAgo: 160 },
  ];
}

function assignRecommended(products, maxRecommended = 10) {
  const rng = mulberry32(20260513);
  const ids = shuffleInPlace(products.map((p) => p.id), rng);
  const recommendedSet = new Set(ids.slice(0, Math.min(maxRecommended, ids.length)));

  return products.map((p) => ({
    ...p,
    recommended: recommendedSet.has(p.id) ? 'true' : 'false',
    isActive: 'true',
  }));
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

async function seedUsers(users) {
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
  for (const name of CATEGORIES) {
    await query('INSERT INTO categories (name) VALUES (?)', [name]);
  }

  const rows = await query('SELECT id, name FROM categories');
  return toMapBy(rows, 'name');
}

async function seedProducts(categoryMap, products) {
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

    for (const categoryName of product.categories || []) {
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

async function seedAddresses(userMap, users) {
  const rng = mulberry32(20260513);

  const homeTemplates = [
    { address: 'House 14, Street 6', city: 'Karachi', province: 'Sindh', postal: '75400', lat: 24.9011, lng: 67.0892 },
    { address: 'Gulshan-e-Iqbal Block 11', city: 'Karachi', province: 'Sindh', postal: '75300', lat: 24.9187, lng: 67.0921 },
    { address: 'North Nazimabad Block H', city: 'Karachi', province: 'Sindh', postal: '74600', lat: 24.9267, lng: 67.0392 },
    { address: 'DHA Phase 6, Lane 4', city: 'Karachi', province: 'Sindh', postal: '75500', lat: 24.8034, lng: 67.0648 },
  ];

  const workTemplates = [
    { address: 'Shahrah-e-Faisal Block C', city: 'Karachi', province: 'Sindh', postal: '75530', lat: 24.8656, lng: 67.0732 },
    { address: 'I.I. Chundrigar Road', city: 'Karachi', province: 'Sindh', postal: '74000', lat: 24.8502, lng: 67.0105 },
    { address: 'Clifton Block 5', city: 'Karachi', province: 'Sindh', postal: '75600', lat: 24.8144, lng: 67.0293 },
  ];

  for (const user of users) {
    const userId = userMap.get(user.email)?.id;
    if (!userId) continue;

    const home = homeTemplates[Math.floor(rng() * homeTemplates.length)];
    const work = workTemplates[Math.floor(rng() * workTemplates.length)];

    await query(
      `INSERT INTO addresses
       (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
       VALUES (?, 'Home', 'home', ?, ?, ?, ?, ?, ?, ?, ?, 'true')`,
      [
        userId,
        home.address,
        home.city,
        home.province,
        home.postal,
        '+92-300-1000000',
        'Ring bell once. Leave at gate if no answer.',
        home.lat,
        home.lng,
      ]
    );

    await query(
      `INSERT INTO addresses
       (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
       VALUES (?, 'Work', 'work', ?, ?, ?, ?, ?, ?, ?, ?, 'false')`,
      [
        userId,
        work.address,
        work.city,
        work.province,
        work.postal,
        '+92-300-1000000',
        'Drop at reception/front desk.',
        work.lat,
        work.lng,
      ]
    );
  }

  const rows = await query('SELECT id, user_id, label FROM addresses');
  const index = new Map();
  rows.forEach((row) => index.set(`${row.user_id}:${row.label}`, row.id));
  return index;
}

function buildOrderAgeDays(rng, maxDays) {
  // Bias towards recent orders but still cover the whole period.
  const skewed = Math.pow(rng(), 2.2);
  return Math.floor(skewed * maxDays);
}

function statusForAgeDays(ageDays, rng) {
  if (ageDays <= 1) return pickWeighted(rng, [
    { value: 'placed', weight: 70 },
    { value: 'packaged', weight: 30 },
  ]);

  if (ageDays <= 3) return pickWeighted(rng, [
    { value: 'packaged', weight: 55 },
    { value: 'enroute', weight: 45 },
  ]);

  if (ageDays <= 7) return pickWeighted(rng, [
    { value: 'enroute', weight: 40 },
    { value: 'arrived', weight: 60 },
  ]);

  return 'arrived';
}

function paymentForAgeDays(ageDays, rng) {
  // Slightly more digital in recent months.
  if (ageDays <= 120) {
    return pickWeighted(rng, [
      { value: 'digital', weight: 45 },
      { value: 'card', weight: 35 },
      { value: 'cash', weight: 20 },
    ]);
  }

  return pickWeighted(rng, [
    { value: 'cash', weight: 40 },
    { value: 'card', weight: 35 },
    { value: 'digital', weight: 25 },
  ]);
}

function noteFor(rng) {
  const notes = [
    null,
    null,
    null,
    'Ring bell once',
    'Call on arrival',
    'Leave at gate',
    'No plastic bag needed',
    'Deliver before 8 PM',
    'Please pack tomatoes separately',
    'If unavailable, replace with similar',
  ];
  return notes[Math.floor(rng() * notes.length)];
}

function buildItem(rng, product) {
  const basePrice = Number(product.price);
  const priceAtPurchase = clamp(roundCurrency(basePrice * (0.9 + rng() * 0.25)), 1, 999999);

  if (product.saleType === 'variable') {
    // Quantity stored in grams in this app (see backend/src/models/orders.model.js UNIT_SCALE = 1000).
    const grams = Math.floor(clamp(200 + rng() * 1800, 200, 2500));
    return {
      productId: product.id,
      quantity: grams,
      priceAtPurchase,
      lineTotal: (grams / 1000) * priceAtPurchase,
    };
  }

  const qty = Math.floor(clamp(1 + rng() * 3, 1, 4));
  return {
    productId: product.id,
    quantity: qty,
    priceAtPurchase,
    lineTotal: qty * priceAtPurchase,
  };
}

function chooseBasketProducts(rng, ageDays, count) {
  // Trend: more pantry/grains in older orders, more fresh produce in recent orders.
  const freshBias = ageDays <= 150 ? 1.4 : 1.0;
  const pantryBias = ageDays >= 350 ? 1.25 : 1.0;

  const weighted = PRODUCTS.map((p) => {
    let weight = 1;

    const isFresh = (p.categories || []).some((c) => ['Fresh Produce', 'Fruits', 'Vegetables'].includes(c));
    const isPantry = (p.categories || []).some((c) => ['Pantry', 'Grains', 'Legumes'].includes(c));
    const isSeafood = (p.categories || []).includes('Seafood');

    if (isFresh) weight *= freshBias;
    if (isPantry) weight *= pantryBias;
    if (isSeafood && ageDays <= 120) weight *= 1.2;

    return { value: p, weight };
  });

  const picked = new Set();
  while (picked.size < count) {
    picked.add(pickWeighted(rng, weighted).id);
  }

  return PRODUCTS.filter((p) => picked.has(p.id));
}

async function seedOrders({ orderCount = 150, maxDays = 730 } = {}, userMap, addressMap) {
  const rng = mulberry32(20260513);
  const users = Array.from(userMap.values());

  for (let i = 0; i < orderCount; i += 1) {
    const userRow = users[Math.floor(rng() * users.length)];
    const ageDays = buildOrderAgeDays(rng, maxDays);

    const status = statusForAgeDays(ageDays, rng);
    const paymentMethod = paymentForAgeDays(ageDays, rng);

    // Must be <= 10 chars in schema: 'O' + 9 digits.
    const orderNumber = `O${(910000000 + i).toString()}`;

    const itemCount = Math.floor(clamp(1 + rng() * 5, 1, 6));
    const basketProducts = chooseBasketProducts(rng, ageDays, itemCount);
    const items = basketProducts.map((p) => buildItem(rng, p));

    const subtotal = roundCurrency(items.reduce((sum, it) => sum + it.lineTotal, 0));
    const taxRate = 5;
    const taxes = roundCurrency(subtotal * (taxRate / 100));

    // Matches app logic often, but allows some realistic paid shipping for small baskets.
    const shipping = subtotal > 50 ? 0 : 100;

    const total = roundCurrency(subtotal + shipping + taxes);

    const addressId = addressMap.get(`${userRow.id}:Home`) || null;
    const addressSnapshot = addressId
      ? JSON.stringify({ label: 'Home', addressId, seededAt: '2026-05-13' })
      : null;

    await query(
      `INSERT INTO orders
       (user_id, order_number, status, subtotal, shipping, tax_rate, total_price, payment_method, notes, address_id, delivery_address_snapshot, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSTIMESTAMP - NUMTODSINTERVAL(?, 'SECOND'))`,
      [
        userRow.id,
        orderNumber,
        status,
        subtotal,
        shipping,
        taxRate,
        total,
        paymentMethod,
        noteFor(rng),
        addressId,
        addressSnapshot,
        ageDays * 86400 + Math.floor(rng() * 86400),
      ]
    );

    const orderRows = await query(
      'SELECT id FROM orders WHERE order_number = ? FETCH FIRST 1 ROWS ONLY',
      [orderNumber]
    );
    const orderId = orderRows[0]?.id;

    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.priceAtPurchase]
      );
    }
  }
}

async function seed() {
  const setupSchemaScript = path.join(__dirname, 'create-schema.js');
  execFileSync(process.execPath, [setupSchemaScript], { stdio: 'inherit' });

  const seededProducts = assignRecommended(PRODUCTS, 10);
  assertCatalogValid(seededProducts, CATEGORIES);

  const users = buildUsers();

  await clearData();

  const userMap = await seedUsers(users);
  const categoryMap = await seedCategories();
  await seedProducts(categoryMap, seededProducts);
  const addressMap = await seedAddresses(userMap, users);
  await seedOrders({ orderCount: 150, maxDays: 730 }, userMap, addressMap);

  console.log('✅ Seed completed successfully');
  console.log(`Users: ${users.length}`);
  console.log(`Categories: ${CATEGORIES.length}`);
  console.log(`Products: ${seededProducts.length}`);
  console.log(`Recommended: ${seededProducts.filter((p) => p.recommended === 'true').length}`);
  console.log('Orders: 150');
}

if (require.main === module) {
  seed()
    .catch((error) => {
      console.error('Seed failed:', error.message);
      process.exit(1);
    })
    .finally(async () => {
      await closeDb();
    });
}

module.exports = {
  seed,
};
