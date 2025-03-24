import React from 'react';
import { Database } from 'lucide-react';

interface QBankCardProps {
  total: number;
  used: number;
  unused: number;
}

const QBankCard = ({ total, used, unused }: QBankCardProps) => {
  return (
    <div className="bg-gradient-to-b from-[#1a237e] to-[#0d47a1] rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-white" />
        <h3 className="text-xl font-semibold text-white">Question Bank</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white">Total Questions: {total}</span>
        </div>
        <div className="h-4 flex rounded-full overflow-hidden bg-white/20">
          <div 
            className="bg-blue-400" 
            style={{ width: `${(used / total) * 100}%` }} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200">Available</p>
            <p className="font-semibold text-white">{unused}</p>
          </div>
          <div>
            <p className="text-blue-200">Used</p>
            <p className="font-semibold text-white">{used}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QBankCard;