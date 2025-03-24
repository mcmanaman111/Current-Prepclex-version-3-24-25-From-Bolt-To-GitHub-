import React from 'react';
import { Clock, BookOpen, Flag, Target } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  testId: string;
  elapsedTime: string;
  totalQuestions: number;
  markedQuestions: number;
  overallScore: number;
}

const TestOverview = ({ testId, elapsedTime, totalQuestions, markedQuestions, overallScore }: Props) => {
  const scoreData = {
    datasets: [{
      data: [overallScore, 100 - overallScore],
      backgroundColor: [
        'rgba(255, 255, 255, 0.9)',
        'rgba(255, 255, 255, 0.1)'
      ],
      borderWidth: 0,
      cutout: '85%'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1a237e] to-[#0d47a1] rounded-xl md:rounded-2xl p-4 md:p-8 text-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-8">
        <div>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Test Results</h1>
          </div>
          <p className="text-blue-100 mb-4">Test ID: {testId}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Duration: {elapsedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Questions: {totalQuestions}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              <span>Marked: {markedQuestions}</span>
            </div>
          </div>
        </div>
        <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
          <Doughnut data={scoreData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold">{overallScore}%</div>
            <div className="text-sm text-blue-200">Overall Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestOverview;