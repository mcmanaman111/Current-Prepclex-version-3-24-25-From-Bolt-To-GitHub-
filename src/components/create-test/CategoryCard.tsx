import React, { memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Category } from '../../data/types';

interface Props {
  category: Category;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onTopicToggle: (categoryId: string, topicId: string) => void;
  selectedTopics: string[];
}

const CategoryCard = memo(({
  category,
  isSelected,
  isExpanded,
  onToggle,
  onExpand,
  onTopicToggle,
  selectedTopics
}: Props) => {
  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5'
          : 'border-gray-200 hover:border-[#2B3467] hover:bg-opacity-5'
      }`}
    >
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
            onClick={(e) => e.stopPropagation()}
          />
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200">{category.name}</h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                {category.count} questions
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                {category.topicCount} sub-topics
              </span>
            </div>
          </div>
        </div>
        {category.topics && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {isExpanded && category.topics && (
        <div className="mt-3 ml-8 space-y-2">
          {category.topics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic.id)}
                  onChange={() => onTopicToggle(category.id, topic.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {topic.name}
                </span>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                {topic.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;