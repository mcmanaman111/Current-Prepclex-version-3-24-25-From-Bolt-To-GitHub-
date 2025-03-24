import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DoNotUseModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const doNotUseList = [
    { abbr: 'U', meaning: 'Unit - Write "unit"' },
    { abbr: 'IU', meaning: 'International Unit - Write "international unit"' },
    { abbr: 'Q.D., QD, q.d., qd', meaning: 'Daily - Write "daily"' },
    { abbr: 'Q.O.D., QOD, q.o.d, qod', meaning: 'Every other day - Write "every other day"' },
    { abbr: 'Trailing zero (X.0 mg)', meaning: 'Never write a zero by itself after a decimal point' },
    { abbr: 'Lack of leading zero (.X mg)', meaning: 'Always use a zero before a decimal point' },
    { abbr: 'MS', meaning: 'Can mean morphine sulfate or magnesium sulfate - Write the complete name' },
    { abbr: 'MSO4', meaning: 'Morphine sulfate - Write "morphine sulfate"' },
    { abbr: 'MgSO4', meaning: 'Magnesium sulfate - Write "magnesium sulfate"' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Joint Commission "Do Not Use" List
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The following abbreviations are considered dangerous and should not be used in medical documentation:
          </p>

          <div className="space-y-4">
            {doNotUseList.map((item, index) => (
              <div key={index} className="border-b dark:border-gray-700 pb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded">
                    <span className="text-red-600 dark:text-red-400 font-bold">{item.abbr}</span>
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">{item.meaning}</p>
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

export default DoNotUseModal;