import React from 'react';
import PlayerAvatar from './PlayerAvatar';

const GameResultsTable = ({ gameResults }) => (
  <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow border border-gray-200">
    <h4 className="font-bold mb-2">Game Results History</h4>
    <div className="text-sm max-h-40 overflow-y-auto">
      {gameResults.length === 0 ? (
        <div className="text-gray-500">No games played yet.</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pr-2">Date</th>
              <th className="pr-2">Player 1</th>
              <th className="pr-2">Score</th>
              <th className="pr-2">Player 2</th>
              <th className="pr-2">Score</th>
              <th className="pr-2">Winner</th>
            </tr>
          </thead>
          <tbody>
            {gameResults.map((res, idx) => (
              <tr key={idx} className="border-b hover:bg-yellow-50 transition-colors">
                <td className="pr-2 text-xs">{res.date}</td>
                <td className="pr-2 flex items-center gap-1"><PlayerAvatar player={1} name={res.player1} size={24} /> {res.player1}</td>
                <td className="pr-2">{res.score1}</td>
                <td className="pr-2 flex items-center gap-1"><PlayerAvatar player={2} name={res.player2} size={24} /> {res.player2}</td>
                <td className="pr-2">{res.score2}</td>
                <td className="pr-2 font-bold">{res.winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

export default GameResultsTable;
