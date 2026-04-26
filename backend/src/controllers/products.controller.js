const productsModel = require('../models/products.model');

function formatProduct(product) {
  return {
    ...product,
    price: product.price !== null ? Number(product.price) : null,
    calories: product.calories !== null ? Number(product.calories) : null,
    unit_weight: product.unit_weight !== null ? Number(product.unit_weight) : null
  };
}

const getProducts = async (req, res, next) => {
  try {
    const products = await productsModel.listProducts();

    res.json(products.map(formatProduct));
  } catch (error) {
    next(error);
  }
};

const getActiveProducts = async (req, res, next) => {
  try {
    const products = await productsModel.listActiveProducts();

    res.json(products.map(formatProduct));
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productsModel.findProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(formatProduct(product));
  } catch (error) {
    next(error);
  }
};


const addProduct = async (req, res, next) => {
  try {
    const {
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
    } = req.body;

    if (!id || !name || price === undefined || !image || calories === undefined || !sale_type || !unit) {
      return res.status(400).json({
        message: 'id, name, price, image, calories, sale_type and unit are required',
      });
    }

    const parsedPrice = Number(price);
    const parsedCalories = Number(calories);
    const parsedUnitWeight = unit_weight === undefined || unit_weight === null || unit_weight === ''
      ? null
      : Number(unit_weight);
    const parsedRecommended = recommended === undefined
      ? 'false'
      : String(recommended).trim().toLowerCase();

    if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedCalories)) {
      return res.status(400).json({
        message: 'price and calories must be valid numbers',
      });
    }

    if (parsedPrice <= 0 || parsedCalories < 0) {
      return res.status(400).json({
        message: 'price must be greater than 0 and calories cannot be negative',
      });
    }

    if (parsedUnitWeight !== null && !Number.isFinite(parsedUnitWeight)) {
      return res.status(400).json({
        message: 'unit_weight must be a valid number when provided',
      });
    }

    if (!['fixed', 'variable'].includes(sale_type)) {
      return res.status(400).json({
        message: 'sale_type must be one of: fixed, variable',
      });
    }

    if (!['true', 'false'].includes(parsedRecommended)) {
      return res.status(400).json({
        message: 'recommended must be one of: true, false',
      });
    }

    const allowedUnits = ['kg', 'l', 'g', 'ml'];
    if (!allowedUnits.includes(unit)) {
      return res.status(400).json({
        message: 'unit must be one of: kg, l, g, ml',
      });
    }

    if (sale_type === 'variable' && parsedUnitWeight !== null) {
      return res.status(400).json({
        message: 'unit_weight must be null/empty when sale_type is variable',
      });
    }

    const existingProduct = await productsModel.findProductById(id);
    if (existingProduct) {
      return res.status(409).json({ message: 'Product with this id already exists' });
    }

    await productsModel.addProduct(
      id,
      name,
      description || null,
      parsedPrice,
      image,
      parsedCalories,
      sale_type,
      unit,
      parsedUnitWeight,
      parsedRecommended
    );

    const createdProduct = await productsModel.findProductById(id);

    if (!createdProduct) {
      return res.status(500).json({ message: 'Product was created but could not be fetched' });
    }

    return res.status(201).json(formatProduct(createdProduct));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await productsModel.deleteProductById(id);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getProducts,
  getActiveProducts,
  getProductById,
  addProduct,
  deleteProduct,
};
