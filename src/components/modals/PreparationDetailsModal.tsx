import React from 'react';
import { X, BookOpen, Target, Clock, Brain, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
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

const PreparationDetailsModal = ({ isOpen, onClose, metrics }: Props) => {
  if (!isOpen) return null;

  // Calculate total subtopics from clientNeeds data
  const totalSubtopics = clientNeeds.reduce((acc, category) => 
    acc + (category.topics?.length || 0), 0
  );

  // Update metrics to use subtopics, ensuring the value doesn't exceed 100%
  const updatedMetrics = {
    ...metrics,
    topicsCovered: Math.min(metrics.topicsCovered * (clientNeeds[0].topics?.length || 1), totalSubtopics),
    totalTopics: totalSubtopics
  };

  const metricDetails = [
    {
      name: 'Questions Completed',
      icon: BookOpen,
      weight: '30%',
      value: Math.round((metrics.questionsCompleted / metrics.totalQuestions) * 100),
      description: 'Tracks the ratio of completed questions to total available questions. This metric ensures you\'ve practiced with a substantial portion of the question bank, exposing you to various question types and topics.',
      current: `${metrics.questionsCompleted} of ${metrics.totalQuestions} questions`
    },
    {
      name: 'Average Score',
      icon: Target,
      weight: '30%',
      value: metrics.averageScore,
      description: 'Based on your performance across all tests. A higher average score indicates better understanding of the material and improved test-taking strategies.',
      current: `${metrics.averageScore}% average across all tests`
    },
    {
      name: 'Topics Covered',
      icon: Brain,
      weight: '25%',
      value: Math.round((updatedMetrics.topicsCovered / updatedMetrics.totalTopics) * 100),
      description: 'Measures how many NCLEX topics and subtopics you\'ve studied. Complete coverage ensures you\'re prepared for questions from all potential exam areas.',
      current: `${updatedMetrics.topicsCovered} of ${updatedMetrics.totalTopics} topics covered`
    },
    {
      name: 'Study Hours',
      icon: Clock,
      weight: '15%',
      value: Math.round((metrics.studyHours / metrics.recommendedHours) * 100),
      description: 'Tracks actual study time against recommended study hours. Consistent study time is crucial for retaining information and building test-taking endurance.',
      current: `${metrics.studyHours} of ${metrics.recommendedHours} recommended hours`
    }
  ];

  const calculateOverallProgress = () => {
    const weights = {
      questionsCompleted: 0.3,
      averageScore: 0.3,
      topicsCoverage: 0.25,
      studyHours: 0.15
    };

    const questionProgress = (metrics.questionsCompleted / metrics.totalQuestions) * 100;
    const scoreProgress = metrics.averageScore;
    const topicProgress = Math.min((updatedMetrics.topicsCovered / updatedMetrics.totalTopics) * 100, 100);
    const hoursProgress = (metrics.studyHours / metrics.recommendedHours) * 100;

    return Math.round(
      questionProgress * weights.questionsCompleted +
      scoreProgress * weights.averageScore +
      topicProgress * weights.topicsCoverage +
      hoursProgress * weights.studyHours
    );
  };

  const getReadinessStatus = () => {
    const progress = calculateOverallProgress();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Preparation Progress Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Readiness Prediction Section */}
          <div className="mb-6">
            <div className={`${readinessInfo.bgColor} rounded-lg p-6 border ${readinessInfo.borderColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <readinessInfo.icon className={`w-6 h-6 ${readinessInfo.color}`} />
                <h3 className={`text-lg font-semibold ${readinessInfo.color}`}>
                  {readinessInfo.status}
                </h3>
              </div>
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
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Current Progress
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${calculateOverallProgress()}%` }}
                  />
                </div>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 min-w-[5rem] text-center">
                  {calculateOverallProgress()}%
                </span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200 mb-4">
                Overall Progress: {calculateOverallProgress()}% complete based on weighted metrics
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Your preparation progress is calculated using a weighted average of four key metrics, each contributing differently to your overall readiness:
              </p>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="space-y-6">
            {metricDetails.map((metric, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg shrink-0">
                    <metric.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {metric.name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          - Weight: {metric.weight}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(metric.value, 100)}%` }}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Your Score</div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.min(metric.value, 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Current Progress: {metric.current}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This weighted scoring system is designed to provide a comprehensive view of your exam readiness. Focus on improving areas with lower scores to increase your overall preparation level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreparationDetailsModal;