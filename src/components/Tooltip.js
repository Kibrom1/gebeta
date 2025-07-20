import React from 'react';

const Tooltip = ({ children, text }) => (
  <span className="relative group">
    {children}
    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
      {text}
    </span>
  </span>
);

export default Tooltip;
