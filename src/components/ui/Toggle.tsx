import React from 'react';

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  darkText?: boolean;
}

const Toggle = ({ label, value, onChange, darkText = true }: ToggleProps) => {
  const textColor = darkText ? 'text-white' : 'text-gray-700 dark:text-gray-200';
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <span className={`text-sm text-center ${textColor}`}>{label}</span>
      <div className="flex rounded-full bg-gray-200 dark:bg-gray-700 p-1 w-36 shadow-inner border border-gray-300 dark:border-gray-600">
        <button
          className={`flex-1 py-1 px-3 rounded-full text-xs font-medium transition-all ${
            !value
              ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-700'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => onChange(false)}
          type="button"
        >
          Off
        </button>
        <button
          className={`flex-1 py-1 px-3 rounded-full text-xs font-medium transition-all ${
            value
              ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-700'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => onChange(true)}
          type="button"
        >
          On
        </button>
      </div>
    </div>
  );
};

export default Toggle;