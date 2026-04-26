import { apiClient } from '../client';

async function runAdminQuery(sql, params = []) {
  const response = await apiClient.post('/admin/query', { sql, params });
  return response.data || {};
}

async function queryRows(sql, params = []) {
  const payload = await runAdminQuery(sql, params);
  return Array.isArray(payload.rows) ? payload.rows : [];
}

async function getSchemaSql() {
  const response = await apiClient.get('/admin/schema');
  return String(response.data?.schemaSql || '');
}

export const adminService = {
  runAdminQuery,
  queryRows,
  getSchemaSql,
};
