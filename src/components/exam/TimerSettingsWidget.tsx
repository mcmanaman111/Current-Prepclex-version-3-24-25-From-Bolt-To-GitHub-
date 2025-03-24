import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface Props {
  onSave?: (minutes: number) => void;
  currentValue?: number;
}

const TimerSettingsWidget = ({ onSave, currentValue = 2 }: Props) => {
  const [timePerQuestion, setTimePerQuestion] = useState(currentValue);
  const [showHelp, setShowHelp] = useState(false);

  const timeOptions = [1, 2, 3, 4, 5];

  const handleSave = () => {
    if (onSave) {
      onSave(timePerQuestion);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Minutes per question</span>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {timeOptions.map((time) => (
          <button
            key={time}
            onClick={() => setTimePerQuestion(time)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              timePerQuestion === time
                ? 'bg-blue-500 text-white dark:bg-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {time}
          </button>
        ))}
      </div>

      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Understanding Timer Settings</p>
              <p>The timer setting determines how many minutes you'll have for each question. The total time will be calculated by multiplying the minutes per question by the total number of questions.</p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Apply & Save
      </button>
    </div>
  );
};

export default TimerSettingsWidget;