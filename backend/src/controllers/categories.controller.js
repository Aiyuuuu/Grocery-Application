const { query } = require('../../db');

function normalizeProductIds(productIds) {
  if (!productIds) {
    return [];
  }

  let normalized = productIds;
  if (typeof normalized === 'string') {
    try {
      normalized = JSON.parse(normalized);
    } catch (_error) {
      return [];
    }
  }

  return Array.isArray(normalized) ? normalized.filter(Boolean) : [];
}

function formatCategory(category) {
  return {
    ...category,
    productIds: normalizeProductIds(category.productIds),
  };
}

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await query(
      `SELECT c.id, c.name, 
              JSON_ARRAYAGG(pc.product_id) as productIds
       FROM categories c
       LEFT JOIN product_categories pc ON c.id = pc.category_id
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`
    );
    
    res.json(categories.map(formatCategory));
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categories = await query(
      `SELECT c.id, c.name,
              JSON_ARRAYAGG(pc.product_id) as productIds
       FROM categories c
       LEFT JOIN product_categories pc ON c.id = pc.category_id
       WHERE c.id = ?
       GROUP BY c.id, c.name`,
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(formatCategory(categories[0]));
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await query(
      'INSERT INTO categories (name) VALUES (?)',
      [name.trim()]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name: name.trim(),
      productIds: []
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Category already exists' });
    }
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ id: parseInt(id), name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
