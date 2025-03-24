import { useState, useEffect, useCallback } from 'react';

export interface TimerState {
  timeLeft: string;
  elapsedTime: string;
  totalTime: number;
  isPaused: boolean;
  isExpired: boolean;
  questionStartTime: number;
  questionTimes: Record<number, number>;
}

export interface UseExamTimerProps {
  questionCount: number;
  minutesPerQuestion: number;
  onTimerExpired: () => void;
  isTimed?: boolean;
  autoStart?: boolean;
  currentQuestionIndex: number;
}

export const useExamTimer = ({
  questionCount,
  minutesPerQuestion,
  onTimerExpired,
  isTimed = false,
  autoStart = false,
  currentQuestionIndex
}: UseExamTimerProps) => {
  // Calculate total seconds based on questions and minutes per question
  const calculateTotalSeconds = useCallback(() => 
    questionCount * minutesPerQuestion * 60, 
    [questionCount, minutesPerQuestion]
  );

  const [state, setState] = useState<TimerState>(() => ({
    timeLeft: formatTime(calculateTotalSeconds()),
    elapsedTime: '00:00:00',
    totalTime: calculateTotalSeconds(),
    isPaused: !autoStart,
    isExpired: false,
    questionStartTime: Date.now(),
    questionTimes: {}
  }));

  // Format seconds into HH:MM:SS
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [hours, minutes, remainingSeconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  }

  // Start the timer
  const startTimer = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isPaused: false,
      questionStartTime: Date.now() 
    }));
  }, []);

  // Pause the timer
  const pauseTimer = useCallback(() => {
    setState(prev => {
      // Record time spent on current question when pausing
      const timeSpent = Math.floor((Date.now() - prev.questionStartTime) / 1000);
      return {
        ...prev,
        isPaused: true,
        questionTimes: {
          ...prev.questionTimes,
          [currentQuestionIndex]: (prev.questionTimes[currentQuestionIndex] || 0) + timeSpent
        }
      };
    });
  }, [currentQuestionIndex]);

  // Record time for current question and start timing next question
  const recordQuestionTime = useCallback(() => {
    setState(prev => {
      const timeSpent = Math.floor((Date.now() - prev.questionStartTime) / 1000);
      return {
        ...prev,
        questionStartTime: Date.now(),
        questionTimes: {
          ...prev.questionTimes,
          [currentQuestionIndex]: (prev.questionTimes[currentQuestionIndex] || 0) + timeSpent
        }
      };
    });
  }, [currentQuestionIndex]);

  // Update minutes per question
  const updateMinutesPerQuestion = useCallback((minutes: number) => {
    const newTotalSeconds = questionCount * minutes * 60;
    const remainingQuestions = questionCount - currentQuestionIndex;
    const remainingTime = remainingQuestions * minutes * 60;
    
    setState(prev => ({
      ...prev,
      timeLeft: formatTime(remainingTime),
      totalTime: newTotalSeconds
    }));
  }, [questionCount, currentQuestionIndex]);

  // Get time spent on a specific question
  const getQuestionTime = useCallback((questionIndex: number) => {
    return state.questionTimes[questionIndex] || 0;
  }, [state.questionTimes]);

  // Get total elapsed time
  const getTotalElapsedTime = useCallback(() => {
    return Object.values(state.questionTimes).reduce((sum, time) => sum + time, 0);
  }, [state.questionTimes]);

  // Timer effect
  useEffect(() => {
    if (state.isPaused) return;

    const interval = setInterval(() => {
      if (isTimed) {
        // Countdown timer for timed tests
        const [hours, minutes, seconds] = state.timeLeft.split(':').map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds <= 0) {
          setState(prev => ({ ...prev, isExpired: true }));
          onTimerExpired();
          clearInterval(interval);
          return;
        }

        totalSeconds -= 1;
        setState(prev => ({
          ...prev,
          timeLeft: formatTime(totalSeconds)
        }));
      } else {
        // Elapsed time for untimed tests
        const elapsedSeconds = Math.floor((Date.now() - state.questionStartTime) / 1000);
        setState(prev => ({
          ...prev,
          elapsedTime: formatTime(elapsedSeconds)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timeLeft, state.isPaused, state.isExpired, isTimed, onTimerExpired, state.questionStartTime]);

  // Update question time when changing questions
  useEffect(() => {
    if (!state.isPaused) {
      recordQuestionTime();
    }
  }, [currentQuestionIndex, recordQuestionTime, state.isPaused]);

  return {
    timeLeft: state.timeLeft,
    elapsedTime: state.elapsedTime,
    isPaused: state.isPaused,
    isExpired: state.isExpired,
    startTimer,
    pauseTimer,
    updateMinutesPerQuestion,
    getQuestionTime,
    getTotalElapsedTime,
    recordQuestionTime
  };
};