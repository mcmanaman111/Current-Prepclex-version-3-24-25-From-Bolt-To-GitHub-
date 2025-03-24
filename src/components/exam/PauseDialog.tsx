import React from 'react';
import { Play, LogOut } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEndTest: () => void;
}

const PauseDialog = ({ isOpen, onClose, onEndTest }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Test Paused
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your test has been paused. The timer has stopped.
          </p>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
            >
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400">Continue Test</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Resume where you left off</div>
              </div>
            </button>

            <button
              onClick={onEndTest}
              className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 group"
            >
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="font-medium text-red-600 dark:text-red-400">End Test</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">View your results</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseDialog;