import React, { useState, useEffect } from 'react';
import { X, Zap, HelpCircle } from 'lucide-react';
import QuickStartCard from '../create-test/QuickStartCard';
import QuickStartHelpModal from '../create-test/QuickStartHelpModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    questionCount: number;
    isQuickStart: boolean;
  }) => void;
}

const QuickStartModal = ({ isOpen, onClose, onStart }: Props) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Reset help modal state when main modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowHelpModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowHelpModal(false);
    onClose();
  };

  const handleStart = (settings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    questionCount: number;
  }) => {
    onStart({
      ...settings,
      isQuickStart: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[#2B3467]" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Quick Start Test
              </h2>
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <QuickStartCard onStart={handleStart} resetKey={isOpen} />
        </div>
      </div>

      <QuickStartHelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default QuickStartModal;