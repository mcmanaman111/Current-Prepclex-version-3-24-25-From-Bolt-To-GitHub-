import React, { useState } from 'react';
import TestValidationModal from '../modals/TestValidationModal';

interface Props {
  userName: string;
  selectedQuestions: string[];
  selectedCategories: string[];
  selectedTopics: string[];
  questionCount: number;
  totalSelectedQuestions: number;
  onBeginTest: () => void;
}

const BeginCustomTestCard = ({ 
  userName = '', 
  selectedQuestions = [],
  selectedCategories = [],
  selectedTopics = [],
  questionCount = 0,
  totalSelectedQuestions = 0,
  onBeginTest 
}: Props) => {
  const [showValidationModal, setShowValidationModal] = useState(false);

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    // Ensure we're working with arrays even if undefined is passed
    const questions = Array.isArray(selectedQuestions) ? selectedQuestions : [];
    const categories = Array.isArray(selectedCategories) ? selectedCategories : [];
    const topics = Array.isArray(selectedTopics) ? selectedTopics : [];

    if (questions.length === 0) {
      errors.push('Select at least one question type');
    }
    
    if (categories.length === 0 && topics.length === 0) {
      errors.push('Select at least one category or sub-topic');
    }
    
    if (!questionCount || questionCount === 0) {
      errors.push('Enter the number of questions');
    }
    
    if (questionCount > totalSelectedQuestions) {
      errors.push(`You've selected ${questionCount} questions but only ${totalSelectedQuestions} questions are available. Please reduce the number of questions or select more categories/topics.`);
    }
    
    return errors;
  };

  const validationErrors = getValidationErrors();
  const isValid = validationErrors.length === 0;

  const handleBeginTest = () => {
    if (isValid) {
      onBeginTest();
    } else {
      setShowValidationModal(true);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1a237e] to-[#0d47a1] rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center h-full">
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-white text-center">
            You Got This! 💪
          </h3>
        </div>

        <button 
          onClick={handleBeginTest}
          className="w-full px-6 py-3 bg-white text-[#2B3467] rounded-lg hover:bg-blue-50 transition-colors font-semibold"
        >
          Begin Test
        </button>
      </div>

      <TestValidationModal 
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        validationErrors={validationErrors}
      />
    </div>
  );
};

export default BeginCustomTestCard;