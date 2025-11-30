
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { User, BrainCircuit } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  partnerName: string;
  avatarUrl: string;
  avatarVideoUrl?: string;
  isLatestModelMessage?: boolean;
  isSpeaking?: boolean;
  animationSpeed?: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
    message, 
    partnerName, 
    avatarUrl, 
    avatarVideoUrl, 
    isLatestModelMessage, 
    isSpeaking
}) => {
  const isUser = message.role === 'user';
  
  // Video State
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // Priority: Idle Video Loop (if available, not error) -> Static AI Generated Image
  const showVideoLoop = avatarVideoUrl && !videoError;

  return (
    <div className={`flex w-full mb-6 animate-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        
        {/* Avatar Container */}
        <div className="flex-shrink-0 relative">
          {isUser ? (
            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-primary-light shadow-lg border border-dark-600">
              <User size={20} />
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-full shadow-lg border-2 border-dark-800 overflow-hidden relative bg-dark-700 transition-transform duration-100 ${isSpeaking && isLatestModelMessage ? 'ring-2 ring-neon ring-offset-2 ring-offset-dark-900' : ''}`}>
                 
                 {showVideoLoop ? (
                    <>
                        {isVideoLoading && (
                            <div className="absolute inset-0 bg-dark-800 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <video 
                            src={avatarVideoUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            onLoadedData={() => setIsVideoLoading(false)}
                            onError={(e) => {
                                console.error("Video avatar failed to load", e);
                                setVideoError(true);
                                setIsVideoLoading(false);
                            }}
                            className={`w-full h-full object-cover will-change-transform ${isVideoLoading ? 'opacity-0' : 'opacity-100'}`}
                        />
                    </>
                 ) : (
                    // High Quality Static Image Rendering
                    <>
                        <img 
                            src={avatarUrl} 
                            alt={partnerName} 
                            className={`w-full h-full object-cover`}
                        />
                        {/* Subtle Glow Pulse when Speaking */}
                        {isSpeaking && isLatestModelMessage && (
                             <div className="absolute inset-0 bg-neon/30 animate-pulse mix-blend-overlay" />
                        )}
                    </>
                 )}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-1">
            <div className={`px-5 py-3 rounded-2xl shadow-md text-sm md:text-base leading-relaxed relative border
              ${isUser 
                ? 'bg-primary text-white rounded-br-none border-primary' 
                : 'bg-dark-800 text-gray-200 rounded-bl-none border-dark-700'
              }`}>
              {message.text}
            </div>
            
            {/* Internal Thought (Visible for Model messages if present) */}
            {!isUser && message.internalThought && (
               <div className="text-xs text-gray-500 italic ml-2 flex items-center gap-1">
                 <BrainCircuit size={12} className="text-primary-light" />
                 <span>Thought: "{message.internalThought}"</span>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
