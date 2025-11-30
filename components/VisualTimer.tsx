
import React, { useEffect, useState } from 'react';

interface VisualTimerProps {
  durationMinutes: number;
  onComplete?: () => void;
  isActive: boolean;
}

const VisualTimer: React.FC<VisualTimerProps> = ({ durationMinutes, onComplete, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
        if (onComplete) onComplete();
        return;
    }

    const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const percentage = (timeLeft / (durationMinutes * 60)) * 100;
  const isCritical = percentage < 20;

  return (
    <div className="w-full max-w-xs h-8 bg-dark-900 border-4 border-white relative overflow-hidden" title="Focus Timer">
       {/* Fill Block */}
       <div 
         className={`h-full transition-all duration-1000 ease-linear ${isCritical ? 'bg-hot animate-pulse' : 'bg-acid'}`}
         style={{ width: `${percentage}%` }}
       ></div>
       
       {/* Grid Overlay */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-30"></div>
       
       {/* Text */}
       <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-black mix-blend-hard-light">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
       </div>
    </div>
  );
};

export default VisualTimer;
