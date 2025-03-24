import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { clientNeeds } from '../../data/clientNeeds';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    questionsCompleted: number;
    totalQuestions: number;
    averageScore: number;
    topicsCovered: number;
    totalTopics: number;
    studyHours: number;
    recommendedHours: number;
  };
}

const ReadinessAssessmentModal = ({ isOpen, onClose, metrics }: Props) => {
  if (!isOpen) return null;

  // Calculate total subtopics from clientNeeds data
  const totalSubtopics = clientNeeds.reduce((acc, category) => 
    acc + (category.topics?.length || 0), 0
  );

  // Update metrics to use subtopics
  const updatedMetrics = {
    ...metrics,
    topicsCovered: Math.min(metrics.topicsCovered * (clientNeeds[0].topics?.length || 1), totalSubtopics),
    totalTopics: totalSubtopics
  };

  const calculateReadinessScore = () => {
    const weights = {
      questionsCompleted: 0.3,
      averageScore: 0.3,
      topicsCoverage: 0.25,
      studyHours: 0.15
    };

    const questionProgress = (metrics.questionsCompleted / metrics.totalQuestions) * 100;
    const scoreProgress = metrics.averageScore;
    const topicProgress = (updatedMetrics.topicsCovered / updatedMetrics.totalTopics) * 100;
    const hoursProgress = (metrics.studyHours / metrics.recommendedHours) * 100;

    return Math.round(
      questionProgress * weights.questionsCompleted +
      scoreProgress * weights.averageScore +
      topicProgress * weights.topicsCoverage +
      hoursProgress * weights.studyHours
    );
  };

  const getReadinessStatus = () => {
    const progress = calculateReadinessScore();
    const averageScore = metrics.averageScore;
    const topicsCoverage = Math.round((updatedMetrics.topicsCovered / updatedMetrics.totalTopics) * 100);

    if (progress >= 85 && averageScore >= 80 && topicsCoverage >= 90) {
      return {
        status: 'High Readiness',
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        message: 'Based on your metrics, you show a high level of readiness for the NCLEX exam. Your consistent performance and comprehensive preparation indicate a strong likelihood of success.',
        recommendations: [
          'Continue with practice tests to maintain momentum',
          'Focus on reviewing any remaining weak areas',
          'Practice time management with full-length tests',
          'Consider scheduling your exam soon'
        ]
      };
    } else if (progress >= 70 && averageScore >= 70 && topicsCoverage >= 75) {
      return {
        status: 'Moderate Readiness',
        icon: AlertCircle,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        message: 'You\'re showing good progress in your preparation, but there\'s room for improvement. With focused study in key areas, you can increase your readiness level.',
        recommendations: [
          'Increase practice test frequency',
          'Focus on topics with lower performance',
          'Aim to complete more questions in untested areas',
          'Dedicate more study hours to reach recommended levels'
        ]
      };
    } else {
      return {
        status: 'Additional Preparation Needed',
        icon: AlertTriangle,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        message: 'Your current metrics suggest you would benefit from additional preparation before taking the NCLEX exam. Focus on improving your weak areas and increasing your overall readiness.',
        recommendations: [
          'Create a structured study schedule',
          'Increase coverage of untested topics',
          'Work on improving test scores through focused review',
          'Complete more practice questions to build confidence'
        ]
      };
    }
  };

  const readinessInfo = getReadinessStatus();
  const ReadinessIcon = readinessInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <ReadinessIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  NCLEX Readiness Level
                </h2>
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  Moderate Readiness
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Section */}
          <div className={`${readinessInfo.bgColor} rounded-lg p-6 border ${readinessInfo.borderColor} mb-6`}>
            <p className="text-gray-700 dark:text-gray-200 mb-4">
              {readinessInfo.message}
            </p>
            <div className="space-y-2">
              <h4 className={`font-medium ${readinessInfo.color}`}>Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                {readinessInfo.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* How We Determine Readiness Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              How We Determine Your NCLEX Readiness
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your NCLEX readiness level is calculated using a comprehensive scoring system that takes into account multiple factors of your preparation journey. We use a weighted scoring system that considers the following key metrics:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Questions Completed (30%)</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  The number of practice questions you've completed relative to the total available. This measures your exposure to different question types and topics.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Average Score (30%)</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Your overall performance across all practice tests. This indicates your understanding of the content and test-taking ability.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Topics Covered (25%)</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  The breadth of your study across different nursing topics. This ensures comprehensive preparation across all potential exam areas.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Study Hours (15%)</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  The time you've invested in studying compared to recommended study hours. This reflects your dedication and preparation thoroughness.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Readiness Levels</h4>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li>• <strong>High Readiness (85%+):</strong> Excellent preparation with strong performance across all metrics</li>
                <li>• <strong>Moderate Readiness (70-84%):</strong> Good progress with room for targeted improvements</li>
                <li>• <strong>Additional Preparation Needed (&lt;70%):</strong> Focus needed on specific areas before exam readiness</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessAssessmentModal;