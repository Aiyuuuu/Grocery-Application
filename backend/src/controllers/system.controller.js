const { checkDbConnection } = require('../../db');

async function getRoot(_req, res) {
  res.status(200).json({
    success: true,
    message: 'Grocery backend API is running',
  });
}

async function getHealth(_req, res, next) {
  try {
    await checkDbConnection();
    res.status(200).json({
      success: true,
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRoot,
  getHealth,
};
