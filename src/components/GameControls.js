import React, { memo } from 'react';
import { RotateCcw, Info, Link2, Loader2 } from 'lucide-react';
import Tooltip from './Tooltip';

const GameControls = ({
  onlineMode,
  setOnlineMode,
  onlineStatus,
  gameId,
  setGameId,
  onlineError,
  onCreateGame,
  onJoinGame,
  onResetGame,
  onToggleRules,
  showRules
}) => {
  return (
    <div className="mb-2 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full items-start">
      {/* Left: Online Play & Status */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
          <Tooltip text="Play with someone online in real time">
            <button
              className={`px-2 sm:px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 sm:gap-2 shadow transition-colors ${onlineMode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
              onClick={() => setOnlineMode(!onlineMode)}
              aria-pressed={onlineMode}
            >
              <Link2 size={18} />
              {onlineMode ? 'Online Mode Enabled' : 'Play Online'}
            </button>
          </Tooltip>
          {onlineMode && (
            <span className="text-green-700 text-xs sm:text-sm font-semibold flex items-center gap-1">
              <Loader2 className="animate-spin" size={16} />
              {onlineStatus === 'idle' ? 'Ready' : onlineStatus === 'waiting' ? 'Waiting for opponent...' : 'Connected'}
            </span>
          )}
        </div>
        
        {/* Game ID and Status - only for online mode */}
        {onlineMode && (
          <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start mt-2">
            {onlineStatus === 'idle' && (
              <>
                <button
                  className="bg-green-500 text-white px-2 sm:px-3 py-1.5 rounded-lg font-bold shadow hover:bg-green-600"
                  onClick={onCreateGame}
                >
                  Create Game
                </button>
                <input
                  type="text"
                  placeholder="Game ID"
                  value={gameId}
                  onChange={e => setGameId(e.target.value)}
                  className="px-2 py-1.5 rounded border border-blue-300 focus:outline-none shadow w-24 sm:w-auto"
                  aria-label="Game ID to join"
                />
                <button
                  className="bg-blue-500 text-white px-2 sm:px-3 py-1.5 rounded-lg font-bold shadow hover:bg-blue-600"
                  onClick={() => onJoinGame(gameId)}
                >
                  Join Game
                </button>
                {onlineError && (
                  <div className="text-red-600 mt-1" role="alert">
                    {onlineError}
                  </div>
                )}
              </>
            )}
            {onlineStatus === 'waiting' && (
              <div className="text-green-700 font-mono text-xs sm:text-sm">
                Game ID: <span className="font-bold">{gameId}</span>
              </div>
            )}
            {onlineStatus === 'playing' && (
              <div className="text-green-700 font-mono text-xs sm:text-sm">
                Connected | Game ID: <span className="font-bold">{gameId}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Rules & New Game Controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end">
          <Tooltip text="View game rules">
            <button
              onClick={onToggleRules}
              className="bg-blue-500 text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 sm:gap-2 shadow text-xs sm:text-base"
              aria-pressed={showRules}
            >
              <Info size={16} />
              Rules
            </button>
          </Tooltip>
          <Tooltip text="Restart the game">
            <button
              onClick={onResetGame}
              className="bg-green-600 text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 shadow text-xs sm:text-base"
            >
              <RotateCcw size={16} />
              New Game
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default memo(GameControls);
