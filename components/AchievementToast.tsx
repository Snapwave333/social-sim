
import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { Trophy, Star, Zap, Heart } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    const closeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    }, 4000);
    return () => { clearTimeout(timer); clearTimeout(closeTimer); };
  }, [onClose]);

  const getIcon = () => {
      switch(achievement.icon) {
          case 'star': return <Star className="text-black" size={24} strokeWidth={3} />;
          case 'zap': return <Zap className="text-black" size={24} strokeWidth={3} />;
          case 'heart': return <Heart className="text-black" size={24} strokeWidth={3} />;
          default: return <Trophy className="text-black" size={24} strokeWidth={3} />;
      }
  }

  return (
    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90'}`}>
      <div className="bg-acid border-4 border-white p-0 shadow-hard-white flex max-w-sm w-full relative overflow-hidden">
        {/* Decorative Strip */}
        <div className="w-12 bg-white border-r-4 border-white flex items-center justify-center">
            {getIcon()}
        </div>
        
        <div className="p-4 flex-grow bg-acid">
            <div className="font-mono text-[10px] font-bold uppercase mb-1 tracking-widest bg-black text-white inline-block px-1">Unlock Code: {achievement.id}</div>
            <h4 className="font-display text-xl uppercase leading-none mb-1 text-black">{achievement.title}</h4>
            <p className="font-mono text-xs font-bold text-black">{achievement.description}</p>
        </div>

        <div className="bg-black text-white flex flex-col items-center justify-center px-4 border-l-4 border-white">
            <span className="font-display text-2xl text-cyan">+{achievement.xpReward}</span>
            <span className="font-mono text-[10px] uppercase">XP</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
