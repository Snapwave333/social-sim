
import React from 'react';
import { ChatMessage } from '../types';
import { Info, TrendingUp, AlertCircle, Smile } from 'lucide-react';

interface FeedbackPanelProps {
  lastModelMessage?: ChatMessage;
  rapportScore: number;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ lastModelMessage, rapportScore }) => {
  if (!lastModelMessage || !lastModelMessage.analysis) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 bg-dark-800/50 rounded-xl border-2 border-dashed border-dark-700">
            <Info size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Start chatting to receive real-time social coaching and analysis.</p>
        </div>
    );
  }

  const { analysis } = lastModelMessage;
  
  let scoreColor = 'text-gray-400';
  if (rapportScore > 70) scoreColor = 'text-teal';
  else if (rapportScore < 30) scoreColor = 'text-red-400';
  else scoreColor = 'text-yellow-400';

  return (
    <div className="bg-dark-800 rounded-2xl shadow-xl border border-dark-700 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-dark-700 bg-dark-900/50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <TrendingUp size={18} className="text-neon" />
          Live Coaching
        </h3>
        <div className={`font-bold text-lg ${scoreColor}`}>
          Rapport: {rapportScore}%
        </div>
      </div>
      
      <div className="p-5 flex-grow overflow-y-auto space-y-6">
        
        {/* Tone Analysis */}
        <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Partner's Mood</h4>
            <div className="flex items-center gap-2 text-gray-200 bg-dark-900 p-3 rounded-xl border border-dark-700">
                <Smile size={20} className="text-primary-light" />
                <span className="font-medium">{analysis.tone}</span>
            </div>
        </div>

        {/* Coach Feedback */}
        <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Coach's Feedback</h4>
            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-sm text-gray-300 leading-relaxed">
                    {analysis.feedback}
                </p>
            </div>
        </div>

        {/* Social Cues */}
        {analysis.socialCues && analysis.socialCues.length > 0 && (
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Observed Cues</h4>
                <ul className="space-y-2">
                    {analysis.socialCues.map((cue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                            <AlertCircle size={14} className="mt-1 text-neon shrink-0" />
                            <span>{cue}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}

      </div>
      
      <div className="p-4 bg-dark-900 text-xs text-center text-gray-600 border-t border-dark-700">
        AI analysis may vary. Use your best judgment.
      </div>
    </div>
  );
};

export default FeedbackPanel;
