import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  testId: string;
}

const TimerExpiredDialog = ({ isOpen, testId }: Props) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewResults = () => {
    navigate(`/results/${testId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Time's Up!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Your test time has expired
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The allotted time for this test has ended. Your answers have been automatically submitted.
          </p>

          <button
            onClick={handleViewResults}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            View Test Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerExpiredDialog;