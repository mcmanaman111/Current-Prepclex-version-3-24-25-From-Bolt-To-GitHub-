import React, { useState, useEffect } from 'react';
import { Clock, FileQuestion, GraduationCap, Sparkles } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import TestSettingsInfoModal from '../modals/TestSettingsInfoModal';

interface Props {
  timeLeft: string;
  elapsedTime: string;
  isTimed: boolean;
  currentQuestion: number;
  totalQuestions: number;
  testSettings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    minutesPerQuestion: number;
  };
}

const ExamHeader = ({ 
  timeLeft, 
  elapsedTime,
  isTimed,
  currentQuestion, 
  totalQuestions,
  testSettings
}: Props) => {
  const [showTime, setShowTime] = useState(window.innerWidth > 960);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [showSettingsInfo, setShowSettingsInfo] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 960;
      setIsMobile(mobile);
      setShowTime(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <header className="bg-[#2B547E] text-white">
        <div className={`py-4 px-6 ${isMobile && testSettings.timer ? 'pb-2' : ''}`}>
          <div className="flex justify-between items-center">
            {/* Left section with question count */}
            <div className="flex-1 flex items-center justify-start">
              {isMobile ? (
                <>
                  <FileQuestion className="w-5 h-5 mr-2" />
                  <span className="text-lg">{currentQuestion} of {totalQuestions}</span>
                </>
              ) : (
                <span className="text-lg">Question: {currentQuestion} of {totalQuestions}</span>
              )}
            </div>

            {/* Center section with PREPCLEX text */}
            <div className="flex-1 flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">PREPCLEX®</h1>
              <span className="text-sm mt-1 w-full text-center hidden lg:block">NCLEX® Exam Preparation</span>
            </div>

            {/* Right section with icons in mobile or timer in desktop */}
            <div className="flex-1 flex items-center justify-end">
              {isMobile ? (
                <button 
                  onClick={() => setShowSettingsInfo(true)}
                  className="flex items-center gap-1.5 hover:bg-white/10 pl-3 pr-1.5 py-1 rounded-lg transition-colors"
                >
                  {testSettings.tutorMode && (
                    <GraduationCap className="w-5 h-5" />
                  )}
                  {testSettings.timer && (
                    <Clock className="w-5 h-5" />
                  )}
                  {testSettings.ngn && (
                    <Sparkles className="w-5 h-5" />
                  )}
                </button>
              ) : (
                isTimed && (
                  <Tooltip content={showTime ? "Hide" : "Show"} placement="bottom">
                    <button 
                      onClick={() => setShowTime(!showTime)}
                      className="flex items-center hover:text-blue-300 transition-colors"
                    >
                      <Clock className="w-5 h-5" />
                      {showTime && (
                        <span className="text-lg ml-2">{timeLeft}</span>
                      )}
                    </button>
                  </Tooltip>
                )
              )}
            </div>
          </div>

          {/* Mobile Timer Display - Only show if timer is enabled */}
          {isMobile && testSettings.timer && (
            <div className="mt-2 flex justify-center">
              <div className="bg-white/10 rounded-full px-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80">Time Remaining:</span>
                  <span className="text-sm font-medium">{timeLeft}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <TestSettingsInfoModal 
        isOpen={showSettingsInfo}
        onClose={() => setShowSettingsInfo(false)}
        settings={testSettings}
      />
    </>
  );
};

export default ExamHeader;