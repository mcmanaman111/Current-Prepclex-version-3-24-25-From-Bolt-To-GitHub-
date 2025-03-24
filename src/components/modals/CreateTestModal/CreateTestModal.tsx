import React, { useState } from 'react';
import TestSettings from './TestSettings';
import QuestionSelection from './QuestionSelection';
import SubjectSelection from './SubjectSelection';

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({ isOpen, onClose, onNext }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tutorMode, setTutorMode] = useState(true);
  const [timer, setTimer] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    // Validation for step 1
    if (currentStep === 1 && selectedQuestions.length === 0) {
      setAlertMessage('Please select at least one question type to continue');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // Validation for step 2
    if (currentStep === 2 && selectedSubjects.length === 0) {
      setAlertMessage('Please select at least one category to continue');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl relative">
        {/* Alert */}
        {showAlert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
              {alertMessage}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-[#2B3467] text-white p-4 rounded-t-xl">
          <h2 className="text-2xl font-semibold text-center">
            Create Test - Step {currentStep}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 ? (
            <>
              <TestSettings 
                tutorMode={tutorMode}
                setTutorMode={setTutorMode}
                timer={timer}
                setTimer={setTimer}
              />
              <QuestionSelection 
                selectedQuestions={selectedQuestions}
                setSelectedQuestions={setSelectedQuestions}
              />
            </>
          ) : (
            <SubjectSelection
              selectedSubjects={selectedSubjects}
              setSelectedSubjects={setSelectedSubjects}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-between gap-4">
          {currentStep === 1 ? (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-[#2B3467] text-[#2B3467] font-semibold hover:bg-gray-50 transition-colors"
            >
              CANCEL
            </button>
          ) : (
            <button
              onClick={handleBack}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-[#2B3467] text-[#2B3467] font-semibold hover:bg-gray-50 transition-colors"
            >
              BACK
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-6 rounded-lg bg-[#2B3467] text-white font-semibold hover:bg-[#232952] transition-colors"
          >
            {currentStep === 2 ? 'NEXT' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTestModal;