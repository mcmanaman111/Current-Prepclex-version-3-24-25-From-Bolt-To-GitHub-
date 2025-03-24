import React, { useState } from 'react';
import { Book, Brain, FileText, BarChart2, Calculator, FileSpreadsheet, X } from 'lucide-react';
import {
  LabValuesModal,
  DrugClassificationsModal,
  VitalSignsModal,
  NursingAbbreviationsModal,
  MedMathModal
} from './ResourceModals';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectResource: (resource: string) => void;
}

const StudyResourcesModal = ({ isOpen, onClose, onSelectResource }: Props) => {
  const [activeResource, setActiveResource] = useState<string | null>(null);

  if (!isOpen) return null;

  const resources = [
    {
      id: 'lab-values',
      title: 'Lab Values',
      description: 'Normal ranges & interpretations',
      icon: Brain,
      color: 'blue'
    },
    {
      id: 'drug-classifications',
      title: 'Drug Classifications',
      description: 'Common medications by category',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'vital-signs',
      title: 'Vital Signs',
      description: 'Normal ranges & variations',
      icon: BarChart2,
      color: 'purple'
    },
    {
      id: 'med-math',
      title: 'Med Math',
      description: 'Medication calculations guide',
      icon: Calculator,
      color: 'orange'
    },
    {
      id: 'nursing-abbreviations',
      title: 'Nursing Abbreviations',
      description: 'Common medical abbreviations',
      icon: FileSpreadsheet,
      color: 'pink'
    }
  ];

  const handleResourceClick = (resourceId: string) => {
    setActiveResource(resourceId);
    onSelectResource(resourceId);
  };

  const handleResourceClose = () => {
    setActiveResource(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
        <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-4xl w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Study Resources
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <button
                  key={resource.id}
                  onClick={() => handleResourceClick(resource.id)}
                  className="bg-white dark:bg-dark-lighter p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                >
                  <div className={`w-12 h-12 rounded-lg bg-${resource.color}-100 dark:bg-${resource.color}-900/20 flex items-center justify-center mb-4`}>
                    <resource.icon className={`w-6 h-6 text-${resource.color}-600 dark:text-${resource.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{resource.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{resource.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resource-specific modals */}
      <LabValuesModal
        isOpen={activeResource === 'lab-values'}
        onClose={handleResourceClose}
      />
      <DrugClassificationsModal
        isOpen={activeResource === 'drug-classifications'}
        onClose={handleResourceClose}
      />
      <VitalSignsModal
        isOpen={activeResource === 'vital-signs'}
        onClose={handleResourceClose}
      />
      <MedMathModal
        isOpen={activeResource === 'med-math'}
        onClose={handleResourceClose}
      />
      <NursingAbbreviationsModal
        isOpen={activeResource === 'nursing-abbreviations'}
        onClose={handleResourceClose}
      />
    </>
  );
};

export default StudyResourcesModal;