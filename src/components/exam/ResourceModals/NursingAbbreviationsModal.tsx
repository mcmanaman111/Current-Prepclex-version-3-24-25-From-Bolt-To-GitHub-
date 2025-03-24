import React, { useState } from 'react';
import { X, AlertTriangle, Search } from 'lucide-react';
import { abbreviations } from '../../../data/abbreviations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NursingAbbreviationsModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');

  const filteredAbbreviations = abbreviations.filter(abbr =>
    abbr.abbr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    abbr.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Nursing Abbreviations</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search abbreviations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-dark-lighter focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAbbreviations.map((abbr, index) => (
              <div key={index} className="bg-white dark:bg-dark-lighter rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{abbr.abbr}</h3>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{abbr.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursingAbbreviationsModal;