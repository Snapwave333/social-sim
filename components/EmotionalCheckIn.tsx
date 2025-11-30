
import React, { useState } from 'react';
import { MoodLog } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface EmotionalCheckInProps {
  onComplete: (mood: MoodLog) => void;
  onSkip: () => void;
}

const EMOJIS = ['😫', '😕', '😐', '🙂', '🤩'];
const TAGS = ['Overwhelmed', 'Anxious', 'Bored', 'Focused', 'Excited', 'Tired'];

const EmotionalCheckIn: React.FC<EmotionalCheckInProps> = ({ onComplete, onSkip }) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    triggerHaptic('light');
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedEmoji) return;
    triggerHaptic('medium');
    onComplete({
        timestamp: Date.now(),
        emoji: selectedEmoji,
        tag: tag
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-void/90 flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-deep border-4 border-white shadow-hard-white p-6 animate-snap-in">
           <h3 className="font-display text-2xl uppercase text-white mb-2 text-center">System Check</h3>
           <p className="font-mono text-xs text-gray-400 text-center mb-6 uppercase border-b-2 border-white/20 pb-4">Calibrate Emotional Sensors</p>

           {!selectedEmoji ? (
               <div className="grid grid-cols-5 gap-2 mb-6">
                   {EMOJIS.map(emoji => (
                       <button 
                         key={emoji}
                         onClick={() => handleEmojiSelect(emoji)}
                         className="text-4xl hover:scale-125 transition-transform p-2 bg-dark-800 border-2 border-transparent hover:border-white rounded-lg"
                       >
                           {emoji}
                       </button>
                   ))}
               </div>
           ) : (
               <div className="space-y-4 mb-6">
                   <div className="text-center text-6xl mb-4 animate-bounce">{selectedEmoji}</div>
                   <div className="grid grid-cols-2 gap-3">
                       {TAGS.map(tag => (
                           <button
                             key={tag}
                             onClick={() => handleTagSelect(tag)}
                             className="py-3 border-2 border-white text-white hover:bg-acid hover:text-black font-mono font-bold uppercase text-sm transition-colors"
                           >
                               {tag}
                           </button>
                       ))}
                   </div>
               </div>
           )}

           <button onClick={onSkip} className="w-full py-2 text-gray-500 font-mono text-xs uppercase hover:text-white">
               Skip Diagnostics
           </button>
       </div>
    </div>
  );
};

export default EmotionalCheckIn;
