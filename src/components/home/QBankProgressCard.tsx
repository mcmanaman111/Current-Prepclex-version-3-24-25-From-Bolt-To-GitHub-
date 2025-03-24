import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Props {
  total: number;
  used: number;
  unused: number;
  omitted: number;
}

const QBankProgressCard = ({ total, used, unused, omitted }: Props) => {
  const data = {
    labels: ['Completed', 'Remaining', 'Marked'],
    datasets: [{
      data: [used, unused, omitted],
      backgroundColor: [
        'rgba(37, 99, 235, 0.8)',
        'rgba(209, 213, 219, 0.8)',
        'rgba(59, 130, 246, 0.5)'
      ],
      borderWidth: 0
    }]
  };

  const options = {
    cutout: '75%',
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  return (
    <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg h-[300px]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">QBank Progress</h3>
      <div className="relative h-[180px]">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{total}</div>
            <div className="text-xs text-gray-500">Total Questions</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-800 dark:text-white">{used}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-800 dark:text-white">{unused}</div>
          <div className="text-xs text-gray-500">Remaining</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-800 dark:text-white">{omitted}</div>
          <div className="text-xs text-gray-500">Marked</div>
        </div>
      </div>
    </div>
  );
};

export default QBankProgressCard;