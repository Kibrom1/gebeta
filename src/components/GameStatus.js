import React, { memo } from 'react';
import { Users } from 'lucide-react';

const GameStatus = ({ 
  board, 
  playerNames, 
  nameInputVisible, 
  gameStatus, 
  winner 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
      {/* Player 1 Score */}
      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex flex-col items-center">
        <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
          <Users size={16} />
          {playerNames[1] || 'Player 1'}
        </div>
        <div className="font-bold text-base sm:text-lg">{board.player1Store}</div>
      </div>
      
      {/* Player 2 Score */}
      <div className="bg-red-100 p-2 sm:p-3 rounded-lg flex flex-col items-center">
        <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
          <Users size={16} />
          {playerNames[2] || (!nameInputVisible ? 'Computer' : 'Player 2')}
        </div>
        <div className="font-bold text-base sm:text-lg">{board.player2Store}</div>
      </div>
      
      {/* Game Status */}
      <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg flex flex-col items-center">
        <div className="text-xs sm:text-sm text-gray-600">Game Status</div>
        <div className="font-bold text-base sm:text-lg">
          {gameStatus === 'ended' ? (
            winner === 0 ? 'Tie!' : `${playerNames[winner] || (winner === 2 ? 'Computer' : `Player ${winner}`)} Wins!`
          ) : 'Playing'}
        </div>
      </div>
    </div>
  );
};

export default memo(GameStatus);
