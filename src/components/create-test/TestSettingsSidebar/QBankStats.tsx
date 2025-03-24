import React from 'react';
import { Database } from 'lucide-react';

interface QBankStatsProps {
  total: number;
  used: number;
  unused: number;
}

const QBankStats = ({ total, used, unused }: QBankStatsProps) => {
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-5 h-5" />
        <h3 className="font-semibold">Question Bank</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Questions:</span>
          <span className="font-semibold">{total}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-400" 
            style={{ width: `${(unused / total) * 100}%` }} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200">Available</p>
            <p className="font-semibold">{unused}</p>
          </div>
          <div>
            <p className="text-blue-200">Used</p>
            <p className="font-semibold">{used}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QBankStats;