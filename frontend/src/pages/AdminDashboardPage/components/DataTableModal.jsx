import { useEffect, useMemo, useState } from 'react';
import AdminModal from './AdminModal';
import {
  deleteCategory,
  deleteProduct,
} from '../adminActions';
import {
  fetchCategoriesTable,
  fetchOrdersTable,
  fetchProductsTable,
  fetchUsersTable,
} from '../adminData';

const TABLE_META = {
  products: {
    title: 'Products',
    filterConfig: [
      { key: 'search', label: 'Search', type: 'text', placeholder: 'ID or name' },
      {
        key: 'saleType',
        label: 'Sale Type',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'fixed', label: 'fixed' },
          { value: 'variable', label: 'variable' },
        ],
      },
      {
        key: 'isActive',
        label: 'Active',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'true', label: 'true' },
          { value: 'false', label: 'false' },
        ],
      },
    ],
  },
  categories: {
    title: 'Categories',
    filterConfig: [{ key: 'search', label: 'Search', type: 'text', placeholder: 'Category name' }],
  },
  users: {
    title: 'Users',
    filterConfig: [
      { key: 'search', label: 'Search', type: 'text', placeholder: 'Name or email' },
      {
        key: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'admin', label: 'admin' },
          { value: 'customer', label: 'customer' },
        ],
      },
      {
        key: 'isActive',
        label: 'Active',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'true', label: 'true' },
          { value: 'false', label: 'false' },
        ],
      },
    ],
  },
  orders: {
    title: 'Orders',
    filterConfig: [
      { key: 'search', label: 'Search', type: 'text', placeholder: 'Order number' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'placed', label: 'placed' },
          { value: 'packaged', label: 'packaged' },
          { value: 'enroute', label: 'enroute' },
          { value: 'arrived', label: 'arrived' },
        ],
      },
      {
        key: 'paymentMethod',
        label: 'Payment',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'cash', label: 'cash' },
          { value: 'card', label: 'card' },
          { value: 'digital', label: 'digital' },
        ],
      },
    ],
  },
};

const INITIAL_FILTERS = {
  search: '',
  saleType: '',
  isActive: '',
  role: '',
  status: '',
  paymentMethod: '',
};

function fetchByType(type, filters) {
  if (type === 'products') return fetchProductsTable(filters);
  if (type === 'categories') return fetchCategoriesTable(filters);
  if (type === 'users') return fetchUsersTable(filters);
  return fetchOrdersTable(filters);
}

function renderValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

export default function DataTableModal({ type, onClose, onMutate }) {
  const meta = TABLE_META[type];
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadRows() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchByType(type, filters);
        if (mounted) {
          setRows(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError?.response?.data?.message || loadError?.message || `Failed to load ${meta.title}`);
          setRows([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRows();

    return () => {
      mounted = false;
    };
  }, [type, filters, meta.title]);

  const columns = useMemo(() => {
    if (!rows.length) {
      return [];
    }
    return Object.keys(rows[0]);
  }, [rows]);

  async function handleDelete(id) {
    const confirmed = window.confirm(`Delete ${type.slice(0, -1)} ${id}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      if (type === 'products') {
        await deleteProduct(id);
      } else if (type === 'categories') {
        await deleteCategory(id);
      }

      onMutate();
      setRows((prev) => prev.filter((row) => String(row.id) !== String(id)));
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || deleteError?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminModal title={meta.title} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {meta.filterConfig.map((filter) => (
            <label key={filter.key} className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">
              <span className="mb-1 block">{filter.label}</span>
              {filter.type === 'select' ? (
                <select
                  value={filters[filter.key]}
                  onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
                  className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={filters[filter.key]}
                  onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
                  placeholder={filter.placeholder}
                  className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                />
              )}
            </label>
          ))}
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-auto rounded-md border border-outline-variant/30">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-surface-container-high">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-2 font-semibold text-on-surface">
                      {column}
                    </th>
                  ))}
                  {(type === 'products' || type === 'categories') && (
                    <th className="px-3 py-2 font-semibold text-on-surface">actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`${row.id || rowIndex}`} className="border-t border-outline-variant/20">
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="px-3 py-2 text-on-surface-variant">
                        {renderValue(row[column])}
                      </td>
                    ))}
                    {(type === 'products' || type === 'categories') && (
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          disabled={deletingId === row.id}
                          onClick={() => handleDelete(row.id)}
                          className="rounded-md border border-error/40 bg-error/10 px-3 py-1 text-xs font-semibold text-error disabled:opacity-60"
                        >
                          {deletingId === row.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
