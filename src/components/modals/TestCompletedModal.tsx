import React from 'react';
import { CheckCircle, BarChart } from 'lucide-react';

interface TestCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewResults: () => void;
  questionsAnswered: number;
  totalQuestions: number;
}

const TestCompletedModal = ({ 
  isOpen, 
  onClose, 
  onViewResults, 
  questionsAnswered, 
  totalQuestions 
}: TestCompletedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl overflow-hidden p-0">
        <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-6 flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-center">Test Complete!</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              You have completed all questions in this test.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium rounded-lg p-4 mb-4">
              {questionsAnswered} of {totalQuestions} questions answered
            </div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Ready to review your performance?
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={onViewResults}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <BarChart className="w-5 h-5" />
              <span>View Results</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCompletedModal;
