import React, { useEffect, useRef } from 'react';
import { Hash } from 'lucide-react';

interface Props {
  availableQuestions: number;
  value: number;
  onChange: (value: number) => void;
  totalSelectedQuestions: number;
}

const MAX_QUESTIONS = 75;

const QuestionCountSelector = ({ 
  availableQuestions, 
  value, 
  onChange,
  totalSelectedQuestions
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const maxQuestions = Math.min(availableQuestions, MAX_QUESTIONS);

  useEffect(() => {
    inputRef.current?.focus();
    if (value === 0) {
      onChange(1);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (newValue === '') {
      onChange(0);
      return;
    }

    const cleanValue = newValue.replace(/^0+/, '');
    const parsed = parseInt(cleanValue);
    
    if (!isNaN(parsed)) {
      const clampedValue = Math.min(Math.max(0, parsed), maxQuestions);
      onChange(clampedValue);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-3">
          <Hash className="w-6 h-6 text-[#2B3467]" />
          <h3 className="text-xl font-semibold text-[#2B3467]">Select Number of Questions</h3>
        </div>
        <p className="text-sm text-gray-500">Choose between 1-75 questions for your test</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center">
          <input
            ref={inputRef}
            type="number"
            value={value || ''}
            onChange={handleInputChange}
            min="0"
            max={maxQuestions}
            placeholder="0"
            className="w-16 h-16 text-2xl text-center text-[#2B3467] border-2 border-[#2B3467] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-[#2B3467] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        
        <div className="w-full max-w-[240px]">
          <div className="relative">
            <input
              type="range"
              min="1"
              max={maxQuestions}
              value={value || 1}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B3467]"
            />
            <div className="flex justify-between mt-1">
              <span className="text-sm text-gray-500">1</span>
              <span className="text-sm text-gray-500">75</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Total questions available: {totalSelectedQuestions}
        </p>
      </div>
    </div>
  );
};

export default QuestionCountSelector;