import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  BarElement,
  PointElement,
  TimeScale,
  Tooltip,
  ArcElement,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

let configured = false;

const CHART_COLORS = {
  emerald: '#69f6b8',
  cyan: '#00dcfd',
  coral: '#ff716c',
  amber: '#fbbc04',
  violet: '#c58bf2',
  mint: '#57edb1',
  steel: '#adaaaa',
};

export function ensureChartConfig() {
  if (configured) {
    return;
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    TimeScale,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
    zoomPlugin
  );

  ChartJS.defaults.font.family = 'Plus Jakarta Sans, sans-serif';
  ChartJS.defaults.color = '#adaaaa';

  configured = true;
}

export { CHART_COLORS };
