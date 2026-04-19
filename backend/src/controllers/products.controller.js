const { query } = require('../../db');

function normalizeTags(tags) {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags;
  }

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  return [];
}

function formatProduct(product) {
  return {
    ...product,
    price: product.price !== null ? Number(product.price) : null,
    calories: product.calories !== null ? Number(product.calories) : null,
    unit_weight: product.unit_weight !== null ? Number(product.unit_weight) : null,
    recommended: Boolean(product.recommended),
    tags: normalizeTags(product.tags),
  };
}

const getProducts = async (req, res, next) => {
  try {
    const products = await query(
      `SELECT
        id,
        name,
        description,
        price,
        image,
        calories,
        sale_type AS saleType,
        unit,
        unit_weight,
        recommended,
        tags
      FROM products
      ORDER BY name ASC`
    );

    res.json(products.map(formatProduct));
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await query(
      `SELECT
        id,
        name,
        description,
        price,
        image,
        calories,
        sale_type AS saleType,
        unit,
        unit_weight,
        recommended,
        tags
      FROM products
      WHERE id = ?
      LIMIT 1`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(formatProduct(products[0]));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
};
