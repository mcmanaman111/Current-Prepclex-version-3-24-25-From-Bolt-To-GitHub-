import React from 'react';
import { CheckCircle2, X, Flag, AlertCircle, SkipForward } from 'lucide-react';
import type { Question, Score } from '../../types/exam';
import { useNavigate } from 'react-router-dom';

interface Props {
  questions: Question[];
  scores: Record<string, Score>;
  markedQuestions: number[];
  showSubTopics: boolean;
  searchTerm: string;
  filter: 'all' | 'correct' | 'incorrect' | 'partially' | 'skipped' | 'marked';
}

const ResultsTable = ({ 
  questions, 
  scores, 
  markedQuestions, 
  showSubTopics, 
  searchTerm, 
  filter 
}: Props) => {
  const navigate = useNavigate();

  // Filter and search questions
  const filteredQuestions = questions.filter(question => {
    const score = scores[question.id];
    const matchesSearch = 
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.statistics.clientNeedArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.statistics.clientNeedTopic.toLowerCase().includes(searchTerm.toLowerCase());

    const isSkipped = !score;
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'correct' && score?.isFullyCorrect) ||
      (filter === 'partially' && !score?.isFullyCorrect && score?.correct > 0) ||
      (filter === 'incorrect' && score?.correct === 0) ||
      (filter === 'skipped' && isSkipped) ||
      (filter === 'marked' && markedQuestions.includes(questions.indexOf(question)));

    return matchesSearch && matchesFilter;
  });

  // Get status icon
  const getStatusIcon = (question: Question, index: number) => {
    const score = scores[question.id];
    
    if (!score) {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
          <SkipForward className="w-5 h-5 text-gray-400" />
        </div>
      );
    }
    
    if (score.isFullyCorrect) {
      return (
        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      );
    }
    
    if (score.correct > 0) {
      return (
        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
          <AlertCircle className="w-5 h-5 text-blue-500" />
        </div>
      );
    }
    
    return (
      <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded">
        <X className="w-5 h-5 text-red-500" />
      </div>
    );
  };

  const handleReviewQuestion = (questionIndex: number) => {
    navigate('/exam', {
      state: {
        reviewMode: true,
        startAtQuestion: questionIndex,
        questions,
        scores,
        markedQuestions
      }
    });
  };

  const isNGNQuestion = (question: Question) => {
    // This is a placeholder check - replace with your actual NGN question detection logic
    return question.statistics.questionType.toLowerCase().includes('ngn');
  };

  const getQuestionType = (question: Question) => {
    // Replace NGN with more specific question type
    const baseType = question.statistics.questionType === 'Next Generation NCLEX' 
      ? 'Graphic/Exhibit'
      : question.statistics.questionType;

    const isNGN = isNGNQuestion(question);

    return (
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
          {baseType}
        </span>
        {isNGN && (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
            NGN
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">#</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {showSubTopics ? 'Sub-topic' : 'Topic'}
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Q-Type</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-lighter divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuestions.map((question, index) => {
                const score = scores[question.id];
                const isMarked = markedQuestions.includes(index);
                const isPartiallyCorrect = score?.correct > 0 && !score?.isFullyCorrect;
                
                return (
                  <tr key={question.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(question, index)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {index + 1}
                        </span>
                        {isMarked && (
                          <Flag className="w-4 h-4 text-red-500" />
                        )}
                        {isPartiallyCorrect && (
                          <AlertCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                        {question.text}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {showSubTopics ? question.statistics.clientNeedTopic : question.statistics.clientNeedArea}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      {getQuestionType(question)}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {question.statistics.timeTaken}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleReviewQuestion(index)}
                        className="px-4 py-1.5 bg-[#2B3467] text-white rounded-lg hover:bg-[#232952] transition-colors text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;