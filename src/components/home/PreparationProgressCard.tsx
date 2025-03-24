import React, { useState } from 'react';
import { ChevronRight, AlertCircle, CheckCircle2, BarChart2, ClipboardList, Flame } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import PreparationDetailsModal from '../modals/PreparationDetailsModal';

interface PreparationMetrics {
  questionsCompleted: number;
  totalQuestions: number;
  averageScore: number;
  topicsCovered: number;
  totalTopics: number;
  studyHours: number;
  recommendedHours: number;
}

interface StatisticsData {
  questionsCompleted: number;
  averageScore: number;
  testsTaken: number;
  studyStreak: number;
}

interface Props {
  statistics: StatisticsData;
}

const PreparationProgressCard = ({ statistics }: Props) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data - In production, this would come from your app's state management
  const preparationMetrics: PreparationMetrics = {
    questionsCompleted: 750,
    totalQuestions: 1250,
    averageScore: 82,
    topicsCovered: 6,
    totalTopics: 8,
    studyHours: 120,
    recommendedHours: 200
  };

  const calculatePreparationProgress = () => {
    // Weight factors for different metrics (total = 100%)
    const weights = {
      questionsCompleted: 0.3, // 30%
      averageScore: 0.3,      // 30%
      topicsCoverage: 0.25,   // 25%
      studyHours: 0.15        // 15%
    };

    // Calculate individual progress metrics
    const questionProgress = (preparationMetrics.questionsCompleted / preparationMetrics.totalQuestions) * 100;
    const scoreProgress = preparationMetrics.averageScore;
    const topicProgress = (preparationMetrics.topicsCovered / preparationMetrics.totalTopics) * 100;
    const hoursProgress = (preparationMetrics.studyHours / preparationMetrics.recommendedHours) * 100;

    // Calculate weighted average
    const totalProgress = (
      questionProgress * weights.questionsCompleted +
      scoreProgress * weights.averageScore +
      topicProgress * weights.topicsCoverage +
      hoursProgress * weights.studyHours
    );

    return Math.min(100, Math.max(0, totalProgress));
  };

  return (
    <>
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Preparation Progress</h3>
              <Tooltip content="Track your exam preparation progress based on questions completed, average scores, topics covered, and study hours">
                <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
              </Tooltip>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePreparationProgress()}%` }}
                  />
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 min-w-[4rem] text-center">
                  {Math.round(calculatePreparationProgress())}%
                </span>
                <button
                  onClick={() => setShowDetailsModal(true)}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-lg transition-colors flex items-center gap-1"
                >
                  Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Questions Completed</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{statistics.questionsCompleted}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{statistics.averageScore}%</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tests Taken</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{statistics.testsTaken}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Study Streak</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{statistics.studyStreak} days</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PreparationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        metrics={preparationMetrics}
      />
    </>
  );
};

export default PreparationProgressCard;