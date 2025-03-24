import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Brain } from 'lucide-react';

interface Props {
  correctAnswers: number;
  partiallyCorrect: number;
  averageTime: string;
  topicsMastered: string;
}

const QuickStats = ({ correctAnswers, partiallyCorrect, averageTime, topicsMastered }: Props) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      <div className="bg-white dark:bg-dark-lighter p-4 md:p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{correctAnswers}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-lighter p-4 md:p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Partially Correct</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{partiallyCorrect}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-lighter p-4 md:p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time per Question</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{averageTime}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-lighter p-4 md:p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Topics Mastered</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{topicsMastered}</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
            <Brain className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;