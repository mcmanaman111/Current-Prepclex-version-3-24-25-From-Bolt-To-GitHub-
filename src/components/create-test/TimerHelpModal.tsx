import React from 'react';
import { X, Clock } from 'lucide-react';

interface TimerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimerHelpModal: React.FC<TimerHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const examples = [
    { minutes: 2, questions: 10, total: 20 },
    { minutes: 4, questions: 10, total: 40 }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Understanding Timer Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              The timer setting determines how many minutes you'll have for each question. 
              The total time for your test will be calculated by multiplying the minutes 
              per question by the total number of questions.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Examples:</h3>
              {examples.map((example, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <p className="text-blue-700 dark:text-blue-300">
                    If you choose {example.minutes} minutes per question with {example.questions} questions:
                  </p>
                  <p className="text-blue-900 dark:text-blue-100 font-medium pl-4">
                    {example.minutes} min × {example.questions} questions = {example.total} minutes total
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a time that allows you to work comfortably while simulating exam conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerHelpModal;