import React, { useState } from 'react';
import { MessageSquare, Book, Timer, Info, BookOpen } from 'lucide-react';
import { TestQuestion } from '../../types/exam';
import QuestionFeedbackModal from '../modals/QuestionFeedbackModal';

interface Props {
  question: TestQuestion;
  isFullyCorrect: boolean;
  onScoringHelp: () => void;
  isStackedView?: boolean;
}

// Tab Navigation Component
interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <button
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
          activeTab === 'info'
            ? 'bg-white dark:bg-gray-900 border-r border-b-0 border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
        }`}
        onClick={() => setActiveTab('info')}
      >
        <Info className="w-4 h-4" />
        <span>Question Info</span>
      </button>
      <button
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
          activeTab === 'references'
            ? 'bg-white dark:bg-gray-900 border-l border-b-0 border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
        }`}
        onClick={() => setActiveTab('references')}
      >
        <BookOpen className="w-4 h-4" />
        <span>References</span>
      </button>
    </div>
  );
};

const ExplanationSection = ({ question, isFullyCorrect, onScoringHelp, isStackedView = true }: Props) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'references'

  // Get correct and incorrect choice numbers
  const correctChoices = question.choices
    .map((choice, index) => choice.isCorrect ? (index + 1) : null)
    .filter((num): num is number => num !== null);

  const incorrectChoices = question.choices
    .map((choice, index) => !choice.isCorrect ? (index + 1) : null)
    .filter((num): num is number => num !== null);

  // Check if this is a SATA question
  const isSATAQuestion = correctChoices.length > 1;

  // Handle the explanation text
  // Attempt to parse structured data or use the raw text
  let correctExplanation = "No explanation available.";
  let incorrectExplanation = "No explanation available.";
  let references: string[] = [];
  
  if (question.explanation) {
    try {
      // First check if the explanation is a JSON string
      const parsedExplanation = JSON.parse(question.explanation);
      if (parsedExplanation.correct) {
        correctExplanation = parsedExplanation.correct;
      }
      if (parsedExplanation.incorrect) {
        incorrectExplanation = parsedExplanation.incorrect;
      }
      if (parsedExplanation.references) {
        references = Array.isArray(parsedExplanation.references) 
          ? parsedExplanation.references 
          : [parsedExplanation.references];
      }
    } catch (e) {
      // Not JSON, so handle as plain text
      // For now we'll just show the full explanation for both sections
      correctExplanation = question.explanation;
      
      // For incorrect choices, if we have no specific content, create a placeholder
      if (incorrectChoices.length > 0) {
        incorrectExplanation = question.explanation;
      }
    }
  }
  
  // Handle references from the question object if not in the explanation
  console.log("Question object:", question);
  console.log("References from explanation parsing:", references);
  console.log("Question has ref_sources property:", question.hasOwnProperty('ref_sources'));
  
  // Look for ref_sources - this is the field name in the database
  if (references.length === 0 && question.ref_sources) {
    console.log("Using ref_sources from question object:", question.ref_sources);
    references = Array.isArray(question.ref_sources) 
      ? question.ref_sources 
      : typeof question.ref_sources === 'string' ? question.ref_sources.split('\n') : [];
  }
  // Also check for legacy references property for backward compatibility
  else if (references.length === 0 && question.references) {
    console.log("Using legacy references property:", question.references);
    references = Array.isArray(question.references) 
      ? question.references 
      : typeof question.references === 'string' ? question.references.split('\n') : [];
  }
  
  console.log("Final references array:", references);

  // Handle multiple paragraphs in explanations
  const formatExplanationText = (text: string | string[]): React.ReactNode => {
    if (typeof text === 'string') {
      return text.split('\n').map((paragraph: string, index: number) => (
        <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 explanation-text">
          {paragraph}
        </p>
      ));
    } else if (Array.isArray(text)) {
      return text.map((paragraph: string, index: number) => (
        <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 explanation-text">
          {paragraph}
        </p>
      ));
    }
    return <p className="text-gray-700 dark:text-gray-300 mb-2 explanation-text">{String(text)}</p>;
  };
  
  // Create a statistics object with our available data
  const statistics = {
    clientNeedArea: question.topic || 'General',
    clientNeedTopic: question.sub_topic || 'Unknown',
    percentCorrect: 0,
    difficulty: question.difficulty || 'Medium',
    timeTaken: question.time_taken || '2:01'
  };

  return (
    <div className={`p-6 pb-24 mt-7 ${isStackedView ? 'md:px-[calc(12rem_+_1.5rem)]' : 'md:px-12'} bg-blue-50/20`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Explanation</h3>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Question Feedback</span>
        </button>
      </div>
      
      <div className="space-y-6 mb-8">
        {/* Correct Answer Explanation */}
        <div>
          <h4 className="font-medium text-green-600 dark:text-green-400 mb-3">
            {`Choice${correctChoices.length > 1 ? 's' : ''} ${correctChoices.join(', ')} ${correctChoices.length > 1 ? 'are' : 'is'} correct.`}
          </h4>
          {formatExplanationText(correctExplanation)}
        </div>

        {/* Incorrect Answer Explanation - only show if there are incorrect choices */}
        {incorrectChoices.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-3">
              {`Choice${incorrectChoices.length > 1 ? 's' : ''} ${incorrectChoices.join(', ')} ${incorrectChoices.length > 1 ? 'are' : 'is'} incorrect.`}
            </h4>
            {formatExplanationText(incorrectExplanation)}
          </div>
        )}
        
        {/* References section moved to the tabbed interface */}
      </div>

      {/* Horizontal Separator */}
      <hr className="border-t border-gray-200 dark:border-gray-700 mb-6" />
      
      {/* Tabbed Card */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        {/* Tab Content */}
        <div className="p-4 bg-white dark:bg-gray-800">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full whitespace-nowrap">
                  Client Needs Topic
                </span>
                <span className="text-gray-600 dark:text-gray-300 break-words">{statistics.clientNeedArea}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full whitespace-nowrap">
                  Sub-topic
                </span>
                <span className="text-gray-600 dark:text-gray-300 break-words">{statistics.clientNeedTopic}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full whitespace-nowrap">
                  Question Format
                </span>
                <span className="text-gray-600 dark:text-gray-300 break-words">
                  {isSATAQuestion ? 'SATA Question' : 'Multiple Choice'}
                  {isSATAQuestion && (
                    <button
                      onClick={onScoringHelp}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline ml-2"
                    >
                      How are partially correct answers scored?
                    </button>
                  )}
                </span>
              </div>
              {question.ngn && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full whitespace-nowrap">
                    Question Type
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">Next Generation NCLEX (NGN)</span>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'references' && (
            <div className={`${references.length > 0 ? '' : 'p-4 text-center text-gray-500 dark:text-gray-400'}`}>
              {references.length > 0 ? (
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                    <Book className="w-4 h-4 mr-2" />
                    References
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {references.map((reference, index) => (
                      <li key={index} className="ml-2">{reference}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No references available for this question.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <QuestionFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        questionId={question.id.toString()}
        testId={`T${question.id}`}
      />
    </div>
  );
};



export default ExplanationSection;
