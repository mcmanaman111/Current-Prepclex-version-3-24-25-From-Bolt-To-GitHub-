import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { CheckCircle2, BarChart2, ClipboardList, Flame } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import QBankCard from './create-test/QBankCard';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const statisticsData = {
  questionsCompleted: 750,
  averageScore: 82,
  testsTaken: 15,
  studyStreak: 7
};

const qbankStats = {
  total: 1250,
  used: 750,
  unused: 425,
  omitted: 75
};

const recentTests = [
  { date: '2024-03-15', score: 85, totalQuestions: 75 },
  { date: '2024-03-14', score: 78, totalQuestions: 75 },
  { date: '2024-03-13', score: 82, totalQuestions: 75 },
  { date: '2024-03-12', score: 75, totalQuestions: 75 }
];

const Dashboard = () => {
  const testScoresData = {
    labels: recentTests.map((_, index) => `Test ${index + 1}`),
    datasets: [
      {
        label: 'Test Scores',
        data: recentTests.map(test => test.score),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          callback: (value: number) => `${value}%`
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Score: ${context.raw}%`
        }
      }
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Welcome and QBank Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Welcome back, John 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Would you like to create a test?</p>
          <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Create New Test
          </button>
        </div>

        {/* QBank Card */}
        <QBankCard {...qbankStats} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Questions Completed</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.questionsCompleted}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.averageScore}%</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tests Taken</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.testsTaken}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Study Streak</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.studyStreak} days</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Flame className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Test Scores */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Test Scores</h3>
          <Line data={testScoresData} options={options} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">{formatDate(test.date)}</span>
                <div className="flex-1 mx-4">
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(test.score)}`}
                      style={{ width: `${test.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-gray-800 dark:text-white font-semibold">{test.score}%</span>
                <button className="ml-4 text-blue-500 hover:text-blue-600 text-sm">
                  Review Test
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;