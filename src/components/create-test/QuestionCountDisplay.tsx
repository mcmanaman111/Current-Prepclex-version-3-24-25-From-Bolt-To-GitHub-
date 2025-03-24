import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  maxQuestions: number;
}

const QuestionCountDisplay = ({ value, onChange, maxQuestions }: Props) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      // Clamp value between 1 and maxQuestions
      const clampedValue = Math.min(Math.max(1, newValue), maxQuestions);
      onChange(clampedValue);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min="1"
        max={maxQuestions}
        className="w-24 h-24 text-4xl text-center text-[#2B3467] border-2 border-[#2B3467] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-[#2B3467] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
};

export default QuestionCountDisplay;