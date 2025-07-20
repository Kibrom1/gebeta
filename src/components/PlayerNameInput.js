import React from 'react';
import PlayerAvatar from './PlayerAvatar';

const PlayerNameInput = ({ playerNames, handleNameChange, handleStartGame }) => (
  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex flex-col md:flex-row gap-4 items-center">
    <h3 className="font-bold mb-2 md:mb-0">Enter Player Names</h3>
    <div className="flex gap-4 items-center">
      <div className="flex flex-col items-center gap-1">
        <PlayerAvatar player={1} name={playerNames[1]} />
        <input
          type="text"
          placeholder="Player 1 Name"
          value={playerNames[1]}
          onChange={e => handleNameChange(1, e.target.value)}
          className="px-3 py-2 rounded border border-blue-300 focus:outline-none shadow"
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <PlayerAvatar player={2} name={playerNames[2]} />
        <input
          type="text"
          placeholder="Player 2 Name"
          value={playerNames[2]}
          onChange={e => handleNameChange(2, e.target.value)}
          className="px-3 py-2 rounded border border-red-300 focus:outline-none shadow"
        />
      </div>
      <button
        onClick={handleStartGame}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold shadow"
      >
        Start Game
      </button>
    </div>
  </div>
);

export default PlayerNameInput;
