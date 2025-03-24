import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultsTabs from '../components/test-results/ResultsTabs';
import SearchAndFilter from '../components/test-results/SearchAndFilter';
import ResultsTable from '../components/test-results/ResultsTable';
import StatisticsView from '../components/test-results/StatisticsView';
import PerformanceView from '../components/test-results/PerformanceView';
import type { TestResultsData } from '../types/exam';

const TestResults = () => {
  const [activeTab, setActiveTab] = useState('results');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'partially' | 'skipped' | 'marked'>('all');
  const [showSubTopics, setShowSubTopics] = useState(false);
  const location = useLocation();
  const testData = location.state as TestResultsData;

  // Calculate overall test statistics
  const testStatistics = useMemo(() => {
    const totalQuestions = testData.questions.length;
    const answeredQuestions = Object.keys(testData.scores).length;
    const correctAnswers = Object.values(testData.scores).filter(score => score.isFullyCorrect).length;
    const partiallyCorrect = Object.values(testData.scores).filter(score => !score.isFullyCorrect && score.correct > 0).length;
    const incorrectAnswers = answeredQuestions - correctAnswers - partiallyCorrect;
    const skippedQuestions = totalQuestions - answeredQuestions;
    const overallScore = Math.round((correctAnswers / totalQuestions) * 100);

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      partiallyCorrect,
      incorrectAnswers,
      skippedQuestions,
      overallScore
    };
  }, [testData]);

  // Calculate client needs data
  const clientNeedsData = useMemo(() => {
    const data: Record<string, {
      correct: number;
      total: number;
      topics: Record<string, { correct: number; total: number; }>
    }> = {};

    testData.questions.forEach(question => {
      const area = question.statistics.clientNeedArea;
      const topic = question.statistics.clientNeedTopic;
      const score = testData.scores[question.id];

      // Initialize area if it doesn't exist
      if (!data[area]) {
        data[area] = { correct: 0, total: 0, topics: {} };
      }

      // Initialize topic if it doesn't exist
      if (!data[area].topics[topic]) {
        data[area].topics[topic] = { correct: 0, total: 0 };
      }

      // Update area statistics
      data[area].total++;
      if (score?.isFullyCorrect) {
        data[area].correct++;
      }

      // Update topic statistics
      data[area].topics[topic].total++;
      if (score?.isFullyCorrect) {
        data[area].topics[topic].correct++;
      }
    });

    return data;
  }, [testData]);

  // Calculate performance data for charts
  const performanceData = useMemo(() => {
    const areaPerformance = Object.entries(clientNeedsData).map(([area, data]) => ({
      name: area,
      score: Math.round((data.correct / data.total) * 100)
    }));

    return {
      labels: areaPerformance.map(item => item.name),
      datasets: [{
        label: 'Score (%)',
        data: areaPerformance.map(item => item.score),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
      }]
    };
  }, [clientNeedsData]);

  // Calculate question type distribution
  const distributionData = useMemo(() => {
    const typeCount: Record<string, number> = {};
    testData.questions.forEach(question => {
      const type = question.statistics.questionType;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return {
      labels: Object.keys(typeCount),
      datasets: [{
        data: Object.values(typeCount),
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(96, 165, 250, 0.4)',
          'rgba(147, 197, 253, 0.3)'
        ],
        borderWidth: 0
      }]
    };
  }, [testData]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'results':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl md:rounded-2xl p-4 md:p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-bold text-blue-900">Test Results</h2>
                  <p className="text-blue-700 mb-4">Test ID: {testData.testId}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Duration: {testData.elapsedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Questions: {testStatistics.totalQuestions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Marked: {testData.markedQuestions.length}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-blue-900">{testStatistics.overallScore}%</div>
                  <div className="text-sm text-blue-700">Overall Score</div>
                </div>
              </div>
            </div>

            <SearchAndFilter 
              showSubTopics={showSubTopics}
              setShowSubTopics={setShowSubTopics}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filter={filter}
              setFilter={setFilter}
            />

            <ResultsTable 
              questions={testData.questions}
              scores={testData.scores}
              markedQuestions={testData.markedQuestions}
              showSubTopics={showSubTopics}
              searchTerm={searchTerm}
              filter={filter}
            />
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl md:rounded-2xl p-4 md:p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-bold text-blue-900">Performance Analysis</h2>
                  <p className="text-blue-700 mb-4">Test ID: {testData.testId}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Correct: {testStatistics.correctAnswers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Partially Correct: {testStatistics.partiallyCorrect}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Incorrect: {testStatistics.incorrectAnswers}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-blue-900">{testStatistics.overallScore}%</div>
                  <div className="text-sm text-blue-700">Overall Score</div>
                </div>
              </div>
            </div>

            <PerformanceView 
              questions={testData.questions}
              scores={testData.scores}
              clientNeedsData={clientNeedsData}
              correctAnswers={testStatistics.correctAnswers}
              partiallyCorrect={testStatistics.partiallyCorrect}
              overallScore={testStatistics.overallScore}
            />
          </div>
        );

      case 'statistics':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl md:rounded-2xl p-4 md:p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-bold text-blue-900">Statistics</h2>
                  <p className="text-blue-700 mb-4">Test ID: {testData.testId}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Question Types: {Object.keys(distributionData.labels).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Topics: {Object.keys(clientNeedsData).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">Sub-topics: {Object.values(clientNeedsData).reduce((acc, curr) => acc + Object.keys(curr.topics).length, 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-blue-900">{testStatistics.totalQuestions}</div>
                  <div className="text-sm text-blue-700">Total Questions</div>
                </div>
              </div>
            </div>

            <StatisticsView 
              performanceData={performanceData}
              distributionData={distributionData}
              clientNeedsData={clientNeedsData}
              correctAnswers={testStatistics.correctAnswers}
              partiallyCorrect={testStatistics.partiallyCorrect}
              overallScore={testStatistics.overallScore}
            />
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <ResultsTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            testId={testData.testId}
          />
        </div>

        <div className="p-4 md:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TestResults;