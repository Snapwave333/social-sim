
import React, { useState } from 'react';
import { Scenario, Difficulty, Category } from '../types';
import { MessageCircle, Heart, Briefcase, ArrowRight, Lock, RotateCw, Info } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
  userLevel: number;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect, userLevel }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isLocked = (scenario.requiredLevel || 1) > userLevel;

  const getIcon = () => {
    switch (scenario.category) {
      case Category.Dating: return <Heart className="text-pink-400" size={24} />;
      case Category.Professional: return <Briefcase className="text-blue-400" size={24} />;
      default: return <MessageCircle className="text-neon" size={24} />;
    }
  };

  const getDifficultyColor = () => {
    switch (scenario.difficulty) {
      case Difficulty.Beginner: return 'text-teal';
      case Difficulty.Intermediate: return 'text-yellow-400';
      case Difficulty.Advanced: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`group relative w-full h-[400px] perspective-1000 transition-all duration-300 ${isLocked ? 'opacity-70 grayscale-[0.5]' : 'hover:-translate-y-2'}`}
      onClick={() => !isLocked && !isFlipped && onSelect(scenario)}
    >
      <div className={`relative w-full h-full text-left transition-transform duration-700 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT FACE */}
        <div className="absolute inset-0 bg-dark-800 rounded-3xl backface-hidden flex flex-col overflow-hidden border border-dark-700 group-hover:border-primary/50">
           {/* Avatar Background Image */}
           <div className="h-2/3 w-full relative">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-800/20 to-dark-800 z-10"></div>
               <img src={scenario.avatarUrl} alt={scenario.partnerName} className="w-full h-full object-cover" />
               
               {/* Category Badge */}
               <div className="absolute top-4 left-4 z-20 bg-dark-900/80 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg">
                   {getIcon()}
               </div>

                {/* Flip Button */}
               <button 
                  onClick={handleFlip}
                  className="absolute top-4 right-4 z-20 bg-dark-900/80 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg text-white hover:bg-primary transition-colors"
               >
                   <Info size={20} />
               </button>
           </div>
           
           <div className="h-1/3 p-6 flex flex-col justify-between relative z-20">
              <div>
                  <h3 className="text-2xl font-bold text-white leading-tight mb-1">{scenario.title}</h3>
                  <p className="text-primary-light font-medium">{scenario.partnerName}</p>
              </div>
              
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <span className={`text-xs font-bold uppercase tracking-wider ${getDifficultyColor()}`}>
                         {scenario.difficulty}
                     </span>
                     {isLocked && <Lock size={14} className="text-gray-400" />}
                 </div>
                 {!isLocked && (
                     <div className="text-neon flex items-center gap-1 font-bold text-sm">
                         Tap to Start <ArrowRight size={16} />
                     </div>
                 )}
              </div>
           </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 bg-dark-900 rounded-3xl backface-hidden rotate-y-180 p-8 flex flex-col border-2 border-primary/30 relative overflow-hidden">
            {/* Decor */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon/20 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-dark-800 p-2 rounded-lg border border-dark-700">
                    {getIcon()}
                </div>
                <button 
                  onClick={handleFlip}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                    <RotateCw size={20} />
                </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 relative z-10">{scenario.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 relative z-10 flex-grow">
                {scenario.description}
            </p>

            <div className="space-y-4 relative z-10">
                <div className="bg-dark-800 p-3 rounded-xl border border-dark-700">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Scenario Goal</p>
                    <p className="text-sm text-teal">Practice conversation flow and reading cues.</p>
                </div>

                {!isLocked ? (
                    <button 
                        onClick={() => onSelect(scenario)}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Start Simulation
                    </button>
                ) : (
                    <div className="w-full py-3 bg-dark-800 text-gray-500 font-bold rounded-xl border border-dark-700 flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock size={16} />
                        Locked (Lvl {scenario.requiredLevel})
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ScenarioCard;
