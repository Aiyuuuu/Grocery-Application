const { query } = require('../../db');

async function listProducts() {
  return query(
    `SELECT
      id,
      name,
      description,
      price,
      image,
      calories,
      sale_type,
      unit,
      unit_weight,
      recommended,
      is_active,
      created_at
    FROM products
    ORDER BY name ASC`
  );
}

async function listActiveProducts(){
return query(
    `SELECT
      id,
      name,
      description,
      price,
      image,
      calories,
      sale_type,
      unit,
      unit_weight,
      recommended,
      is_active,
      created_at
    FROM products
    WHERE is_active = 'true'
    ORDER BY name ASC`
  );
}

async function findProductById(id) {
  const rows = await query(
    `SELECT
      id,
      name,
      description,
      price,
      image,
      calories,
      sale_type,
      unit,
      unit_weight,
      recommended,
      is_active,
      created_at
    FROM products
    WHERE id = ?
    FETCH FIRST 1 ROWS ONLY`,
    [id]
  );

  return rows[0] || null;
}


async function addProduct(id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended){
    await query(
    `INSERT INTO products (
      id,
      name,
      description,
      price,
      image,
      calories,
      sale_type,
      unit,
      unit_weight,
      recommended)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended]
  );
  return findProductById(id)
}


async function deleteProductById(id){
  return query(
    `UPDATE products
     SET is_active = 'false'
     WHERE id = ?`,
    [id]
    )
}

module.exports = {
  listProducts,
  findProductById,
  listActiveProducts,
  addProduct,
  deleteProductById
};
