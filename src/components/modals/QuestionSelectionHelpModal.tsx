import React from 'react';
import { X, ListFilter, CheckCircle2, Flag, SkipForward, XCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const QuestionSelectionHelpModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const ngnFeature = {
    icon: Sparkles,
    title: 'NGN Questions Only Filter',
    description: 'Filter your question selection to focus specifically on Next Generation NCLEX (NGN) style questions.',
    features: [
      'Shows only NGN questions from selected categories',
      'Automatically adjusts question counts (approximately 30% of total)',
      'Helps focus practice on new question formats',
      'Ideal for targeted NGN preparation'
    ],
    howToUse: [
      'Toggle "NGN Questions Only" at the top of the selection panel',
      'Question counts will automatically adjust to show NGN availability',
      'Select desired question types as normal',
      'Total available questions will reflect NGN-only counts'
    ],
    recommendation: 'Best for: Focused practice on Next Generation NCLEX question formats and clinical judgment scenarios'
  };

  const questionTypes = [
    {
      icon: CheckCircle2,
      title: 'Unused Questions',
      description: 'Questions you haven\'t encountered before in your practice tests.',
      features: [
        'Fresh content for optimal learning',
        'No repetition of previously seen questions',
        'Helps assess knowledge comprehensively',
        'Recommended for initial practice sessions'
      ],
      recommendation: 'Best for: Building foundational knowledge and first-time topic exposure'
    },
    {
      icon: XCircle,
      title: 'Incorrect Questions',
      description: 'Questions you\'ve answered incorrectly in previous attempts.',
      features: [
        'Review challenging concepts',
        'Track improvement on difficult topics',
        'Strengthen weak areas',
        'Build confidence through mastery'
      ],
      recommendation: 'Best for: Focused review and improvement of weak areas'
    },
    {
      icon: Flag,
      title: 'Marked Questions',
      description: 'Questions you\'ve flagged for later review or found particularly challenging.',
      features: [
        'Revisit questions you want to study more',
        'Practice complex scenarios',
        'Review important concepts',
        'Create targeted study sessions'
      ],
      recommendation: 'Best for: Targeted practice on challenging content'
    },
    {
      icon: SkipForward,
      title: 'Skipped Questions',
      description: 'Questions you chose to skip during previous test sessions.',
      features: [
        'Address questions you were unsure about',
        'Practice time management strategies',
        'Identify knowledge gaps',
        'Build test-taking confidence'
      ],
      recommendation: 'Best for: Addressing uncertainty and building confidence'
    },
    {
      icon: CheckCircle2,
      title: 'Correct Questions',
      description: 'Questions you\'ve answered correctly in previous attempts.',
      features: [
        'Reinforce existing knowledge',
        'Maintain mastery of concepts',
        'Build test-taking momentum',
        'Verify consistent understanding'
      ],
      recommendation: 'Best for: Knowledge retention and confidence building'
    }
  ];

  const strategies = [
    {
      title: 'For New Users',
      steps: [
        'Start with Unused Questions only',
        'Focus on building foundational knowledge',
        'Track performance to identify weak areas',
        'Gradually increase question variety'
      ]
    },
    {
      title: 'For Intermediate Practice',
      steps: [
        'Mix Incorrect and Unused Questions',
        'Include Marked Questions for targeted review',
        'Review Skipped Questions to build confidence',
        'Use performance data to adjust selection'
      ]
    },
    {
      title: 'For Advanced Review',
      steps: [
        'Focus on Incorrect and Marked Questions',
        'Include challenging Correct Questions',
        'Create balanced question sets',
        'Simulate exam conditions with mixed selection'
      ]
    },
    {
      title: 'For NGN Practice',
      steps: [
        'Enable NGN Questions Only filter',
        'Start with Unused NGN questions',
        'Focus on clinical judgment scenarios',
        'Practice with all new question types'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <ListFilter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Question Selection Guide
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
            Choose from different question types to create a customized practice experience that matches your learning needs and preparation level.
          </p>

          {/* NGN Feature Section */}
          <div className="mb-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-lg shrink-0">
                  <ngnFeature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {ngnFeature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {ngnFeature.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {ngnFeature.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">How to Use:</h4>
                      <ol className="space-y-2">
                        {ngnFeature.howToUse.map((step, sIndex) => (
                          <li key={sIndex} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                            <span className="text-purple-600 dark:text-purple-400 font-medium">{sIndex + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {ngnFeature.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {questionTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg shrink-0">
                    <type.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        {type.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {type.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Key Benefits:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {type.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {type.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Selection Strategies
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy, index) => (
                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
                    {strategy.title}
                  </h4>
                  <ol className="space-y-2">
                    {strategy.steps.map((step, sIndex) => (
                      <li key={sIndex} className="text-blue-700 dark:text-blue-300 text-sm">
                        {sIndex + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectionHelpModal;