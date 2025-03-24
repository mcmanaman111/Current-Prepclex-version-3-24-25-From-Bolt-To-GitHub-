import React from 'react';
import { X, ShieldCheck, Heart, Brain, Activity, Stethoscope, Pill, AlertTriangle, Workflow } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ClientNeedsModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const clientNeeds = [
    {
      title: 'Management of Care',
      icon: ShieldCheck,
      description: 'Focuses on coordination of care, safety, legal rights, and ethical practice.',
      percentage: '17-23%',
      keyTopics: [
        'Assignment and delegation',
        'Legal rights and responsibilities',
        'Ethics and advocacy',
        'Case management',
        'Quality improvement'
      ],
      examples: [
        'Prioritizing care for multiple patients',
        'Delegating tasks to appropriate staff',
        'Maintaining patient confidentiality',
        'Ensuring informed consent'
      ]
    },
    {
      title: 'Safety and Infection Control',
      icon: AlertTriangle,
      description: 'Covers prevention of injury, emergency response, and infection prevention.',
      percentage: '9-15%',
      keyTopics: [
        'Standard precautions',
        'Emergency response plans',
        'Error prevention',
        'Safe handling of materials',
        'Use of restraints'
      ],
      examples: [
        'Implementing isolation protocols',
        'Responding to emergency situations',
        'Preventing medication errors',
        'Maintaining sterile technique'
      ]
    },
    {
      title: 'Health Promotion and Maintenance',
      icon: Heart,
      description: 'Addresses prevention, early detection, and lifestyle choices.',
      percentage: '6-12%',
      keyTopics: [
        'Health screening',
        'Disease prevention',
        'Lifestyle choices',
        'Growth and development',
        'Self-care'
      ],
      examples: [
        'Teaching breast self-examination',
        'Providing smoking cessation education',
        'Recommending immunizations',
        'Discussing nutrition guidelines'
      ]
    },
    {
      title: 'Psychosocial Integrity',
      icon: Brain,
      description: 'Deals with mental health, coping, and cultural aspects of care.',
      percentage: '6-12%',
      keyTopics: [
        'Coping mechanisms',
        'Mental health concepts',
        'Crisis intervention',
        'Cultural awareness',
        'End of life care'
      ],
      examples: [
        'Supporting grieving families',
        'Identifying abuse or neglect',
        'Managing stress',
        'Providing culturally competent care'
      ]
    },
    {
      title: 'Basic Care and Comfort',
      icon: Activity,
      description: 'Covers activities of daily living, nutrition, and rest.',
      percentage: '6-12%',
      keyTopics: [
        'Personal hygiene',
        'Mobility',
        'Nutrition and hydration',
        'Sleep and rest',
        'Elimination'
      ],
      examples: [
        'Assisting with ADLs',
        'Implementing comfort measures',
        'Managing nutrition',
        'Promoting rest and sleep'
      ]
    },
    {
      title: 'Pharmacological Therapies',
      icon: Pill,
      description: 'Focuses on medication administration and pain management.',
      percentage: '12-18%',
      keyTopics: [
        'Medication administration',
        'Pain management',
        'Blood products',
        'Parenteral therapies',
        'Medication calculations'
      ],
      examples: [
        'Administering medications safely',
        'Managing IV therapy',
        'Monitoring drug effects',
        'Calculating dosages'
      ]
    },
    {
      title: 'Reduction of Risk Potential',
      icon: Stethoscope,
      description: 'Addresses complications and health alterations.',
      percentage: '9-15%',
      keyTopics: [
        'Diagnostic tests',
        'Lab values',
        'System assessments',
        'Potential complications',
        'Vital signs'
      ],
      examples: [
        'Monitoring lab results',
        'Preventing complications',
        'Assessing vital signs',
        'Managing therapeutic procedures'
      ]
    },
    {
      title: 'Physiological Adaptation',
      icon: Workflow,
      description: 'Covers care for acute, chronic, and life-threatening conditions.',
      percentage: '11-17%',
      keyTopics: [
        'Fluid/electrolyte balance',
        'Medical emergencies',
        'Pathophysiology',
        'Unexpected responses',
        'Hemodynamics'
      ],
      examples: [
        'Managing acute conditions',
        'Responding to changes in condition',
        'Providing emergency care',
        'Monitoring hemodynamics'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                NCLEX Client Needs Categories
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              The NCLEX test plan is organized by Client Needs categories. These categories reflect the core areas of nursing practice and form the framework for nursing education and examination. Understanding these categories is crucial for effective test preparation.
            </p>
            
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">About Category Percentages</h4>
              <p className="text-blue-700 dark:text-blue-300">
                The percentage ranges shown for each category (e.g., "17-23%") indicate the proportion of questions from that category that will appear on your NCLEX exam. These ranges are set by the National Council of State Boards of Nursing (NCSBN) and represent the distribution of content on the actual NCLEX examination.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {clientNeeds.map((need, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg shrink-0">
                    <need.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                          {need.title}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                          {need.percentage}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {need.description}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Key Topics:</h4>
                        <ul className="space-y-1">
                          {need.keyTopics.map((topic, tIndex) => (
                            <li key={tIndex} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Example Questions:</h4>
                        <ul className="space-y-1">
                          {need.examples.map((example, eIndex) => (
                            <li key={eIndex} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Study Tips:</h4>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300">
              <li>• Focus on categories with higher percentage ranges first</li>
              <li>• Practice questions from all categories to ensure comprehensive preparation</li>
              <li>• Pay special attention to Management of Care and Pharmacological Therapies</li>
              <li>• Review both normal and abnormal findings for each category</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientNeedsModal;