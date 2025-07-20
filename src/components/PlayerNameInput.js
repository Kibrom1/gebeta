import React from 'react';
import PlayerAvatar from './PlayerAvatar';

const PlayerNameInput = ({ playerNames, handleNameChange, handleStartGame }) => (
  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex flex-col gap-4 items-center w-full max-w-lg mx-auto">
    <h3 className="font-bold mb-2 text-center text-lg">Enter Player Names</h3>
    <div className="flex flex-col sm:flex-row gap-4 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-1 w-full">
        <PlayerAvatar player={1} name={playerNames[1]} />
        <input
          type="text"
          placeholder="Player 1 Name"
          value={playerNames[1]}
          onChange={e => handleNameChange(1, e.target.value)}
          className="px-3 py-3 rounded border-2 border-blue-300 focus:outline-none shadow w-full text-base"
        />
      </div>
      <div className="flex flex-col items-center gap-1 w-full">
        <PlayerAvatar player={2} name={playerNames[2]} />
        <input
          type="text"
          placeholder="Player 2 Name"
          value={playerNames[2]}
          onChange={e => handleNameChange(2, e.target.value)}
          className="px-3 py-3 rounded border-2 border-red-300 focus:outline-none shadow w-full text-base"
        />
      </div>
      <button
        onClick={handleStartGame}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow w-full sm:w-auto text-lg"
        style={{ minHeight: '48px', minWidth: '120px' }}
      >
        Start Game
      </button>
    </div>
  </div>
);

export default PlayerNameInput;
