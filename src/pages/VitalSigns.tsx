import React from 'react';
import { Thermometer, Heart, Wind, Activity } from 'lucide-react';

const VitalSigns = () => {
  const vitalSigns = [
    {
      name: 'Temperature',
      icon: Thermometer,
      normalRange: '36.5-37.5°C (97.7-99.5°F)',
      variations: [
        { condition: 'Oral', range: '37°C (98.6°F)' },
        { condition: 'Axillary', range: '36.4°C (97.6°F)' },
        { condition: 'Rectal', range: '37.5°C (99.5°F)' },
      ],
      notes: 'Fever is generally considered when temperature is above 38°C (100.4°F)',
    },
    {
      name: 'Heart Rate',
      icon: Heart,
      normalRange: '60-100 beats/min (adult)',
      variations: [
        { condition: 'Athletes', range: '40-60 beats/min' },
        { condition: 'Children', range: '70-120 beats/min' },
        { condition: 'Newborns', range: '120-160 beats/min' },
      ],
      notes: 'Rate varies with activity, emotion, and medical conditions',
    },
    {
      name: 'Respiratory Rate',
      icon: Wind,
      normalRange: '12-20 breaths/min (adult)',
      variations: [
        { condition: 'Children', range: '20-30 breaths/min' },
        { condition: 'Infants', range: '30-60 breaths/min' },
        { condition: 'During exercise', range: 'Up to 40-60 breaths/min' },
      ],
      notes: 'Observe for depth, rhythm, and effort of breathing',
    },
    {
      name: 'Blood Pressure',
      icon: Activity,
      normalRange: '120/80 mmHg',
      variations: [
        { condition: 'Normal', range: '< 120/80 mmHg' },
        { condition: 'Elevated', range: '120-129/< 80 mmHg' },
        { condition: 'Stage 1 Hypertension', range: '130-139/80-89 mmHg' },
      ],
      notes: 'Multiple readings over time provide the most accurate assessment',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Vital Signs</h2>
          <p className="text-gray-500 dark:text-gray-400">Reference guide for normal ranges and variations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vitalSigns.map((vital, index) => (
          <div key={index} className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg mr-4">
                <vital.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{vital.name}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Normal Range</h4>
                <p className="text-gray-800 dark:text-white font-medium">{vital.normalRange}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Variations</h4>
                <div className="space-y-2">
                  {vital.variations.map((variation, vIndex) => (
                    <div key={vIndex} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">{variation.condition}</span>
                      <span className="text-gray-800 dark:text-white">{variation.range}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Clinical Notes</h4>
                <p className="text-gray-600 dark:text-gray-300">{vital.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VitalSigns;