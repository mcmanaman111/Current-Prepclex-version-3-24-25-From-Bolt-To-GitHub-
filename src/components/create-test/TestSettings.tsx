import React, { useState } from 'react';
import { GraduationCap, Clock, Sparkles, Settings, HelpCircle } from 'lucide-react';
import Toggle from '../ui/Toggle';
import TimerSettings from './TimerSettings';
import TestSettingsHelpModal from '../modals/TestSettingsHelpModal';

interface Props {
  tutorMode: boolean;
  setTutorMode: (value: boolean) => void;
  timer: boolean;
  setTimer: (value: boolean) => void;
  ngn: boolean;
  setNGN: (value: boolean) => void;
  minutesPerQuestion: number;
  setMinutesPerQuestion: (value: number) => void;
}

const TestSettings = ({
  tutorMode,
  setTutorMode,
  timer,
  setTimer,
  ngn,
  setNGN,
  minutesPerQuestion,
  setMinutesPerQuestion
}: Props) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-[#2B3467] dark:text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Select Test Settings</h3>
          <button
            onClick={() => setShowHelpModal(true)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border-2 transition-all ${
            tutorMode
              ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5 dark:border-blue-500 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-[#2B3467] dark:hover:border-blue-500 hover:bg-opacity-5'
          }`}>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-[#2B3467] dark:text-gray-300" />
                <p className="text-[#2B3467] dark:text-gray-300 font-medium">Tutor Mode</p>
              </div>
              <div className="h-[38px] flex items-center">
                <Toggle value={tutorMode} onChange={setTutorMode} />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 transition-all ${
            timer
              ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5 dark:border-blue-500 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-[#2B3467] dark:hover:border-blue-500 hover:bg-opacity-5'
          }`}>
            <div className="flex flex-col items-center">
              <TimerSettings 
                timer={timer} 
                onChange={setTimer} 
                minutesPerQuestion={minutesPerQuestion}
                onMinutesChange={setMinutesPerQuestion}
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 transition-all ${
            ngn
              ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5 dark:border-blue-500 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-[#2B3467] dark:hover:border-blue-500 hover:bg-opacity-5'
          }`}>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#2B3467] dark:text-gray-300" />
                <p className="text-[#2B3467] dark:text-gray-300 font-medium">NGN Questions</p>
              </div>
              <div className="h-[38px] flex items-center">
                <Toggle value={ngn} onChange={setNGN} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TestSettingsHelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
};

export default TestSettings;