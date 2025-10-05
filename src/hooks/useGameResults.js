import { useState, useCallback } from 'react';

export const useGameResults = () => {
  const [gameResults, setGameResults] = useState([]);
  const [highestScorer, setHighestScorer] = useState(null);

  const saveGameResult = useCallback((result) => {
    const newResults = [...gameResults, result];
    setGameResults(newResults);
    
    // Find highest scorer
    let maxScore = -1;
    let maxPlayer = '';
    
    newResults.forEach(r => {
      if (r.score1 > maxScore) {
        maxScore = r.score1;
        maxPlayer = r.player1;
      }
      if (r.score2 > maxScore) {
        maxScore = r.score2;
        maxPlayer = r.player2;
      }
    });
    
    setHighestScorer({ name: maxPlayer, score: maxScore });
  }, [gameResults]);

  const clearResults = useCallback(() => {
    setGameResults([]);
    setHighestScorer(null);
  }, []);

  return {
    gameResults,
    highestScorer,
    saveGameResult,
    clearResults
  };
};
