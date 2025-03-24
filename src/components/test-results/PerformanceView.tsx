import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { ClientNeedsData, Question, Score } from '../../types/exam';

interface Props {
  questions: Question[];
  scores: Record<string, Score>;
  clientNeedsData: ClientNeedsData;
  correctAnswers: number;
  partiallyCorrect: number;
  overallScore: number;
}

const PerformanceView = ({ 
  questions = [], 
  scores = {}, 
  clientNeedsData = {}, 
  correctAnswers = 0,
  partiallyCorrect = 0,
  overallScore = 0
}: Props) => {
  // Calculate Q-type data from questions and scores
  const qTypeData = questions.reduce((acc, question) => {
    const type = question.statistics.questionType;
    const score = scores[question.id];
    
    if (!acc[type]) {
      acc[type] = { total: 0, correct: 0 };
    }
    
    acc[type].total++;
    if (score?.isFullyCorrect) {
      acc[type].correct++;
    }
    
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  // Calculate total questions from Q-type data
  const totalQTypeQuestions = Object.values(qTypeData).reduce((sum, data) => sum + data.total, 0);

  // Calculate Q-type performance
  const qTypeChartData = {
    labels: Object.keys(qTypeData),
    datasets: [{
      data: Object.values(qTypeData).map(data => Math.round((data.correct / data.total) * 100)),
      backgroundColor: [
        'rgba(37, 99, 235, 0.8)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(96, 165, 250, 0.4)',
        'rgba(147, 197, 253, 0.3)'
      ],
      borderWidth: 0
    }]
  };

  // Calculate best and worst performance
  const topicPerformance = Object.entries(clientNeedsData).map(([area, data]) => ({
    name: area,
    score: Math.round((data.correct / data.total) * 100),
    type: 'topic',
    total: data.total,
    correct: data.correct
  }));

  const subTopicPerformance = Object.entries(clientNeedsData).flatMap(([area, data]) =>
    Object.entries(data.topics).map(([topic, scores]) => ({
      name: topic,
      score: Math.round((scores.correct / scores.total) * 100),
      type: 'subtopic',
      total: scores.total,
      correct: scores.correct,
      parentTopic: area
    }))
  );

  const bestTopics = topicPerformance
    .filter(topic => topic.score >= 80)
    .sort((a, b) => b.score - a.score);

  const worstTopics = topicPerformance
    .filter(topic => topic.score < 70)
    .sort((a, b) => a.score - b.score);

  const bestSubTopics = subTopicPerformance
    .filter(topic => topic.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const worstSubTopics = subTopicPerformance
    .filter(topic => topic.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Performance Analysis */}
        <div className="col-span-5 space-y-6">
          {/* Topics Analysis */}
          <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Topics Analysis</h3>
            
            {/* Best Topics */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-gray-800 dark:text-white">Strongest Topics</h4>
              </div>
              <div className="space-y-2">
                {bestTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    <div>
                      <span className="text-sm text-green-700 dark:text-green-300">{topic.name}</span>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {topic.correct} of {topic.total} correct
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">{topic.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Topics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-gray-800 dark:text-white">Topics Needing Review</h4>
              </div>
              <div className="space-y-2">
                {worstTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    <div>
                      <span className="text-sm text-red-700 dark:text-red-300">{topic.name}</span>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {topic.correct} of {topic.total} correct
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">{topic.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-topics Analysis */}
          <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Sub-topics Analysis</h3>
            
            {/* Best Sub-topics */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-gray-800 dark:text-white">Strongest Sub-topics</h4>
              </div>
              <div className="space-y-2">
                {bestSubTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    <div>
                      <span className="text-sm text-green-700 dark:text-green-300">{topic.name}</span>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {topic.correct} of {topic.total} correct
                      </div>
                      <div className="text-xs text-green-500 dark:text-green-300 mt-0.5">
                        {topic.parentTopic}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">{topic.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Sub-topics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-gray-800 dark:text-white">Sub-topics Needing Review</h4>
              </div>
              <div className="space-y-2">
                {worstSubTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    <div>
                      <span className="text-sm text-red-700 dark:text-red-300">{topic.name}</span>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {topic.correct} of {topic.total} correct
                      </div>
                      <div className="text-xs text-red-500 dark:text-red-300 mt-0.5">
                        {topic.parentTopic}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">{topic.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance by Q-Type */}
          <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Performance by Q-Type</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(qTypeData).map(([type, data], index) => {
                  const percentage = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{type}</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {data.correct}/{data.total} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Performance by Topic and Sub-topic */}
        <div className="col-span-7 bg-white dark:bg-dark-lighter rounded-xl shadow-lg">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Performance by Topic and Sub-topic</h3>
            <div className="space-y-6">
              {Object.entries(clientNeedsData).map(([area, data]) => {
                const scoreData = {
                  datasets: [{
                    data: [data.correct, data.total - data.correct],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(209, 213, 219, 0.8)'
                    ],
                    borderWidth: 0
                  }]
                };

                const totalQuestions = data.total;
                const correctQuestions = data.correct;
                const incorrectQuestions = totalQuestions - correctQuestions;
                const ngnQuestions = questions.filter(q => 
                  q.statistics.clientNeedArea === area && 
                  q.statistics.questionType.includes('NGN')
                ).length;

                return (
                  <div key={area} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{area}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                            Questions: {totalQuestions}
                          </span>
                          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                            Correct: {correctQuestions}
                          </span>
                          <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                            Incorrect: {incorrectQuestions}
                          </span>
                          <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full flex items-center gap-1">
                            NGN Questions: {ngnQuestions}
                          </span>
                        </div>
                      </div>
                      <div className="w-24 h-24 relative shrink-0">
                        <Doughnut data={scoreData} options={{
                          cutout: '75%',
                          plugins: { legend: { display: false } }
                        }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                              {Math.round((data.correct / data.total) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(data.topics).map(([topic, scores]) => {
                        const percentage = Math.round((scores.correct / scores.total) * 100);
                        return (
                          <div key={topic} className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-300 min-w-[180px]">{topic}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              {percentage}% ({scores.correct}/{scores.total})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;