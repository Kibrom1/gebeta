import React from 'react';
import { Trophy } from 'lucide-react';

const GameEndPanel = ({ winner, playerNames, board, resetGame }) => (
  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg text-center border-2 border-yellow-400 shadow-lg">
    <Trophy className="mx-auto mb-2 text-yellow-600" size={32} />
    <h3 className="text-2xl font-bold text-gray-800 mb-2">
      {winner === 0 ? 'Game Tied!' : `${playerNames[winner] || `Player ${winner}`} Wins!`}
    </h3>
    <p className="text-gray-700 mb-4">
      Final Score: {playerNames[1] || 'Player 1'}: {board.player1Store} | {playerNames[2] || 'Player 2'}: {board.player2Store}
    </p>
    <button
      onClick={resetGame}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow"
    >
      Play Again
    </button>
  </div>
);

export default GameEndPanel;
