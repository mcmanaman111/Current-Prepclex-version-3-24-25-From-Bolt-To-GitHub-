import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MedMathModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('desired');

  const tabs = [
    { id: 'desired', name: 'Desired Over Have Method' },
    { id: 'dimensional', name: 'Dimensional Analysis Method' },
    { id: 'ratio', name: 'Ratio & Proportion Method' }
  ];

  const examples = [
    {
      problem: 'A healthcare provider orders Metformin 850mg PO BID for a patient with type 2 diabetes. The medication is available as 500mg tablets. How many tablets should the nurse administer for one dose?',
      desiredSolution: [
        '1. Identify what you want (Desired): 850mg',
        '2. Identify what you have (Have): 500mg per tablet',
        '3. Apply the formula: (Desired ÷ Have) × Quantity',
        '4. Calculate: (850mg ÷ 500mg) × 1 tablet',
        '5. Solve: 1.7 tablets',
        'Therefore, the nurse should administer 1.7 tablets.'
      ],
      dimensionalSolution: [
        '1. Start with the desired dose: 850mg',
        '2. Set up the conversion factor: (1 tablet/500mg)',
        '3. Write the equation: 850mg × (1 tablet/500mg)',
        '4. Cancel out matching units: mg cancels out',
        '5. Multiply: 850 × (1/500) = 1.7',
        'Therefore, 1.7 tablets are needed.'
      ],
      ratioSolution: [
        '1. Set up the proportion: 500mg/1 tablet = 850mg/X tablets',
        '2. Cross multiply: 500X = 850 × 1',
        '3. Solve for X: X = 850/500',
        '4. Calculate: X = 1.7',
        'Therefore, 1.7 tablets should be administered.'
      ]
    },
    {
      problem: 'A patient is to receive 1000mL of Normal Saline over 8 hours. Calculate the flow rate in mL/hr and drops/min using a drop factor of 15 gtts/mL.',
      desiredSolution: [
        '1. Calculate mL/hr:',
        '   • Identify total volume: 1000mL',
        '   • Identify total time: 8 hours',
        '   • Divide: 1000mL ÷ 8hr = 125mL/hr',
        '2. Calculate drops/min:',
        '   • Use formula: (mL/hr × drop factor) ÷ 60min',
        '   • Insert values: (125mL/hr × 15gtts/mL) ÷ 60min',
        '   • Calculate: 1875 ÷ 60 = 31.25 gtts/min',
        'Therefore, set the rate at 31 drops per minute.'
      ],
      dimensionalSolution: [
        '1. Calculate mL/hr:',
        '   • Set up equation: 1000mL × (1hr/8)',
        '   • Solve: 1000 × (1/8) = 125mL/hr',
        '2. Calculate drops/min:',
        '   • Set up equation: 125mL/hr × (15gtts/1mL) × (1hr/60min)',
        '   • Cancel units: mL and hr cancel out',
        '   • Solve: 125 × 15 ÷ 60 = 31.25 gtts/min',
        'Therefore, set the rate at 31 drops per minute.'
      ],
      ratioSolution: [
        '1. Calculate mL/hr:',
        '   • Set up proportion: 1000mL/8hr = X mL/1hr',
        '   • Solve: X = 1000 ÷ 8 = 125mL/hr',
        '2. Calculate drops/min:',
        '   • Set up proportion: 15gtts/1mL = X gtts/125mL per hour',
        '   • Solve for hour: X = (125 × 15) = 1875gtts/hr',
        '   • Convert to min: 1875 ÷ 60 = 31.25 gtts/min',
        'Therefore, set the rate at 31 drops per minute.'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Medication Mathematics</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Method Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Examples */}
          <div className="space-y-6">
            {examples.map((example, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-4">{example.problem}</p>
                <div className="text-gray-600 dark:text-gray-400 pl-4">
                  {activeTab === 'desired' && example.desiredSolution.map((step, sIndex) => (
                    <p key={sIndex} className="mb-1">{step}</p>
                  ))}
                  {activeTab === 'dimensional' && example.dimensionalSolution.map((step, sIndex) => (
                    <p key={sIndex} className="mb-1">{step}</p>
                  ))}
                  {activeTab === 'ratio' && example.ratioSolution.map((step, sIndex) => (
                    <p key={sIndex} className="mb-1">{step}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedMathModal;