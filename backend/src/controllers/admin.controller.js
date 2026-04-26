const adminModel = require('../models/admin.model');

function isAdminRole(role) {
  return String(role || '').trim().toLowerCase() === 'admin';
}

async function runQuery(req, res, next) {
  try {
    if (!isAdminRole(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: admin role required',
      });
    }

    const sql = String(req.body?.sql || '').trim();
    const params = req.body?.params;

    if (!sql) {
      return res.status(400).json({
        success: false,
        message: 'sql is required',
      });
    }

    if (sql.length > 50000) {
      return res.status(400).json({
        success: false,
        message: 'sql is too long',
      });
    }

    if (params !== undefined && !Array.isArray(params)) {
      return res.status(400).json({
        success: false,
        message: 'params must be an array when provided',
      });
    }

    const result = await adminModel.runAdminQuery(sql, Array.isArray(params) ? params : []);

    if (Array.isArray(result)) {
      return res.status(200).json({
        success: true,
        rows: result,
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  runQuery,
  async getSchema(req, res, next) {
    try {
      if (!isAdminRole(req.user?.role)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: admin role required',
        });
      }

      const schemaSql = await adminModel.readDatabaseSchema();

      return res.status(200).json({
        success: true,
        schemaSql,
      });
    } catch (error) {
      return next(error);
    }
  },
};
