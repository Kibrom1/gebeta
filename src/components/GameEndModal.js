import React from 'react';
import { Trophy } from 'lucide-react';

const GameEndModal = ({ 
  gameStatus, 
  winner, 
  playerNames, 
  board, 
  onPlayAgain, 
  onExit 
}) => {
  if (gameStatus !== 'ended') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="p-8 bg-white rounded-2xl shadow-2xl border-4 border-yellow-400 text-center max-w-md mx-auto">
        <Trophy className="mx-auto mb-2 text-yellow-600" size={40} />
        <h3 className="text-3xl font-bold text-gray-800 mb-2">
          {winner === 0 ? 'Game Tied!' : `${playerNames[winner] || (winner === 2 ? 'Computer' : `Player ${winner}`)} Wins!`}
        </h3>
        <p className="text-gray-700 mb-4 text-lg">
          Final Score: {playerNames[1] || 'Player 1'}: {board.player1Store} | {playerNames[2] || 'Player 2'}: {board.player2Store}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onPlayAgain}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow text-lg"
          >
            Play Again
          </button>
          <button
            onClick={onExit}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-bold shadow text-lg"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
