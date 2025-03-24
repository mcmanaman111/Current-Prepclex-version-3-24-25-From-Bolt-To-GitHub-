import React from 'react';
import { GraduationCap, Timer } from 'lucide-react';
import Toggle from './Toggle';

interface TestSettingsProps {
  tutorMode: boolean;
  setTutorMode: (value: boolean) => void;
  timer: boolean;
  setTimer: (value: boolean) => void;
}

const TestSettings: React.FC<TestSettingsProps> = ({
  tutorMode,
  setTutorMode,
  timer,
  setTimer
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#2B3467]">Select Test Settings:</h3>
      <div className="bg-white border-2 border-blue-100 rounded-xl p-6">
        <div className="flex justify-around">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#2B3467]" />
              <p className="text-[#2B3467] font-medium">Tutor Mode</p>
            </div>
            <Toggle value={tutorMode} onChange={setTutorMode} />
          </div>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Timer className="w-5 h-5 text-[#2B3467]" />
              <p className="text-[#2B3467] font-medium">Timer</p>
            </div>
            <Toggle value={timer} onChange={setTimer} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestSettings;