import React, { useState } from 'react';
import { Search, Filter, Info } from 'lucide-react';

const LabValues = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['Hematology', 'Chemistry', 'Cardiac', 'Endocrine', 'Arterial Blood Gas'];

  const labValues = [
    {
      name: 'Hemoglobin (Hgb)',
      category: 'Hematology',
      normalRange: '12-16 g/dL (female), 14-18 g/dL (male)',
      criticalValues: '< 7 g/dL or > 20 g/dL',
      interpretation: 'Measures oxygen-carrying capacity of blood. Low values indicate anemia, high values may indicate polycythemia.',
    },
    {
      name: 'Sodium (Na+)',
      category: 'Chemistry',
      normalRange: '135-145 mEq/L',
      criticalValues: '< 120 mEq/L or > 160 mEq/L',
      interpretation: 'Key electrolyte for fluid balance and nerve conduction. Abnormal values may indicate dehydration or SIADH.',
    },
    {
      name: 'Troponin',
      category: 'Cardiac',
      normalRange: '< 0.04 ng/mL',
      criticalValues: '> 0.4 ng/mL',
      interpretation: 'Cardiac-specific protein that indicates heart muscle damage. Elevated in heart attack.',
    },
    // Add more lab values here
  ];

  const filteredLabValues = labValues.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lab.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Lab Values</h2>
          <p className="text-gray-500 dark:text-gray-400">Quick reference guide for common laboratory values</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search lab values..."
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
        {filteredLabValues.map((lab, index) => (
          <div key={index} className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{lab.name}</h3>
                <span className="text-sm text-blue-600 dark:text-blue-400">{lab.category}</span>
              </div>
              <Info className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Normal Range</h4>
                <p className="text-gray-800 dark:text-white">{lab.normalRange}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Critical Values</h4>
                <p className="text-red-600 dark:text-red-400">{lab.criticalValues}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Interpretation</h4>
                <p className="text-gray-800 dark:text-white">{lab.interpretation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabValues;