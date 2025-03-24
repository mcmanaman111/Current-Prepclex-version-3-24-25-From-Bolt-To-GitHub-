import React from 'react';
import { Check, X } from 'lucide-react';
import ScoreDisplay from './ScoreDisplay';
import { Question, Score } from '../../types/exam';

interface Props {
  question: Question;
  selectedAnswers: number[];
  isSubmitted: boolean;
  onAnswerSelect: (index: number) => void;
  score?: Score;
  testNumber?: number;
  userId?: string;
  cumulativeTestNumber?: number;
  isStackedView?: boolean;
  isSplitView?: boolean;
}

const QuestionSection = ({ 
  question, 
  selectedAnswers = [], 
  isSubmitted = false, 
  onAnswerSelect, 
  score,
  testNumber = 14,
  userId = "12345",
  cumulativeTestNumber = 1212,
  isStackedView = true,
  isSplitView = false
}: Props) => {
  const renderAnswerIndicator = (index: number) => {
    if (!isSubmitted) return null;

    const isCorrect = question.choices[index].isCorrect;
    return isCorrect ? (
      <Check className="w-5 h-5 text-green-500 absolute -left-7" />
    ) : (
      <X className="w-5 h-5 text-red-500 absolute -left-7" />
    );
  };

  // Use stacked view padding unless in split view mode with submitted answer
  const shouldUseStackedPadding = !isSplitView || !isSubmitted;

  return (
    <div className={`p-6 pb-8 mt-8 ${shouldUseStackedPadding ? 'md:px-[calc(12rem_+_1.5rem)]' : 'md:px-12'}`}>
      <div className="pl-4">
        <div className="mb-8">
          <p className="text-lg text-gray-800 dark:text-gray-200 question-text">{question.text}</p>
        </div>

        <div className="space-y-3 mb-12">
          {question.choices.map((choice, index) => (
            <div
              key={index}
              className={`relative flex items-start gap-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                selectedAnswers.includes(index) ? 'bg-gray-50 dark:bg-gray-700/50' : ''
              }`}
              onClick={() => onAnswerSelect(index)}
            >
              {renderAnswerIndicator(index)}
              <div 
                className="flex items-start gap-3 flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnswerSelect(index);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedAnswers.includes(index)}
                  onChange={() => onAnswerSelect(index)}
                  className="mt-1 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{index + 1}.</span>
                  <span className={`text-gray-800 dark:text-gray-200 choice-text ${
                    isSubmitted && choice.isCorrect ? 'text-green-700 dark:text-green-400' : ''
                  }`}>
                    {choice.text}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isSubmitted && score && (
          <ScoreDisplay 
            score={score} 
            statistics={question.statistics} 
            questionId={question.qid}
            testNumber={testNumber}
            userId={userId}
            cumulativeTestNumber={cumulativeTestNumber}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionSection;