
import React, { useState } from 'react';
import { STARTER_QUIZ } from '../constants';
import { BookOpen, Check, X, ArrowRight, Award, SkipForward, AlertTriangle } from 'lucide-react';

interface StarterCourseProps {
  onComplete: () => void;
}

const StarterCourse: React.FC<StarterCourseProps> = ({ onComplete }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = STARTER_QUIZ[currentQuestionIdx];
  const progress = ((currentQuestionIdx) / STARTER_QUIZ.length) * 100;

  const handleOptionClick = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
    setIsAnswered(true);
    
    const option = question.options.find(o => o.id === optionId);
    if (option && option.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < STARTER_QUIZ.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  // RESULT SCREEN
  if (showResult) {
    const passed = score >= 4;
    return (
      <div className="bg-deep border-4 border-white shadow-hard-white max-w-2xl w-full p-8 text-center relative overflow-hidden text-white">
        <div className={`absolute inset-0 opacity-10 ${passed ? 'bg-acid' : 'bg-hazard'} pattern-dots`}></div>
        
        <div className={`w-32 h-32 mx-auto border-4 border-white flex items-center justify-center mb-6 shadow-hard-white ${passed ? 'bg-acid text-black' : 'bg-hazard text-white'}`}>
           {passed ? <Award size={64} strokeWidth={3} /> : <X size={64} strokeWidth={3} />}
        </div>
        
        <h2 className="font-display text-5xl mb-4 uppercase tracking-tighter">
            {passed ? "CERTIFIED" : "FAILURE"}
        </h2>
        
        <p className="font-mono text-lg mb-8 max-w-md mx-auto text-gray-300">
            {passed 
                ? "Social Protocol Downloaded. You are cleared for simulation." 
                : "Protocol match below threshold (80%). Retraining required."}
        </p>

        <div className="font-display text-6xl mb-8">
            {score}/{STARTER_QUIZ.length}
        </div>

        <div className="space-y-4">
            {passed ? (
                <button 
                    onClick={onComplete}
                    className="w-full py-5 bg-white text-black font-display text-xl uppercase hover:bg-acid hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-hard-white transition-all border-2 border-transparent"
                >
                    ENTER SIMULATION
                </button>
            ) : (
                <>
                    <button 
                        onClick={handleRetry}
                        className="w-full py-4 bg-deep border-4 border-white font-display text-xl uppercase hover:bg-dark-800 shadow-hard-white transition-all active:translate-y-1 active:shadow-none"
                    >
                        RETRY SEQUENCE
                    </button>
                    <button 
                        onClick={onComplete}
                        className="w-full py-2 text-gray-500 font-mono text-sm underline hover:text-white uppercase"
                    >
                        Force Entry (Skip)
                    </button>
                </>
            )}
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  return (
    <div className="bg-deep border-4 border-white shadow-hard-white max-w-3xl w-full flex flex-col min-h-[600px] relative text-white">
      
      {/* HEADER */}
      <div className="bg-white text-black p-6 border-b-4 border-white flex justify-between items-center">
        <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-black" />
            <h2 className="font-display text-2xl uppercase tracking-wider">Protocol Training</h2>
        </div>
        
        {/* BIG SKIP BUTTON */}
        <button 
            onClick={onComplete} 
            className="group flex items-center gap-2 bg-hazard text-white px-4 py-2 border-2 border-black hover:bg-black hover:text-white font-mono font-bold uppercase text-sm transition-colors"
        >
            Skip Lesson <SkipForward size={16} />
        </button>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-4 border-b-4 border-white bg-dark-800">
        <div 
            className="h-full bg-acid border-r-4 border-white transition-all duration-300 ease-out" 
            style={{ width: `${Math.max(5, progress)}%` }}
        ></div>
      </div>

      {/* CONTENT */}
      <div className="p-8 flex-grow flex flex-col relative z-10">
        
        {/* LESSON BOX */}
        <div className="bg-dark-800 border-l-8 border-white p-6 mb-8">
            <span className="font-mono font-bold text-xs bg-white text-black px-2 py-1 mb-2 inline-block">THEORY_0{currentQuestionIdx + 1}</span>
            <p className="font-mono text-sm md:text-base leading-relaxed whitespace-pre-line text-gray-300">
                {question.context}
            </p>
        </div>

        <h3 className="font-display text-2xl md:text-3xl mb-8 leading-tight">
            {question.question}
        </h3>

        {/* OPTIONS */}
        <div className="space-y-4 mb-8">
            {question.options.map(option => {
                let stateStyles = "bg-deep border-white text-white hover:bg-dark-800 hover:translate-x-1 hover:-translate-y-1 hover:shadow-hard-white";
                let icon = null;

                if (isAnswered) {
                    if (selectedOption === option.id) {
                        if (option.isCorrect) {
                            stateStyles = "bg-acid border-white shadow-hard-white text-black";
                            icon = <Check size={24} strokeWidth={4} />;
                        } else {
                            stateStyles = "bg-hazard text-white border-white shadow-hard-white";
                            icon = <X size={24} strokeWidth={4} />;
                        }
                    } else if (option.isCorrect) {
                        stateStyles = "bg-deep border-white opacity-50 border-dashed text-gray-400";
                    } else {
                        stateStyles = "bg-deep border-white opacity-30 grayscale text-gray-500";
                    }
                }

                return (
                    <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        disabled={isAnswered}
                        className={`w-full text-left p-6 border-4 transition-all duration-100 flex items-center justify-between group ${stateStyles}`}
                    >
                        <span className="font-bold font-mono text-lg">{option.text}</span>
                        {icon}
                    </button>
                );
            })}
        </div>

        {/* FOOTER ACTION */}
        {isAnswered && (
            <div className="mt-auto animate-snap-in">
                <div className={`p-4 border-4 border-white mb-4 font-mono font-bold text-sm ${
                    question.options.find(o => o.id === selectedOption)?.isCorrect 
                    ? 'bg-acid text-black' 
                    : 'bg-white text-black'
                }`}>
                    <span className="block uppercase text-xs mb-1 opacity-70">Analysis:</span>
                    {question.options.find(o => o.id === selectedOption)?.explanation}
                </div>
                
                <button 
                    onClick={handleNext}
                    className="w-full py-4 bg-cyan border-4 border-white font-display text-xl uppercase text-black hover:bg-white transition-colors shadow-hard-white active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
                >
                    {currentQuestionIdx === STARTER_QUIZ.length - 1 ? "FINALIZE" : "NEXT SEQUENCE"}
                    <ArrowRight size={24} strokeWidth={3} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default StarterCourse;
