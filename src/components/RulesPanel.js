import React from 'react';

const RulesPanel = () => (
  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
    <h3 className="font-bold mb-2">Gebeta Rules:</h3>
    <ul className="text-sm space-y-1 list-disc list-inside">
      <li>Each player starts with 4 seeds in each of their 6 houses</li>
      <li>Players take turns picking up all seeds from one of their houses</li>
      <li>Seeds are distributed counter-clockwise, one per house</li>
      <li>If the last seed lands in your store, you get another turn</li>
      <li>If the last seed lands in an empty house on your side, you capture all seeds from the opposite house</li>
      <li>Game ends when one player has no seeds in their houses</li>
      <li>The player with the most seeds in their store wins!</li>
    </ul>
  </div>
);

export default RulesPanel;
