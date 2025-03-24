import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { CheckCircle2, BarChart2, ClipboardList, Flame } from 'lucide-react';
import type { ClientNeedsData } from '../../types/exam';

interface Props {
  performanceData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
  distributionData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }[];
  };
  clientNeedsData: ClientNeedsData;
  correctAnswers: number;
  partiallyCorrect: number;
  overallScore: number;
}

const StatisticsView = ({ 
  performanceData,
  distributionData,
  correctAnswers,
  partiallyCorrect,
  overallScore
}: Props) => {
  const totalQuestions = distributionData.datasets[0].data.reduce((a, b) => a + b, 0);

  const options = {
    cutout: '75%',
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Questions Completed</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{totalQuestions}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{overallScore}%</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Correct Answers</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{correctAnswers}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Partially Correct</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{partiallyCorrect}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Topic Distribution */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Topic Distribution</h3>
          <div className="relative">
            <Doughnut data={performanceData} options={options} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">{totalQuestions}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {performanceData.labels.map((label, index) => (
              <div key={label} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: performanceData.datasets[0].backgroundColor[index] }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {performanceData.datasets[0].data[index]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Question Type Distribution */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Question Type Distribution</h3>
          <div className="space-y-4">
            {distributionData.labels.map((label, index) => {
              const count = distributionData.datasets[0].data[index];
              const percentage = Math.round((count / totalQuestions) * 100);
              
              return (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answer Distribution */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Answer Distribution</h3>
          <div className="relative">
            <Doughnut 
              data={{
                labels: ['Correct', 'Partially Correct', 'Incorrect'],
                datasets: [{
                  data: [correctAnswers, partiallyCorrect, totalQuestions - (correctAnswers + partiallyCorrect)],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderWidth: 0
                }]
              }} 
              options={options} 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">{overallScore}%</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Correct</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">{correctAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Partially Correct</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">{partiallyCorrect}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Incorrect</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {totalQuestions - (correctAnswers + partiallyCorrect)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;