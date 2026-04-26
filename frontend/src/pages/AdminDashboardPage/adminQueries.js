const DATE_PATTERNS = {
  day: 'DD',
  week: 'IW',
  month: 'MM',
  year: 'YYYY',
};

function buildDateClause(column, startDate, endDate, params) {
  const clauses = [];

  if (startDate) {
    clauses.push(`${column} >= TO_DATE(?, 'YYYY-MM-DD')`);
    params.push(startDate);
  }

  if (endDate) {
    clauses.push(`${column} < TO_DATE(?, 'YYYY-MM-DD') + 1`);
    params.push(endDate);
  }

  return clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '';
}

export function buildKpiQueries(filters) {
  const totalUsers = {
    sql: "SELECT COUNT(*) AS metric_value FROM users WHERE is_active = 'true'",
    params: [],
  };

  const ordersParams = [];
  const ordersDateClause = buildDateClause('o.created_at', filters.startDate, filters.endDate, ordersParams);
  const totalOrders = {
    sql: `SELECT COUNT(*) AS metric_value FROM orders o WHERE 1 = 1${ordersDateClause}`,
    params: ordersParams,
  };

  const products = {
    sql: "SELECT COUNT(*) AS metric_value FROM products WHERE is_active = 'true'",
    params: [],
  };

  const revenueParams = [];
  const revenueDateClause = buildDateClause('o.created_at', filters.startDate, filters.endDate, revenueParams);
  const totalRevenue = {
    sql: `
      SELECT NVL(SUM(o.total_price), 0) AS metric_value
      FROM orders o
      WHERE 1 = 1${revenueDateClause}
    `.trim(),
    params: revenueParams,
  };

  const conversionParams = [];
  const conversionDateClause = buildDateClause('o.created_at', filters.startDate, filters.endDate, conversionParams);
  const payingCustomers = {
    sql: `
      SELECT COUNT(DISTINCT o.user_id) AS metric_value
      FROM orders o
      WHERE 1 = 1${conversionDateClause}
    `.trim(),
    params: conversionParams,
  };

  return {
    totalUsers,
    totalOrders,
    totalProducts: products,
    totalRevenue,
    payingCustomers,
  };
}

function getTruncPattern(granularity) {
  return DATE_PATTERNS[granularity] || DATE_PATTERNS.day;
}

function buildTrendQuery({ metricExpression, granularity, startDate, endDate }) {
  const params = [];
  const dateClause = buildDateClause('o.created_at', startDate, endDate, params);
  const truncPattern = getTruncPattern(granularity);

  return {
    sql: `
      SELECT
        TRUNC(o.created_at, '${truncPattern}') AS bucket_date,
        ${metricExpression} AS metric_value
      FROM orders o
      WHERE 1 = 1${dateClause}
      GROUP BY TRUNC(o.created_at, '${truncPattern}')
      ORDER BY bucket_date
    `.trim(),
    params,
  };
}

