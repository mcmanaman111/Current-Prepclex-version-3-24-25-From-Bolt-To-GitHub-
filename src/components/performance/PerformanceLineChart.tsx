import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

interface Props {
  data: number[];
  darkMode?: boolean;
}

const PerformanceLineChart = ({ data, darkMode = false }: Props) => {
  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => `Test ${i + 1}`),
    datasets: [{
      label: 'Score',
      data,
      borderColor: darkMode ? '#fff' : '#2563eb',
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 160);
        if (darkMode) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
        }
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: darkMode ? '#fff' : '#2563eb',
      pointBorderColor: darkMode ? '#1a237e' : '#fff',
      pointBorderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 30,
        left: 10,
        right: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#6B7280',
          font: {
            size: 12
          },
          callback: (value: number) => `${value}%`,
          padding: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#6B7280',
          font: {
            size: 12
          },
          padding: 10
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      },
      datalabels: {
        align: 'top',
        offset: 4,
        color: darkMode ? '#fff' : '#2563eb',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value: number) => `${value}%`
      }
    }
  };

  return (
    <div className="relative h-[200px]">
      <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};

export default PerformanceLineChart;