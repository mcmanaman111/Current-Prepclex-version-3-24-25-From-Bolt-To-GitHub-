import React from 'react';
import { SkipForward, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSkip: () => void;
}

const SkipConfirmationDialog = ({ isOpen, onClose, onConfirmSkip }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Skip Question?
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to skip this question?
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              When you skip a question:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>• It will be removed from your unseen questions bank</li>
              <li>• It will be placed in a pool of skipped questions</li>
              <li>• You can access it later through the "Skipped Questions" option when creating a custom test</li>
              <li>• It won't be scored or count towards your current test results</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmSkip}
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward className="w-5 h-5" />
              Skip Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkipConfirmationDialog;