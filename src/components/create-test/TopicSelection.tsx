import React, { useState, useMemo } from 'react';
import { Book, HelpCircle, Sparkles } from 'lucide-react';
import TopicCard from './TopicCard';
import TopicsModal from '../modals/TopicsModal';
import type { Category } from '../../data/types';

interface Props {
  topics: Category[];
  selectedTopics: string[];
  selectedSubtopics: string[];
  onTopicToggle: (topicId: string) => void;
  onSubtopicToggle: (topicId: string, subtopicId: string) => void;
  onSelectAll: () => void;
  totalSelectedQuestions?: number;
  ngnEnabled?: boolean;
  ngnOnly?: boolean;
  ngnQuestionData?: {
    total: number,
    byTopic: Record<string, number>
  };
}

const TopicSelection = ({
  topics,
  selectedTopics,
  selectedSubtopics,
  onTopicToggle,
  onSubtopicToggle,
  onSelectAll,
  totalSelectedQuestions = 0,
  ngnEnabled = false,
  ngnOnly = false,
  ngnQuestionData = { total: 5, byTopic: {} }
}: Props) => {
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleExpand = (topicId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Calculate raw total questions by topics (without filtering by question types)
  const rawTopicQuestionCount = useMemo(() => {
    // When NGN Only is true, return the total NGN questions directly
    if (ngnOnly) {
      return ngnQuestionData.total; // Get the actual count from the database
    }
    
    // For normal count calculation (when ngnOnly is false)
    return topics.reduce((acc, topic) => {
      if (selectedTopics.includes(topic.id)) {
        return acc + topic.count;
      }
      
      if (topic.topics) {
        const selectedSubtopicsInTopic = topic.topics.filter(subtopic => 
          selectedSubtopics.includes(subtopic.id)
        );
        return acc + selectedSubtopicsInTopic.reduce((sum, subtopic) => sum + subtopic.count, 0);
      }
      
      return acc;
    }, 0);
  }, [topics, selectedTopics, selectedSubtopics, ngnOnly]);

  // Memoize topic cards to prevent unnecessary re-renders
  const topicCards = useMemo(() => (
    topics.map((topic) => (
      <TopicCard
        key={topic.id}
        topic={topic}
        isSelected={selectedTopics.includes(topic.id)}
        isExpanded={expandedTopics.includes(topic.id)}
        onToggle={() => onTopicToggle(topic.id)}
        onExpand={() => handleExpand(topic.id)}
        onSubtopicToggle={onSubtopicToggle}
        selectedSubtopics={selectedSubtopics}
        ngnOnly={ngnOnly}
        ngnQuestionData={ngnQuestionData}
      />
    ))
  ), [topics, selectedTopics, expandedTopics, selectedSubtopics, onTopicToggle, onSubtopicToggle, ngnOnly, ngnQuestionData]);

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
          <p className="text-sm text-gray-500">Choose from NCLEX topics and subtopics</p>
        </div>

        <div className="flex justify-end mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[#2B3467]">Select All</span>
            <input
              type="checkbox"
              checked={selectedTopics.length === topics.length}
              onChange={onSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Make items independent with flex layout */}
          {topicCards.map((card, index) => (
            <div key={index} className="flex-grow basis-full md:basis-[calc(50%-0.5rem)]">
              {card}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg space-y-2">
          <p className="text-[#2B3467] text-sm text-center">
            Selected topics: {selectedTopics.length} of {topics.length}
          </p>
          <p className="text-gray-500 text-sm text-center">
            Total questions available: {ngnOnly ? ngnQuestionData.total : (totalSelectedQuestions || rawTopicQuestionCount)}
          </p>
          {rawTopicQuestionCount > totalSelectedQuestions ? (
            <p className="text-orange-600 text-xs text-center">
              Note: {rawTopicQuestionCount - totalSelectedQuestions} questions are filtered out by question type selection
            </p>
          ) : null}
          {ngnEnabled && (
            <>
              {ngnOnly && (
                <p className="text-purple-600 text-sm text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Showing only {ngnQuestionData.total} Next Generation NCLEX questions
                </p>
              )}
              {!ngnOnly && (
                <p className="text-blue-600 text-sm text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  NGN Questions are enabled for this test
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <TopicsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default TopicSelection;
