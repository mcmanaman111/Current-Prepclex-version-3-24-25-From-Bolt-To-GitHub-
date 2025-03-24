import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ExamHeader from '../components/exam/ExamHeader';
import ExamSubHeader from '../components/exam/ExamSubHeader';
import QuestionSection from '../components/exam/QuestionSection';
import ExplanationSection from '../components/exam/ExplanationSection';
import ExamFooter from '../components/exam/ExamFooter';
import StopTestDialog from '../components/exam/StopTestDialog';
import NclexScoringModal from '../components/modals/NclexScoringModal';
import TimerExpiredDialog from '../components/modals/TimerExpiredDialog';
import SkipConfirmationDialog from '../components/modals/SkipConfirmationDialog';
import { useExamTimer } from '../hooks/useExamTimer';
import { mockQuestions } from '../data/mockData';
import { calculateScore } from '../utils/examUtils';
import type { Score } from '../types/exam';

interface AnswerState {
  [questionId: string]: {
    selectedAnswers: number[];
    isSubmitted: boolean;
    score?: Score;
  };
}

const ExamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isReviewMode = location.state?.reviewMode;
  const startAtQuestion = location.state?.startAtQuestion ?? 0;
  
  // Initialize state based on whether we're in review mode
  const [testSettings, setTestSettings] = useState(() => ({
    tutorMode: true,
    timer: false,
    ngn: false,
    isQuickStart: false,
    questionCount: 25,
    minutesPerQuestion: 2,
    ...location.state?.settings
  }));

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(startAtQuestion);
  const [answerStates, setAnswerStates] = useState<AnswerState>(() => {
    // If in review mode, use the provided scores
    if (isReviewMode && location.state?.scores) {
      return location.state.scores;
    }
    return {};
  });
  
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<number[]>(() => {
    // If in review mode, use the provided marked questions
    if (isReviewMode && location.state?.markedQuestions) {
      return location.state.markedQuestions;
    }
    return [];
  });
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [showTimerExpired, setShowTimerExpired] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isStackedView, setIsStackedView] = useState(() => window.innerWidth <= 768);

  // Get questions from location state if in review mode, otherwise use mock questions
  const questions = isReviewMode && location.state?.questions ? location.state.questions : mockQuestions;

  // Update isStackedView on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsStackedView(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTimerExpired = useCallback(() => {
    setShowTimerExpired(true);
  }, []);

  const { 
    timeLeft,
    elapsedTime,
    isPaused,
    startTimer,
    pauseTimer,
    updateMinutesPerQuestion,
    getQuestionTime,
    getTotalElapsedTime,
    recordQuestionTime
  } = useExamTimer({
    questionCount: testSettings.questionCount,
    minutesPerQuestion: testSettings.minutesPerQuestion,
    onTimerExpired: handleTimerExpired,
    isTimed: testSettings.timer && !isReviewMode, // Disable timer in review mode
    autoStart: !isReviewMode, // Don't auto-start timer in review mode
    currentQuestionIndex
  });

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionState = answerStates[currentQuestion.id] || {
    selectedAnswers: [],
    isSubmitted: isReviewMode // Auto-submit in review mode
  };

  // Check if all questions have been answered
  const allQuestionsAnswered = questions.every(question => 
    answerStates[question.id]?.isSubmitted
  );

  const handleAnswerSelect = (index: number) => {
    if (currentQuestionState.isSubmitted) return;
    
    const newSelectedAnswers = currentQuestionState.selectedAnswers.includes(index)
      ? currentQuestionState.selectedAnswers.filter(i => i !== index)
      : [...currentQuestionState.selectedAnswers, index];

    setAnswerStates(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedAnswers: newSelectedAnswers
      }
    }));
  };

  const handleMarkForReview = () => {
    setMarkedQuestions(prev => {
      if (prev.includes(currentQuestionIndex)) {
        return prev.filter(i => i !== currentQuestionIndex);
      }
      return [...prev, currentQuestionIndex];
    });
  };

  const handleSubmit = () => {
    const score = calculateScore(currentQuestionState.selectedAnswers, currentQuestion.choices);
    setAnswerStates(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        isSubmitted: true,
        score
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkipClick = () => {
    if (isReviewMode) return; // Disable skip in review mode
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = () => {
    if (isReviewMode) return; // Disable skip in review mode
    
    setSkippedQuestions(prev => [...prev, currentQuestionIndex]);
    setAnswerStates(prev => {
      const newState = { ...prev };
      delete newState[currentQuestion.id];
      return newState;
    });
    setShowSkipDialog(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleStop = () => {
    pauseTimer();
    setShowStopDialog(true);
  };

  const handleExitWithoutSaving = () => {
    navigate('/');
  };

  const handleExitAndSave = () => {
    navigate('/');
  };

  const handleEndTest = () => {
    navigate('/results', {
      state: {
        testId: `T${Date.now()}`,
        questions,
        scores: answerStates,
        markedQuestions,
        startTime: new Date(Date.now() - getTotalElapsedTime() * 1000).toISOString(),
        endTime: new Date().toISOString(),
        elapsedTime: elapsedTime
      }
    });
  };

  const handleContinueTest = () => {
    setShowStopDialog(false);
    if (!isReviewMode) {
      startTimer();
    }
  };

  const handleTimerSettingChange = (minutes: number) => {
    setTestSettings(prev => ({
      ...prev,
      minutesPerQuestion: minutes
    }));
    updateMinutesPerQuestion(minutes);
  };

  const handleViewToggle = () => {
    setIsStackedView(!isStackedView);
  };

  const handleCompleteTest = () => {
    navigate('/results', {
      state: {
        testId: `T${Date.now()}`,
        questions,
        scores: answerStates,
        markedQuestions,
        startTime: new Date(Date.now() - getTotalElapsedTime() * 1000).toISOString(),
        endTime: new Date().toISOString(),
        elapsedTime: elapsedTime
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark">
      <ExamHeader 
        timeLeft={timeLeft}
        elapsedTime={elapsedTime}
        isTimed={testSettings.timer && !isReviewMode}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        testSettings={{...testSettings, isReviewMode}}
      />

      <ExamSubHeader 
        testId={currentQuestion.id}
        isMarked={markedQuestions.includes(currentQuestionIndex)}
        onMarkForReview={handleMarkForReview}
        testSettings={testSettings}
        onTimerSettingChange={handleTimerSettingChange}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        isStackedView={isStackedView}
        onViewToggle={handleViewToggle}
        currentQuestion={currentQuestion}
      />

      <div className={`flex-1 flex ${!isStackedView && currentQuestionState.isSubmitted && !window.matchMedia('(max-width: 768px)').matches ? 'lg:flex-row' : 'flex-col'}`}>
        <div className={`${!isStackedView && currentQuestionState.isSubmitted && !window.matchMedia('(max-width: 768px)').matches ? 'lg:w-1/2' : 'w-full'} bg-white dark:bg-dark`}>
          <QuestionSection 
            question={currentQuestion}
            selectedAnswers={currentQuestionState.selectedAnswers}
            isSubmitted={currentQuestionState.isSubmitted}
            onAnswerSelect={handleAnswerSelect}
            score={currentQuestionState.score}
            isStackedView={isStackedView}
            isSplitView={!isStackedView && !window.matchMedia('(max-width: 768px)').matches}
          />
        </div>

        {currentQuestionState.isSubmitted && (
          <div className={`${!isStackedView && !window.matchMedia('(max-width: 768px)').matches ? 'hidden lg:block lg:w-1/2 lg:border-l border-gray-200 dark:border-gray-700' : ''} bg-gradient-to-b from-blue-50 via-blue-50/50 to-white dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900`}>
            <ExplanationSection 
              question={currentQuestion}
              isFullyCorrect={currentQuestionState.score?.isFullyCorrect || false}
              onScoringHelp={() => setShowScoringModal(true)}
              isStackedView={isStackedView}
            />
          </div>
        )}
      </div>

      <ExamFooter 
        isSubmitted={currentQuestionState.isSubmitted}
        isTutorMode={testSettings.tutorMode}
        onSubmit={handleSubmit}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkipClick}
        onStop={handleStop}
        onComplete={handleCompleteTest}
        canGoPrevious={currentQuestionIndex > 0}
        canGoNext={currentQuestionIndex < questions.length - 1}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
        allQuestionsAnswered={allQuestionsAnswered}
      />

      <StopTestDialog 
        isOpen={showStopDialog}
        onClose={() => setShowStopDialog(false)}
        onExitWithoutSaving={handleExitWithoutSaving}
        onExitAndSave={handleExitAndSave}
        onEndTest={handleEndTest}
        onContinue={handleContinueTest}
      />

      <NclexScoringModal 
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
      />

      <TimerExpiredDialog
        isOpen={showTimerExpired}
        testId={currentQuestion.id.toString()}
      />

      <SkipConfirmationDialog 
        isOpen={showSkipDialog}
        onClose={() => setShowSkipDialog(false)}
        onConfirmSkip={handleConfirmSkip}
      />
    </div>
  );
};

export default ExamPage;