import React from 'react';
import { X, Brain, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LabValuesModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const labValues = [
    {
      name: 'Hemoglobin (Hgb)',
      category: 'Hematology',
      normalRange: '12-16 g/dL (female), 14-18 g/dL (male)',
      criticalValues: '< 7 g/dL or > 20 g/dL',
      interpretation: 'Measures oxygen-carrying capacity of blood. Low values indicate anemia, high values may indicate polycythemia.',
    },
    {
      name: 'Sodium (Na+)',
      category: 'Chemistry',
      normalRange: '135-145 mEq/L',
      criticalValues: '< 120 mEq/L or > 160 mEq/L',
      interpretation: 'Key electrolyte for fluid balance and nerve conduction. Abnormal values may indicate dehydration or SIADH.',
    },
    {
      name: 'Troponin',
      category: 'Cardiac',
      normalRange: '< 0.04 ng/mL',
      criticalValues: '> 0.4 ng/mL',
      interpretation: 'Cardiac-specific protein that indicates heart muscle damage. Elevated in heart attack.',
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lab Values</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid gap-6">
            {labValues.map((lab, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{lab.name}</h3>
                    <span className="text-sm text-blue-600 dark:text-blue-400">{lab.category}</span>
                  </div>
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Normal Range</h4>
                    <p className="text-gray-800 dark:text-white">{lab.normalRange}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Critical Values</h4>
                    <p className="text-red-600 dark:text-red-400">{lab.criticalValues}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Interpretation</h4>
                    <p className="text-gray-800 dark:text-white">{lab.interpretation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabValuesModal;