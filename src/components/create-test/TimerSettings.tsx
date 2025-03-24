import React, { useState } from 'react';
import { Settings, X, HelpCircle, Clock } from 'lucide-react';
import Toggle from '../ui/Toggle';
import TimerHelpModal from './TimerHelpModal';

interface Props {
  timer: boolean;
  onChange: (value: boolean) => void;
  minutesPerQuestion: number;
  onMinutesChange: (minutes: number) => void;
}

const TimerSettings = ({ timer, onChange, minutesPerQuestion, onMinutesChange }: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const timeOptions = [1, 2, 3, 4, 5];

  const handleSaveSettings = () => {
    setShowSettings(false);
  };

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-[#2B3467]" />
          <p className="text-[#2B3467] font-medium">Timer</p>
        </div>
      </div>
      
      <div className="h-[38px] flex items-center justify-center">
        <Toggle value={timer} onChange={onChange} />
      </div>
      
      {showSettings && (
        <div className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 p-4 bg-white dark:bg-dark-lighter border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Timer Settings</h4>
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">
                Minutes per question
              </label>
              <div className="flex gap-2">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => onMinutesChange(time)}
                    className={`flex-1 py-1 px-2 rounded-md text-sm ${
                      minutesPerQuestion === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Apply & Save
            </button>
          </div>
        </div>
      )}

      <TimerHelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default TimerSettings;