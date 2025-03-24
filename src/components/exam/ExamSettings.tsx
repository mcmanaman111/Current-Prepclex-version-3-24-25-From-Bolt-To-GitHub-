import React, { useState } from 'react';
import { Moon, Sun, Type, Settings, X, Clock, HelpCircle, PanelsTopLeft, PanelTop as PanelsTop } from 'lucide-react';
import TimerSettingsWidget from './TimerSettingsWidget';
import TestSettingsHelpModal from '../modals/TestSettingsHelpModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onTimerSettingChange?: (minutes: number) => void;
  minutesPerQuestion: number;
  timer: boolean;
  isStackedView: boolean;
  onViewToggle: () => void;
}

const ExamSettings = ({ 
  isOpen, 
  onClose, 
  fontSize, 
  onFontSizeChange, 
  isDark, 
  onThemeToggle,
  onTimerSettingChange,
  minutesPerQuestion,
  timer,
  isStackedView,
  onViewToggle
}: Props) => {
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure your test experience</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Settings Card */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Display Settings</h3>
              <div className="space-y-6">
                {/* Font Size Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-200">Font Size</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    value={fontSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      onFontSizeChange(newSize);
                      document.documentElement.style.fontSize = `${newSize}px`;
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">A</span>
                    <span className="text-base text-gray-500 dark:text-gray-400">A</span>
                  </div>
                </div>

                {/* View Layout Radio */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {isStackedView ? (
                      <PanelsTop className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <PanelsTopLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                    <span className="text-gray-700 dark:text-gray-200">View Layout</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                      <input
                        type="radio"
                        name="viewLayout"
                        checked={!isStackedView}
                        onChange={() => onViewToggle()}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <PanelsTopLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Split View</span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                      <input
                        type="radio"
                        name="viewLayout"
                        checked={isStackedView}
                        onChange={() => onViewToggle()}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <PanelsTop className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Stacked View</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Theme Radio */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {isDark ? (
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                    <span className="text-gray-700 dark:text-gray-200">Theme</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                      <input
                        type="radio"
                        name="theme"
                        checked={!isDark}
                        onChange={() => onThemeToggle()}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Light Mode</span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                      <input
                        type="radio"
                        name="theme"
                        checked={isDark}
                        onChange={() => onThemeToggle()}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Dark Mode</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Timer Settings Card - Only show when timer is enabled */}
            {timer && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Timer Settings</h3>
                  </div>
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <TimerSettingsWidget 
                  onSave={onTimerSettingChange}
                  currentValue={minutesPerQuestion}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <TestSettingsHelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default ExamSettings;