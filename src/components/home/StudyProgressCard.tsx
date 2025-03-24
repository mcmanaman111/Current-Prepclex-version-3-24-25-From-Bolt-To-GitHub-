import React from 'react';
import { Line } from 'react-chartjs-2';
import { Trophy, TrendingUp, Target } from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const StudyProgressCard = () => {
  const recentScores = [78, 82, 85, 88, 92];
  
  const chartData = {
    labels: recentScores.map((_, index) => `Test ${index + 1}`),
    datasets: [{
      label: 'Score',
      data: recentScores,
      borderColor: '#2563eb',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 160);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
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
        ticks: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        align: 'top',
        offset: 4,
        color: '#2563eb',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value) => `${value}%`
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Study Progress</h3>
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
          <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">7 days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Latest Score</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">92%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">Score Trend</h4>
        <div className="h-40">
          <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
      </div>
    </div>
  );
};

export default StudyProgressCard;