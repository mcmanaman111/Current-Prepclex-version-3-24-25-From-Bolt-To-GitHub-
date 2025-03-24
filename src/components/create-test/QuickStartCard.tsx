import React, { useState, useEffect } from 'react';
import { Timer, HelpCircle, Save, Sparkles } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface Props {
  onStart: (settings: {
    tutorMode: boolean;
    timer: boolean;
    ngn: boolean;
    questionCount: number;
    minutesPerQuestion: number;
  }) => void;
  resetKey?: boolean;
}

interface QuickStartSettings {
  questionCount: number;
  defaultQuestionCount: number;
  timed: boolean;
  includeNGN: boolean;
  minutesPerQuestion: number;
}

const MAX_QUESTIONS = 75;
const STORAGE_KEY = 'quickStartSettings';

const QuickStartCard = ({ onStart, resetKey }: Props) => {
  const [settings, setSettings] = useState<QuickStartSettings>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...parsed,
        questionCount: parsed.defaultQuestionCount, // Always start with default count
        minutesPerQuestion: parsed.minutesPerQuestion || 2 // Default to 2 minutes per question
      };
    }
    return {
      questionCount: 25,
      defaultQuestionCount: 25,
      timed: false,
      includeNGN: false,
      minutesPerQuestion: 2
    };
  });

  // Reset to defaults when modal opens/closes
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...parsed,
        questionCount: parsed.defaultQuestionCount,
        timed: false,
        includeNGN: false,
        minutesPerQuestion: 2
      });
    }
  }, [resetKey]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleQuestionCountChange = (value: number) => {
    const validatedValue = Math.min(Math.max(1, value), MAX_QUESTIONS);
    setSettings({
      ...settings,
      questionCount: validatedValue
    });
  };

  const handleDefaultQuestionCountChange = () => {
    setSettings(prev => ({
      ...prev,
      defaultQuestionCount: prev.questionCount,
      questionCount: prev.questionCount
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleQuestionCountChange(parseInt(e.target.value));
  };

  const handleStart = () => {
    onStart({
      tutorMode: true, // Quick Start is always in Tutor Mode
      timer: settings.timed,
      ngn: settings.includeNGN,
      questionCount: settings.questionCount,
      minutesPerQuestion: settings.minutesPerQuestion
    });
  };

  return (
    <div className="bg-gradient-to-b from-[#1a237e] to-[#0d47a1] rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-blue-200">Number of Questions</label>
              <Tooltip content="Choose how many questions you want in your practice test (maximum 75)">
                <HelpCircle className="w-4 h-4 text-blue-200 cursor-help" />
              </Tooltip>
            </div>
            <button
              onClick={handleDefaultQuestionCountChange}
              className="flex items-center gap-1 text-sm text-blue-200 hover:text-white"
              title="Set as default"
            >
              <Save className="w-4 h-4" />
              <span>Set as Default</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={settings.questionCount}
              onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 0)}
              min="1"
              max={MAX_QUESTIONS}
              className="w-16 h-10 text-lg text-center text-white bg-white/10 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max={MAX_QUESTIONS}
                value={settings.questionCount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-blue-200">1</span>
                <span className="text-xs text-blue-200">75</span>
              </div>
            </div>
          </div>
          
          {settings.defaultQuestionCount !== settings.questionCount && (
            <p className="text-xs text-blue-200 mt-1">
              Default: {settings.defaultQuestionCount} questions
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-200">Timed Mode</span>
            <Tooltip content="Enable to set a 2-minute time limit per question">
              <HelpCircle className="w-4 h-4 text-blue-200 cursor-help" />
            </Tooltip>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.timed}
              onChange={(e) => setSettings({
                ...settings,
                timed: e.target.checked
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-200">NGN Questions</span>
            <Tooltip content="Include Next Generation NCLEX style questions">
              <HelpCircle className="w-4 h-4 text-blue-200 cursor-help" />
            </Tooltip>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.includeNGN}
              onChange={(e) => setSettings({
                ...settings,
                includeNGN: e.target.checked
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
          </label>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {settings.timed ? (
            <>
              <Timer className="w-5 h-5" />
              Begin Timed Test
            </>
          ) : (
            'Begin Test'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickStartCard;