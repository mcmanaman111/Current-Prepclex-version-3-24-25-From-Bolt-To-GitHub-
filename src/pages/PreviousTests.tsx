import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import PerformanceBarGraph from '../components/performance/PerformanceBarGraph';

const PreviousTests = () => {
  // Mock data for performance trend - last 10 exams
  const performanceData = [85, 78, 92, 88, 75, 82, 90, 85, 95, 88];
  
  // Generate mock tests based on performance data
  const mockTests = performanceData.map((score, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (performanceData.length - 1 - index));
    return {
      id: index + 1,
      date: date.toISOString().split('T')[0],
      score,
      questions: Math.floor(Math.random() * 26) + 50, // Random between 50-75 questions
      time: Math.floor(Math.random() * 31) + 60, // Random between 60-90 minutes
      type: Math.random() > 0.5 ? 'Practice Test' : 'Timed Test'
    };
  }).reverse(); // Reverse to show most recent first

  // Calculate trend
  const calculateTrend = () => {
    if (performanceData.length < 2) return 0;
    const firstScore = performanceData[0];
    const lastScore = performanceData[performanceData.length - 1];
    return lastScore - firstScore;
  };

  const trend = calculateTrend();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl md:rounded-2xl p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-700" />
                <h2 className="text-4xl font-bold text-blue-900">Previous Tests</h2>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-blue-900">82%</div>
                <div className="text-sm text-blue-700">Overall Score</div>
              </div>
            </div>
            <p className="text-blue-700 mt-2">Review your test history and performance</p>
            <div className="flex flex-wrap gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Tests Taken: 15</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Average Score: 82%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Average Time: 95m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Graph Section */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-blue-900">Recent Test Scores</h3>
              <div className="px-3 py-1 text-xs font-medium bg-blue-600/10 text-blue-700 rounded-full">
                Last 10 Exams
              </div>
            </div>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 text-blue-700`}>
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">{Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}</span>
              </div>
            )}
          </div>
          <PerformanceBarGraph data={performanceData} darkMode={false} />
        </div>
      </div>

      {/* Test History Table */}
      <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Test History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time (min)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-lighter divide-y divide-gray-200 dark:divide-gray-700">
                {mockTests.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{test.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{test.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{test.questions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{test.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        test.score >= 80 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {test.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviousTests;