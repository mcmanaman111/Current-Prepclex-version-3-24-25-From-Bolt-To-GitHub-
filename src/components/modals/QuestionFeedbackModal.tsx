import React, { useState } from 'react';
import { X, MessageSquare, Star, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { Database } from '../../types/database';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  testId: string;
}

const QuestionFeedbackModal = ({ isOpen, onClose, questionId, testId }: Props) => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Insert feedback
      const { error: feedbackError } = await supabase
        .from('question_feedback')
        .insert({
          user_id: user.id,
          question_id: questionId,
          test_id: testId,
          message: message || 'No message provided',
          rating: rating || 0,
          difficulty: difficulty || 'MEDIUM',
          status: 'pending'
        });

      if (feedbackError) throw feedbackError;

      // Create notification for admin
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: 'admin', // Replace with actual admin user ID
          type: 'question_feedback',
          title: 'New Question Feedback',
          message: `New feedback received for question ${questionId}`,
          link: `/admin/feedback/${questionId}`,
          read: false
        });

      if (notificationError) throw notificationError;

      onClose();
      setMessage('');
      setRating(0);
      setDifficulty('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if at least one feedback option is provided
  const hasValidFeedback = message.trim() !== '' || rating > 0 || difficulty !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Question Feedback
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Question ID and Test ID */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                Question ID: {questionId}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                Test ID: {testId}
              </span>
            </div>

            {/* Feedback Message */}
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Please give us your feedback regarding this question
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts about this question..."
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Star Rating */}
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Please rate this question from 1 to 5 stars
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Please indicate the difficulty level of this question
              </p>
              <div className="flex gap-2">
                {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level as typeof difficulty)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      difficulty === level
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasValidFeedback}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionFeedbackModal;