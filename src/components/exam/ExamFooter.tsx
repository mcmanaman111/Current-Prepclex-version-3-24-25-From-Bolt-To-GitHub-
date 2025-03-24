import React from 'react';
import { ChevronLeft, ChevronRight, SkipForward, LogOut, CheckCircle, Flag } from 'lucide-react';

interface Props {
  isSubmitted: boolean;
  isTutorMode: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onStop: () => void;
  onComplete?: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  allQuestionsAnswered: boolean;
}

const ExamFooter = ({ 
  isSubmitted, 
  isTutorMode,
  onSubmit, 
  onNext,
  onPrevious,
  onSkip,
  onStop,
  onComplete,
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  allQuestionsAnswered
}: Props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2B547E] text-white">
      <div className="flex items-center justify-between max-w-[1920px] mx-auto px-4 py-4">
        <button 
          onClick={onStop}
          className="flex flex-col items-center md:flex-row md:gap-2 px-4 md:px-6 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
        >
          <LogOut className="w-5 h-5 mb-1 md:mb-0" />
          <span className="text-xs md:text-base">Exit</span>
        </button>

        {isTutorMode && (
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`flex flex-col items-center md:flex-row md:gap-2 px-4 md:px-6 py-2 rounded transition-colors ${
              canGoPrevious 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-white/5 text-white/50 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mb-1 md:mb-0" />
            <span className="text-xs md:text-base">Previous</span>
          </button>
        )}

        {!isSubmitted && (
          <>
            <button
              onClick={onSkip}
              className="flex flex-col items-center md:flex-row md:gap-2 px-4 md:px-6 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              <SkipForward className="w-5 h-5 mb-1 md:mb-0" />
              <span className="text-xs md:text-base">Skip</span>
            </button>

            <button
              onClick={onSubmit}
              className="flex flex-col items-center md:flex-row md:gap-2 px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
            >
              <CheckCircle className="w-5 h-5 mb-1 md:mb-0" />
              <span className="text-xs md:text-base">Submit</span>
            </button>
          </>
        )}

        {isSubmitted && !isLastQuestion && (
          <button 
            onClick={onNext}
            disabled={!canGoNext}
            className={`flex flex-col items-center md:flex-row md:gap-2 px-4 md:px-6 py-2 rounded transition-colors ${
              canGoNext 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-blue-500/50 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5 mb-1 md:mb-0" />
            <span className="text-xs md:text-base">Next</span>
          </button>
        )}

        {isSubmitted && isLastQuestion && allQuestionsAnswered && onComplete && (
          <button 
            onClick={onComplete}
            className="flex flex-col items-center md:flex-row md:gap-2 px-4 md:px-6 py-2 bg-green-500 hover:bg-green-600 rounded transition-colors"
          >
            <Flag className="w-5 h-5 mb-1 md:mb-0" />
            <span className="text-xs md:text-base">Complete Test</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamFooter;