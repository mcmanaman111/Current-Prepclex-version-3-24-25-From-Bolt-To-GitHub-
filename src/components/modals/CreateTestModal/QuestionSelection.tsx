import React from 'react';

interface QuestionSelectionProps {
  selectedQuestions: string[];
  setSelectedQuestions: (questions: string[]) => void;
}

const QuestionSelection: React.FC<QuestionSelectionProps> = ({
  selectedQuestions,
  setSelectedQuestions
}) => {
  const questionTypes = [
    { id: 'unused', label: 'Unused', count: 1211, checked: true },
    { id: 'incorrect', label: 'Incorrect', count: 140 },
    { id: 'marked', label: 'Marked', count: 140 },
    { id: 'skipped', label: 'Skipped', count: 34 },
    { id: 'correct', label: 'Correct', count: 132 }
  ];

  const handleCheckboxChange = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questionTypes.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questionTypes.map(q => q.id));
    }
  };

  const totalSelectedQuestions = questionTypes.reduce((acc, type) => 
    selectedQuestions.includes(type.id) ? acc + type.count : acc, 0
  );

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold text-[#2B3467]">Include:</h3>

      <div className="flex justify-end mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[#2B3467]">Select All</span>
          <input
            type="checkbox"
            checked={selectedQuestions.length === questionTypes.length}
            onChange={handleSelectAll}
            className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionTypes.map((type) => (
          <div
            key={type.id}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedQuestions.includes(type.id)
                ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5'
                : 'border-gray-200 hover:border-[#2B3467] hover:bg-opacity-5'
            }`}
            onClick={() => handleCheckboxChange(type.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(type.id)}
                  onChange={() => handleCheckboxChange(type.id)}
                  className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
                />
                <div>
                  <h4 className="font-medium text-[#2B3467]">{type.label}</h4>
                  <p className="text-sm text-gray-500">{type.count} questions</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-[#2B3467] text-sm">
          Selected question types: {selectedQuestions.length} of {questionTypes.length}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Total questions available: {totalSelectedQuestions}
        </p>
      </div>
    </div>
  );
}

export default QuestionSelection;