import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  testId: string;
  topic: string;
  subTopic: string;
}

const ExamNotesModal = ({ isOpen, onClose, questionId, testId, topic, subTopic }: Props) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setIsAuthenticated(!!session);
    } catch (err) {
      console.error('Error checking auth status:', err);
      setIsAuthenticated(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSigningIn(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      await checkAuth();
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!content.trim()) return;
    
    try {
      setIsSaving(true);
      setError('');

      if (!isAuthenticated) {
        setError('Please sign in to save notes');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error: insertError } = await supabase
        .from('notes')
        .insert([
          {
            content: content.trim(),
            question_id: questionId,
            test_id: testId,
            topic,
            sub_topic: subTopic,
            user_id: user.id
          }
        ]);

      if (insertError) throw insertError;

      onClose();
      setContent('');
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Add Note
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="py-8">
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Please sign in to save notes
              </p>
              <form onSubmit={handleSignIn} className="max-w-sm mx-auto space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningIn ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your notes here..."
                className="w-full h-64 p-4 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                  Question ID: {questionId}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                  Test ID: {testId}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                  {topic}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                  {subTopic}
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !content.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamNotesModal;