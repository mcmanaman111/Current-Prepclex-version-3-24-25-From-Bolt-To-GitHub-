import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ClientNeedsData } from '../../types/exam';

interface Props {
  data: ClientNeedsData;
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
}

const ClientNeedsBreakdown = ({ data, performanceData, distributionData }: Props) => {
  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    } else if (percentage >= 70) {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  };

  // Calculate total questions for distribution
  const totalDistributionQuestions = distributionData.datasets[0].data.reduce((a, b) => a + b, 0);
  const totalTopicQuestions = performanceData.datasets[0].data.reduce((a, b) => a + b, 0);

  return (
    <div className="flex gap-6">
      <div className="w-1/2 space-y-6">
        {Object.entries(data).map(([area, areaData]) => {
          const areaPercentage = Math.round((areaData.correct / areaData.total) * 100);
          const chartColors = getScoreBadgeColor(areaPercentage);
          
          return (
            <div key={area} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-6 mb-4">
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-800 dark:text-white">{area}</h4>
                </div>
                <div className="w-24 h-24 relative">
                  <Doughnut 
                    data={{
                      datasets: [{
                        data: [areaPercentage, 100 - areaPercentage],
                        backgroundColor: [
                          areaPercentage >= 80 ? 'rgba(34, 197, 94, 0.8)' : areaPercentage >= 70 ? 'rgba(234, 179, 8, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                          areaPercentage >= 80 ? 'rgba(34, 197, 94, 0.1)' : areaPercentage >= 70 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        ],
                        borderWidth: 0,
                        cutout: '75%'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800 dark:text-white">
                      {areaPercentage}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />
              <div className="space-y-3">
                {Object.entries(areaData.topics).map(([topic, topicData]) => {
                  const percentage = Math.round((topicData.correct / topicData.total) * 100);
                  return (
                    <div key={topic} className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-300 text-sm min-w-[180px]">{topic}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getScoreBadgeColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-1/2 space-y-6">
        {/* Topic Distribution */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Topic Distribution</h3>
          <div className="flex items-start gap-8">
            <div className="relative w-[180px] h-[180px]">
              <Doughnut 
                data={{
                  labels: performanceData.labels,
                  datasets: [{
                    data: performanceData.datasets[0].data,
                    backgroundColor: [
                      'rgba(37, 99, 235, 0.8)',  // blue
                      'rgba(16, 185, 129, 0.8)', // green
                      'rgba(245, 158, 11, 0.8)', // yellow
                      'rgba(239, 68, 68, 0.8)',  // red
                      'rgba(139, 92, 246, 0.8)', // purple
                      'rgba(236, 72, 153, 0.8)', // pink
                      'rgba(14, 165, 233, 0.8)', // light blue
                      'rgba(168, 85, 247, 0.8)'  // violet
                    ],
                    borderWidth: 0
                  }]
                }}
                options={{
                  cutout: '75%',
                  plugins: {
                    legend: { display: false }
                  },
                  maintainAspectRatio: true
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalTopicQuestions}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {performanceData.labels.map((label, index) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: performanceData.datasets[0].backgroundColor[index] }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {performanceData.datasets[0].data[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Type Distribution */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Question Type Distribution</h3>
          <div className="flex items-start gap-8">
            <div className="relative w-[180px] h-[180px]">
              <Doughnut 
                data={{
                  labels: distributionData.labels,
                  datasets: [{
                    data: distributionData.datasets[0].data,
                    backgroundColor: [
                      'rgba(37, 99, 235, 0.8)',   // blue
                      'rgba(59, 130, 246, 0.6)',  // lighter blue
                      'rgba(96, 165, 250, 0.4)',  // even lighter blue
                      'rgba(147, 197, 253, 0.3)'  // lightest blue
                    ],
                    borderWidth: 0
                  }]
                }}
                options={{
                  cutout: '75%',
                  plugins: {
                    legend: { display: false }
                  },
                  maintainAspectRatio: true
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalDistributionQuestions}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {distributionData.labels.map((label, index) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: distributionData.datasets[0].backgroundColor[index] }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {distributionData.datasets[0].data[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientNeedsBreakdown;