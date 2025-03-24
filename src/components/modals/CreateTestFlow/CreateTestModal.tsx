import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import TestSettings from '../../create-test/TestSettings';
import QuestionSelection from '../../create-test/QuestionSelection';
import CategorySelection from '../../create-test/CategorySelection';
import QuestionCountSelector from '../../create-test/QuestionCountSelector';
import BeginCustomTestCard from '../../create-test/BeginCustomTestCard';
import { questionTypes } from '../../../data/testData';
import { clientNeeds } from '../../../data/clientNeeds';
import type { TestConfig } from '../../../data/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: TestConfig) => void;
}

const CreateTestModal = ({ isOpen, onClose, onComplete }: Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tutorMode, setTutorMode] = useState(true);
  const [timer, setTimer] = useState(false);
  const [ngn, setNGN] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(25);
  const [minutesPerQuestion, setMinutesPerQuestion] = useState(2);

  // Reset all state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setTutorMode(true);
      setTimer(false);
      setNGN(false);
      setSelectedQuestions([]);
      setSelectedCategories([]);
      setSelectedTopics([]);
      setQuestionCount(25);
      setMinutesPerQuestion(2);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        tutorMode,
        timer,
        ngn,
        questionCount,
        minutesPerQuestion
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    onClose();
  };

  const totalSelectedQuestions = clientNeeds.reduce((acc, category) => {
    if (selectedCategories.includes(category.id)) {
      return acc + category.count;
    }
    
    if (category.topics) {
      const selectedTopicsInCategory = category.topics.filter(topic => 
        selectedTopics.includes(topic.id)
      );
      return acc + selectedTopicsInCategory.reduce((sum, topic) => sum + topic.count, 0);
    }
    
    return acc;
  }, 0);

  const handleQuestionToggle = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleTopicToggle = (categoryId: string, topicId: string) => {
    setSelectedTopics(prev => {
      const newTopics = prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId];

      const category = clientNeeds.find(c => c.id === categoryId);
      if (category?.topics) {
        const categoryTopicIds = category.topics.map(t => t.id);
        const allTopicsSelected = categoryTopicIds.every(id => newTopics.includes(id));
        
        if (allTopicsSelected && !selectedCategories.includes(categoryId)) {
          setSelectedCategories(prev => [...prev, categoryId]);
        } else if (!allTopicsSelected && selectedCategories.includes(categoryId)) {
          setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        }
      }

      return newTopics;
    });
  };

  const handleSelectAllQuestions = () => {
    setSelectedQuestions(prev => 
      prev.length === questionTypes.length ? [] : questionTypes.map(q => q.id)
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(prev => 
      prev.length === clientNeeds.length ? [] : clientNeeds.map(c => c.id)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Create Custom Test - Step {currentStep} of 4
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <TestSettings
              tutorMode={tutorMode}
              setTutorMode={setTutorMode}
              timer={timer}
              setTimer={setTimer}
              ngn={ngn}
              setNGN={setNGN}
              minutesPerQuestion={minutesPerQuestion}
              setMinutesPerQuestion={setMinutesPerQuestion}
            />
          )}

          {currentStep === 2 && (
            <QuestionSelection
              questionTypes={questionTypes}
              selectedQuestions={selectedQuestions}
              onQuestionToggle={handleQuestionToggle}
              onSelectAll={handleSelectAllQuestions}
            />
          )}

          {currentStep === 3 && (
            <CategorySelection
              categories={clientNeeds}
              selectedCategories={selectedCategories}
              selectedTopics={selectedTopics}
              onCategoryToggle={handleCategoryToggle}
              onTopicToggle={handleTopicToggle}
              onSelectAll={handleSelectAllCategories}
            />
          )}

          {currentStep === 4 && (
            <div className="grid grid-cols-2 gap-6">
              <QuestionCountSelector
                availableQuestions={totalSelectedQuestions}
                value={questionCount}
                onChange={setQuestionCount}
                totalSelectedQuestions={totalSelectedQuestions}
              />
              <BeginCustomTestCard 
                userName="Sara"
                selectedQuestions={selectedQuestions}
                selectedCategories={selectedCategories}
                selectedTopics={selectedTopics}
                questionCount={questionCount}
                totalSelectedQuestions={totalSelectedQuestions}
                onBeginTest={handleNext}
              />
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-dark-lighter flex justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-2 border-2 border-[#2B3467] text-[#2B3467] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          {currentStep < 4 && (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#2B3467] text-white rounded-lg hover:bg-[#232952] transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTestModal;