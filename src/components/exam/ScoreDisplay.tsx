import React from 'react';
import { Activity, Users, Timer, Gauge, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Score, QuestionStatistics } from '../../types/exam';
import { getDifficultyBadgeColor } from '../../utils/examUtils';

interface Props {
  score: Score;
  statistics: QuestionStatistics;
  questionId: string;
  testNumber: number;
  userId: string;
  cumulativeTestNumber: number;
}

const ScoreDisplay = ({ 
  score, 
  statistics, 
  questionId = "Q11374",
  testNumber = 14,
  userId = "12345",
  cumulativeTestNumber = 1212
}: Props) => {
  let icon, message, bgColor, textColor;

  // Format the combined ID string
  const formattedQuestionId = `QID: ${questionId}`;
  const formattedTestId = `TID: T${testNumber.toString().padStart(2, '0')}-${userId}-${cumulativeTestNumber}`;
  const combinedId = `${formattedQuestionId} | ${formattedTestId}`;

  if (score.isFullyCorrect) {
    icon = <CheckCircle2 className="w-6 h-6" />;
    message = "You are correct. Nice work!";
    bgColor = "bg-green-100 dark:bg-green-900/20";
    textColor = "text-green-700 dark:text-green-400";
  } else if (score.correct > 0 && score.correct < score.total) {
    icon = <AlertCircle className="w-6 h-6" />;
    message = "Partially correct. Review the explanation provided.";
    bgColor = "bg-blue-100 dark:bg-blue-900/20";
    textColor = "text-blue-700 dark:text-blue-400";
  } else {
    icon = <XCircle className="w-6 h-6" />;
    message = "Incorrect. Review the explanation provided.";
    bgColor = "bg-red-100 dark:bg-red-900/20";
    textColor = "text-red-700 dark:text-red-400";
  }

  return (
    <div className="mt-12 space-y-8">
      <div className={`${bgColor} ${textColor} px-6 py-4 rounded-full flex items-center justify-center gap-3`}>
        {icon}
        <span className="text-lg font-semibold">{message}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Your Score/Max:</span>
          <span className={`px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full`}>
            {score.correct}/{score.total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Peer Score:</span>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
            {statistics.avgPeerScore}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Time:</span>
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
            {statistics.timeTaken}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Difficulty:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyBadgeColor(statistics.difficulty)}`}>
            {statistics.difficulty}
          </span>
        </div>
      </div>

      {/* Combined ID Badge */}
      <div className="flex items-center justify-center">
        <span className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full font-mono">
          {combinedId}
        </span>
      </div>
    </div>
  );
};

export default ScoreDisplay;