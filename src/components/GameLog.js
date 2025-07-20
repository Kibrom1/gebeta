import React from 'react';
import { Play } from 'lucide-react';

const GameLog = ({ gameLog }) => (
  <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow border border-gray-200">
    <h4 className="font-bold mb-2 flex items-center gap-2">
      <Play size={16} />
      Game Log
    </h4>
    <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
      {gameLog.map((log, idx) => (
        <div key={idx} className="text-gray-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: idx % 2 === 0 ? '#60a5fa' : '#f87171' }}></span>
          {log}
        </div>
      ))}
    </div>
  </div>
);

export default GameLog;
