const ordersModel = require('../models/orders.model');
const VALID_PAYMENT_METHODS = ['cash', 'card', 'digital'];

exports.listOrders = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const orders = await ordersModel.listOrdersByUser(userId);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

exports.placeOrder = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { addressId, paymentMethod, deliveryNotes } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: 'Address is required to place an order' });
    }

    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        message: 'paymentMethod is required and must be one of: cash, card, digital',
      });
    }

    const result = await ordersModel.placeOrderForUser(
      userId,
      addressId,
      paymentMethod,
      deliveryNotes
    );

    if (result.error) {
      return res.status(result.error.code).json({ message: result.error.message });
    }

    return res.status(201).json(result.data);
  } catch (error) {
    return next(error);
  }
};
