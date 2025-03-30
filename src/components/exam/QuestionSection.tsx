import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import ScoreDisplay from './ScoreDisplay';
import { TestQuestion, Score } from '../../types/exam';

interface Props {
  question: TestQuestion;
  selectedAnswers: number[];
  isSubmitted: boolean;
  onAnswerSelect: (index: number) => void;
  score?: Score;
  testNumber?: number;
  userId?: string;
  cumulativeTestNumber?: number;
  isStackedView?: boolean;
  isSplitView?: boolean;
  actualTimeTaken?: number;
  tutorMode?: boolean; // Add tutorMode prop
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
  isSplitView = false,
  actualTimeTaken = 0,
  tutorMode = true // Default to true for backwards compatibility
}: Props) => {
  const renderAnswerIndicator = (index: number) => {
    // Only show answer indicators if submitted AND tutor mode is on
    if (!isSubmitted || !tutorMode) return null;

    const isCorrect = question.choices[index].isCorrect;
    return isCorrect ? (
      <Check className="w-5 h-5 text-green-500 absolute -left-7" />
    ) : (
      <X className="w-5 h-5 text-red-500 absolute -left-7" />
    );
  };

  // Use stacked view padding unless in split view mode with submitted answer
  const shouldUseStackedPadding = !isSplitView || !isSubmitted;

  // Determine if this is a SATA (Select All That Apply) question
  // Count how many correct answers the question has
  const correctAnswerCount = useMemo(() => {
    return (question.choices || []).filter(choice => choice.isCorrect).length;
  }, [question.choices]);
  
  // Question is SATA if it has more than one correct answer
  const isSATAQuestion = correctAnswerCount > 1;

  // Handle mapping between our TestQuestion type and the expected data structure
  const questionText = question.question_text || '';
  const choices = question.choices || [];
  
  // Format time from seconds to MM:SS
  const formatTimeMMSS = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Build statistics object with actual time taken
  const statistics = {
    clientNeedArea: question.topic || 'General',
    clientNeedTopic: question.sub_topic || 'Unknown',
    percentCorrect: 0,
    difficulty: question.difficulty || 'Medium',
    // Use actual time if available, otherwise fall back to the stored time or default
    timeTaken: actualTimeTaken > 0 
      ? formatTimeMMSS(actualTimeTaken) 
      : question.time_taken || '0:05'
  };

  return (
    <div className={`p-6 pb-8 mt-8 ${shouldUseStackedPadding ? 'md:px-[calc(12rem_+_1.5rem)]' : 'md:px-12'}`}>
      <div className="pl-4">
        <div className="mb-8">
          <p className="text-lg text-gray-800 dark:text-gray-200 question-text">{questionText}</p>
        </div>

        <div className="space-y-3 mb-4">
          {choices.map((choice, index) => (
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
                {isSATAQuestion ? (
                  // Checkboxes for questions with multiple correct answers (SATA)
                  <input
                    type="checkbox"
                    checked={selectedAnswers.includes(index)}
                    onChange={() => onAnswerSelect(index)}
                    className="mt-1 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  // Radio buttons for multiple choice questions with one correct answer
                  <input
                    type="radio"
                    checked={selectedAnswers.includes(index)}
                    onChange={() => onAnswerSelect(index)}
                    className="mt-1 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    name="single-choice-answer"
                  />
                )}
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{index + 1}.</span>
                  <span className={`text-gray-800 dark:text-gray-200 choice-text ${
                    isSubmitted && tutorMode && choice.isCorrect ? 'text-green-700 dark:text-green-400' : ''
                  }`}>
                    {choice.text}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal Separator - only show in tutor mode */}
        {isSubmitted && score && tutorMode && (
          <hr className="border-t border-gray-200 dark:border-gray-700 mb-4" />
        )}

        {/* Score display - only show in tutor mode */}
        {isSubmitted && score && tutorMode && (
          <ScoreDisplay 
            score={score} 
            statistics={statistics} 
            questionId={question.id.toString()}
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
