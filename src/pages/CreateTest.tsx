import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import TestSettings from '../components/create-test/TestSettings';
import QuestionSelection from '../components/create-test/QuestionSelection';
import TopicSelection from '../components/create-test/TopicSelection';
import QuestionCountSelector from '../components/create-test/QuestionCountSelector';
import BeginCustomTestCard from '../components/create-test/BeginCustomTestCard';
import QuickStartModal from '../components/modals/QuickStartModal';
import { fetchQuestionTypeData, fetchTopicData, fetchNgnQuestionsData } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/AuthProvider';
import type { QuestionType, Category, TestConfig } from '../data/types';

const CreateTest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ first_name: string } | null>(null);
  const [tutorMode, setTutorMode] = useState(true);
  const [timer, setTimer] = useState(false);
  const [ngn, setNGN] = useState(false);
  // Function to handle NGN toggle that also ensures ngnOnly is turned off when NGN is disabled
  const handleNgnToggle = (value: boolean) => {
    setNGN(value);
    // If NGN is being turned off, also turn off NGN Only
    if (!value) {
      setNgnOnly(false);
    }
  };
  const [ngnOnly, setNgnOnly] = useState(false);
  const [minutesPerQuestion, setMinutesPerQuestion] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(25);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [standardQuestionTypes, setStandardQuestionTypes] = useState<QuestionType[]>([]);
  const [topics, setTopics] = useState<Category[]>([]);
  const [standardTopics, setStandardTopics] = useState<Category[]>([]);
  const [ngnQuestionData, setNgnQuestionData] = useState<{
    total: number,
    byTopic: Record<string, number>
  }>({ total: 5, byTopic: {} });

  // Fetch user profile data when user changes
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          if (data) setUserProfile(data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [user]);

  // Fetch data when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch question types, topics, and NGN data
        const userId = user?.id || 'anonymous';
        const [questionTypeResult, topicResult, ngnData] = await Promise.all([
          fetchQuestionTypeData(userId),
          fetchTopicData(),
          fetchNgnQuestionsData()
        ]);
        
        setQuestionTypes(questionTypeResult.questionTypes);
        setStandardQuestionTypes(questionTypeResult.standardQuestionTypes);
        setTopics(topicResult.topics);
        setStandardTopics(topicResult.standardTopics);
        setNgnQuestionData(ngnData);
      } catch (error) {
        console.error('Error loading test creation data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

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

  // Get the appropriate topics based on NGN setting
  const activeTopics = useMemo(() => {
    if (ngnOnly) {
      // When NGN Only is enabled, use filtered topics that only show NGN questions
      return topics;
    } else if (ngn) {
      // When NGN is enabled but not "NGN Only", use all topics
      return topics;
    } else {
      // When NGN is disabled, use standard topics (excluding NGN questions)
      return standardTopics;
    }
  }, [topics, standardTopics, ngn, ngnOnly]);

  // Get the appropriate question types based on NGN setting
  const activeQuestionTypes = useMemo(() => {
    if (ngnOnly) {
      // When NGN Only is true, use the full question types but adjust count to only show NGN questions
      return questionTypes.map(type => ({
        ...type,
        count: type.id === 'unused' ? ngnQuestionData.total : 0
      }));
    } else if (ngn) {
      // When NGN is enabled but not "NGN Only", use all question types
      return questionTypes;
    } else {
      // When NGN is disabled, use standard question types (excluding NGN questions)
      return standardQuestionTypes;
    }
  }, [questionTypes, standardQuestionTypes, ngn, ngnOnly, ngnQuestionData]);

  // Memoize total selected questions calculation
  const totalSelectedQuestions = useMemo(() => {
    // If no question types are selected, no questions are available
    if (selectedQuestions.length === 0) return 0;
    
    // If no topics or subtopics are selected, no questions are available
    if (selectedTopics.length === 0 && selectedSubtopics.length === 0) return 0;
    
    // Calculate the total available questions based on selected topics/subtopics
    let topicFilteredQuestions = activeTopics.reduce((acc, topic) => {
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
    
    // Calculate the total available questions based on selected question types
    let questionTypeFilteredQuestions = selectedQuestions.reduce((acc, typeId) => {
      const questionType = activeQuestionTypes.find(qt => qt.id === typeId);
      return acc + (questionType?.count || 0);
    }, 0);
    
    // Apply NGN Only filter to show only NGN questions
    if (ngnOnly) {
      return ngnQuestionData.total;
    }
    
    // Return the smaller of the two counts, as this represents the intersection
    return Math.min(topicFilteredQuestions, questionTypeFilteredQuestions);
  }, [activeQuestionTypes, activeTopics, selectedQuestions, selectedTopics, selectedSubtopics, ngnOnly, ngnQuestionData]);

  // Adjust question count when available questions changes
  useEffect(() => {
    // If the user has selected more questions than are available, cap it
    if (questionCount > totalSelectedQuestions && totalSelectedQuestions > 0) {
      setQuestionCount(totalSelectedQuestions);
    }
  }, [totalSelectedQuestions, questionCount]);

  // When a topic is selected, automatically select all its subtopics
  useEffect(() => {
    const newSelectedSubtopics = [...selectedSubtopics];
    let hasChanges = false;

    activeTopics.forEach(topic => {
      if (topic.topics) {
        const subtopicIds = topic.topics.map(subtopic => subtopic.id);
        if (selectedTopics.includes(topic.id)) {
          // Only when a topic is selected, select all its subtopics
          subtopicIds.forEach(subtopicId => {
            if (!newSelectedSubtopics.includes(subtopicId)) {
              newSelectedSubtopics.push(subtopicId);
              hasChanges = true;
            }
          });
        }
      }
    });

    if (hasChanges) {
      setSelectedSubtopics(newSelectedSubtopics);
    }
  }, [selectedTopics, selectedSubtopics, activeTopics]);

  // Memoize handlers
  const handleQuestionToggle = useCallback((id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  }, []);

  const handleTopicToggle = useCallback((topicId: string) => {
    const isDeselecting = selectedTopics.includes(topicId);
    
    // Update selected topics
    setSelectedTopics(prev => 
      isDeselecting 
        ? prev.filter(t => t !== topicId) 
        : [...prev, topicId]
    );
    
    // When deselecting a topic, remove all of its subtopics from selection
    if (isDeselecting) {
      const topic = activeTopics.find(t => t.id === topicId);
      if (topic?.topics) {
        const subtopicIds = topic.topics.map(subtopic => subtopic.id);
        setSelectedSubtopics(prev => 
          prev.filter(id => !subtopicIds.includes(id))
        );
      }
    }
  }, [selectedTopics, activeTopics]);

  const handleSubtopicToggle = useCallback((topicId: string, subtopicId: string) => {
    // Simple toggle of subtopic selection state
    setSelectedSubtopics(prev => 
      prev.includes(subtopicId)
        ? prev.filter(id => id !== subtopicId)
        : [...prev, subtopicId]
    );
    
    // Check if all subtopics are now selected, and if so, auto-select the parent topic
    const topic = activeTopics.find(t => t.id === topicId);
    if (topic?.topics) {
      const topicSubtopicIds = topic.topics.map(st => st.id);
      
      // After the toggle, calculate what the new subtopics array will be
      const newSubtopics = selectedSubtopics.includes(subtopicId)
        ? selectedSubtopics.filter(id => id !== subtopicId)  // if deselecting
        : [...selectedSubtopics, subtopicId];  // if selecting
      
      // Check if all subtopics are selected to determine if parent should be auto-selected
      const allSubtopicsSelected = topicSubtopicIds.every(id => newSubtopics.includes(id));
      
      if (allSubtopicsSelected && !selectedTopics.includes(topicId)) {
        // Auto-select the parent topic
        setSelectedTopics(prev => [...prev, topicId]);
      }
    }
  }, [selectedTopics, selectedSubtopics, activeTopics]);

  const handleSelectAllQuestions = useCallback(() => {
    // Toggle all question types - if all are selected, deselect all, otherwise select all
    setSelectedQuestions(prev => 
      prev.length === activeQuestionTypes.length ? [] : activeQuestionTypes.map(q => q.id)
    );
  }, [activeQuestionTypes]);

  const handleSelectAllTopics = useCallback(() => {
    if (selectedTopics.length === activeTopics.length) {
      // Deselect all topics AND subtopics
      setSelectedTopics([]);
      setSelectedSubtopics([]);
    } else {
      // Select all topics
      setSelectedTopics(activeTopics.map(t => t.id));
      
      // Select all subtopics
      const allSubtopics = activeTopics.reduce((acc, topic) => {
        if (topic.topics) {
          return [...acc, ...topic.topics.map(st => st.id)];
        }
        return acc;
      }, [] as string[]);
      setSelectedSubtopics(allSubtopics);
    }
  }, [activeTopics, selectedTopics]);

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
        selectedTopics,
        selectedSubtopics,
        ngnOnly  // Pass the ngnOnly parameter to the exam page
      } 
    });
  }, [tutorMode, timer, ngn, questionCount, selectedQuestions, selectedTopics, selectedSubtopics, ngnOnly, navigate]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hey {userProfile?.first_name || user?.email?.split('@')[0] || 'User'}, let's create your practice test! 👋
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2B3467]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <TestSettings
            tutorMode={tutorMode}
            setTutorMode={setTutorMode}
            timer={timer}
            setTimer={setTimer}
            ngn={ngn}
            setNGN={handleNgnToggle}
            minutesPerQuestion={minutesPerQuestion}
            setMinutesPerQuestion={setMinutesPerQuestion}
          />

          <QuestionSelection
            questionTypes={activeQuestionTypes}
            selectedQuestions={selectedQuestions}
            onQuestionToggle={handleQuestionToggle}
            onSelectAll={handleSelectAllQuestions}
            totalSelectedQuestions={ngnOnly ? ngnQuestionData.total : totalSelectedQuestions}
            ngnEnabled={ngn}
            ngnOnly={ngnOnly}
            onNgnOnlyChange={setNgnOnly}
            ngnQuestionData={ngnQuestionData}
          />

          <TopicSelection
            topics={activeTopics}
            selectedTopics={selectedTopics}
            selectedSubtopics={selectedSubtopics}
            onTopicToggle={handleTopicToggle}
            onSubtopicToggle={handleSubtopicToggle}
            onSelectAll={handleSelectAllTopics}
            totalSelectedQuestions={ngnOnly ? ngnQuestionData.total : totalSelectedQuestions}
            ngnEnabled={ngn}
            ngnOnly={ngnOnly}
            ngnQuestionData={ngnQuestionData}
          />

          <div className="grid grid-cols-2 gap-6">
            <QuestionCountSelector
              availableQuestions={totalSelectedQuestions}
              value={questionCount}
              onChange={setQuestionCount}
              totalSelectedQuestions={totalSelectedQuestions}
            />
            <BeginCustomTestCard 
              userName={userProfile?.first_name || user?.email?.split('@')[0] || 'User'}
              selectedQuestions={selectedQuestions}
              selectedCategories={selectedTopics} // Passing selectedTopics as selectedCategories for backward compatibility
              selectedTopics={selectedSubtopics} // Passing selectedSubtopics as selectedTopics for backward compatibility
              questionCount={questionCount}
              totalSelectedQuestions={totalSelectedQuestions}
              onBeginTest={handleBeginTest}
            />
          </div>
        </div>
      )}

      <QuickStartModal
        isOpen={showQuickStartModal}
        onClose={() => setShowQuickStartModal(false)}
        onStart={handleQuickStart}
      />
    </div>
  );
};

export default CreateTest;
