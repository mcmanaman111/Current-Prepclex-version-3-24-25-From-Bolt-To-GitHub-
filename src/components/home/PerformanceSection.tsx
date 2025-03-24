import React from 'react';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  recentTests: Array<{
    date: string;
    score: number;
    totalQuestions: number;
  }>;
}

const PerformanceSection = ({ recentTests }: Props) => {
  // Take only the latest 10 tests and reverse them for chronological order
  const latestTests = recentTests.slice(0, 10).reverse();

  // Calculate trend
  const calculateTrend = () => {
    if (latestTests.length < 2) return 0;
    const firstScore = latestTests[0].score;
    const lastScore = latestTests[latestTests.length - 1].score;
    return lastScore - firstScore;
  };

  const trend = calculateTrend();

  const testScoresData = {
    labels: latestTests.map((_, index) => `${index + 1}`),
    datasets: [{
      label: 'Test Scores',
      data: latestTests.map(test => test.score),
      borderColor: '#3B82F6',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(241, 245, 249, 0.1)');
        return gradient;
      },
      pointBackgroundColor: '#3B82F6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { display: false },
        ticks: { 
          callback: (value: number) => `${value}%`,
          font: { 
            size: 13,
            weight: '600'
          },
          stepSize: 20 // This sets the interval to 20%
        }
      },
      x: { 
        grid: { display: false },
        title: {
          display: true,
          text: 'Latest 10 Tests',
          color: '#6B7280',
          font: {
            size: 13,
            weight: '600'
          },
          padding: { top: 20 }
        },
        ticks: { 
          font: { 
            size: 13,
            weight: '600'
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false // Disable default tooltip since we're showing values always
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value: number) => `${value}%`,
        color: '#3B82F6',
        font: {
          weight: 'bold',
          size: 12
        },
        padding: {
          bottom: 8
        }
      }
    },
    layout: {
      padding: {
        bottom: 16 // Add padding to the bottom of the chart
      }
    }
  };

  return (
    <div className="col-span-2 bg-white dark:bg-dark-lighter p-4 pb-8 rounded-xl shadow-lg h-[300px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Performance Trend</h3>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 ${
            trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}</span>
          </div>
        )}
      </div>
      <div className="h-[250px]">
        <Line data={testScoresData} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
};

export default PerformanceSection;