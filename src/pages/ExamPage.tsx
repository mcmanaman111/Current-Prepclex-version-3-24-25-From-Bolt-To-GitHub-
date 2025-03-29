import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { fetchQuestionsForTest } from '../services/api';
import type { TestSelectionCriteria } from '../services/api';
import { calculateScore } from '../utils/examUtils';
import type { Score } from '../types/exam';

interface AnswerState {
  [questionId: string]: {
    selectedAnswers: number[];
    isSubmitted: boolean;
    score?: Score;
    timeSpent?: number;  // Time spent on question in seconds
  };
}

const ExamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isReviewMode = location.state?.reviewMode;
  const startAtQuestion = location.state?.startAtQuestion ?? 0;
  
  // Track if we're in a loading state while fetching questions
  const [isLoading, setIsLoading] = useState(!isReviewMode);
  
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

  // Get the selection criteria from location.state
  const selectionCriteria = useRef<TestSelectionCriteria>({
    selectedQuestions: location.state?.selectedQuestions || [],
    selectedTopics: location.state?.selectedTopics || [],
    selectedSubtopics: location.state?.selectedSubtopics || [],
    questionCount: testSettings.questionCount,
    ngnEnabled: testSettings.ngn,
    ngnOnly: location.state?.ngnOnly || false
  });

  // Initialize questions state
  const [questions, setQuestions] = useState<any[]>([]);
  
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

  // Fetch questions based on selection criteria
  useEffect(() => {
    // Skip if we're in review mode, as we'll use the provided questions
    if (isReviewMode) {
      setQuestions(location.state?.questions || []);
      setIsLoading(false);
      return;
    }
    
    // For quick start, just use mock questions
    if (testSettings.isQuickStart) {
      setQuestions(mockQuestions);
      setIsLoading(false);
      return;
    }
    
    // Otherwise, fetch questions based on selection criteria
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const fetchedQuestions = await fetchQuestionsForTest(selectionCriteria.current);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to mock questions in case of error
        setQuestions(mockQuestions);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [isReviewMode, testSettings.isQuickStart]);

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

  // Safely access the current question with null checks
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  
  // Only create the question state if we have a valid question
  const currentQuestionState = currentQuestion ? (
    answerStates[currentQuestion.id] || {
      selectedAnswers: [],
      isSubmitted: isReviewMode // Auto-submit in review mode
    }
  ) : {
    selectedAnswers: [],
    isSubmitted: false
  };

  // Check if all questions have been answered - only if we have questions
  const allQuestionsAnswered = questions.length > 0 
    ? questions.every(question => answerStates[question.id]?.isSubmitted)
    : false;

  // Add debugging to help track the state
  useEffect(() => {
    console.log("Questions array:", questions);
    console.log("Current question index:", currentQuestionIndex);
    console.log("Current question:", currentQuestion);
    console.log("Selection criteria:", selectionCriteria.current);
  }, [questions, currentQuestionIndex, currentQuestion]);

  const handleAnswerSelect = (index: number) => {
    if (!currentQuestion || currentQuestionState.isSubmitted) return;
    
    const newSelectedAnswers = currentQuestionState.selectedAnswers.includes(index)
      ? currentQuestionState.selectedAnswers.filter(i => i !== index)
      : [...currentQuestionState.selectedAnswers, index];

    setAnswerStates((prev: AnswerState) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedAnswers: newSelectedAnswers
      }
    }));
  };

  const handleMarkForReview = () => {
    setMarkedQuestions((prev: number[]) => {
      if (prev.includes(currentQuestionIndex)) {
        return prev.filter(i => i !== currentQuestionIndex);
      }
      return [...prev, currentQuestionIndex];
    });
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;
    
    // Record the time spent on the question when submitting
    recordQuestionTime();
    
    // Get the actual time spent on this question
    const timeSpentSeconds = getQuestionTime(currentQuestionIndex);
    console.log(`Time spent on question ${currentQuestionIndex}: ${timeSpentSeconds} seconds`);
    
    const score = calculateScore(currentQuestionState.selectedAnswers, currentQuestion.choices);
    setAnswerStates((prev: AnswerState) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        isSubmitted: true,
        score,
        timeSpent: timeSpentSeconds
      }
    }));
    
    // Update the current question object with actual time taken
    if (timeSpentSeconds > 0) {
      const minutes = Math.floor(timeSpentSeconds / 60);
      const seconds = timeSpentSeconds % 60;
      const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Update the time_taken property on the current question
      currentQuestion.time_taken = formattedTime;
    }
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
    if (isReviewMode || !currentQuestion) return; // Disable skip in review mode or if no question
    
    setSkippedQuestions((prev: number[]) => [...prev, currentQuestionIndex]);
    setAnswerStates((prev: AnswerState) => {
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
    setTestSettings((prev: any) => ({
      ...prev,
      minutesPerQuestion: minutes
    }));
    updateMinutesPerQuestion(minutes);
  };

  const handleViewToggle = () => {
    setIsStackedView(!isStackedView);
  };

  const handleCompleteTest = () => {
    // Make sure to record the time for the current question before completing
    recordQuestionTime();
    
    // Update each question with its time data for the result page and analytics
    const updatedQuestions = questions.map((question, index) => {
      const timeSpent = getQuestionTime(index);
      if (timeSpent > 0) {
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Create a new object to avoid mutating the original
        return {
          ...question,
          time_taken: formattedTime
        };
      }
      return question;
    });
    
    // Calculate total test time and other statistics
    const totalTestTime = getTotalElapsedTime();
    const avgTimePerQuestion = Math.round(totalTestTime / Object.keys(answerStates).length);
    const testTimeAnalytics = {
      totalTime: totalTestTime,
      avgTimePerQuestion,
      questionTimes: Object.entries(answerStates).reduce((acc, [id, state]) => {
        if (state.timeSpent) {
          acc[id] = state.timeSpent;
        }
        return acc;
      }, {} as Record<string, number>)
    };
    
    console.log("Test timing analytics:", testTimeAnalytics);
    
    navigate('/results', {
      state: {
        testId: `T${Date.now()}`,
        questions: updatedQuestions, // Use updated questions with time data
        scores: answerStates,
        markedQuestions,
        startTime: new Date(Date.now() - totalTestTime * 1000).toISOString(),
        endTime: new Date().toISOString(),
        elapsedTime: elapsedTime,
        timeAnalytics: testTimeAnalytics // Include time analytics
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark">
      
      {/* Always do a null check on currentQuestion before trying to render */}
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your test questions...</p>
          </div>
        </div>
      ) : !currentQuestion || questions.length === 0 ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">No Questions Available</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No questions match your current selection criteria. Please go back and select different options.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Only render exam components if we have a valid currentQuestion */}
          <ExamHeader 
            timeLeft={timeLeft}
            elapsedTime={elapsedTime}
            isTimed={testSettings.timer && !isReviewMode}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            testSettings={{...testSettings, isReviewMode}}
          />

          {currentQuestion && (
            <>
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
                    actualTimeTaken={getQuestionTime(currentQuestionIndex)}
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
            </>
          )}

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
            testId={currentQuestion ? currentQuestion.id.toString() : '0'}
          />

          <SkipConfirmationDialog 
            isOpen={showSkipDialog}
            onClose={() => setShowSkipDialog(false)}
            onConfirmSkip={handleConfirmSkip}
          />
        </>
      )}
    </div>
  );
};

export default ExamPage;
