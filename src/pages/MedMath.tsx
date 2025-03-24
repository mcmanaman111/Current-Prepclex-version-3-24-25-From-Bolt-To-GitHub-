import React, { useState, useRef } from 'react';
import { Calculator, Pill, Clock, Baby, Navigation, Brain, BeakerIcon, ChevronRight } from 'lucide-react';

const MedMath = () => {
  const [activeTab, setActiveTab] = useState('desired');
  const sectionRefs = {
    basicCalculations: useRef(null),
    weightBased: useRef(null),
    ivCalculations: useRef(null),
    pediatric: useRef(null),
    conversions: useRef(null)
  };

  const scrollToSection = (sectionKey) => {
    sectionRefs[sectionKey].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigationCards = [
    { title: 'Basic Calculations', color: 'blue', icon: Calculator, ref: 'basicCalculations' },
    { title: 'Weight-Based Dosing', color: 'emerald', icon: Baby, ref: 'weightBased' },
    { title: 'IV Calculations', color: 'indigo', icon: Clock, ref: 'ivCalculations' },
    { title: 'Pediatric Dosing', color: 'rose', icon: Baby, ref: 'pediatric' },
    { title: 'Conversions', color: 'amber', icon: BeakerIcon, ref: 'conversions' }
  ];

  const tabs = [
    { id: 'desired', name: 'Desired Over Have Method' },
    { id: 'dimensional', name: 'Dimensional Analysis Method' },
    { id: 'ratio', name: 'Ratio & Proportion Method' }
  ];

  const methodDescriptions = {
    desired: `The Desired over Have method is a straightforward approach where you divide what you want (desired) by what you have, then multiply by the quantity. This method is particularly useful for simple conversions and dosage calculations.`,
    dimensional: `Dimensional Analysis is a systematic method that uses conversion factors to solve problems. Units are written out and cancelled, making it easier to track units throughout the calculation process.`,
    ratio: `The Ratio and Proportion method sets up an equation where two ratios are equal to each other. This method is particularly useful when working with similar units or when converting between different measurements.`
  };

  const sections = [
    {
      title: 'Solid Dosage Calculations',
      ref: 'basicCalculations',
      icon: Pill,
      examples: [
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
          problem: 'The provider orders Warfarin 7.5mg PO daily. The pharmacy supplies 5mg tablets. How many tablets should be administered?',
          desiredSolution: [
            '1. Identify what you want (Desired): 7.5mg',
            '2. Identify what you have (Have): 5mg per tablet',
            '3. Apply the formula: (Desired ÷ Have) × Quantity',
            '4. Calculate: (7.5mg ÷ 5mg) × 1 tablet',
            '5. Solve: 1.5 tablets',
            'Therefore, the nurse should administer 1.5 tablets.'
          ],
          dimensionalSolution: [
            '1. Start with the desired dose: 7.5mg',
            '2. Set up the conversion factor: (1 tablet/5mg)',
            '3. Write the equation: 7.5mg × (1 tablet/5mg)',
            '4. Cancel out matching units: mg cancels out',
            '5. Multiply: 7.5 × (1/5) = 1.5',
            'Therefore, 1.5 tablets are needed.'
          ],
          ratioSolution: [
            '1. Set up the proportion: 5mg/1 tablet = 7.5mg/X tablets',
            '2. Cross multiply: 5X = 7.5 × 1',
            '3. Solve for X: X = 7.5/5',
            '4. Calculate: X = 1.5',
            'Therefore, 1.5 tablets should be administered.'
          ]
        }
      ]
    },
    {
      title: 'Weight-Based Dosage Calculations',
      ref: 'weightBased',
      icon: Calculator,
      examples: [
        {
          problem: 'A provider orders Vancomycin 15mg/kg IV q12h for a patient weighing 70kg. Calculate the dose in mg.',
          desiredSolution: [
            '1. Identify the ordered dose per kg: 15mg/kg',
            '2. Identify the patient weight: 70kg',
            '3. Multiply the dose/kg by the patient weight',
            '4. Calculate: 15mg/kg × 70kg',
            '5. Solve: 1050mg',
            'Therefore, 1050mg should be administered every 12 hours.'
          ],
          dimensionalSolution: [
            '1. Start with the patient weight: 70kg',
            '2. Set up the conversion factor: (15mg/1kg)',
            '3. Write the equation: 70kg × (15mg/1kg)',
            '4. Cancel out matching units: kg cancels out',
            '5. Multiply: 70 × 15 = 1050mg',
            'Therefore, 1050mg should be administered every 12 hours.'
          ],
          ratioSolution: [
            '1. Set up the proportion: 15mg/1kg = X mg/70kg',
            '2. Cross multiply: 1X = 15 × 70',
            '3. Solve for X: X = 15 × 70',
            '4. Calculate: X = 1050',
            'Therefore, 1050mg should be administered every 12 hours.'
          ]
        },
        {
          problem: 'A patient weighing 85kg is prescribed Enoxaparin 1mg/kg subcutaneously q12h. Calculate the dose in mg.',
          desiredSolution: [
            '1. Identify the ordered dose per kg: 1mg/kg',
            '2. Identify the patient weight: 85kg',
            '3. Multiply the dose/kg by the patient weight',
            '4. Calculate: 1mg/kg × 85kg',
            '5. Solve: 85mg',
            'Therefore, 85mg should be administered every 12 hours.'
          ],
          dimensionalSolution: [
            '1. Start with the patient weight: 85kg',
            '2. Set up the conversion factor: (1mg/1kg)',
            '3. Write the equation: 85kg × (1mg/1kg)',
            '4. Cancel out matching units: kg cancels out',
            '5. Multiply: 85 × 1 = 85mg',
            'Therefore, 85mg should be administered every 12 hours.'
          ],
          ratioSolution: [
            '1. Set up the proportion: 1mg/1kg = X mg/85kg',
            '2. Cross multiply: 1X = 1 × 85',
            '3. Solve for X: X = 85',
            '4. Calculate: X = 85mg',
            'Therefore, 85mg should be administered every 12 hours.'
          ]
        }
      ]
    },
    {
      title: 'IV Flow Rate Calculations',
      ref: 'ivCalculations',
      icon: Clock,
      examples: [
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
        },
        {
          problem: 'A provider orders D5W to run at 75mL/hr. Using a drop factor of 20 gtts/mL, calculate the drops per minute.',
          desiredSolution: [
            '1. Identify known values:',
            '   • Flow rate: 75mL/hr',
            '   • Drop factor: 20 gtts/mL',
            '2. Use formula: (mL/hr × drop factor) ÷ 60min',
            '3. Insert values: (75mL/hr × 20gtts/mL) ÷ 60min',
            '4. Calculate: 1500 ÷ 60 = 25 gtts/min',
            'Therefore, set the rate at 25 drops per minute.'
          ],
          dimensionalSolution: [
            '1. Start with hourly rate: 75mL/hr',
            '2. Set up conversion factors:',
            '   • Convert to drops: (20gtts/1mL)',
            '   • Convert to minutes: (1hr/60min)',
            '3. Write equation: 75mL/hr × (20gtts/1mL) × (1hr/60min)',
            '4. Cancel units: mL and hr cancel out',
            '5. Solve: 75 × 20 ÷ 60 = 25 gtts/min',
            'Therefore, set the rate at 25 drops per minute.'
          ],
          ratioSolution: [
            '1. Convert mL/hr to drops/hr:',
            '   • Set up proportion: 20gtts/1mL = X gtts/75mL',
            '   • Solve: X = 75 × 20 = 1500 gtts/hr',
            '2. Convert drops/hr to drops/min:',
            '   • Set up proportion: 1500gtts/60min = X gtts/1min',
            '   • Solve: X = 1500 ÷ 60 = 25 gtts/min',
            'Therefore, set the rate at 25 drops per minute.'
          ]
        }
      ]
    },
    {
      title: 'Pediatric Dosage Calculations',
      ref: 'pediatric',
      icon: Baby,
      examples: [
        {
          problem: 'A pediatric patient weighing 25kg is prescribed Ceftriaxone 75mg/kg/day IV divided q12h. Calculate each dose in mg.',
          desiredSolution: [
            '1. Calculate total daily dose:',
            '   • Multiply: 75mg/kg × 25kg = 1875mg/day',
            '2. Divide for q12h dosing:',
            '   • Divide by 2: 1875mg ÷ 2 = 937.5mg',
            '3. Verify calculation:',
            '   • Two 937.5mg doses = 1875mg/day',
            'Therefore, administer 937.5mg every 12 hours.'
          ],
          dimensionalSolution: [
            '1. Set up equation with all factors:',
            '   • 25kg × (75mg/1kg) × (1day/2doses)',
            '2. Cancel out units:',
            '   • kg cancels out',
            '   • day cancels out in final step',
            '3. Solve: 25 × 75 ÷ 2 = 937.5mg/dose',
            'Therefore, administer 937.5mg every 12 hours.'
          ],
          ratioSolution: [
            '1. Calculate total daily dose:',
            '   • Set up proportion: 75mg/1kg = X mg/25kg',
            '   • Solve: X = 75 × 25 = 1875mg/day',
            '2. Calculate per dose:',
            '   • Set up proportion: 1875mg/2doses = X mg/1dose',
            '   • Solve: X = 1875 ÷ 2 = 937.5mg/dose',
            'Therefore, administer 937.5mg every 12 hours.'
          ]
        },
        {
          problem: 'A child weighing 20kg requires a continuous IV infusion of Dopamine at 5mcg/kg/min. The solution concentration is 400mg/250mL. Calculate the mL/hr infusion rate.',
          desiredSolution: [
            '1. Calculate mcg/min needed:',
            '   • 5mcg/kg/min × 20kg = 100mcg/min',
            '2. Convert solution concentration to mcg/mL:',
            '   • 400mg = 400,000mcg',
            '   • 400,000mcg/250mL = 1600mcg/mL',
            '3. Calculate mL/min needed:',
            '   • 100mcg/min ÷ 1600mcg/mL = 0.0625mL/min',
            '4. Convert to mL/hr:',
            '   • 0.0625mL/min × 60min/hr = 3.75mL/hr',
            'Therefore, set the infusion rate at 3.75mL/hr.'
          ],
          dimensionalSolution: [
            '1. Set up complete equation:',
            '   • 20kg × (5mcg/kg/min) × (60min/1hr) × (1mg/1000mcg) × (250mL/400mg)',
            '2. Cancel out units step by step:',
            '   • kg cancels out',
            '   • mcg converts to mg',
            '   • mg cancels out',
            '3. Solve: 20 × 5 × 60 × (1/1000) × (250/400) = 3.75mL/hr',
            'Therefore, set the infusion rate at 3.75mL/hr.'
          ],
          ratioSolution: [
            '1. Set up proportion for concentration:',
            '   • 400mg/250mL = (5mcg × 20kg × 60min)/(X × 1000mcg/mg)',
            '2. Cross multiply:',
            '   • 400X = (5 × 20 × 60 × 250)/1000',
            '3. Solve for X:',
            '   • X = (5 × 20 × 60 × 250)/(400 × 1000) = 3.75',
            'Therefore, set the infusion rate at 3.75mL/hr.'
          ]
        }
      ]
    }
  ];

  const conversions = {
    volume: [
      { from: '1 liter (L)', to: '1000 milliliters (mL)' },
      { from: '1 milliliter (mL)', to: '1 cubic centimeter (cc)' },
      { from: '1 teaspoon', to: '5 mL' },
      { from: '1 tablespoon', to: '15 mL' },
      { from: '1 ounce', to: '30 mL' },
      { from: '1 cup', to: '240 mL' }
    ],
    weight: [
      { from: '1 kilogram (kg)', to: '2.2 pounds (lb)' },
      { from: '1 gram (g)', to: '1000 milligrams (mg)' },
      { from: '1 milligram (mg)', to: '1000 micrograms (mcg)' },
      { from: '1 grain', to: '60 mg' }
    ],
    time: [
      { from: '1 hour', to: '60 minutes' },
      { from: '1 minute', to: '60 seconds' },
      { from: 'q.i.d.', to: '4 times per day (every 6 hours)' },
      { from: 't.i.d.', to: '3 times per day (every 8 hours)' },
      { from: 'b.i.d.', to: '2 times per day (every 12 hours)' }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Medication Mathematics</h2>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive guide to medical calculations</p>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
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

      {/* Method Description */}
      <div className="bg-white dark:bg-dark-lighter rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Understanding {tabs.find(tab => tab.id === activeTab)?.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {methodDescriptions[activeTab]}
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {navigationCards.map((card, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(card.ref)}
            className={`bg-${card.color}-100 dark:bg-${card.color}-900/30 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
          >
            <div className={`text-${card.color}-600 dark:text-${card.color}-400 flex items-center space-x-2`}>
              <card.icon className="w-5 h-5" />
              <span className="font-medium">{card.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content Sections */}
      {sections.map((section, index) => (
        <div 
          key={index} 
          ref={sectionRefs[section.ref]}
          className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg mr-4">
              <section.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{section.title}</h3>
          </div>

          <div className="space-y-6">
            {section.examples.map((example, eIndex) => (
              <div key={eIndex} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-4">{example.problem}</p>
                <div className="space-y-4">
                  {activeTab === 'desired' && (
                    <div className="text-gray-600 dark:text-gray-400 pl-4">
                      {example.desiredSolution.map((step, sIndex) => (
                        <p key={sIndex} className="mb-1">{step}</p>
                      ))}
                    </div>
                  )}
                  {activeTab === 'dimensional' && (
                    <div className="text-gray-600 dark:text-gray-400 pl-4">
                      {example.dimensionalSolution.map((step, sIndex) => (
                        <p key={sIndex} className="mb-1">{step}</p>
                      ))}
                    </div>
                  )}
                  {activeTab === 'ratio' && (
                    <div className="text-gray-600 dark:text-gray-400 pl-4">
                      {example.ratioSolution.map((step, sIndex) => (
                        <p key={sIndex} className="mb-1">{step}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Conversions Section */}
      <div 
        ref={sectionRefs.conversions}
        className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Essential Medical Conversions</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(conversions).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 capitalize mb-2">{category}</h4>
              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.from} = {item.to}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedMath;