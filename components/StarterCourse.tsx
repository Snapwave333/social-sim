
import React, { useState } from 'react';
import { STARTER_QUIZ } from '../constants';
import { BookOpen, CheckCircle, XCircle, ArrowRight, Award, RefreshCcw, SkipForward } from 'lucide-react';

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

  if (showResult) {
    const passed = score >= 4; // 80% passing grade
    return (
      <div className="bg-dark-800 rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center border border-dark-700">
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ${passed ? 'bg-teal/20 text-teal' : 'bg-red-500/20 text-red-500'}`}>
           {passed ? <Award size={48} /> : <XCircle size={48} />}
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
            {passed ? "Course Completed!" : "Keep Practicing"}
        </h2>
        
        <p className="text-gray-400 mb-8 text-lg">
            {passed 
                ? "You've demonstrated a solid understanding of social fundamentals. You are ready for the simulations." 
                : "You need a score of at least 4/5 to pass the academy. Review the concepts and try again!"}
        </p>

        <div className="text-4xl font-bold text-primary mb-8">
            {score} / {STARTER_QUIZ.length}
        </div>

        {passed ? (
            <button 
                onClick={onComplete}
                className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
                Enter Simulation & Unlock Scenarios
            </button>
        ) : (
            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleRetry}
                    className="w-full py-4 bg-dark-700 text-white font-bold text-lg rounded-xl hover:bg-dark-600 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCcw size={20} />
                    Retake Quiz
                </button>
                <button 
                    onClick={onComplete}
                    className="text-gray-500 hover:text-gray-300 text-sm py-2"
                >
                    Skip and enter anyway (Not recommended)
                </button>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-3xl shadow-2xl max-w-2xl w-full border border-dark-700 overflow-hidden flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="bg-dark-900 p-6 text-white border-b border-dark-700">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 mb-2">
                <BookOpen size={24} className="text-primary" />
                <h2 className="text-xl font-bold">Social Skills 101 Academy</h2>
            </div>
            <button 
                onClick={onComplete} 
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded bg-dark-800 border border-dark-700"
            >
                Skip <SkipForward size={12} />
            </button>
        </div>
        <p className="text-gray-400 text-sm">Question {currentQuestionIdx + 1} of {STARTER_QUIZ.length}</p>
        
        <div className="w-full bg-dark-700 h-2 rounded-full mt-4 overflow-hidden">
            <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-grow flex flex-col bg-dark-800">
        {/* Context/Lesson */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-gray-300 text-sm leading-relaxed">
            <span className="font-bold uppercase text-xs tracking-wider block mb-1 text-primary-light">Lesson</span>
            {question.context}
        </div>

        <h3 className="text-xl font-bold text-white mb-6 leading-snug">
            {question.question}
        </h3>

        <div className="space-y-3 mb-8">
            {question.options.map(option => {
                let statusClass = "border-dark-700 bg-dark-900 hover:border-primary/50 text-gray-300";
                let icon = null;

                if (isAnswered) {
                    if (selectedOption === option.id) {
                        if (option.isCorrect) {
                            statusClass = "border-teal bg-teal/10 text-teal";
                            icon = <CheckCircle size={20} className="text-teal" />;
                        } else {
                            statusClass = "border-red-500 bg-red-500/10 text-red-500";
                            icon = <XCircle size={20} className="text-red-500" />;
                        }
                    } else if (option.isCorrect) {
                        // Show correct answer even if not selected
                        statusClass = "border-teal/30 bg-teal/5 text-teal opacity-70";
                    } else {
                        statusClass = "opacity-30 border-dark-700 bg-dark-900";
                    }
                }

                return (
                    <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${statusClass}`}
                    >
                        <span className="font-medium">{option.text}</span>
                        {icon}
                    </button>
                );
            })}
        </div>

        {/* Explanation & Next Button */}
        {isAnswered && (
            <div className="mt-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className={`p-4 rounded-xl mb-4 ${
                    question.options.find(o => o.id === selectedOption)?.isCorrect 
                    ? 'bg-teal/10 text-teal border border-teal/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                    <p className="text-sm font-semibold">
                        {question.options.find(o => o.id === selectedOption)?.explanation}
                    </p>
                </div>
                
                <button 
                    onClick={handleNext}
                    className="w-full py-3 bg-white text-dark-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                    {currentQuestionIdx === STARTER_QUIZ.length - 1 ? "Finish Quiz" : "Next Question"}
                    <ArrowRight size={20} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default StarterCourse;
