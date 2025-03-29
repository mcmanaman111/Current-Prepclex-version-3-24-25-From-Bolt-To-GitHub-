import React, { memo } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { Category } from '../../data/types';

interface Props {
  topic: Category;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onSubtopicToggle: (topicId: string, subtopicId: string) => void;
  selectedSubtopics: string[];
  ngnOnly?: boolean;
  ngnQuestionData?: {
    total: number,
    byTopic: Record<string, number>
  };
}

const TopicCard = memo(({
  topic,
  isSelected,
  isExpanded,
  onToggle,
  onExpand,
  onSubtopicToggle,
  selectedSubtopics,
  ngnOnly = false,
  ngnQuestionData = { 
    total: 5, 
    byTopic: {
      '2': 1, // Safety and Infection Control
      '3': 1, // Health Promotion and Maintenance
      '4': 2, // Psychosocial Integrity
      '5': 1  // Basic Care and Comfort
    }
  }
}: Props) => {
  // When NGN Only is enabled, distribute questions based on actual data from API
  const questionCount = ngnOnly 
    ? (ngnQuestionData.byTopic[topic.id] || 0) // Get count from NGN data
    : topic.count;
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
            <h4 className="font-medium text-gray-800 dark:text-gray-200">{topic.name}</h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                {questionCount} questions
              </span>
              {ngnOnly && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  NGN Only
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                {topic.topicCount} subtopics
              </span>
            </div>
          </div>
        </div>
        {topic.topics && (
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

      {topic.topics && (
        <div className={`mt-3 ml-8 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          {topic.topics.map((subtopic) => (
            <div key={subtopic.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSubtopics.includes(subtopic.id)}
                  onChange={() => onSubtopicToggle(topic.id, subtopic.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {subtopic.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                  {ngnOnly 
                    ? (ngnQuestionData.byTopic[topic.id] || 0) // Show NGN questions in this topic
                    : subtopic.count}
                </span>
                {ngnOnly && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    NGN
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

TopicCard.displayName = 'TopicCard';

export default TopicCard;
