import React, { useState } from 'react';
import { Search, Pill, AlertCircle } from 'lucide-react';

const DrugClassifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['Cardiovascular', 'Respiratory', 'Neurological', 'Antibiotics', 'Pain Management'];

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
    },
    // Add more drug classifications
  ];

  const filteredDrugs = drugs.filter(drug => {
    const matchesSearch = drug.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Drug Classifications</h2>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive guide to medication classes and nursing considerations</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search drug classifications..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-dark-lighter focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-dark-lighter focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {filteredDrugs.map((drug, index) => (
          <div key={index} className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center">
                  <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{drug.className}</h3>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">{drug.category}</span>
              </div>
              {drug.primaryUse.includes('High Alert') && (
                <AlertCircle className="w-6 h-6 text-red-500" />
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
  );
};

export default DrugClassifications;