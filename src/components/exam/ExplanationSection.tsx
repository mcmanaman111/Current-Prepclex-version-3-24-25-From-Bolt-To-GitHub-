import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Question } from '../../types/exam';
import QuestionFeedbackModal from '../modals/QuestionFeedbackModal';

interface Props {
  question: Question;
  isFullyCorrect: boolean;
  onScoringHelp: () => void;
  isStackedView?: boolean;
}

const ExplanationSection = ({ question, isFullyCorrect, onScoringHelp, isStackedView = true }: Props) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Get correct and incorrect choice numbers
  const correctChoices = question.choices
    .map((choice, index) => choice.isCorrect ? (index + 1) : null)
    .filter((num): num is number => num !== null);

  const incorrectChoices = question.choices
    .map((choice, index) => !choice.isCorrect ? (index + 1) : null)
    .filter((num): num is number => num !== null);

  // Check if this is a SATA question
  const isSATAQuestion = correctChoices.length > 1;

  return (
    <div className={`p-6 pb-24 mt-7 ${isStackedView ? 'md:px-[calc(12rem_+_1.5rem)]' : 'md:px-12'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-4xl font-bold text-gray-800 dark:text-white">Explanation</h3>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Question Feedback</span>
        </button>
      </div>
      
      <div className="space-y-4 mb-8">
        <div>
          <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
            {`Choice${correctChoices.length > 1 ? 's' : ''} ${correctChoices.join(', ')} ${correctChoices.length > 1 ? 'are' : 'is'} correct.`}
          </h4>
          {question.explanation.correct.map((text, index) => (
            <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 explanation-text">{text}</p>
          ))}
        </div>
        <div>
          <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
            {`Choice${incorrectChoices.length > 1 ? 's' : ''} ${incorrectChoices.join(', ')} ${incorrectChoices.length > 1 ? 'are' : 'is'} incorrect.`}
          </h4>
          {question.explanation.incorrect.map((text, index) => (
            <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 explanation-text">{text}</p>
          ))}
        </div>
      </div>

      {/* Horizontal Separator */}
      <hr className="border-t border-gray-200 dark:border-gray-700 mb-6" />

      {/* Topic Information */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full whitespace-nowrap">
            Client Needs Topic
          </span>
          <span className="text-gray-600 dark:text-gray-300 break-words">{question.statistics.clientNeedArea}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full whitespace-nowrap">
            Sub-topic
          </span>
          <span className="text-gray-600 dark:text-gray-300 break-words">{question.statistics.clientNeedTopic}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full whitespace-nowrap">
            Question Format
          </span>
          <span className="text-gray-600 dark:text-gray-300 break-words">
            SATA Question
            {isSATAQuestion && (
              <button
                onClick={onScoringHelp}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline ml-2"
              >
                How are partially correct answers scored?
              </button>
            )}
          </span>
        </div>
      </div>

      <QuestionFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        questionId={question.qid}
        testId={`T${question.id}`}
      />
    </div>
  );
};

export default ExplanationSection;