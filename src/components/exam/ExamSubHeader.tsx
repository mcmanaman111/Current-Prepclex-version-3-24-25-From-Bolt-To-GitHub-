import React, { useState } from 'react';
import { Calculator as CalculatorIcon, Flag, Settings, GraduationCap, Clock, Sparkles, PanelsTopLeft, PanelTop as PanelsTop, NotebookPen, BookOpen } from 'lucide-react';
import Calculator from './Calculator';
import ExamSettings from './ExamSettings';
import ExamNotesModal from '../modals/ExamNotesModal';
import StudyResourcesModal from './StudyResourcesModal';
import { useTheme } from '../../hooks/useTheme';
import Tooltip from '../ui/Tooltip';
import type { Question } from '../../types/exam';

interface Props {
  testId: number;
  isMarked: boolean;
  onMarkForReview: () => void;
  testSettings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    isQuickStart?: boolean;
    minutesPerQuestion: number;
  };
  onTimerSettingChange?: (minutes: number) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  isStackedView: boolean;
  onViewToggle: () => void;
  currentQuestion: Question;
}

const ExamSubHeader = ({ 
  testId, 
  isMarked, 
  onMarkForReview, 
  testSettings,
  onTimerSettingChange,
  showSettings,
  setShowSettings,
  isStackedView,
  onViewToggle,
  currentQuestion
}: Props) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const { isDark, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);

  // Check if mobile on mount and window resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 960);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleResourceSelect = (resourceId: string) => {
    console.log('Selected resource:', resourceId);
  };

  return (
    <div className="bg-[#5BB4E5] text-white py-2 px-4">
      <div className="flex items-center justify-between">
        {/* Calculator and Notes Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Tooltip content="Calculator" placement="bottom">
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-2 hover:bg-blue-600/50 px-3 py-1 rounded transition-colors"
              >
                <CalculatorIcon className="w-5 h-5" />
                <span className="hidden lg:inline">CALCULATOR</span>
              </button>
            </Tooltip>
          </div>
          <div className="relative">
            <Tooltip content="Notes" placement="bottom">
              <button 
                onClick={() => setShowNotesModal(true)}
                className="flex items-center gap-2 hover:bg-blue-600/50 px-3 py-1 rounded transition-colors"
              >
                <NotebookPen className="w-5 h-5" />
                <span className="hidden lg:inline">NOTES</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Center Section - Test Settings (Hidden on Mobile) */}
        {!isMobile && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="bg-white/10 rounded-full px-4 py-1.5">
              <div className="flex items-center gap-4">
                {testSettings.tutorMode && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-5 h-5" />
                    <span>Tutor Mode</span>
                  </div>
                )}
                {testSettings.timer && (
                  <>
                    <div className="h-5 w-px bg-white/30" />
                    <div className="flex items-center gap-1">
                      <Clock className="w-5 h-5" />
                      <span>Timer ({testSettings.minutesPerQuestion} min/question)</span>
                    </div>
                  </>
                )}
                {testSettings.ngn && (
                  <>
                    <div className="h-5 w-px bg-white/30" />
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-5 h-5" />
                      <span>+NGN</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Section - Review Later and Settings */}
        <div className="flex items-center gap-4">
          <Tooltip content="Mark For Later" placement="bottom">
            <button 
              onClick={onMarkForReview}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                isMarked 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'hover:bg-blue-600/50'
              }`}
            >
              <Flag className="w-5 h-5" />
            </button>
          </Tooltip>

          <Tooltip content="Resources" placement="bottom">
            <button
              onClick={() => setShowResourcesModal(true)}
              className="hover:bg-blue-600/50 px-3 py-1 rounded transition-colors"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </Tooltip>

          {/* View Toggle - Hidden on Mobile */}
          {!isMobile && (
            <Tooltip content={isStackedView ? "Split View" : "Stacked View"} placement="bottom">
              <button
                onClick={onViewToggle}
                className="hover:bg-blue-600/50 px-3 py-1 rounded transition-colors"
              >
                {isStackedView ? (
                  <PanelsTop className="w-5 h-5" />
                ) : (
                  <PanelsTopLeft className="w-5 h-5" />
                )}
              </button>
            </Tooltip>
          )}
          <Tooltip content="Settings" placement="bottom">
            <button 
              onClick={() => setShowSettings(true)}
              className="hover:bg-blue-600/50 px-3 py-1 rounded transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Calculator with improved mobile positioning */}
      {showCalculator && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isMobile ? 'p-4 pb-20' : ''}`}>
          <div className={`${isMobile ? 'w-full max-w-[320px]' : ''}`}>
            <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
          </div>
        </div>
      )}

      <ExamNotesModal 
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        questionId={currentQuestion.qid}
        testId={`T${testId}`}
        topic={currentQuestion.statistics.clientNeedArea}
        subTopic={currentQuestion.statistics.clientNeedTopic}
      />

      <ExamSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onTimerSettingChange={onTimerSettingChange}
        minutesPerQuestion={testSettings.minutesPerQuestion}
        timer={testSettings.timer}
        isStackedView={isStackedView}
        onViewToggle={onViewToggle}
      />

      <StudyResourcesModal
        isOpen={showResourcesModal}
        onClose={() => setShowResourcesModal(false)}
        onSelectResource={handleResourceSelect}
      />
    </div>
  );
};

export default ExamSubHeader;