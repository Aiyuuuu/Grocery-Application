import { adminService } from '../../api/services/adminService';
import {
  buildCategoriesTableQuery,
  buildCategoryOptionsQuery,
  buildCategoryQueries,
  buildKpiQueries,
  buildOrdersTableQuery,
  buildProductsTableQuery,
  buildTrendQueries,
  buildUsersTableQuery,
} from './adminQueries';

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function metricFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return 0;
  }

  return toNumber(rows[0].metric_value);
}

function toSeriesRows(rows) {
  return (rows || []).map((row) => ({
    x: row.bucket_date,
    y: toNumber(row.metric_value),
  }));
}

function toCategoryRows(rows) {
  return (rows || []).map((row) => ({
    label: row.category_name,
    value: toNumber(row.metric_value),
  }));
}

export async function fetchAdminDashboardData(filters) {
  const kpiQueries = buildKpiQueries(filters);
  const trendQueries = buildTrendQueries(filters);
  const categoryQueries = buildCategoryQueries(filters);

  const [
    totalUsersRows,
    totalOrdersRows,
    totalProductsRows,
    totalRevenueRows,
    payingCustomersRows,
    orderVolumeRows,
    aovRows,
    revenueGrowthRows,
    ordersByCategoryRows,
    revenueByCategoryRows,
  ] = await Promise.all([
    adminService.queryRows(kpiQueries.totalUsers.sql, kpiQueries.totalUsers.params),
    adminService.queryRows(kpiQueries.totalOrders.sql, kpiQueries.totalOrders.params),
    adminService.queryRows(kpiQueries.totalProducts.sql, kpiQueries.totalProducts.params),
    adminService.queryRows(kpiQueries.totalRevenue.sql, kpiQueries.totalRevenue.params),
    adminService.queryRows(kpiQueries.payingCustomers.sql, kpiQueries.payingCustomers.params),
    adminService.queryRows(trendQueries.orderVolume.sql, trendQueries.orderVolume.params),
    adminService.queryRows(trendQueries.aov.sql, trendQueries.aov.params),
    adminService.queryRows(trendQueries.revenueGrowth.sql, trendQueries.revenueGrowth.params),
    adminService.queryRows(categoryQueries.ordersByCategory.sql, categoryQueries.ordersByCategory.params),
    adminService.queryRows(categoryQueries.revenueByCategory.sql, categoryQueries.revenueByCategory.params),
  ]);

  const totalUsers = metricFromRows(totalUsersRows);
  const totalOrders = metricFromRows(totalOrdersRows);
  const totalProducts = metricFromRows(totalProductsRows);
  const totalRevenue = metricFromRows(totalRevenueRows);
  const payingCustomers = metricFromRows(payingCustomersRows);

  const conversionRate = totalUsers > 0 ? (payingCustomers / totalUsers) * 100 : 0;

  return {
    kpis: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      conversionRate,
    },
    trends: {
      orderVolume: toSeriesRows(orderVolumeRows),
      aov: toSeriesRows(aovRows),
      revenueGrowth: toSeriesRows(revenueGrowthRows),
    },
    categories: {
      ordersByCategory: toCategoryRows(ordersByCategoryRows),
      revenueByCategory: toCategoryRows(revenueByCategoryRows),
    },
  };
}

export async function fetchCategoryOptions() {
  const query = buildCategoryOptionsQuery();
  return adminService.queryRows(query.sql, query.params);
}

export async function fetchProductsTable(filters) {
  const query = buildProductsTableQuery(filters || {});
  return adminService.queryRows(query.sql, query.params);
}

export async function fetchCategoriesTable(filters) {
  const query = buildCategoriesTableQuery(filters || {});
  return adminService.queryRows(query.sql, query.params);
}

export async function fetchUsersTable(filters) {
  const query = buildUsersTableQuery(filters || {});
  return adminService.queryRows(query.sql, query.params);
}

export async function fetchOrdersTable(filters) {
  const query = buildOrdersTableQuery(filters || {});
  return adminService.queryRows(query.sql, query.params);
}
