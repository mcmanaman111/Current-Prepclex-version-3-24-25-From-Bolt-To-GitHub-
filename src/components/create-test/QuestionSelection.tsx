import React, { useState } from 'react';
import { ListFilter, HelpCircle, Sparkles } from 'lucide-react';
import QuestionSelectionHelpModal from '../modals/QuestionSelectionHelpModal';
import Toggle from '../ui/Toggle';

interface Props {
  questionTypes: Array<{
    id: string;
    label: string;
    count: number;
  }>;
  selectedQuestions: string[];
  onQuestionToggle: (id: string) => void;
  onSelectAll: () => void;
}

const QuestionSelection = ({
  questionTypes,
  selectedQuestions,
  onQuestionToggle,
  onSelectAll
}: Props) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [ngnOnly, setNgnOnly] = useState(false);

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-3">
            <ListFilter className="w-6 h-6 text-[#2B3467] dark:text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Select Question Type</h3>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose which questions to include</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2B3467] dark:text-gray-300" />
            <span className="text-[#2B3467] dark:text-gray-300 text-sm font-medium">NGN Questions Only</span>
          </div>
          <Toggle
            value={ngnOnly}
            onChange={setNgnOnly}
            label=""
            darkText={false}
          />
        </div>

        <div className="flex justify-end mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[#2B3467] dark:text-gray-300">Select All</span>
            <input
              type="checkbox"
              checked={selectedQuestions.length === questionTypes.length}
              onChange={onSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              className={`p-4 rounded-xl border-2 ${
                selectedQuestions.includes(type.id)
                  ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5 dark:border-blue-500 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#2B3467] dark:hover:border-blue-500 hover:bg-opacity-5'
              }`}
            >
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => onQuestionToggle(type.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(type.id)}
                    onChange={() => onQuestionToggle(type.id)}
                    className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{type.label}</h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                        {ngnOnly ? Math.round(type.count * 0.3) : type.count} questions
                      </span>
                      {ngnOnly && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          NGN Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-[#2B3467] dark:text-gray-200 text-sm text-center">
            Selected question types: {selectedQuestions.length} of {questionTypes.length}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
            Total questions available: {ngnOnly ? Math.round(questionTypes.reduce((acc, type) => 
              selectedQuestions.includes(type.id) ? acc + type.count : acc, 0) * 0.3) : 
              questionTypes.reduce((acc, type) => 
                selectedQuestions.includes(type.id) ? acc + type.count : acc, 0)}
          </p>
          {ngnOnly && (
            <p className="text-purple-600 dark:text-purple-400 text-sm mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Showing only Next Generation NCLEX questions
            </p>
          )}
        </div>
      </div>

      <QuestionSelectionHelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default QuestionSelection;