export function buildTrendQueries(filters) {
  return {
    orderVolume: buildTrendQuery({
      metricExpression: 'COUNT(*)',
      granularity: filters.granularity,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    aov: buildTrendQuery({
      metricExpression: 'AVG(o.total_price)',
      granularity: filters.granularity,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    revenueGrowth: buildTrendQuery({
      metricExpression: 'SUM(o.total_price)',
      granularity: filters.granularity,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
  };
}

export function buildCategoryQueries(filters) {
  const ordersByCategoryParams = [];
  const ordersByCategoryDateClause = buildDateClause(
    'o.created_at',
    filters.startDate,
    filters.endDate,
    ordersByCategoryParams
  );

  const ordersByCategory = {
    sql: `
      SELECT
        c.name AS category_name,
        COUNT(DISTINCT o.id) AS metric_value
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product_categories pc ON pc.product_id = oi.product_id
      JOIN categories c ON c.id = pc.category_id
      WHERE 1 = 1${ordersByCategoryDateClause}
      GROUP BY c.name
      ORDER BY metric_value DESC, c.name ASC
    `.trim(),
    params: ordersByCategoryParams,
  };

  const revenueByCategoryParams = [];
  const revenueByCategoryDateClause = buildDateClause(
    'o.created_at',
    filters.startDate,
    filters.endDate,
    revenueByCategoryParams
  );

  const revenueByCategory = {
    sql: `
      SELECT
        c.name AS category_name,
        SUM(
          CASE
            WHEN p.sale_type = 'variable' THEN (oi.quantity / 1000) * oi.price_at_purchase
            ELSE oi.quantity * oi.price_at_purchase
          END
        ) AS metric_value
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      JOIN product_categories pc ON pc.product_id = oi.product_id
      JOIN categories c ON c.id = pc.category_id
      WHERE 1 = 1${revenueByCategoryDateClause}
      GROUP BY c.name
      ORDER BY metric_value DESC, c.name ASC
    `.trim(),
    params: revenueByCategoryParams,
  };

  return {
    ordersByCategory,
    revenueByCategory,
  };
}

function buildLikeClause(column, value, params) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  params.push(normalized);
  return ` AND LOWER(${column}) LIKE '%' || LOWER(?) || '%'`;
}

function buildEqualsClause(column, value, params) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  params.push(normalized);
  return ` AND ${column} = ?`;
}

export function buildCategoryOptionsQuery() {
  return {
    sql: 'SELECT id, name FROM categories ORDER BY name ASC',
    params: [],
  };
}

export function buildProductsTableQuery(filters) {
  const params = [];
  const searchClause = buildLikeClause('p.id || p.name', filters.search, params);
  const saleTypeClause = buildEqualsClause('p.sale_type', filters.saleType, params);
  const activeClause = buildEqualsClause('p.is_active', filters.isActive, params);

  return {
    sql: `
      SELECT
        p.id,
        p.name,
        p.sale_type,
        p.unit,
        p.unit_weight,
        p.price,
        p.calories,
        p.is_active,
        NVL(LISTAGG(c.name, ', ') WITHIN GROUP (ORDER BY c.name), '') AS categories,
        p.created_at
      FROM products p
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      WHERE 1 = 1${searchClause}${saleTypeClause}${activeClause}
      GROUP BY
        p.id,
        p.name,
        p.sale_type,
        p.unit,
        p.unit_weight,
        p.price,
        p.calories,
        p.is_active,
        p.created_at
      ORDER BY p.created_at DESC
    `.trim(),
    params,
  };
}

export function buildCategoriesTableQuery(filters) {
  const params = [];
  const searchClause = buildLikeClause('c.name', filters.search, params);

  return {
    sql: `
      SELECT
        c.id,
        c.name,
        COUNT(pc.product_id) AS product_count
      FROM categories c
      LEFT JOIN product_categories pc ON pc.category_id = c.id
      WHERE 1 = 1${searchClause}
      GROUP BY c.id, c.name
      ORDER BY c.name ASC, c.id ASC
    `.trim(),
    params,
  };
}

export function buildUsersTableQuery(filters) {
  const params = [];
  const searchClause = buildLikeClause("u.first_name || ' ' || u.last_name || ' ' || u.email", filters.search, params);
  const roleClause = buildEqualsClause('u.role', filters.role, params);
  const activeClause = buildEqualsClause('u.is_active', filters.isActive, params);

  return {
    sql: `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.is_active,
        COUNT(o.id) AS total_orders,
        MIN(u.created_at) AS created_at
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE 1 = 1${searchClause}${roleClause}${activeClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, u.is_active
      ORDER BY created_at DESC
    `.trim(),
    params,
  };
}

export function buildOrdersTableQuery(filters) {
  const params = [];
  const searchClause = buildLikeClause('o.order_number', filters.search, params);
  const statusClause = buildEqualsClause('o.status', filters.status, params);
  const paymentClause = buildEqualsClause('o.payment_method', filters.paymentMethod, params);

  return {
    sql: `
      SELECT
        o.id,
        o.order_number,
        o.user_id,
        o.status,
        o.payment_method,
        o.subtotal,
        o.shipping,
        o.tax_rate,
        o.total_price,
        COUNT(oi.product_id) AS item_lines,
        o.created_at
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1 = 1${searchClause}${statusClause}${paymentClause}
      GROUP BY
        o.id,
        o.order_number,
        o.user_id,
        o.status,
        o.payment_method,
        o.subtotal,
        o.shipping,
        o.tax_rate,
        o.total_price,
        o.created_at
      ORDER BY o.created_at DESC
    `.trim(),
    params,
  };
}
