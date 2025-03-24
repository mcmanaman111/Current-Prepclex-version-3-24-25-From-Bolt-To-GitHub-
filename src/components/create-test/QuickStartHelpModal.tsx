import React from 'react';
import { X, Zap, Timer, Settings, HelpCircle, Sparkles } from 'lucide-react';

interface QuickStartHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickStartHelpModal = ({ isOpen, onClose }: QuickStartHelpModalProps) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: Zap,
      title: 'Quick Start Test',
      description: 'Start a practice test immediately in TUTOR MODE with randomly selected UNUSED questions from your question bank. Configure your preferences and begin your test.'
    },
    {
      icon: Settings,
      title: 'Customizable Settings',
      description: 'Customize your test settings:',
      subFeatures: [
        'Choose the number of questions (1-75)',
        'Enable or disable timed mode',
        'Include or exclude NGN questions',
        'Save your preferences for future quick starts'
      ]
    },
    {
      icon: Timer,
      title: 'Timed Mode',
      description: 'When enabled, you\'ll have 2 minutes per question to complete your test, helping you practice under exam-like conditions.'
    },
    {
      icon: Sparkles,
      title: 'NGN Questions',
      description: 'Toggle to include Next Generation NCLEX style questions in your practice test, featuring case studies and advanced item types.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Quick Start Guide
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="border-b dark:border-gray-700 pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {feature.description}
                    </p>
                    {feature.subFeatures && (
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {feature.subFeatures.map((subFeature, subIndex) => (
                          <li key={subIndex}>{subFeature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> All questions are selected from your unused question pool to ensure you're always practicing with fresh content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartHelpModal;