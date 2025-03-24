import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, BarChart2, ClipboardList, Flame } from 'lucide-react';
import WelcomeSection from '../components/home/WelcomeSection';
import ActivitySection from '../components/home/ActivitySection';
import CreateTestModal from '../components/modals/CreateTestFlow/CreateTestModal';
import QuickStartModal from '../components/modals/QuickStartModal';
import { statisticsData, qbankStats, recentTests } from '../data/homeData';
import type { TestConfig } from '../data/types';
import { mockQuestions, mockScores } from '../data/mockData';

const Home = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);

  const handleTestComplete = (config: TestConfig) => {
    setShowCreateModal(false);
    navigate('/exam', { state: { settings: config } });
  };

  const handleQuickStart = (settings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    questionCount: number;
    isQuickStart: boolean;
  }) => {
    setShowQuickStartModal(false);
    navigate('/exam', { state: { settings } });
  };

  // Function to view test results with mock data
  const viewMockResults = () => {
    // Create mock test data
    const mockTestData = {
      testId: `T${Date.now()}`,
      questions: mockQuestions,
      scores: mockScores,
      markedQuestions: [0, 2],
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      elapsedTime: '01:00:00'
    };

    navigate('/results', { state: mockTestData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/50 to-white dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 transition-colors">
      <div className="p-8 space-y-6">
        {/* Development Link */}
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Development Tools</h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                Temporary link for development purposes
              </p>
            </div>
            <button
              onClick={viewMockResults}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              View Mock Test Results
            </button>
          </div>
        </div>

        <WelcomeSection 
          onCreateTest={() => setShowCreateModal(true)}
          onQuickStart={() => setShowQuickStartModal(true)}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Questions Completed</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.questionsCompleted}</p>
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
                <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.averageScore}%</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tests Taken</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.testsTaken}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Study Streak</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{statisticsData.studyStreak} days</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
        
        <ActivitySection recentTests={recentTests} qbankStats={qbankStats} />

        <CreateTestModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onComplete={handleTestComplete}
        />

        <QuickStartModal
          isOpen={showQuickStartModal}
          onClose={() => setShowQuickStartModal(false)}
          onStart={handleQuickStart}
        />
      </div>
    </div>
  );
};

export default Home;