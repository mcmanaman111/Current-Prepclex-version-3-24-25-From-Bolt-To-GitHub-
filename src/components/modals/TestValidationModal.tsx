import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  validationErrors: string[];
}

const TestValidationModal = ({ isOpen, onClose, validationErrors }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Cannot Start Test
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4 text-left">
            Please complete the following before starting the test:
          </p>

          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-red-600 dark:text-red-400">
                <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full mt-2 shrink-0" />
                <div className="text-sm text-left">{error}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestValidationModal;