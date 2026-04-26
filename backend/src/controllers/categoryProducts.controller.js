const categoryProductsModel = require('../models/categoryProducts.model');

function normalizeProductIds(value) {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return [...new Set(normalized)];
}

async function getCategoryProducts(req, res, next) {
  try {
    const { categoryId } = req.params;

    const category = await categoryProductsModel.findCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productIds = await categoryProductsModel.listProductIdsByCategory(categoryId);

    return res.json({
      categoryId: Number(category.id),
      categoryName: category.name,
      productIds,
    });
  } catch (error) {
    return next(error);
  }
}

async function replaceCategoryProducts(req, res, next) {
  try {
    const { categoryId } = req.params;
    const normalizedProductIds = normalizeProductIds(req.body.productIds);

    if (normalizedProductIds === null) {
      return res.status(400).json({ message: 'productIds must be an array' });
    }

    const category = await categoryProductsModel.findCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const existingProducts = await categoryProductsModel.findExistingProductIds(normalizedProductIds);
    const existingSet = new Set(existingProducts);
    const missingProducts = normalizedProductIds.filter((id) => !existingSet.has(id));

    if (missingProducts.length > 0) {
      return res.status(400).json({
        message: 'Some product IDs do not exist',
        missingProductIds: missingProducts,
      });
    }

    await categoryProductsModel.replaceCategoryProducts(categoryId, normalizedProductIds);

    return res.json({
      categoryId: Number(category.id),
      categoryName: category.name,
      productIds: normalizedProductIds,
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductCategories(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await categoryProductsModel.findProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const categoryIds = await categoryProductsModel.listCategoryIdsByProduct(productId);

    return res.json({
      productId,
      categoryIds,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCategoryProducts,
  replaceCategoryProducts,
  getProductCategories,
};
