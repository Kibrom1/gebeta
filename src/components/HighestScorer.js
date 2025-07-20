import React from 'react';
import { Trophy } from 'lucide-react';

const HighestScorer = ({ highestScorer }) => (
  highestScorer ? (
    <div className="mb-4 p-3 bg-yellow-100 rounded-lg border-l-4 border-yellow-400 font-bold text-lg flex items-center gap-2">
      <Trophy className="text-yellow-500" size={24} />
      Highest Scorer: {highestScorer.name} ({highestScorer.score} seeds)
    </div>
  ) : null
);

export default HighestScorer;
