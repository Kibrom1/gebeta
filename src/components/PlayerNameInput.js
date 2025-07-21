import React, { useState } from 'react';
import PlayerAvatar from './PlayerAvatar';

const PlayerNameInput = ({ playerNames, handleNameChange, handleStartGame }) => {
  const [collapsed, setCollapsed] = useState(true);

  // Limit name to 10 characters
  const handleLimitedNameChange = (player, value) => {
    handleNameChange(player, value.slice(0, 10));
  };

  return (
    <div className="mb-4 w-full max-w-xs mx-auto">
      <button
        className={`w-full px-3 py-2 rounded-lg font-bold shadow text-base bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-2`}
        onClick={() => setCollapsed(v => !v)}
        aria-expanded={!collapsed}
        style={{ minHeight: '40px' }}
      >
        {collapsed ? 'Player Name Entry' : 'Player Name Entry'}
      </button>
      {!collapsed && (
        <div className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex flex-col gap-2 items-center">
          <div className="flex flex-col gap-2 w-full items-center justify-center">
            {/* Player 1 avatar to the left of its name field */}
            <div className="flex flex-row items-center gap-3 w-full">
              <PlayerAvatar player={1} name={playerNames[1]} size={56} />
              <input
                type="text"
                placeholder="Player 1 Name"
                value={playerNames[1]}
                onChange={e => handleLimitedNameChange(1, e.target.value)}
                className="px-2 py-2 rounded border-2 border-blue-300 focus:outline-none shadow w-full text-base"
                maxLength={10}
              />
            </div>
            {/* Player 2 avatar to the left of its name field */}
            <div className="flex flex-row items-center gap-3 w-full">
              <PlayerAvatar player={2} name={playerNames[2]} size={56} />
              <input
                type="text"
                placeholder="Player 2 Name"
                value={playerNames[2]}
                onChange={e => handleLimitedNameChange(2, e.target.value)}
                className="px-2 py-2 rounded border-2 border-red-300 focus:outline-none shadow w-full text-base"
                maxLength={10}
              />
            </div>
            <button
              onClick={handleStartGame}
              className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 font-bold shadow text-base"
              style={{ minHeight: '32px', minWidth: '0', width: 'auto', alignSelf: 'center' }}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerNameInput;
