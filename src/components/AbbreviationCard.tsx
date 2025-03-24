import React from 'react';

interface Props {
  abbr: string;
  meaning: string;
}

const AbbreviationCard = ({ abbr, meaning }: Props) => {
  return (
    <div className="bg-white dark:bg-dark-lighter rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{abbr}</h3>
      <p className="text-gray-700 dark:text-gray-300 mt-1">{meaning}</p>
    </div>
  );
};

export default AbbreviationCard;