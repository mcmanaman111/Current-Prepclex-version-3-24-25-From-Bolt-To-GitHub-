import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  showSubTopics: boolean;
  setShowSubTopics: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: 'all' | 'correct' | 'incorrect' | 'partially' | 'skipped' | 'marked') => void;
}

const SearchAndFilter = ({ 
  showSubTopics, 
  setShowSubTopics, 
  searchTerm, 
  setSearchTerm, 
  filter, 
  setFilter 
}: Props) => {
  return (
    <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:gap-4">
      <button
        onClick={() => setShowSubTopics(!showSubTopics)}
        className="px-4 py-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 whitespace-nowrap"
      >
        {showSubTopics ? 'Show Topics' : 'Show Sub-topics'}
      </button>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-dark-lighter focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('correct')}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'correct'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Correct
        </button>
        <button
          onClick={() => setFilter('partially')}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'partially'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Partially
        </button>
        <button
          onClick={() => setFilter('incorrect')}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'incorrect'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Incorrect
        </button>
        <button
          onClick={() => setFilter('marked')}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'marked'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Marked
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;