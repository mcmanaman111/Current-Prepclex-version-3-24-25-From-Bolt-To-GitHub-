import React from 'react';
import { Save, Pause, LogOut } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExitWithoutSaving: () => void;
  onExitAndSave: () => void;
  onPause: () => void;
}

const ExitDialog = ({ isOpen, onClose, onExitWithoutSaving, onExitAndSave, onPause }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Exit Test
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please select how you would like to proceed:
          </p>

          <div className="space-y-3">
            <button
              onClick={onExitWithoutSaving}
              className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 group"
            >
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="font-medium text-red-600 dark:text-red-400">Exit without saving</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">All progress will be lost</div>
              </div>
            </button>

            <button
              onClick={onExitAndSave}
              className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
            >
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Save className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400">Save and exit</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Resume this test later</div>
              </div>
            </button>

            <button
              onClick={onPause}
              className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 group"
            >
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Pause className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-purple-600 dark:text-purple-400">Pause test</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Take a break without closing</div>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Continue test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitDialog;