import React from 'react';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  defaultLeft?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange, leftLabel, rightLabel, defaultLeft }) => {
  return (
    <div className="flex rounded-full bg-gray-100 p-1 w-48">
      <button
        className={`flex-1 py-1 px-4 rounded-full text-sm font-medium transition-colors ${
          !value
            ? 'bg-[#2B3467] text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-600'
        }`}
        onClick={() => onChange(false)}
      >
        {leftLabel || 'Off'}
      </button>
      <button
        className={`flex-1 py-1 px-4 rounded-full text-sm font-medium transition-colors ${
          value
            ? 'bg-[#2B3467] text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-600'
        }`}
        onClick={() => onChange(true)}
      >
        {rightLabel || 'On'}
      </button>
    </div>
  );
};

export default Toggle;