import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, ChevronRight, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import ReadinessAssessmentModal from '../modals/ReadinessAssessmentModal';

const STORAGE_KEY = 'examDate';

const ExamCountdownCard = () => {
  const [examDate, setExamDate] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || '';
  });
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);
  const [showReadinessModal, setShowReadinessModal] = useState(false);

  // Mock data for the modal - In production, this would come from your app's state management
  const preparationMetrics = {
    questionsCompleted: 750,
    totalQuestions: 1250,
    averageScore: 82,
    topicsCovered: 6,
    totalTopics: 8,
    studyHours: 120,
    recommendedHours: 200
  };

  // Calculate readiness level based on metrics
  const getReadinessInfo = () => {
    const progress = Math.round(
      (preparationMetrics.questionsCompleted / preparationMetrics.totalQuestions) * 30 +
      preparationMetrics.averageScore * 0.3 +
      (preparationMetrics.topicsCovered / preparationMetrics.totalTopics) * 25 +
      (preparationMetrics.studyHours / preparationMetrics.recommendedHours) * 15
    );
    const averageScore = preparationMetrics.averageScore;
    const topicsCoverage = Math.round((preparationMetrics.topicsCovered / preparationMetrics.totalTopics) * 100);

    if (progress >= 85 && averageScore >= 80 && topicsCoverage >= 90) {
      return {
        icon: CheckCircle,
        color: 'text-white',
        bgColor: 'bg-green-500/20 hover:bg-green-500/30',
        borderColor: 'border-green-400/20'
      };
    } else if (progress >= 70 && averageScore >= 70 && topicsCoverage >= 75) {
      return {
        icon: AlertCircle,
        color: 'text-white',
        bgColor: 'bg-blue-500/20 hover:bg-blue-500/30',
        borderColor: 'border-blue-400/20'
      };
    } else {
      return {
        icon: AlertTriangle,
        color: 'text-white',
        bgColor: 'bg-yellow-500/20 hover:bg-yellow-500/30',
        borderColor: 'border-yellow-400/20'
      };
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, examDate);
  }, [examDate]);

  useEffect(() => {
    if (!examDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(examDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute

    return () => clearInterval(timer);
  }, [examDate]);

  const readinessInfo = getReadinessInfo();
  const ReadinessIcon = readinessInfo.icon;

  return (
    <>
      <div className="bg-gradient-to-b from-[#1a237e] to-[#0d47a1] rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-white shrink-0" />
            <h3 className="text-lg font-semibold text-white">NCLEX Exam Countdown</h3>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full sm:w-auto bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:ring-2 focus:ring-blue-400 focus:border-white/40 [color-scheme:dark]"
            />
          </div>
        </div>

        {examDate && timeLeft && (
          <div className="mt-3 bg-white/10 rounded-lg p-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-white">{timeLeft.days}</div>
                <div className="text-xs text-blue-200">Days</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{timeLeft.hours}</div>
                <div className="text-xs text-blue-200">Hours</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{timeLeft.minutes}</div>
                <div className="text-xs text-blue-200">Minutes</div>
              </div>
            </div>
          </div>
        )}

        {!examDate && (
          <div className="mt-3 bg-white/10 rounded-lg p-2 text-center">
            <Clock className="w-5 h-5 text-blue-200 mx-auto mb-1" />
            <p className="text-sm text-blue-200">Set your exam date</p>
          </div>
        )}

        {examDate && !timeLeft && (
          <div className="mt-3 bg-white/10 rounded-lg p-2 text-center">
            <Target className="w-5 h-5 text-blue-200 mx-auto mb-1" />
            <p className="text-sm text-blue-200">Exam date has passed</p>
          </div>
        )}

        {/* Readiness Level Section */}
        <div className="mt-3 border-t border-white/10 pt-3">
          <button
            onClick={() => setShowReadinessModal(true)}
            className={`w-full flex items-center justify-between rounded-lg p-2 transition-colors ${readinessInfo.bgColor} border ${readinessInfo.borderColor}`}
          >
            <div className="flex items-center gap-2">
              <ReadinessIcon className={readinessInfo.color} />
              <span className={readinessInfo.color}>NCLEX Readiness Level</span>
            </div>
            <ChevronRight className={readinessInfo.color} />
          </button>
        </div>
      </div>

      <ReadinessAssessmentModal
        isOpen={showReadinessModal}
        onClose={() => setShowReadinessModal(false)}
        metrics={preparationMetrics}
      />
    </>
  );
};

export default ExamCountdownCard;