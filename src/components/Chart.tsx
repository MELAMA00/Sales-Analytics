import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

interface ChartProps {
  type: 'bar' | 'line' | 'doughnut';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
  title: string;
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ type, data, title, height = 400 }) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#CBD5E1' : '#334155';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(203, 213, 225, 0.5)';

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: axisColor },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: axisColor,
      },
    },
    ...(type !== 'doughnut' && {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: axisColor,
            callback: function(value: any) {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
            },
          },
          grid: { color: gridColor },
        },
        x: {
          ticks: { color: axisColor },
          grid: { color: gridColor },
        }
      },
    }),
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart;
