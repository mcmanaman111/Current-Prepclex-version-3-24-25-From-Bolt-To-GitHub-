import React, { useState } from 'react';
import { Book } from 'lucide-react';
import Toggle from './Toggle';

interface SubjectSelectionProps {
  selectedSubjects: string[];
  setSelectedSubjects: (subjects: string[]) => void;
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  selectedSubjects,
  setSelectedSubjects,
}) => {
  const [showClientNeeds, setShowClientNeeds] = useState(false);

  const subjects = [
    { id: 'fundamentals', name: 'Fundamentals', count: 245 },
    { id: 'adult-health', name: 'Adult Health', count: 312 },
    { id: 'pediatrics', name: 'Pediatrics', count: 178 },
    { id: 'mental-health', name: 'Mental Health', count: 134 },
    { id: 'maternal-newborn', name: 'Maternal - Newborn', count: 156 },
    { id: 'pharmacology', name: 'Pharmacology', count: 186 },
    { id: 'critical-care', name: 'Critical Care', count: 198 },
    { id: 'management', name: 'Management of Care', count: 224 },
  ];

  const clientNeeds = [
    { id: 'management', name: 'Management of Care', count: 224 },
    { id: 'safety', name: 'Safety and Infection Control', count: 156 },
    { id: 'health-promotion', name: 'Health Promotion and Maintenance', count: 178 },
    { id: 'psychosocial', name: 'Psychosocial Integrity', count: 134 },
    { id: 'basic-care', name: 'Basic Care and Comfort', count: 145 },
    { id: 'pharmacological', name: 'Pharmacological and Parenteral Therapies', count: 186 },
    { id: 'risk-reduction', name: 'Reduction of Risk Potential', count: 198 },
    { id: 'physiological', name: 'Physiological Adaptation', count: 167 },
  ];

  const currentOptions = showClientNeeds ? clientNeeds : subjects;

  const handleToggle = (optionId: string) => {
    if (selectedSubjects.includes(optionId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== optionId));
    } else {
      setSelectedSubjects([...selectedSubjects, optionId]);
    }
  };

  const handleSelectAll = () => {
    const currentIds = currentOptions.map(option => option.id);
    if (selectedSubjects.length === currentOptions.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(currentIds);
    }
  };

  const handleViewChange = (value: boolean) => {
    setShowClientNeeds(value);
    setSelectedSubjects([]); // Clear selections when switching views
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-[#2B3467]" />
          <h3 className="text-xl font-semibold text-[#2B3467]">Select Categories:</h3>
        </div>
        <Toggle 
          value={showClientNeeds} 
          onChange={handleViewChange} 
          leftLabel="Subjects" 
          rightLabel="Client Needs"
          defaultLeft={true}
        />
      </div>

      <div className="flex justify-end mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[#2B3467]">Select All</span>
          <input
            type="checkbox"
            checked={selectedSubjects.length === currentOptions.length}
            onChange={handleSelectAll}
            className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentOptions.map((option) => (
          <div
            key={option.id}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedSubjects.includes(option.id)
                ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5'
                : 'border-gray-200 hover:border-[#2B3467] hover:bg-opacity-5'
            }`}
            onClick={() => handleToggle(option.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                  className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
                />
                <div>
                  <h4 className="font-medium text-[#2B3467]">{option.name}</h4>
                  <p className="text-sm text-gray-500">{option.count} questions</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-[#2B3467] text-sm">
          Selected {showClientNeeds ? 'client needs' : 'subjects'}: {selectedSubjects.length} of {currentOptions.length}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Total questions available: {currentOptions.reduce((acc, option) => 
            selectedSubjects.includes(option.id) ? acc + option.count : acc, 0
          )}
        </p>
      </div>
    </div>
  );
};

export default SubjectSelection;