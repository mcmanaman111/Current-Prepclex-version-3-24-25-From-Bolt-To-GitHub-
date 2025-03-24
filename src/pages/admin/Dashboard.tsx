import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Bell, MessageSquare, Users, CheckCircle2, Star, Upload, LayoutDashboard } from 'lucide-react';
import QuestionUpload from '../../components/admin/QuestionUpload';
import type { Database } from '../../types/database';

type QuestionFeedback = Database['public']['Tables']['question_feedback']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions'>('overview');
  const [feedback, setFeedback] = useState<QuestionFeedback[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('question_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Fetch notifications
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notificationError) throw notificationError;

      setFeedback(feedbackData || []);
      setNotifications(notificationData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToFeedback = async (feedbackId: string, response: string) => {
    try {
      const { error: updateError } = await supabase
        .from('question_feedback')
        .update({
          admin_response: response,
          status: 'responded'
        })
        .eq('id', feedbackId);

      if (updateError) throw updateError;

      // Create notification for user
      const feedbackItem = feedback.find(f => f.id === feedbackId);
      if (feedbackItem) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: feedbackItem.user_id,
            type: 'feedback_response',
            title: 'Response to Your Feedback',
            message: `An administrator has responded to your feedback on question ${feedbackItem.question_id}`,
            link: `/exam?question=${feedbackItem.question_id}`
          });

        if (notificationError) throw notificationError;
      }

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error responding to feedback:', error);
      setError('Failed to send response');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h2>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-dark-lighter text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-dark-lighter/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-dark-lighter text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-dark-lighter/50'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Upload Questions</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'questions' ? (
        <QuestionUpload />
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{feedback.length}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Responses</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {feedback.filter(f => f.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {new Set(feedback.map(f => f.user_id)).size}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-lighter p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {feedback.filter(f => f.status === 'responded').length}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Recent Feedback</h3>
              <div className="space-y-6">
                {feedback.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    className="border-b dark:border-gray-700 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {item.status === 'pending' ? 'Pending' : 'Responded'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                          Question {item.question_id}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                          Test {item.test_id}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{item.message}</p>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < item.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Difficulty: {item.difficulty}
                      </span>
                    </div>
                    {item.status === 'pending' ? (
                      <div className="mt-4">
                        <textarea
                          placeholder="Write your response..."
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                          rows={3}
                        />
                        <button
                          onClick={() => handleRespondToFeedback(item.id, 'Thank you for your feedback!')}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Send Response
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{item.admin_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Recent Notifications</h3>
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">{notification.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;