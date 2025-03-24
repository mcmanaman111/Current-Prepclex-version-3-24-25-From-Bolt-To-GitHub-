import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import PreparationProgressCard from '../components/home/PreparationProgressCard';
import PerformanceView from '../components/test-results/PerformanceView';
import PerformanceLineChart from '../components/performance/PerformanceLineChart';
import { mockQuestions } from '../data/mockData';
import type { ClientNeedsData } from '../types/exam';

const Performance = () => {
  const statisticsData = {
    questionsCompleted: 750,
    averageScore: 82,
    testsTaken: 15,
    studyStreak: 7
  };

  // Mock data for performance trend - last 10 exams
  const performanceData = [85, 78, 92, 88, 75, 82, 90, 85, 95, 88];

  // Calculate trend
  const calculateTrend = () => {
    if (performanceData.length < 2) return 0;
    const firstScore = performanceData[0];
    const lastScore = performanceData[performanceData.length - 1];
    return lastScore - firstScore;
  };

  const trend = calculateTrend();

  // Mock data for overall performance
  const mockClientNeedsData: ClientNeedsData = {
    'Management of Care': {
      correct: 180,
      total: 224,
      topics: {
        'Assignment and Delegation': { correct: 45, total: 56 },
        'Case Management': { correct: 42, total: 56 },
        'Legal Rights and Responsibilities': { correct: 48, total: 56 },
        'Ethics and Advocacy': { correct: 45, total: 56 }
      }
    },
    'Safety and Infection Control': {
      correct: 125,
      total: 156,
      topics: {
        'Standard Precautions': { correct: 32, total: 39 },
        'Emergency Response': { correct: 31, total: 39 },
        'Error Prevention': { correct: 30, total: 39 },
        'Safe Handling': { correct: 32, total: 39 }
      }
    },
    'Health Promotion and Maintenance': {
      correct: 142,
      total: 178,
      topics: {
        'Health Screening': { correct: 36, total: 45 },
        'Disease Prevention': { correct: 35, total: 44 },
        'Lifestyle Choices': { correct: 36, total: 45 },
        'Growth and Development': { correct: 35, total: 44 }
      }
    },
    'Psychosocial Integrity': {
      correct: 108,
      total: 134,
      topics: {
        'Coping Mechanisms': { correct: 27, total: 34 },
        'Mental Health Concepts': { correct: 27, total: 33 },
        'Crisis Intervention': { correct: 27, total: 34 },
        'Cultural Awareness': { correct: 27, total: 33 }
      }
    }
  };

  // Create mock scores for the questions
  const mockScores = mockQuestions.reduce((acc, q) => ({
    ...acc,
    [q.id]: {
      correct: Math.random() > 0.3 ? 1 : 0,
      total: 1,
      incorrect: Math.random() > 0.3 ? 0 : 1,
      isFullyCorrect: Math.random() > 0.3,
      nclexScore: Math.random() > 0.3 ? 1 : 0,
      percentage: Math.random() > 0.3 ? 100 : 0
    }
  }), {});

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl md:rounded-2xl p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-700" />
                <h2 className="text-4xl font-bold text-blue-900">Performance Analytics</h2>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-blue-900">{statisticsData.averageScore}%</div>
                <div className="text-sm text-blue-700">Overall Score</div>
              </div>
            </div>
            <p className="text-blue-700 mt-2">Comprehensive analysis of all test performance</p>
            <div className="flex flex-wrap gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Tests Taken: {statisticsData.testsTaken}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Questions Completed: {statisticsData.questionsCompleted}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Study Streak: {statisticsData.studyStreak} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart Section */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-blue-900">Performance Trend</h3>
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
          <PerformanceLineChart data={performanceData} darkMode={false} />
        </div>
      </div>
      
      {/* Performance View */}
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <PerformanceView 
            questions={mockQuestions}
            scores={mockScores}
            clientNeedsData={mockClientNeedsData}
            correctAnswers={statisticsData.questionsCompleted * 0.82}
            partiallyCorrect={statisticsData.questionsCompleted * 0.1}
            overallScore={statisticsData.averageScore}
          />
        </div>
      </div>
      
      {/* Preparation Progress Card */}
      <PreparationProgressCard statistics={statisticsData} />
    </div>
  );
};

export default Performance;