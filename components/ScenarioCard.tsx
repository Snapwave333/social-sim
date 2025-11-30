
import React, { useState } from 'react';
import { Scenario, Difficulty, Category } from '../types';
import { MessageCircle, Heart, Briefcase, ArrowRight, Lock, Split, RotateCcw } from 'lucide-react';
import { generateScenarioBreakdown } from '../services/geminiService';
import { triggerHaptic } from '../utils/haptics';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
  userLevel: number;
  apiKey?: string | null;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect, userLevel, apiKey }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [breakdownSteps, setBreakdownSteps] = useState<string[] | null>(null);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

  const isLocked = (scenario.requiredLevel || 1) > userLevel;

  const getBgColor = () => {
     switch (scenario.difficulty) {
        case Difficulty.Beginner: return 'bg-acid';
        case Difficulty.Intermediate: return 'bg-cyan';
        case Difficulty.Advanced: return 'bg-hot';
        default: return 'bg-white';
     }
  };

  const handleBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    
    if (!isFlipped) {
        if (!breakdownSteps && apiKey) {
            setIsLoadingSteps(true);
            const steps = await generateScenarioBreakdown(apiKey, scenario);
            setBreakdownSteps(steps);
            setIsLoadingSteps(false);
        } else if (!breakdownSteps) {
            // Fallback if no API key
            setBreakdownSteps(["Connect API Key", "To Enable", "AI Analysis"]);
        }
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full h-[450px] group perspective-1000">
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT FACE */}
        <div 
          className={`absolute inset-0 backface-hidden w-full h-full transition-all duration-200 ${isLocked ? 'opacity-50 grayscale' : 'hover:-translate-y-2 hover:translate-x-1'}`}
          onClick={() => !isLocked && onSelect(scenario)}
        >
          {/* SHADOW BLOCK */}
          <div className="absolute inset-0 bg-white translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-200 pointer-events-none"></div>

          {/* MAIN CARD */}
          <div className="relative w-full h-full data-stream-border bg-deep flex flex-col overflow-hidden">
            
            {/* HEADER BAR */}
            <div className="h-12 border-b-4 border-white flex items-center justify-between px-4 bg-deep shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                </div>
                <div className="font-mono text-xs font-bold uppercase tracking-tighter text-white">
                    ID: {scenario.id.substring(0, 8)}
                </div>
            </div>

            {/* IMAGE SECTION */}
            <div className="h-1/2 w-full relative border-b-4 border-white overflow-hidden group-hover:contrast-125 transition-all">
                <img 
                    src={scenario.avatarUrl} 
                    alt={scenario.partnerName} 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                <div className={`absolute bottom-0 left-0 ${getBgColor()} border-t-4 border-r-4 border-white px-4 py-1`}>
                    <span className="font-display font-black text-lg uppercase text-black">{scenario.category}</span>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="flex-grow p-5 flex flex-col justify-between bg-deep relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 invert"></div>
                
                <div>
                    <h3 className="font-display text-3xl leading-none mb-1 uppercase text-white line-clamp-2">
                        {scenario.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-white text-black px-2 py-0.5 font-mono text-xs font-bold uppercase">
                            {scenario.partnerName}
                        </span>
                        <span className="font-mono text-xs font-bold uppercase border border-white text-white px-2 py-0.5">
                            {scenario.difficulty}
                        </span>
                    </div>
                </div>

                {/* ACTION FOOTER */}
                <div className="pt-4 border-t-2 border-white border-dashed mt-2 flex gap-2">
                    {!isLocked ? (
                        <>
                            <button className="flex-grow py-3 bg-white text-black font-mono font-bold text-sm uppercase hover:bg-acid hover:text-black transition-colors border-2 border-transparent hover:border-white flex items-center justify-between px-4">
                                <span>Initiate</span>
                                <ArrowRight size={18} />
                            </button>
                            <button 
                                onClick={handleBreakdown}
                                className="w-12 bg-deep border-2 border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                                title="Break Down Scenario"
                            >
                                <Split size={20} />
                            </button>
                        </>
                    ) : (
                        <div className="w-full py-3 bg-dark-800 text-gray-500 font-mono font-bold text-sm uppercase flex items-center justify-center gap-2 border-2 border-gray-600 border-dashed">
                            <Lock size={16} />
                            Level {scenario.requiredLevel} Req.
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* BACK FACE (Breakdown) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-deep border-4 border-white shadow-hard-white p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-white">
                <h3 className="font-display text-2xl uppercase text-white">Tac-Ops Breakdown</h3>
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} className="text-white hover:text-acid"><RotateCcw size={24} /></button>
            </div>
            
            <div className="flex-grow flex flex-col justify-center gap-6">
                {isLoadingSteps ? (
                    <div className="text-center font-mono text-acid animate-pulse">Analyzing Scenario Logic...</div>
                ) : breakdownSteps ? (
                    breakdownSteps.map((step, idx) => (
                        <div key={idx} className="bg-dark-800 border-2 border-white p-4 relative group">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-acid border-2 border-black flex items-center justify-center font-display text-black">
                                {idx + 1}
                            </div>
                            <p className="font-mono text-lg text-white font-bold ml-2">{step}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-white font-mono">Error generating breakdown.</div>
                )}
            </div>
            
            <div className="mt-auto pt-6 text-center">
                 <p className="font-mono text-xs text-gray-400 uppercase">Micro-steps to prevent executive freeze.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
