
import React from 'react';
import { ChatMessage } from '../types';
import { User, Terminal } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  partnerName: string;
  avatarUrl: string;
  avatarVideoUrl?: string;
  isLatestModelMessage?: boolean;
  isSpeaking?: boolean;
  isLoading?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
    message, 
    partnerName, 
    avatarUrl, 
    isLatestModelMessage, 
    isSpeaking,
    isLoading
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        flex max-w-[90%] md:max-w-[75%] 
        ${isUser ? 'flex-row-reverse' : 'flex-row'} 
        items-end gap-0 
        animate-snap-in 
        ${isUser ? 'origin-bottom-right' : 'origin-bottom-left'}
        will-change-transform
      `}>
        
        {/* Avatar Block */}
        <div className={`w-14 h-14 border-4 border-white flex-shrink-0 relative overflow-hidden bg-deep z-10 ${isUser ? 'ml-[-4px]' : 'mr-[-4px]'}`}>
          {isUser ? (
            <div className="w-full h-full bg-cyan flex items-center justify-center">
              <User size={28} className="text-black" strokeWidth={2.5} />
            </div>
          ) : (
            <>
                <img 
                    src={avatarUrl} 
                    alt={partnerName} 
                    className="w-full h-full object-cover filter grayscale contrast-125"
                />
                {isSpeaking && isLatestModelMessage && (
                     <div className="absolute inset-0 bg-acid/40 animate-pulse" />
                )}
            </>
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
            {/* Name Tag */}
            {!isUser && (
                <div className="self-start bg-white text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest mb-[-4px] z-20 relative ml-4">
                    {partnerName}
                </div>
            )}

            <div className={`
                p-6 border-4 border-white shadow-hard-white relative z-0 min-w-[120px]
                ${isUser 
                    ? 'bg-acid text-black' 
                    : 'bg-deep text-white'
                }
            `}>
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center h-4">
                    <div className="w-3 h-3 bg-white animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-white animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 bg-white animate-bounce"></div>
                  </div>
                  <span className="font-mono text-[10px] tracking-widest opacity-60 animate-pulse">PROCESSING...</span>
                </div>
              ) : (
                <p className="font-mono text-sm md:text-base font-bold leading-relaxed whitespace-pre-wrap">
                    {message.text}
                </p>
              )}
            </div>
            
            {/* Internal Thought - Brutalist Style */}
            {!isUser && !isLoading && message.internalThought && (
               <div className="mt-2 ml-1 border-l-4 border-white pl-3 py-1 opacity-70 hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase mb-1 text-gray-300">
                    <Terminal size={12} />
                    <span>Processing Logic...</span>
                 </div>
                 <p className="font-mono text-xs italic text-gray-400">
                    "{message.internalThought}"
                 </p>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
