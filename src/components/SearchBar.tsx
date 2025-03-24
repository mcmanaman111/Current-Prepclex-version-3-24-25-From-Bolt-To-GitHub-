import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: Props) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search abbreviations..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-dark-lighter focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
    </div>
  );
};

export default SearchBar;