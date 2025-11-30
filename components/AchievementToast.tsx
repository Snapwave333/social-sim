
import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { Trophy, Star, Zap, Heart, X } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    // Auto close after 4 seconds
    const closeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
    }, 4000);

    return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
    };
  }, [onClose]);

  const getIcon = () => {
      switch(achievement.icon) {
          case 'star': return <Star className="text-yellow-400 fill-current" size={24} />;
          case 'zap': return <Zap className="text-teal fill-current" size={24} />;
          case 'heart': return <Heart className="text-pink-400 fill-current" size={24} />;
          default: return <Trophy className="text-amber-400 fill-current" size={24} />;
      }
  }

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="bg-dark-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-neon flex items-center gap-4 max-w-sm">
        <div className="p-3 bg-neon/10 rounded-full">
            {getIcon()}
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-neon text-sm uppercase tracking-wider">Achievement Unlocked!</h4>
            <p className="font-bold text-lg leading-tight">{achievement.title}</p>
            <p className="text-gray-300 text-xs mt-1">{achievement.description}</p>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-white/20 pl-4">
            <span className="font-bold text-neon">+{achievement.xpReward}</span>
            <span className="text-[10px] uppercase text-gray-400">XP</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
