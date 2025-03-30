import React, { useState, useEffect } from 'react';
import { X, Zap, HelpCircle, Loader2 } from 'lucide-react';
import QuickStartCard from '../create-test/QuickStartCard';
import QuickStartHelpModal from '../create-test/QuickStartHelpModal';
import { useAuth } from '../AuthProvider';
import { fetchUnusedQuestionsForQuickStart } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    questionCount: number;
    isQuickStart: boolean;
    questions?: any[]; // Add questions property to accept the fetched questions
    minutesPerQuestion?: number; // Add minutesPerQuestion property
  }) => void;
}

const QuickStartModal = ({ isOpen, onClose, onStart }: Props) => {
  // Get auth context inside the component
  const { user } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset help modal state when main modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowHelpModal(false);
      setErrorMessage(null); // Also clear any error messages
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowHelpModal(false);
    onClose();
  };

  const handleStart = async (settings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    questionCount: number;
    minutesPerQuestion: number;
  }) => {
    if (!user) {
      setErrorMessage("You must be logged in to start a test");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch unused questions from the database
      const questions = await fetchUnusedQuestionsForQuickStart(
        user.id,
        settings.questionCount,
        settings.ngn,
        settings.minutesPerQuestion
      );
      
      if (questions.length === 0) {
        setErrorMessage("No unused questions found matching your criteria. Try including NGN questions or complete some existing tests to unlock more questions.");
        setIsLoading(false);
        return;
      }
      
      // Start the test with the fetched questions
      onStart({
        ...settings,
        isQuickStart: true,
        questions // Pass the actual questions to the exam page
      });
    } catch (error) {
      console.error('Error starting quick test:', error);
      setErrorMessage("An error occurred while starting your test. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-xl w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-800 dark:text-gray-200 font-medium">
                Loading your test questions...
              </p>
            </div>
          </div>
        )}
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
          
          {errorMessage && (
            <div className="px-6 pb-6">
              <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm">
                {errorMessage}
              </div>
            </div>
          )}
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
