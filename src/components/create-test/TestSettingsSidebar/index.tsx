import React from 'react';
import { Brain, Clock, Sparkles } from 'lucide-react';
import Toggle from '../../ui/Toggle';
import QBankStats from './QBankStats';

interface TestSettingsSidebarProps {
  tutorMode: boolean;
  timer: boolean;
  ngn: boolean;
  onTutorModeChange: (value: boolean) => void;
  onTimerChange: (value: boolean) => void;
  onNGNChange: (value: boolean) => void;
  qbankStats: {
    total: number;
    used: number;
    unused: number;
  };
}

const TestSettingsSidebar = ({
  tutorMode,
  timer,
  ngn,
  onTutorModeChange,
  onTimerChange,
  onNGNChange,
  qbankStats
}: TestSettingsSidebarProps) => {
  return (
    <div className="w-80 min-h-screen bg-gradient-to-b from-[#1a237e] to-[#0d47a1] text-white p-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Test Settings</h2>
          <p className="text-blue-200 text-sm">Configure your practice test</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold">Mode Settings</h3>
            </div>
            <div className="space-y-6">
              <Toggle
                label="Tutor Mode"
                tooltip="Get detailed explanations after each question"
                icon={Brain}
                value={tutorMode}
                onChange={onTutorModeChange}
              />

              <Toggle
                label="Timer"
                tooltip="Set time limits for each question"
                icon={Clock}
                value={timer}
                onChange={onTimerChange}
              />

              <Toggle
                label="NGN Questions"
                tooltip="Include Next Generation NCLEX style questions"
                icon={Sparkles}
                value={ngn}
                onChange={onNGNChange}
              />
            </div>
          </div>

          <QBankStats {...qbankStats} />
        </div>
      </div>
    </div>
  );
};

export default TestSettingsSidebar;