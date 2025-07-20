import React from 'react';
import { User } from 'lucide-react';

const AVATAR_COLORS = ['bg-blue-400', 'bg-red-400'];

const PlayerAvatar = ({ player, name, size = 40 }) => (
  <div
    className={`rounded-full flex items-center justify-center shadow-lg border-2 ${AVATAR_COLORS[player-1]}`}
    style={{ width: size, height: size }}
    title={name || `Player ${player}`}
  >
    <User className="text-white" size={size * 0.6} />
  </div>
);

export default PlayerAvatar;
