import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import { adminService } from '../../api/services';
import { formatPKR } from '../../utils/currency';
import { fetchAdminDashboardData } from './adminData';
import { CHART_COLORS, ensureChartConfig } from './chartConfig';
import KpiCard from './components/KpiCard';
import AddCategoryModal from './components/AddCategoryModal';
import AddProductModal from './components/AddProductModal';
import DataTableModal from './components/DataTableModal';

ensureChartConfig();

const GRANULARITY_OPTIONS = [
  { id: 'day', label: 'Days', unit: 'day' },
  { id: 'week', label: 'Weeks', unit: 'week' },
  { id: 'month', label: 'Months', unit: 'month' },
  { id: 'year', label: 'Years', unit: 'year' },
];

const ACTION_BUTTONS = [
  { id: 'add-product', label: 'Add Product' },
  { id: 'add-category', label: 'Add Category' },
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'users', label: 'Users' },
  { id: 'orders', label: 'Orders' },
];

const DONUT_PALETTE = [
  CHART_COLORS.emerald,
  CHART_COLORS.cyan,
  CHART_COLORS.coral,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
  CHART_COLORS.mint,
];

function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function getLineOptions(title, granularityUnit, yAxisLabel, yTickFormatter) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(18,18,18,0.9)',
        borderColor: 'rgba(72,72,71,0.35)',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${title}: ${yTickFormatter(context.parsed.y)}`,
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: granularityUnit,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: CHART_COLORS.steel,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(72,72,71,0.2)',
          borderDash: [4, 4],
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: CHART_COLORS.steel,
        },
        ticks: {
          color: CHART_COLORS.steel,
          callback: yTickFormatter,
        },
      },
    },
  };
}

function getDonutOptions(valueFormatter) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: CHART_COLORS.steel,
          usePointStyle: true,
          boxWidth: 10,
          padding: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${valueFormatter(context.parsed)}`,
        },
      },
    },
  };
}

function highlightSql(sqlText) {
  const KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'ON', 'AND', 'OR', 'NOT', 'NULL', 'AS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT',
    'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'ALTER', 'ADD', 'DROP', 'INDEX', 'UNIQUE',
    'FETCH', 'FIRST', 'ROWS', 'ONLY', 'NUMBER', 'VARCHAR2', 'TIMESTAMP', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
  ]);

  const tokenRegex = /(\/\*[^]*?\*\/|--[^\n]*|'(?:''|[^'])*'|\b[A-Za-z_][A-Za-z0-9_]*\b|\d+(?:\.\d+)?|\S)/g;
  const lines = String(sqlText || '').split('\n');

  return lines.map((line, lineIndex) => {
    const tokens = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(line)) !== null) {
      const token = match[0];
      const start = match.index;

      if (start > lastIndex) {
        tokens.push(
          <span key={`plain-${lineIndex}-${lastIndex}`} className="text-on-surface-variant">
            {line.slice(lastIndex, start)}
          </span>
        );
      }

      let className = 'text-on-surface-variant';
      if (token.startsWith('--') || token.startsWith('/*')) {
        className = 'text-emerald-300/80';
      } else if (token.startsWith("'")) {
        className = 'text-amber-300';
      } else if (/^\d/.test(token)) {
        className = 'text-cyan-300';
      } else if (KEYWORDS.has(token.toUpperCase())) {
        className = 'text-violet-300 font-semibold';
      } else if (/^[(),.;]$/.test(token)) {
        className = 'text-on-surface-variant/70';
      }

      tokens.push(
        <span key={`tok-${lineIndex}-${start}`} className={className}>
          {token}
        </span>
      );

      lastIndex = start + token.length;
    }

    if (lastIndex < line.length) {
      tokens.push(
        <span key={`tail-${lineIndex}-${lastIndex}`} className="text-on-surface-variant">
          {line.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div key={`line-${lineIndex}`} className="whitespace-pre">
        {tokens.length > 0 ? tokens : <span className="text-on-surface-variant"> </span>}
      </div>
    );
  });
}

