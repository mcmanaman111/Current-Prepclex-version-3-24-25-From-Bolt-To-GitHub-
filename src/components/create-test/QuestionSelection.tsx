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
  totalSelectedQuestions?: number;
  ngnEnabled?: boolean; // NGN from test settings
  ngnOnly: boolean; // NGN Only from this component
  onNgnOnlyChange: (value: boolean) => void;
  ngnQuestionData?: {
    total: number,
    byTopic: Record<string, number>
  };
}

const QuestionSelection = ({
  questionTypes,
  selectedQuestions,
  onQuestionToggle,
  onSelectAll,
  totalSelectedQuestions,
  ngnEnabled = false,
  ngnOnly,
  onNgnOnlyChange,
  ngnQuestionData = { total: 5, byTopic: {} }
}: Props) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

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
            {ngnEnabled && (
              <>
                <Sparkles className="w-5 h-5 text-[#2B3467] dark:text-gray-300" />
                <span className="text-[#2B3467] dark:text-gray-300 text-sm font-medium">NGN Questions Only</span>
                <div className="h-[38px] flex items-center ml-2">
                  <div className="flex rounded-full bg-gray-200 dark:bg-gray-700 p-1 w-36 shadow-inner border border-gray-300 dark:border-gray-600">
                    <button
                      className={`flex-1 py-1 px-3 rounded-full text-xs font-medium transition-all ${
                        !ngnOnly
                          ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-700'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => onNgnOnlyChange(false)}
                      type="button"
                    >
                      Off
                    </button>
                    <button
                      className={`flex-1 py-1 px-3 rounded-full text-xs font-medium transition-all ${
                        ngnOnly
                          ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-700'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => onNgnOnlyChange(true)}
                      type="button"
                    >
                      On
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

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

        <div className="flex flex-wrap gap-4">
          {questionTypes.map((type) => (
            <div 
              key={type.id}
              className={`flex-grow basis-full md:basis-[calc(50%-0.5rem)] p-4 rounded-xl border-2 ${
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
                        {ngnOnly ? (
                          // Show all NGN questions in the "Unused" category when it's selected
                          // If no categories are selected, distribute according to actual data
                          selectedQuestions.length === 0 || selectedQuestions.includes(type.id) ? 
                            (type.id === 'unused' ? (ngnQuestionData?.total || 5) : 0) : 0
                        ) : type.count} questions
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

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
          <p className="text-[#2B3467] dark:text-gray-200 text-sm text-center">
            Selected question types: {selectedQuestions.length} of {questionTypes.length}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
            Total questions available: {
              // If totalSelectedQuestions is provided, use it (this factors in topic filtering)
              totalSelectedQuestions !== undefined ? totalSelectedQuestions :
              // Otherwise, calculate based only on question types
              (ngnOnly ? (ngnQuestionData?.total || 5) : 
                questionTypes.reduce((acc, type) => 
                  selectedQuestions.includes(type.id) ? acc + type.count : acc, 0))
            }
          </p>
          {ngnOnly && (
            <p className="text-purple-600 dark:text-purple-400 text-sm text-center flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Showing only {ngnQuestionData?.total || 5} Next Generation NCLEX questions
            </p>
          )}
          {ngnEnabled && !ngnOnly && (
            <p className="text-blue-600 dark:text-blue-400 text-sm text-center flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              NGN Questions are enabled for this test
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
