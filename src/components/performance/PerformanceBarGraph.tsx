import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: number[];
  darkMode?: boolean;
}

const PerformanceBarGraph = ({ data, darkMode = false }: Props) => {
  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => `Test ${i + 1}`),
    datasets: [{
      data,
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        if (darkMode) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        } else {
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        }
        return gradient;
      },
      hoverBackgroundColor: darkMode ? 'rgba(255, 255, 255, 0.9)' : '#2563eb',
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 20
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
        enabled: true,
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? '#fff' : '#000',
        bodyColor: darkMode ? '#fff' : '#000',
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.raw}%`
        }
      }
    }
  };

  return (
    <div className="relative h-[200px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PerformanceBarGraph;