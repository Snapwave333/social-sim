
import React, { useEffect, useState } from 'react';

interface ContextTagProps {
  label: string;
  trigger: any; // Changing this prop triggers the animation
}

const ContextTag: React.FC<ContextTagProps> = ({ label, trigger }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reset animation
    setVisible(false);
    const frame1 = requestAnimationFrame(() => {
        setVisible(true);
    });
    
    // Auto hide after 3 seconds
    const timer = setTimeout(() => {
        setVisible(false);
    }, 3000);

    return () => {
        cancelAnimationFrame(frame1);
        clearTimeout(timer);
    };
  }, [trigger, label]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 md:right-8 z-50 animate-glitch origin-right">
      <div className="bg-deep border-2 border-white text-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider shadow-hard flex items-center gap-2">
        <span className="w-2 h-2 bg-electric animate-pulse"></span>
        [{label}]
      </div>
    </div>
  );
};

export default ContextTag;
