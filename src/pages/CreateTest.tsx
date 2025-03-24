import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import TestSettings from '../components/create-test/TestSettings';
import QuestionSelection from '../components/create-test/QuestionSelection';
import CategorySelection from '../components/create-test/CategorySelection';
import QuestionCountSelector from '../components/create-test/QuestionCountSelector';
import BeginCustomTestCard from '../components/create-test/BeginCustomTestCard';
import QuickStartModal from '../components/modals/QuickStartModal';
import { questionTypes } from '../data/testData';
import { clientNeeds } from '../data/clientNeeds';
import type { TestConfig } from '../data/types';

const CreateTest = () => {
  const navigate = useNavigate();
  const [tutorMode, setTutorMode] = useState(true);
  const [timer, setTimer] = useState(false);
  const [ngn, setNGN] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(25);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Memoize the quick start handler
  const handleQuickStart = useCallback(() => {
    navigate('/exam', { 
      state: { 
        isQuickStart: true,
        settings: {
          tutorMode: true,
          timer: false,
          ngn: false,
          questionCount: 25
        }
      } 
    });
  }, [navigate]);

  // Memoize total selected questions calculation
  const totalSelectedQuestions = useMemo(() => {
    return clientNeeds.reduce((acc, category) => {
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
  }, [selectedCategories, selectedTopics]);

  // Memoize category-topic relationship effect
  useEffect(() => {
    const newSelectedTopics = [...selectedTopics];

    clientNeeds.forEach(category => {
      if (category.topics) {
        const topicIds = category.topics.map(topic => topic.id);
        if (selectedCategories.includes(category.id)) {
          topicIds.forEach(topicId => {
            if (!newSelectedTopics.includes(topicId)) {
              newSelectedTopics.push(topicId);
            }
          });
        }
      }
    });

    if (JSON.stringify(newSelectedTopics) !== JSON.stringify(selectedTopics)) {
      setSelectedTopics(newSelectedTopics);
    }
  }, [selectedCategories, selectedTopics]);

  // Memoize handlers
  const handleQuestionToggle = useCallback((id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  }, []);

  const handleTopicToggle = useCallback((categoryId: string, topicId: string) => {
    setSelectedTopics(prev => {
      const newTopics = prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId];

      const category = clientNeeds.find(c => c.id === categoryId);
      if (category?.topics) {
        const categoryTopicIds = category.topics.map(t => t.id);
        const allTopicsSelected = categoryTopicIds.every(id => newTopics.includes(id));
        
        if (allTopicsSelected && !selectedCategories.includes(categoryId)) {
          setSelectedCategories(prev => [...prev, categoryId]);
        } else if (!allTopicsSelected && selectedCategories.includes(categoryId)) {
          setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        }
      }

      return newTopics;
    });
  }, [selectedCategories]);

  const handleSelectAllQuestions = useCallback(() => {
    setSelectedQuestions(prev => 
      prev.length === questionTypes.length ? [] : questionTypes.map(q => q.id)
    );
  }, []);

  const handleSelectAllCategories = useCallback(() => {
    setSelectedCategories(prev => 
      prev.length === clientNeeds.length ? [] : clientNeeds.map(c => c.id)
    );
  }, []);

  const handleBeginTest = useCallback(() => {
    const settings: TestConfig = {
      tutorMode,
      timer,
      ngn,
      questionCount
    };

    navigate('/exam', { 
      state: { 
        settings,
        selectedQuestions,
        selectedCategories,
        selectedTopics
      } 
    });
  }, [tutorMode, timer, ngn, questionCount, selectedQuestions, selectedCategories, selectedTopics, navigate]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hey Sara, let's create your practice test! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose to start right away with the Quick Start button, or customize your test by selecting specific question types and topics below.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowQuickStartModal(true)}
            className="whitespace-nowrap bg-[#2B3467] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#232952] transition-colors flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Quick Start
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <TestSettings
          tutorMode={tutorMode}
          setTutorMode={setTutorMode}
          timer={timer}
          setTimer={setTimer}
          ngn={ngn}
          setNGN={setNGN}
        />

        <QuestionSelection
          questionTypes={questionTypes}
          selectedQuestions={selectedQuestions}
          onQuestionToggle={handleQuestionToggle}
          onSelectAll={handleSelectAllQuestions}
        />

        <CategorySelection
          categories={clientNeeds}
          selectedCategories={selectedCategories}
          selectedTopics={selectedTopics}
          onCategoryToggle={handleCategoryToggle}
          onTopicToggle={handleTopicToggle}
          onSelectAll={handleSelectAllCategories}
        />

        <div className="grid grid-cols-2 gap-6">
          <QuestionCountSelector
            availableQuestions={totalSelectedQuestions}
            value={questionCount}
            onChange={setQuestionCount}
            totalSelectedQuestions={totalSelectedQuestions}
          />
          <BeginCustomTestCard 
            userName="Sara"
            selectedQuestions={selectedQuestions}
            selectedCategories={selectedCategories}
            selectedTopics={selectedTopics}
            questionCount={questionCount}
            totalSelectedQuestions={totalSelectedQuestions}
            onBeginTest={handleBeginTest}
          />
        </div>
      </div>

      <QuickStartModal
        isOpen={showQuickStartModal}
        onClose={() => setShowQuickStartModal(false)}
        onStart={handleQuickStart}
      />
    </div>
  );
};

export default CreateTest;