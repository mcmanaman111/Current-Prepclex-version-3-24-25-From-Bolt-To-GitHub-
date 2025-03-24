import React from 'react';
import { CheckCircle2, BarChart2, ClipboardList, Flame } from 'lucide-react';

interface Props {
  data: {
    questionsCompleted: number;
    averageScore: number;
    testsTaken: number;
    studyStreak: number;
  };
}

const StatisticsSection = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white dark:bg-dark-lighter p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Questions Completed</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">{data.questionsCompleted}</p>
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
            <p className="text-lg font-bold text-gray-800 dark:text-white">{data.averageScore}%</p>
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
            <p className="text-lg font-bold text-gray-800 dark:text-white">{data.testsTaken}</p>
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
            <p className="text-lg font-bold text-gray-800 dark:text-white">{data.studyStreak} days</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <Flame className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;