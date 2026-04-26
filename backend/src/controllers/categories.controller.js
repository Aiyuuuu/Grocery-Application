const categoriesModel = require('../models/categories.model');

function normalizeProductIds(productIds) {
  if (!productIds) {
    return [];
  }

  if (Array.isArray(productIds)) {
    return productIds.filter(Boolean);
  }

  if (typeof productIds === 'string') {
    return productIds
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatCategory(category) {
  const rawProductIds = category.productids ?? category.productIds;
  const { productids, productIds: _productIds, ...rest } = category;

  return {
    ...rest,
    productIds: normalizeProductIds(rawProductIds),
  };
}

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await categoriesModel.listCategories();
    
    res.json(categories.map(formatCategory));
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoriesModel.findCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(formatCategory(category));
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

    const existing = await categoriesModel.findCategoryByName(name.trim());
    if (existing) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const created = await categoriesModel.createCategory(name.trim());
    res.status(201).json(formatCategory({ ...created, productids: null }));
  } catch (error) {
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

    const duplicate = await categoriesModel.findCategoryByName(name.trim());
    if (duplicate && Number(duplicate.id) !== Number(id)) {
      return res.status(409).json({ message: 'Category name already exists' });
    }

    const result = await categoriesModel.updateCategoryName(id, name.trim());

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ id: parseInt(id), name: name.trim() });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await categoriesModel.deleteCategory(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
