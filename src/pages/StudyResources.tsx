import React, { useState } from 'react';
import { Book, Video, FileText, Brain, Search, BookOpen, Star, Clock, BarChart2, Calculator, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudyResources = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const quickAccess = [
    {
      title: 'Lab Values',
      description: 'Normal ranges & interpretations',
      icon: Brain,
      color: 'blue',
      path: '/lab-values'
    },
    {
      title: 'Drug Classifications',
      description: 'Common medications by category',
      icon: FileText,
      color: 'green',
      path: '/drug-classifications'
    },
    {
      title: 'Vital Signs',
      description: 'Normal ranges & variations',
      icon: BarChart2,
      color: 'purple',
      path: '/vital-signs'
    },
    {
      title: 'Med Math',
      description: 'Medication calculations guide',
      icon: Calculator,
      color: 'orange',
      path: '/med-math'
    },
    {
      title: 'Nursing Abbreviations',
      description: 'Common medical abbreviations',
      icon: FileSpreadsheet,
      color: 'pink',
      path: '/nursing-abbreviations'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Study Resources</h2>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive materials for NCLEX preparation</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-dark-lighter border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {quickAccess.map((item, index) => (
          <div 
            key={index}
            onClick={() => navigate(item.path)}
            className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/20 flex items-center justify-center mb-4`}>
              <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{item.title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyResources;