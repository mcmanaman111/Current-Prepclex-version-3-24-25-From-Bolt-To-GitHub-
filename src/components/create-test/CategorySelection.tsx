import React, { useState, useMemo } from 'react';
import { Book, HelpCircle } from 'lucide-react';
import CategoryCard from './CategoryCard';
import ClientNeedsModal from '../modals/ClientNeedsModal';
import type { Category } from '../../data/types';

interface Props {
  categories: Category[];
  selectedCategories: string[];
  selectedTopics: string[];
  onCategoryToggle: (categoryId: string) => void;
  onTopicToggle: (categoryId: string, topicId: string) => void;
  onSelectAll: () => void;
}

const CategorySelection = ({
  categories,
  selectedCategories,
  selectedTopics,
  onCategoryToggle,
  onTopicToggle,
  onSelectAll
}: Props) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Memoize total available questions calculation
  const totalAvailableQuestions = useMemo(() => {
    return categories.reduce((acc, category) => {
      if (selectedCategories.includes(category.id)) {
        return acc + category.count;
      }
      
      if (category.topics) {
        const selectedTopicsInCategory = category.topics.filter(topic => 
          selectedTopics.includes(topic.id)
        );
        return acc + selectedTopicsInCategory.reduce((sum, topic) => sum + topic.count, 0);
      }
      
      return acc;
    }, 0);
  }, [categories, selectedCategories, selectedTopics]);

  // Memoize category cards to prevent unnecessary re-renders
  const categoryCards = useMemo(() => (
    categories.map((category) => (
      <CategoryCard
        key={category.id}
        category={category}
        isSelected={selectedCategories.includes(category.id)}
        isExpanded={expandedCategories.includes(category.id)}
        onToggle={() => onCategoryToggle(category.id)}
        onExpand={() => handleExpand(category.id)}
        onTopicToggle={onTopicToggle}
        selectedTopics={selectedTopics}
      />
    ))
  ), [categories, selectedCategories, expandedCategories, selectedTopics, onCategoryToggle, onTopicToggle]);

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-3">
            <Book className="w-6 h-6 text-[#2B3467]" />
            <h3 className="text-xl font-semibold text-[#2B3467]">Select Test Material</h3>
            <button
              onClick={() => setShowModal(true)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Choose from NCLEX Client Needs categories</p>
        </div>

        <div className="flex justify-end mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[#2B3467]">Select All</span>
            <input
              type="checkbox"
              checked={selectedCategories.length === categories.length}
              onChange={onSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryCards}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-[#2B3467] text-sm text-center">
            Selected client needs: {selectedCategories.length} of {categories.length}
          </p>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Total questions available: {totalAvailableQuestions}
          </p>
        </div>
      </div>

      <ClientNeedsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default CategorySelection;