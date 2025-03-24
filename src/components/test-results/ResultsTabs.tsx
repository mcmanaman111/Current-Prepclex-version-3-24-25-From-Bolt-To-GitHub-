import React from 'react';
import { Target, BarChart2, BarChartIcon as ChartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  testId: string;
}

const ResultsTabs = ({ activeTab, onTabChange, testId }: Props) => {
  const navigate = useNavigate();

  const handleReviewTest = () => {
    navigate('/exam', {
      state: {
        reviewMode: true,
        testId
      }
    });
  };

  return (
    <div className="flex justify-between items-center px-4">
      <nav className="-mb-px flex overflow-x-auto">
        <button
          onClick={() => onTabChange('results')}
          className={`py-3 md:py-4 px-4 md:px-6 text-lg font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'results'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>Test Results</span>
        </button>
        <button
          onClick={() => onTabChange('performance')}
          className={`py-3 md:py-4 px-4 md:px-6 text-lg font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'performance'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ChartIcon className="w-5 h-5" />
          <span>Performance</span>
        </button>
        <button
          onClick={() => onTabChange('statistics')}
          className={`py-3 md:py-4 px-4 md:px-6 text-lg font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'statistics'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span>Statistics</span>
        </button>
      </nav>
      <button
        onClick={handleReviewTest}
        className="bg-[#2B3467] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#232952] transition-colors"
      >
        Review Test
      </button>
    </div>
  );
};

export default ResultsTabs;