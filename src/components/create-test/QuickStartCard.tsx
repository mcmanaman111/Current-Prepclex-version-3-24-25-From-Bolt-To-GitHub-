import React, { useState, useEffect } from 'react';
import { Timer, HelpCircle, Save, Sparkles, Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { useAuth } from '../AuthProvider';
import { getUnusedQuestionsCount } from '../../services/api';

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

const MAX_ALLOWED_QUESTIONS = 85; // Max of 85 questions as specified in requirements
const STORAGE_KEY = 'quickStartSettings';

const QuickStartCard = ({ onStart, resetKey }: Props) => {
  const { user } = useAuth();
  const [availableQuestions, setAvailableQuestions] = useState<number>(0);
  const [availableNGNQuestions, setAvailableNGNQuestions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Keep track of the max questions available based on settings
  const [maxQuestions, setMaxQuestions] = useState<number>(25);

  // Fetch the count of unused questions when the component mounts or when including NGN changes
  useEffect(() => {
    const fetchQuestionCounts = async () => {
      try {
        setIsLoading(true);
        
        // Handle case where user might not be available yet
        if (!user) {
          console.log("User not available yet, using default counts");
          setAvailableQuestions(25); // Default fallback
          setAvailableNGNQuestions(30); // Default fallback
          setMaxQuestions(25);
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching question counts for user:", user.id);
        
        // Get count without NGN first
        const standardCount = await getUnusedQuestionsCount(user.id, false);
        setAvailableQuestions(standardCount);
        
        // Then get count with NGN
        const withNGNCount = await getUnusedQuestionsCount(user.id, true);
        setAvailableNGNQuestions(withNGNCount);
        
        // Set max questions based on current settings
        updateMaxQuestions(settings.includeNGN, standardCount, withNGNCount);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching unused question counts:', error);
        setAvailableQuestions(25); // Default fallback
        setAvailableNGNQuestions(30); // Default fallback
        setMaxQuestions(25);
        setIsLoading(false);
      }
    };
    
    fetchQuestionCounts();
  }, [user, resetKey]);
  
  // Update max questions whenever includeNGN changes
  const updateMaxQuestions = (includeNGN: boolean, standardCount: number = availableQuestions, totalCount: number = availableNGNQuestions) => {
    const availableCount = includeNGN ? totalCount : standardCount;
    const newMaxQuestions = Math.min(availableCount, MAX_ALLOWED_QUESTIONS);
    setMaxQuestions(newMaxQuestions);
    
    // If current question count exceeds the new max, adjust it
    if (settings.questionCount > newMaxQuestions && newMaxQuestions > 0) {
      setSettings(prev => ({
        ...prev,
        questionCount: newMaxQuestions
      }));
    }
  };
  
  // Reset to defaults when modal opens/closes
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      
      // Load saved settings but ensure questionCount doesn't exceed max
      const loadedSettings = {
        ...parsed,
        questionCount: Math.min(parsed.defaultQuestionCount, maxQuestions || MAX_ALLOWED_QUESTIONS),
        timed: parsed.timed || false,
        includeNGN: parsed.includeNGN || false,
        minutesPerQuestion: parsed.minutesPerQuestion || 2
      };
      
      setSettings(loadedSettings);
      
      // Update maxQuestions based on loaded NGN setting
      updateMaxQuestions(loadedSettings.includeNGN);
    }
  }, [resetKey, maxQuestions]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);
  
  // When NGN setting changes, update max questions
  useEffect(() => {
    updateMaxQuestions(settings.includeNGN);
  }, [settings.includeNGN]);

  const handleQuestionCountChange = (value: number) => {
    const validatedValue = Math.min(Math.max(1, value), maxQuestions || 25);
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
  
  const handleNGNToggle = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      includeNGN: checked
    }));
    // updateMaxQuestions will be called by the useEffect that watches settings.includeNGN
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
  
  // Calculate available questions message
  const getAvailableMessage = () => {
    const relevantCount = settings.includeNGN ? availableNGNQuestions : availableQuestions;
    if (isLoading) return "Loading...";
    return `${relevantCount} unused questions available`;
  };

  return (
    <div className="bg-gradient-to-b from-[#1a237e] to-[#0d47a1] rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-blue-200">Number of Questions</label>
              <Tooltip content="Choose how many questions you want in your practice test (maximum 85)">
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
              max={maxQuestions}
              className="w-16 h-10 text-lg text-center text-white bg-white/10 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={isLoading || maxQuestions === 0}
            />
            
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max={maxQuestions || 1}
                value={settings.questionCount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                disabled={isLoading || maxQuestions === 0}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-blue-200">1</span>
                <span className="text-xs text-blue-200">{maxQuestions || "N/A"}</span>
              </div>
            </div>
          </div>
          
          {/* Available questions message */}
          <div className="flex items-center gap-2 mt-1">
            <Info className="w-3 h-3 text-blue-200" />
            <p className="text-xs text-blue-200">{getAvailableMessage()}</p>
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
              onChange={(e) => handleNGNToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
          </label>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={isLoading || maxQuestions === 0}
        >
          {settings.timed ? (
            <>
              <Timer className="w-5 h-5" />
              {settings.includeNGN ? 'Begin Timed Test With NGN' : 'Begin Timed Test'}
            </>
          ) : (
            settings.includeNGN ? 'Begin Test With NGN' : 'Begin Test'
          )}
        </button>
        
        {maxQuestions === 0 && !isLoading && (
          <p className="text-xs text-red-300 text-center mt-2">
            No unused questions available. Complete previous tests to unlock more questions.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuickStartCard;
