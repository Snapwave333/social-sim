
import React from 'react';
import { ChatMessage } from '../types';
import { Terminal, Activity, AlertTriangle, MessageSquare } from 'lucide-react';

interface FeedbackPanelProps {
  lastModelMessage?: ChatMessage;
  rapportScore: number;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ lastModelMessage, rapportScore }) => {
  if (!lastModelMessage || !lastModelMessage.analysis) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 border-4 border-white border-dashed opacity-50 text-white">
            <Terminal size={48} className="mb-4" />
            <p className="font-mono text-sm uppercase">Awaiting Data Stream...</p>
        </div>
    );
  }

  const { analysis } = lastModelMessage;
  
  // Brutalist Score Meter
  const getScoreColor = () => {
      if (rapportScore > 70) return 'bg-acid';
      if (rapportScore < 30) return 'bg-hazard text-white';
      return 'bg-yellow-400';
  };

  return (
    <div className="flex flex-col gap-6 text-white">
      
      {/* RAPPORT METER */}
      <div className="border-4 border-white p-4 shadow-hard-white bg-deep">
          <div className="flex justify-between items-end mb-2">
              <h3 className="font-display text-xl uppercase">Rapport</h3>
              <span className="font-mono text-2xl font-bold">{rapportScore}%</span>
          </div>
          <div className="w-full h-6 border-4 border-white bg-dark-800 relative">
              <div 
                className={`h-full ${getScoreColor()} transition-all duration-500`} 
                style={{width: `${rapportScore}%`}}
              ></div>
              {/* Grid lines on bar */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20"></div>
          </div>
      </div>

      {/* ANALYSIS BLOCK */}
      <div className="border-4 border-white bg-deep">
          <div className="bg-white text-black px-3 py-1 font-mono text-xs font-bold uppercase flex items-center gap-2">
              <Activity size={14} /> Tone Analysis
          </div>
          <div className="p-4">
              <div className="font-display text-2xl uppercase mb-1">{analysis.tone}</div>
          </div>
      </div>

      {/* COACH BLOCK */}
      <div className="border-4 border-white bg-deep shadow-hard-white relative">
          <div className="bg-acid text-black px-3 py-1 font-mono text-xs font-bold uppercase border-b-4 border-white flex items-center gap-2">
              <MessageSquare size={14} /> Coach Protocol
          </div>
          <div className="p-4 font-mono text-sm leading-relaxed text-gray-200">
              {analysis.feedback}
          </div>
      </div>

      {/* CUES BLOCK */}
      {analysis.socialCues && analysis.socialCues.length > 0 && (
          <div className="border-4 border-white bg-dark-900 text-white p-4">
              <h4 className="font-display text-lg uppercase mb-3 text-cyan border-b-2 border-white/20 pb-1">Detected Signals</h4>
              <ul className="space-y-2">
                  {analysis.socialCues.map((cue, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-mono text-xs">
                          <span className="text-acid mt-0.5">>></span>
                          <span>{cue}</span>
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
