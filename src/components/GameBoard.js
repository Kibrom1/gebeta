import React, { memo } from 'react';
import Tooltip from './Tooltip';
import { getHousePosition, getStorePosition } from '../utils/gameUtils';

const GameBoard = ({
  board,
  currentPlayer,
  selectedHouse,
  isAnimating,
  computerSelectedHouse,
  playerNames,
  nameInputVisible,
  movingSeed,
  movePath,
  moveAnimationStep,
  onHouseClick,
  renderSeeds
}) => {
  const handlePitClick = (houseIndex, player) => {
    if ((player === 1 && currentPlayer === 1) || (player === 2 && currentPlayer === 2)) {
      onHouseClick(houseIndex, player);
    }
  };

  return (
    <div
      className="bg-amber-300 p-2 sm:p-6 rounded-xl shadow-inner overflow-x-auto w-full flex flex-col items-center"
      style={{ background: 'repeating-linear-gradient(135deg, #fbbf24 0px, #fbbf24 2px, #fff3c4 2px, #fff3c4 32px)' }}
      role="region"
      aria-label="Gebeta game board"
      tabIndex={0}
      aria-describedby="game-instructions"
    >
      <div id="game-instructions" className="sr-only">
        Gebeta game board. Each player has 6 houses and 1 store. Click on a house to move seeds counter-clockwise. 
        The goal is to capture seeds in your store. Player 1 is at the bottom, Player 2 is at the top.
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-4 gap-2">
        {/* Player 2 Store */}
        <div
          className="w-20 sm:w-24 h-20 sm:h-32 bg-red-200 rounded-lg shadow-lg flex flex-col items-center justify-center relative border-4 border-red-400 mb-2 sm:mb-0 shrink-0 text-base sm:text-lg"
          aria-label="Player 2 Store"
          tabIndex={0}
        >
          <div className={`font-bold mb-1 text-white ${currentPlayer === 2 ? 'animate-flash' : ''}`}>
            {playerNames[2] || (!nameInputVisible ? 'Computer' : 'Player 2')}
          </div>
          {renderSeeds(board.player2Store, getStorePosition(2))}
        </div>

        {/* Playing Field */}
        <div className="flex-1 mx-2 sm:mx-6 min-w-[320px] max-w-full flex flex-col gap-4">
          {/* Player 2 Houses (top row) */}
          <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-4 justify-center flex-wrap w-full" role="group" aria-label="Player 2 Houses">
            {board.player2Houses.slice().reverse().map((seeds, idx) => {
              const actualIndex = 5 - idx;
              const houseId = getHousePosition(2, actualIndex);
              const isSelectedP2 = selectedHouse && selectedHouse.player === 2 && selectedHouse.house === actualIndex;
              const canSelectP2 = currentPlayer === 2 && seeds > 0 && !isAnimating;
              const isComputerFlash = computerSelectedHouse === actualIndex && currentPlayer === 2 && playerNames[2] === '';
              
              return (
                <Tooltip key={`p2-${actualIndex}`} text={`House ${actualIndex + 1}`}>
                  <div
                    id={houseId}
                    disabled={currentPlayer !== 2}
                    className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl shadow-md cursor-pointer transition-all relative border-2 flex items-center justify-center
                      ${isSelectedP2 ? 'border-red-500 bg-red-200 animate-flash' :
                        canSelectP2 ? 'border-red-400 bg-red-100 hover:bg-red-200' :
                        'border-red-300 bg-red-50'}
                      ${isComputerFlash ? 'animate-flash' : ''}
                      ${currentPlayer !== 2 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => handlePitClick(actualIndex, 2)}
                    style={{ margin: '4px' }}
                    aria-label={`Player 2 House ${actualIndex + 1}`}
                    tabIndex={canSelectP2 ? 0 : -1}
                    role="button"
                    onKeyDown={e => {
                      if (canSelectP2 && (e.key === 'Enter' || e.key === ' ')) {
                        handlePitClick(actualIndex, 2);
                      }
                    }}
                  >
                    {renderSeeds(seeds, houseId)}
                  </div>
                </Tooltip>
              );
            })}
          </div>

          {/* Player 1 Houses (bottom row) */}
          <div className="flex gap-2 sm:gap-4 justify-center flex-wrap w-full" role="group" aria-label="Player 1 Houses">
            {board.player1Houses.map((seeds, idx) => {
              const houseId = getHousePosition(1, idx);
              const isSelectedP1 = selectedHouse && selectedHouse.player === 1 && selectedHouse.house === idx;
              const canSelectP1 = currentPlayer === 1 && seeds > 0 && !isAnimating;
              
              return (
                <Tooltip key={`p1-${idx}`} text={`House ${idx + 1}`}>
                  <div
                    id={houseId}
                    disabled={currentPlayer !== 1}
                    className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl shadow-md cursor-pointer transition-all relative border-2 flex items-center justify-center
                      ${isSelectedP1 ? 'border-blue-500 bg-blue-200 animate-flash' :
                        canSelectP1 ? 'border-blue-400 bg-blue-100 hover:bg-blue-200' :
                        'border-blue-300 bg-blue-50'}
                      ${currentPlayer !== 1 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => handlePitClick(idx, 1)}
                    style={{ margin: '4px' }}
                    aria-label={`Player 1 House ${idx + 1}`}
                    tabIndex={canSelectP1 ? 0 : -1}
                    role="button"
                    onKeyDown={e => {
                      if (canSelectP1 && (e.key === 'Enter' || e.key === ' ')) {
                        handlePitClick(idx, 1);
                      }
                    }}
                  >
                    {renderSeeds(seeds, houseId)}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Player 1 Store */}
        <div
          className="w-20 sm:w-24 h-20 sm:h-32 bg-blue-200 rounded-lg shadow-lg flex flex-col items-center justify-center relative border-4 border-blue-400 mt-2 sm:mt-0 shrink-0 text-base sm:text-lg"
          aria-label="Player 1 Store"
          tabIndex={0}
        >
          <div className={`font-bold mb-1 text-white ${currentPlayer === 1 ? 'animate-flash' : ''}`}>
            {playerNames[1] || 'Player 1'}
          </div>
          {renderSeeds(board.player1Store, getStorePosition(1))}
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="w-full text-center mt-2 mb-2" aria-live="polite">
        <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg shadow-lg ${currentPlayer === 1 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'} animate-flash`}>
          {currentPlayer === 1 ? `${playerNames[1] || 'Player 1'}'s Turn` : `${playerNames[2] || (!nameInputVisible ? 'Computer' : 'Player 2')}'s Turn`}
        </span>
      </div>
    </div>
  );
};

export default memo(GameBoard);
