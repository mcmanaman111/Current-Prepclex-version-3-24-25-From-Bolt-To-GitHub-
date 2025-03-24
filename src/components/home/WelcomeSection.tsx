import React from 'react';
import { Zap, Settings } from 'lucide-react';
import ExamCountdownCard from './ExamCountdownCard';

interface Props {
  onCreateTest: () => void;
  onQuickStart: () => void;
}

const WelcomeSection = ({ onCreateTest, onQuickStart }: Props) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Hey Sara, let's create your practice test! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose to start right away with our Quick Start option, or customize your test by selecting specific question types and topics below.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onQuickStart}
            className="bg-[#2B3467] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#232952] transition-colors flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Quick Start
          </button>
          <button
            onClick={onCreateTest}
            className="bg-white text-[#2B3467] border-2 border-[#2B3467] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Create Custom Test
          </button>
        </div>
      </div>
      <div className="lg:w-1/3 min-w-[300px]">
        <ExamCountdownCard />
      </div>
    </div>
  );
};

export default WelcomeSection;