import React from 'react';
import { X, GraduationCap, Timer, Sparkles, Settings, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TestSettingsHelpModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const settings = [
    {
      icon: GraduationCap,
      title: 'Tutor Mode',
      description: 'When enabled, you\'ll receive detailed explanations after each question, helping you understand the rationale behind correct and incorrect answers.',
      features: [
        'Immediate feedback after each answer',
        'Detailed explanations of correct and incorrect options',
        'References to relevant study materials',
        'Performance tracking for each topic'
      ],
      recommendation: 'Recommended for: Initial learning and concept mastery'
    },
    {
      icon: Timer,
      title: 'Timer Settings',
      description: 'Configure time limits for your practice test to simulate exam conditions and improve time management skills.',
      features: [
        'Adjustable time per question (1-5 minutes)',
        'Total test time automatically calculated',
        'Visual time remaining indicator',
        'Optional time warnings'
      ],
      timerSettings: {
        title: 'How to Configure Timer',
        steps: [
          'Click the gear icon in the Timer card',
          'Select minutes per question (default: 2 minutes)',
          'Total test time will adjust based on question count',
          'Save settings to apply to your test'
        ]
      },
      recommendation: 'Recommended for: Exam preparation and timing practice'
    },
    {
      icon: Sparkles,
      title: 'NGN Questions',
      description: 'Include Next Generation NCLEX (NGN) style questions that assess clinical judgment through new question types.',
      features: [
        'Case studies with multiple decision points',
        'Clinical judgment measurement model',
        'Extended multiple response questions',
        'Dynamic exhibits and charts'
      ],
      recommendation: 'Recommended for: Comprehensive exam preparation'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Test Settings Guide
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
            Customize your test experience by configuring these settings to match your study goals and preparation level.
          </p>

          <div className="space-y-8">
            {settings.map((setting, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg shrink-0">
                    <setting.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        {setting.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {setting.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Key Features:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {setting.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {setting.timerSettings && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-medium text-blue-800 dark:text-blue-200">
                            {setting.timerSettings.title}
                          </h4>
                        </div>
                        <ol className="space-y-1">
                          {setting.timerSettings.steps.map((step, sIndex) => (
                            <li key={sIndex} className="text-blue-700 dark:text-blue-300">
                              {sIndex + 1}. {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {setting.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Pro Tips:</h4>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300">
              <li>• Start with Tutor Mode enabled to learn from each question</li>
              <li>• Progress to timed tests as you gain confidence</li>
              <li>• Include NGN questions gradually to familiarize yourself with new formats</li>
              <li>• Use timer settings that match your comfort level, then decrease time as you improve</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSettingsHelpModal;