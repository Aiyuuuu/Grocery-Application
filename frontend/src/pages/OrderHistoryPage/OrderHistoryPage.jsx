import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../../api/services';
import { formatPKR } from '../../utils/currency';

const filters = [
  { value: 'all', label: 'All Orders' },
  { value: 'placed', label: 'Placed' },
  { value: 'packaged', label: 'Packaged' },
  { value: 'enroute', label: 'En Route' },
  { value: 'arrived', label: 'Arrived' },
];

function getStatusStyles(status) {
  if (status === 'arrived') {
    return {
      chip: 'bg-emerald-500/20 text-emerald-200',
      icon: 'task_alt',
    };
  }

  if (status === 'enroute') {
    return {
      chip: 'bg-sky-500/20 text-sky-200',
      icon: 'local_shipping',
    };
  }

  if (status === 'packaged') {
    return {
      chip: 'bg-amber-500/20 text-amber-200',
      icon: 'inventory_2',
    };
  }

  return {
    chip: 'bg-indigo-500/20 text-indigo-200',
    icon: 'shopping_bag',
  };
}

function getStatusLabel(status) {
  if (status === 'arrived') return 'Arrived';
  if (status === 'enroute') return 'En Route';
  if (status === 'packaged') return 'Packaged';
  return 'Placed';
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await ordersService.listOrders();
        setOrders(data);
      } catch (loadError) {
        setError(loadError?.message || 'Failed to load your order history.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const visibleOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return orders;
    }

    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter, orders]);

  const arrivedCount = orders.filter((order) => order.status === 'arrived').length;
  const enRouteCount = orders.filter((order) => order.status === 'enroute').length;
  const lifetimeSpend = orders.reduce((sum, order) => sum + order.total, 0);

  // console.log(orders)
  return (
    <section className="w-full px-6 lg:px-12 2xl:px-24 pb-16">
      <header className="mb-8 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 lg:p-8 shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-primary font-semibold">CartZen</span>
            <h1 className="mt-2 text-3xl lg:text-4xl font-headline font-bold text-on-surface">Order History</h1>
            <p className="mt-2 text-on-surface-variant">Your curated selection of past provisions.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-4 py-2 font-semibold text-on-primary-container hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-xl bg-surface-container p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">Arrived Orders</p>
            <p className="mt-2 text-2xl font-headline font-bold text-on-surface">{arrivedCount}</p>
          </article>
          <article className="rounded-xl bg-surface-container p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">En Route</p>
            <p className="mt-2 text-2xl font-headline font-bold text-on-surface">{enRouteCount}</p>
          </article>
          <article className="rounded-xl bg-surface-container p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">Lifetime Spend</p>
            <p className="mt-2 text-2xl font-headline font-bold text-primary">{formatPKR(lifetimeSpend)}</p>
          </article>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface-variant">
          <span className="material-symbols-outlined text-base">tune</span>
          Filter
        </span>
        {filters.map((filter) => {
          const active = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-8 text-center">
            <p className="text-on-surface-variant">Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">receipt_long</span>
            <h2 className="mt-3 text-xl font-headline font-semibold">No orders in this filter</h2>
            <p className="mt-2 text-on-surface-variant">Try a different filter, or place your first curated order.</p>
          </div>
        ) : null}

        {!loading && !error ? (
          visibleOrders.map((order) => {
            const statusUi = getStatusStyles(order.status);
            const statusLabel = getStatusLabel(order.status);

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 sm:p-5 hover:bg-surface-container transition-colors"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-on-surface-variant">{statusUi.icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-headline font-semibold text-on-surface truncate">#{order.orderNumber}</h3>
                      <p className="text-sm text-on-surface-variant inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusUi.chip}`}>
                      {statusLabel}
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-on-surface">{formatPKR(order.total)}</p>
                      <p className="text-xs text-on-surface-variant">{order.itemCount} items</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                      aria-label={`Open order ${order.id}`}
                    >
                      <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : null}
      </div>
    </section>
  );
}
