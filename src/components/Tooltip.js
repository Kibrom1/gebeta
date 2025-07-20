import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, text }) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);

  // Close tooltip on outside tap (mobile)
  useEffect(() => {
    if (!visible) return;
    const handleClick = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener('touchstart', handleClick);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [visible]);

  return (
    <span
      className="relative group"
      tabIndex={0}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onClick={() => setVisible((v) => !v)}
      ref={tooltipRef}
      aria-label={text}
      role="button"
    >
      {children}
      {visible && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded bg-gray-800 text-white text-sm shadow-lg z-10 whitespace-nowrap min-w-[80px] text-center">
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