export default function AdminDashboardPage() {
  const [granularity, setGranularity] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customSql, setCustomSql] = useState('SELECT COUNT(*) AS users_count FROM users');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [queryRows, setQueryRows] = useState([]);
  const [queryResultMeta, setQueryResultMeta] = useState(null);
  const [schemaSql, setSchemaSql] = useState('');
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [adminMutationTick, setAdminMutationTick] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalRevenue: 0,
      conversionRate: 0,
    },
    trends: {
      orderVolume: [],
      aov: [],
      revenueGrowth: [],
    },
    categories: {
      ordersByCategory: [],
      revenueByCategory: [],
    },
  });

  const orderVolumeRef = useRef(null);
  const aovRef = useRef(null);
  const revenueRef = useRef(null);

  const selectedGranularity = useMemo(
    () => GRANULARITY_OPTIONS.find((option) => option.id === granularity) || GRANULARITY_OPTIONS[0],
    [granularity]
  );

  const hasInvalidRange = Boolean(startDate && endDate && startDate > endDate);

  useEffect(() => {
    let isMounted = true;

    async function loadSchema() {
      try {
        setSchemaLoading(true);
        setSchemaError('');
        const sql = await adminService.getSchemaSql();
        if (isMounted) {
          setSchemaSql(sql);
        }
      } catch (requestError) {
        if (isMounted) {
          setSchemaError(requestError?.response?.data?.message || requestError?.message || 'Failed to load schema file');
        }
      } finally {
        if (isMounted) {
          setSchemaLoading(false);
        }
      }
    }

    loadSchema();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasInvalidRange) {
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const payload = await fetchAdminDashboardData({
          granularity,
          startDate,
          endDate,
        });

        if (!isMounted) {
          return;
        }

        setDashboardData(payload);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError?.response?.data?.message || requestError?.message || 'Failed to load admin analytics');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [granularity, startDate, endDate, hasInvalidRange, adminMutationTick]);

  function handleActionClick(actionId) {
    setActiveModal(actionId);
  }

  function handleMutationDone() {
    setAdminMutationTick((prev) => prev + 1);
  }

  function resetZoom() {
    [orderVolumeRef, aovRef, revenueRef].forEach((ref) => {
      if (ref.current) {
        ref.current.resetZoom();
      }
    });
  }

  async function executeCustomQuery() {
    try {
      const sql = String(customSql || '').trim();
      if (!sql) {
        setQueryError('SQL cannot be empty.');
        setQueryRows([]);
        setQueryResultMeta(null);
        return;
      }

      setQueryLoading(true);
      setQueryError('');

      const payload = await adminService.runAdminQuery(sql, []);

      if (Array.isArray(payload.rows)) {
        setQueryRows(payload.rows);
        setQueryResultMeta({ kind: 'rows', count: payload.rows.length });
      } else {
        setQueryRows([]);
        setQueryResultMeta({ kind: 'result', payload: payload.result || null });
      }
    } catch (requestError) {
      setQueryError(requestError?.response?.data?.message || requestError?.message || 'Query failed');
      setQueryRows([]);
      setQueryResultMeta(null);
    } finally {
      setQueryLoading(false);
    }
  }

  const orderVolumeData = {
    datasets: [
      {
        label: 'Order Volume',
        data: dashboardData.trends.orderVolume,
        borderColor: CHART_COLORS.emerald,
        backgroundColor: 'rgba(105, 246, 184, 0.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const aovData = {
    datasets: [
      {
        label: 'Average Order Value',
        data: dashboardData.trends.aov,
        borderColor: CHART_COLORS.cyan,
        backgroundColor: 'rgba(0, 220, 253, 0.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const revenueGrowthData = {
    datasets: [
      {
        label: 'Revenue Growth',
        data: dashboardData.trends.revenueGrowth,
        borderColor: CHART_COLORS.violet,
        backgroundColor: 'rgba(197, 139, 242, 0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const ordersByCategoryData = {
    labels: dashboardData.categories.ordersByCategory.map((entry) => entry.label),
    datasets: [
      {
        data: dashboardData.categories.ordersByCategory.map((entry) => entry.value),
        backgroundColor: DONUT_PALETTE,
        borderWidth: 0,
      },
    ],
  };

  const revenueByCategoryData = {
    labels: dashboardData.categories.revenueByCategory.map((entry) => entry.label),
    datasets: [
      {
        data: dashboardData.categories.revenueByCategory.map((entry) => entry.value),
        backgroundColor: DONUT_PALETTE,
        borderWidth: 0,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-8 lg:px-10 lg:py-10">
      <section className="mx-auto max-w-[1400px] space-y-8">
        <header className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-[0_20px_44px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-primary">CartZen Admin</p>
              <h1 className="mt-2 font-headline text-3xl font-bold text-on-surface lg:text-4xl">Analytics Dashboard</h1>
              <p className="mt-2 text-on-surface-variant">Operational metrics and revenue intelligence with live database-backed queries.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="rounded-md border border-outline-variant/30 bg-surface-container px-3 py-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
              >
                Home
              </Link>
              {ACTION_BUTTONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleActionClick(action.id)}
                  className="rounded-md border border-outline-variant/30 bg-surface-container px-3 py-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-outline-variant/20 bg-surface-container p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm text-on-surface-variant">
                <span className="mb-1 block text-xs uppercase tracking-[0.16em]">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
                />
              </label>

              <label className="text-sm text-on-surface-variant">
                <span className="mb-1 block text-xs uppercase tracking-[0.16em]">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  className="h-[42px] w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear Date Range
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {GRANULARITY_OPTIONS.map((option) => {
                const active = option.id === granularity;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setGranularity(option.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                      active
                        ? 'bg-primary text-on-primary-container'
                        : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={resetZoom}
                className="rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-semibold tracking-wide text-on-surface-variant hover:text-on-surface"
              >
                Reset Zoom
              </button>
            </div>
          </div>

          {hasInvalidRange ? (
            <p className="mt-3 text-sm text-error">Start date cannot be after end date.</p>
          ) : null}
        </header>

        {error ? (
          <section className="rounded-xl border border-error/40 bg-error/10 p-4 text-error">{error}</section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Total Users" value={formatCompactNumber(dashboardData.kpis.totalUsers)} />
          <KpiCard title="Total Orders" value={formatCompactNumber(dashboardData.kpis.totalOrders)} />
          <KpiCard title="Total Products" value={formatCompactNumber(dashboardData.kpis.totalProducts)} />
          <KpiCard title="Total Revenue" value={formatPKR(dashboardData.kpis.totalRevenue)} />
          <KpiCard
            title="Conversion Rate"
            value={`${dashboardData.kpis.conversionRate.toFixed(2)}%`}
            subtitle="Paying customers / total users"
          />
        </section>

        <section className="space-y-5">
          <article className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-3">
              <h2 className="font-headline text-2xl font-semibold text-on-surface">Order Volume</h2>
              <p className="text-sm text-on-surface-variant">X-axis zoom supports dynamic {selectedGranularity.label.toLowerCase()} scaling.</p>
            </div>
            <div className="h-72">
              <Line
                ref={orderVolumeRef}
                data={orderVolumeData}
                options={getLineOptions('Order Volume', selectedGranularity.unit, 'Orders', (value) => Number(value).toFixed(0))}
              />
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-3">
              <h2 className="font-headline text-2xl font-semibold text-on-surface">Average Order Value (AOV)</h2>
              <p className="text-sm text-on-surface-variant">Trend of average total price per order over time.</p>
            </div>
            <div className="h-72">
              <Line
                ref={aovRef}
                data={aovData}
                options={getLineOptions('AOV', selectedGranularity.unit, 'AOV (PKR)', (value) => formatPKR(value))}
              />
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-3">
              <h2 className="font-headline text-2xl font-semibold text-on-surface">Revenue Growth</h2>
              <p className="text-sm text-on-surface-variant">Revenue accumulation with temporal zooming and pan.</p>
            </div>
            <div className="h-72">
              <Line
                ref={revenueRef}
                data={revenueGrowthData}
                options={getLineOptions('Revenue Growth', selectedGranularity.unit, 'Revenue (PKR)', (value) => formatPKR(value))}
              />
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-3">
              <h2 className="font-headline text-2xl font-semibold text-on-surface">Orders by Category</h2>
              <p className="text-sm text-on-surface-variant">Distribution of distinct orders across categories.</p>
            </div>
            <div className="h-72">
              <Doughnut
                data={ordersByCategoryData}
                options={getDonutOptions((value) => formatCompactNumber(value))}
              />
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-3">
              <h2 className="font-headline text-2xl font-semibold text-on-surface">Revenue by Category</h2>
              <p className="text-sm text-on-surface-variant">Financial contribution grouped by category.</p>
            </div>
            <div className="h-72">
              <Doughnut
                data={revenueByCategoryData}
                options={getDonutOptions((value) => formatPKR(value))}
              />
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
          <div className="mb-3">
            <h2 className="font-headline text-2xl font-semibold text-on-surface">Database Schema</h2>
            <p className="text-sm text-on-surface-variant">Live schema.sql fetched from backend.</p>
          </div>

          {schemaError ? <p className="text-sm text-error">{schemaError}</p> : null}

          {schemaLoading ? (
            <p className="text-sm text-on-surface-variant">Loading schema...</p>
          ) : (
            <div className="max-h-[520px] overflow-auto rounded-md border border-outline-variant/30 bg-[#0d0f14] p-4 font-mono text-xs leading-6">
              {highlightSql(schemaSql)}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
          <div className="mb-3">
            <h2 className="font-headline text-2xl font-semibold text-on-surface">Admin Query Console</h2>
            <p className="text-sm text-on-surface-variant">Run arbitrary SQL directly from the dashboard.</p>
          </div>

          <textarea
            value={customSql}
            onChange={(event) => setCustomSql(event.target.value)}
            className="h-36 w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
            placeholder="SELECT * FROM users FETCH FIRST 20 ROWS ONLY"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={executeCustomQuery}
              disabled={queryLoading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-70"
            >
              {queryLoading ? 'Running...' : 'Run Query'}
            </button>
            {queryResultMeta?.kind === 'rows' ? (
              <p className="text-xs text-on-surface-variant">Returned {queryResultMeta.count} row(s)</p>
            ) : null}
            {queryResultMeta?.kind === 'result' ? (
              <p className="text-xs text-on-surface-variant">
                Non-select result: {JSON.stringify(queryResultMeta.payload || {})}
              </p>
            ) : null}
          </div>

          {queryError ? <p className="mt-2 text-sm text-error">{queryError}</p> : null}

          {queryRows.length > 0 ? (
            <div className="mt-4 overflow-auto rounded-md border border-outline-variant/30">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-surface-container-high">
                  <tr>
                    {Object.keys(queryRows[0]).map((column) => (
                      <th key={column} className="px-3 py-2 font-semibold text-on-surface">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-outline-variant/20">
                      {Object.keys(queryRows[0]).map((column) => (
                        <td key={`${rowIndex}-${column}`} className="px-3 py-2 text-on-surface-variant">
                          {String(row[column] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        {loading ? <p className="text-sm text-on-surface-variant">Loading dashboard data...</p> : null}
      </section>

      {activeModal === 'add-product' ? (
        <AddProductModal
          onClose={() => setActiveModal(null)}
          onSaved={handleMutationDone}
        />
      ) : null}

      {activeModal === 'add-category' ? (
        <AddCategoryModal
          onClose={() => setActiveModal(null)}
          onSaved={handleMutationDone}
        />
      ) : null}

      {['products', 'categories', 'users', 'orders'].includes(activeModal || '') ? (
        <DataTableModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          onMutate={handleMutationDone}
        />
      ) : null}
    </main>
  );
}
