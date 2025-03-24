import React from 'react';
import { X, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DrugClassificationsModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const drugs = [
    {
      category: 'Cardiovascular',
      className: 'Beta Blockers',
      commonExamples: ['Metoprolol', 'Atenolol', 'Propranolol'],
      primaryUse: 'Hypertension, Arrhythmias, Heart Failure',
      nursingConsiderations: [
        'Monitor heart rate and blood pressure',
        'Assess for signs of bradycardia',
        'Never discontinue abruptly'
      ],
      sideEffects: [
        'Fatigue',
        'Bradycardia',
        'Hypotension',
        'Depression'
      ]
    },
    {
      category: 'Pain Management',
      className: 'Opioid Analgesics',
      commonExamples: ['Morphine', 'Hydromorphone', 'Fentanyl'],
      primaryUse: 'Severe Pain Management',
      nursingConsiderations: [
        'Assess pain level before and after administration',
        'Monitor respiratory rate',
        'Check sedation level'
      ],
      sideEffects: [
        'Respiratory depression',
        'Constipation',
        'Nausea',
        'Sedation'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Drug Classifications</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid gap-6">
            {drugs.map((drug, index) => (
              <div key={index} className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{drug.className}</h3>
                    </div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">{drug.category}</span>
                  </div>
                  {drug.primaryUse.includes('High Alert') && (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Common Examples</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {drug.commonExamples.map((example, i) => (
                        <li key={i} className="text-gray-800 dark:text-white">{example}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Primary Use</h4>
                    <p className="text-gray-800 dark:text-white">{drug.primaryUse}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nursing Considerations</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {drug.nursingConsiderations.map((consideration, i) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300">{consideration}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Common Side Effects</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {drug.sideEffects.map((effect, i) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300">{effect}</li>
                      ))}
                    </ul>
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

export default DrugClassificationsModal;