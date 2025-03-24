import React from 'react';
import { X, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NclexScoringModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                NCLEX Scoring Information
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              The NCLEX exam uses a specific scoring method for "Select All That Apply" (SATA) questions:
            </p>
            
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>You must select ALL correct options and NONE of the incorrect options to receive credit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Partial credit is not awarded - the question is scored as either correct or incorrect.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>This all-or-nothing approach ensures nurses can fully identify correct interventions and avoid incorrect ones.</span>
              </li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Note:</strong> While our practice tests show partially correct answers to help you learn, remember that on the actual NCLEX exam, you need to select all correct options to receive credit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NclexScoringModal;