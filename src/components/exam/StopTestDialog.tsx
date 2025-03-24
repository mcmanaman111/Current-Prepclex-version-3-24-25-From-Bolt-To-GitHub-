import React, { useState } from 'react';
import { Play, Save, LogOut, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExitWithoutSaving: () => void;
  onExitAndSave: () => void;
  onEndTest: () => void;
  onContinue: () => void;
}

const StopTestDialog = ({ isOpen, onClose, onExitWithoutSaving, onExitAndSave, onEndTest, onContinue }: Props) => {
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleExitWithoutSaving = () => {
    if (!showExitConfirmation) {
      setShowExitConfirmation(true);
      return;
    }
    onExitWithoutSaving();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Test Paused
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            All the timers have been stopped. What would you like to do?
          </p>

          <div className="space-y-3">
            <button
              onClick={onContinue}
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
              onClick={onExitAndSave}
              className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 group"
            >
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Save className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-green-600 dark:text-green-400">Save and Exit</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Save progress and finish later</div>
              </div>
            </button>

            <button
              onClick={onEndTest}
              className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 group"
            >
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <LogOut className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-purple-600 dark:text-purple-400">End Test</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">View your results now</div>
              </div>
            </button>

            <div className={`border-2 rounded-lg transition-colors ${
              showExitConfirmation 
                ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' 
                : 'border-transparent'
            }`}>
              <button
                onClick={handleExitWithoutSaving}
                className="w-full flex items-center gap-3 p-4 text-left rounded-lg"
              >
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-red-600 dark:text-red-400">Exit Without Saving</div>
                  <div className="text-sm text-red-500 dark:text-red-400">
                    {showExitConfirmation ? (
                      <span className="font-medium">Click again to confirm. This action cannot be undone!</span>
                    ) : (
                      'All progress will be lost'
                    )}
                  </div>
                </div>
              </button>
              {showExitConfirmation && (
                <div className="px-4 pb-4">
                  <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>
                      Warning: This will permanently delete all your progress in this test session. 
                      Consider using "Save and Exit" or "End Test" instead to keep your progress.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopTestDialog;