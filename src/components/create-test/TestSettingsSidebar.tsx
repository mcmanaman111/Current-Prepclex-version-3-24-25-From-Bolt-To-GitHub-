import React from 'react';
import { Brain, Clock, Database, Settings, Sparkles, HelpCircle } from 'lucide-react';
import Toggle from '../modals/CreateTestModal/Toggle';
import Tooltip from '../ui/Tooltip';

interface Props {
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
    omitted: number;
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
}: Props) => {
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
              <Settings className="w-5 h-5" />
              <h3 className="font-semibold">Mode Settings</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-200" />
                  <label className="text-sm text-blue-200">Tutor Mode</label>
                  <Tooltip content="Get detailed explanations after each question">
                    <HelpCircle className="w-4 h-4 text-blue-200/60 cursor-help" />
                  </Tooltip>
                </div>
                <Toggle value={tutorMode} onChange={onTutorModeChange} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-200" />
                  <label className="text-sm text-blue-200">Timer</label>
                  <Tooltip content="Set time limits for each question">
                    <HelpCircle className="w-4 h-4 text-blue-200/60 cursor-help" />
                  </Tooltip>
                </div>
                <Toggle value={timer} onChange={onTimerChange} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <label className="text-sm text-blue-200">NGN Questions</label>
                  <Tooltip content="Include Next Generation NCLEX style questions">
                    <HelpCircle className="w-4 h-4 text-blue-200/60 cursor-help" />
                  </Tooltip>
                </div>
                <Toggle value={ngn} onChange={onNGNChange} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5" />
              <h3 className="font-semibold">Question Bank</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Questions:</span>
                <span className="font-semibold">{qbankStats.total}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400" 
                  style={{ width: `${(qbankStats.unused / qbankStats.total) * 100}%` }} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">Available</p>
                  <p className="font-semibold">{qbankStats.unused}</p>
                </div>
                <div>
                  <p className="text-blue-200">Used</p>
                  <p className="font-semibold">{qbankStats.used}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSettingsSidebar;