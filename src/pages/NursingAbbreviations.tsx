import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DoNotUseModal from '../components/DoNotUseModal';
import SearchBar from '../components/SearchBar';
import AbbreviationCard from '../components/AbbreviationCard';
import { abbreviations } from '../data/abbreviations';

const NursingAbbreviations = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAbbreviations = abbreviations.filter(abbr =>
    abbr.abbr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    abbr.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Warning Card */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Important Notice</h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Some abbreviations are prohibited by The Joint Commission due to patient safety concerns.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-yellow-800 dark:text-yellow-200 underline hover:text-yellow-900"
            >
              View "Do Not Use" List
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {/* Abbreviations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAbbreviations.map((abbr, index) => (
          <AbbreviationCard key={index} {...abbr} />
        ))}
      </div>

      {/* Do Not Use Modal */}
      <DoNotUseModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default NursingAbbreviations;