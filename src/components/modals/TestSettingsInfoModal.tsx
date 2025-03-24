import React from 'react';
import { X, GraduationCap, Clock, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    minutesPerQuestion: number;
  };
}

const TestSettingsInfoModal = ({ isOpen, onClose, settings }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-sm w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Test Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {settings.tutorMode && (
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Tutor Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive detailed explanations after each question to enhance your learning.
                  </p>
                </div>
              </div>
            )}

            {settings.timer && (
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Timer Enabled</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {settings.minutesPerQuestion} minutes per question to simulate exam conditions.
                  </p>
                </div>
              </div>
            )}

            {settings.ngn && (
              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">NGN Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Next Generation NCLEX style questions are included in this test.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSettingsInfoModal;