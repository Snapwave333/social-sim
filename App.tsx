
import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, UserCircle, Home, Brain, Sparkles, X, ChevronLeft, Volume2, GraduationCap, Book, RefreshCw } from 'lucide-react';
import ScenarioCard from './components/ScenarioCard';
import ChatBubble from './components/ChatBubble';
import FeedbackPanel from './components/FeedbackPanel';
import AchievementToast from './components/AchievementToast';
import StarterCourse from './components/StarterCourse';
import SensoryRegulator from './components/SensoryRegulator';
import ContextTag from './components/ContextTag';
import VisualTimer from './components/VisualTimer';
import EmotionalCheckIn from './components/EmotionalCheckIn';
import { USFLUGuide } from './components/USFLUModules';
import { SCENARIOS, ACHIEVEMENTS, XP_PER_LEVEL_BASE } from './constants';
import { Scenario, SimulationState, ChatMessage, PartnerGender, Difficulty, UserProgress, Achievement, SavedSession, MoodLog } from './types';
import { generateAIResponse, generateHint, generateCharacterImage, generateCharacterSpeech, decodeAudioData } from './services/geminiService';
import { getDailyWallpaper } from './services/wallpaperService';
import { triggerHaptic } from './utils/haptics';

type ViewMode = 'discovery' | 'profile' | 'chat' | 'settings';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [showKeyModal, setShowKeyModal] = useState(!process.env.API_KEY);
  const [currentView, setCurrentView] = useState<ViewMode>('discovery');
  const [selectedScenarioForConfig, setSelectedScenarioForConfig] = useState<Scenario | null>(null);
  const [showUSFLUGuide, setShowUSFLUGuide] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  
  // New States
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);

  // Sensory State
  const [sensorySettings, setSensorySettings] = useState({ animationSpeed: 1.0, colorFilter: 'none', hapticsEnabled: true });

  // Apply sensory settings globally
  useEffect(() => {
    // Animation Speed
    const root = document.documentElement;
    document.body.className = ''; // Reset
    if (sensorySettings.colorFilter === 'calm') document.body.classList.add('filter-calm');
    if (sensorySettings.colorFilter === 'mono') document.body.classList.add('filter-mono');
  }, [sensorySettings]);

  // Wallpaper Init
  useEffect(() => {
    getDailyWallpaper().then(data => {
        if (data) {
            const el = document.getElementById('wallpaper-layer');
            if (el) el.style.backgroundImage = `url('${data.url}')`;
        }
    });
    // Check-in on startup roughly
    if (Math.random() > 0.7) setShowMoodCheckIn(true);
  }, []);

  // Gamification State
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
      const saved = localStorage.getItem('socialsim_progress');
      if (saved) return JSON.parse(saved);
      return {
          level: 1, currentXp: 0, xpToNextLevel: XP_PER_LEVEL_BASE, unlockedAchievements: [], 
          totalMessagesSent: 0, highestRapport: 50, sessionsCompleted: 0, tutorialCompleted: false, moodHistory: []
      };
  });
  const [prevLevel, setPrevLevel] = useState(userProgress.level);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  
  // Saved Sessions
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
      const saved = localStorage.getItem('socialsim_saves');
      return saved ? JSON.parse(saved) : [];
  });

  const [state, setState] = useState<SimulationState>({
    currentScenario: null, messages: [], rapportScore: 50, isTyping: false, showFeedback: true, apiKey: null
  });

  const [inputText, setInputText] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Persistence
  useEffect(() => { localStorage.setItem('socialsim_progress', JSON.stringify(userProgress)); }, [userProgress]);
  useEffect(() => { localStorage.setItem('socialsim_saves', JSON.stringify(savedSessions)); }, [savedSessions]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [state.messages, state.isTyping]);

  // Check for Level Up to trigger flicker
  useEffect(() => {
    if (userProgress.level > prevLevel) {
        // Level up happened
        setPrevLevel(userProgress.level);
    }
  }, [userProgress.level, prevLevel]);

  // Audio Init
  const initAudio = () => {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
  };

  const playResponseAudio = (base64Audio: string) => {
      if (!sensorySettings.hapticsEnabled) return;
      initAudio();
      if (!audioContextRef.current) return;
      try {
          const buffer = decodeAudioData(base64Audio, audioContextRef.current);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => setIsSpeaking(false);
          setIsSpeaking(true);
          source.start(0);
      } catch (e) { console.error("Audio playback failed", e); setIsSpeaking(false); }
  };

  // --- LOGIC HANDLERS ---
  const addXp = (amount: number) => {
      setUserProgress(prev => {
          let newXp = prev.currentXp + amount;
          let newLevel = prev.level;
          const needed = newLevel * XP_PER_LEVEL_BASE;
          if (newXp >= needed) { newXp -= needed; newLevel++; }
          return { ...prev, currentXp: newXp, level: newLevel };
      });
  };

  const checkAchievements = (trigger: 'message' | 'rapport' | 'session' | 'tutorial') => {
      const { totalMessagesSent, highestRapport, unlockedAchievements, sessionsCompleted } = userProgress;
      ACHIEVEMENTS.forEach(ach => {
          if (unlockedAchievements.includes(ach.id)) return;
          let unlocked = false;
          if (ach.id === 'first_step' && totalMessagesSent >= 1) unlocked = true;
          if (ach.id === 'smooth_operator' && highestRapport >= 90) unlocked = true;
          if (ach.id === 'graduate' && trigger === 'tutorial') unlocked = true;
          if (unlocked) {
              addXp(ach.xpReward);
              triggerHaptic('success');
              setUserProgress(prev => ({ ...prev, unlockedAchievements: [...prev.unlockedAchievements, ach.id] }));
              setActiveAchievement(ach);
          }
      });
  };

  const handleCompleteTutorial = () => {
      setShowTutorial(false);
      setUserProgress(prev => ({ ...prev, tutorialCompleted: true }));
      triggerHaptic('success');
      setTimeout(() => checkAchievements('tutorial'), 500);
  };

  const handleStartSimulation = async (gender: PartnerGender) => {
    if (!selectedScenarioForConfig) return;
    triggerHaptic('medium');
    initAudio();
    const activeScenario: Scenario = { ...selectedScenarioForConfig, gender: gender };
    setIsGeneratingImage(true);
    setSelectedScenarioForConfig(null);
    setCurrentView('chat');
    
    setState({
      ...state, currentScenario: activeScenario, rapportScore: 50, showFeedback: true,
      messages: [{ id: 'init', role: 'model', text: activeScenario.initialMessage, timestamp: Date.now(), analysis: { tone: 'Neutral', feedback: 'Start naturally.', score: 0, socialCues: [], suggestion: '' } }]
    });

    if (apiKey) {
        const generatedAvatar = await generateCharacterImage(apiKey, activeScenario);
        if (generatedAvatar) setState(prev => ({ ...prev, currentScenario: prev.currentScenario ? { ...prev.currentScenario, avatarUrl: generatedAvatar } : null }));
        const speech = await generateCharacterSpeech(apiKey, activeScenario.initialMessage, gender);
        if (speech) playResponseAudio(speech);
    }
    setIsGeneratingImage(false);
  };

  const handleReRoll = async () => {
      if (!state.currentScenario) return;
      triggerHaptic('medium');
      // Simply restart the current scenario for now, but in future could request a variation
      const gender = state.currentScenario.gender || 'male'; 
      setState({
        ...state, rapportScore: 50, showFeedback: true,
        messages: [{ id: 'init', role: 'model', text: state.currentScenario.initialMessage, timestamp: Date.now(), analysis: { tone: 'Neutral', feedback: 'Context Re-Rolled. Begin fresh.', score: 0, socialCues: [], suggestion: '' } }]
      });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !state.currentScenario || !apiKey) return;
    triggerHaptic('medium');
    initAudio();
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: Date.now() };
    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg], isTyping: true }));
    setInputText('');
    setHint(null);
    setUserProgress(p => ({ ...p, totalMessagesSent: p.totalMessagesSent + 1 }));
    addXp(10);
    checkAchievements('message');

    try {
      const response = await generateAIResponse(apiKey, [...state.messages, userMsg], state.currentScenario);
      const newRapport = Math.min(100, Math.max(0, state.rapportScore + response.analysis.score));
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.text, timestamp: Date.now(), internalThought: response.internalThought, analysis: response.analysis };
      setState(prev => ({ ...prev, messages: [...prev.messages, botMsg], rapportScore: newRapport, isTyping: false }));
      const speech = await generateCharacterSpeech(apiKey, response.text, state.currentScenario.gender);
      if (speech) playResponseAudio(speech);
      if (newRapport > userProgress.highestRapport) setUserProgress(p => ({ ...p, highestRapport: newRapport }));
      checkAchievements('rapport');
    } catch (error) { console.error(error); setState(prev => ({ ...prev, isTyping: false })); }
  };

  const handleGetHint = async () => {
      if(!state.currentScenario || !apiKey) return;
      triggerHaptic('light');
      setHint("Computing optimal social trajectory...");
      try { const hintText = await generateHint(apiKey, state.messages, state.currentScenario); setHint(hintText); } catch(e) { setHint("Hint Protocol Failed."); }
  };

  const handleMoodComplete = (mood: MoodLog) => {
    setUserProgress(prev => ({
        ...prev,
        moodHistory: [...prev.moodHistory, mood]
    }));
    setShowMoodCheckIn(false);
  };

  const resetSimulation = () => { 
      triggerHaptic('medium');
      setState({ ...state, currentScenario: null, messages: [], rapportScore: 50 }); 
      setIsSpeaking(false); 
      setCurrentView('discovery'); 
      // 20% chance to ask for mood check after session
      if(Math.random() > 0.8) setShowMoodCheckIn(true);
  };

  const handleCardClick = (scenario: Scenario) => {
    setSelectedScenarioForConfig(scenario);
  };

  // Helper for Context Tag Label
  const getContextLabel = () => {
    if (currentView === 'discovery') return "System_Ready";
    if (currentView === 'profile') return "User_Metrics";
    if (currentView === 'chat') return state.currentScenario ? `Sim_${state.currentScenario.difficulty}` : "Sim_Active";
    return "Menu";
  };

  const xpPercent = (userProgress.currentXp / (userProgress.level * XP_PER_LEVEL_BASE)) * 100;
  const isLevelingUp = userProgress.level > prevLevel;

  // --- COMPONENTS RENDER ---
  
  // API Key Modal
  if (showKeyModal) {
    return (
      <div className="fixed inset-0 bg-void flex items-center justify-center p-6 z-[100]">
        <div className="bg-deep border-4 border-white shadow-hard-white p-8 max-w-lg w-full">
            <h2 className="font-display text-4xl uppercase mb-2 text-white">AUTH_REQUIRED</h2>
            <p className="font-mono text-sm mb-6 border-l-4 border-acid pl-4 text-gray-300">Enter Gemini API Key to initialize the simulation engine.</p>
            <form onSubmit={(e) => { e.preventDefault(); if(apiKey) setShowKeyModal(false); }} className="space-y-4">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="PASTE_KEY_HERE" className="w-full p-4 bg-dark-800 border-4 border-white text-white font-mono focus:bg-dark-900 transition-colors outline-none focus-hum" />
                <button type="submit" disabled={!apiKey} className="w-full py-4 bg-white text-black font-display uppercase hover:bg-acid border-2 border-transparent hover:border-white transition-all">Connect System</button>
            </form>
        </div>
      </div>
    );
  }

  // Tutorial Overlay
  if (showTutorial) return (<div className="fixed inset-0 bg-void/90 z-[60] flex items-center justify-center p-4"><StarterCourse onComplete={handleCompleteTutorial} /></div>);

  // Partner Select Modal
  if (selectedScenarioForConfig) return (
      <div className="fixed inset-0 bg-void/90 z-[60] flex items-center justify-center p-4">
        <div className="bg-deep border-4 border-white shadow-hard-white p-8 max-w-2xl w-full relative">
            <button onClick={() => setSelectedScenarioForConfig(null)} className="absolute top-4 right-4 bg-white text-black p-2 hover:bg-hazard hover:text-white hover:border-white border-2 border-transparent"><X size={24} /></button>
            <h2 className="font-display text-3xl uppercase mb-6 text-center text-white">Select Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['male', 'female'].map(g => (
                    <button key={g} onClick={() => handleStartSimulation(g as PartnerGender)} className="border-4 border-white text-white p-8 hover:bg-acid hover:text-black hover:shadow-hard-white transition-all group">
                        <div className="font-display text-2xl uppercase">{g}</div>
                        <div className="font-mono text-xs mt-2 group-hover:underline">INITIATE &gt;</div>
                    </button>
                ))}
            </div>
        </div>
      </div>
  );

  return (
    <div className="h-screen w-full bg-void flex flex-col md:flex-row overflow-hidden relative">
      
      {/* OUT-OF-THE-BOX ELEMENTS */}
      <SensoryRegulator onSettingsChange={setSensorySettings} />
      <ContextTag label={getContextLabel()} trigger={currentView} />
      {showMoodCheckIn && <EmotionalCheckIn onComplete={handleMoodComplete} onSkip={() => setShowMoodCheckIn(false)} />}
      {showUSFLUGuide && <USFLUGuide onClose={() => setShowUSFLUGuide(false)} />}
      {activeAchievement && <AchievementToast achievement={activeAchievement} onClose={() => setActiveAchievement(null)} />}

      {/* --- SIDEBAR NAV --- */}
      <nav className="md:w-24 bg-deep border-r-4 border-white flex md:flex-col justify-between items-center py-4 md:py-8 fixed bottom-0 left-0 right-0 md:static z-40 h-20 md:h-full shrink-0 shadow-hard-white md:shadow-none">
          <div className="hidden md:flex flex-col items-center gap-2 mb-8">
              <div className="w-12 h-12 bg-white flex items-center justify-center text-black">
                  <Brain size={32} strokeWidth={2.5} />
              </div>
          </div>
          <div className="flex md:flex-col w-full justify-around md:justify-start md:gap-8">
               {[
                   { id: 'discovery', icon: Home },
                   { id: 'profile', icon: UserCircle },
                   { id: 'settings', icon: Settings }
               ].map(item => (
                   <button 
                      key={item.id}
                      onClick={() => { triggerHaptic('medium'); setCurrentView(item.id as ViewMode); }}
                      className={`p-4 border-2 transition-all ${currentView === item.id ? 'bg-acid border-white shadow-hard-white transform -translate-y-1' : 'border-transparent hover:bg-white/10'}`}
                   >
                       <item.icon size={24} className={currentView === item.id ? "text-black" : "text-white"} />
                   </button>
               ))}
               {state.currentScenario && (
                  <button onClick={() => setCurrentView('chat')} className={`p-4 border-2 border-white bg-white text-black ${currentView === 'chat' ? 'bg-hot text-white' : ''}`}>
                      <Send size={24} />
                  </button>
               )}
          </div>
          <div className="hidden md:block"></div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full relative flex flex-col overflow-hidden bg-transparent scroll-tension">
          
          {/* VIEW: DISCOVERY */}
          {currentView === 'discovery' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-tension">
                  {/* HEADER */}
                  <div className="flex justify-between items-end mb-12 border-b-4 border-white pb-4 bg-deep/80 p-6 backdrop-blur-sm">
                      <div>
                          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none tracking-tighter text-white">Social<br/>Sim_OS</h1>
                          <div className="bg-white text-black inline-block px-2 py-1 font-mono text-sm mt-2">V.2.0 // DARK_MODE</div>
                      </div>
                      <div className="hidden md:block text-right text-white">
                          <div className="font-mono text-xs font-bold uppercase mb-1">Current Level</div>
                          <div className="font-display text-4xl">{userProgress.level}</div>
                      </div>
                  </div>

                  {/* TUTORIAL CTA */}
                  {!userProgress.tutorialCompleted && (
                    <div onClick={() => setShowTutorial(true)} className="mb-12 bg-deep border-4 border-white p-6 shadow-hard-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer flex items-center justify-between group">
                        <div>
                            <h2 className="font-display text-2xl uppercase text-white group-hover:text-acid transition-colors">Academy Training Required</h2>
                            <p className="font-mono text-sm mt-1 text-gray-300">Complete the mandatory social protocols to unlock scenarios.</p>
                        </div>
                        <div className="bg-white text-black p-3"><GraduationCap size={32} /></div>
                    </div>
                  )}

                  {/* FILTER STRIP */}
                  <div className={`flex gap-4 overflow-x-auto pb-6 mb-2 ${!userProgress.tutorialCompleted ? 'opacity-20 pointer-events-none' : ''}`}>
                        {['All', ...Object.values(Difficulty)].map(level => (
                            <button
                                key={level}
                                onClick={() => setDifficultyFilter(level as any)}
                                className={`px-6 py-3 border-4 border-white font-mono font-bold uppercase text-sm whitespace-nowrap transition-all ${difficultyFilter === level ? 'bg-white text-black shadow-hard-white' : 'bg-deep text-white hover:bg-dark-800'}`}
                            >
                                {level}
                            </button>
                        ))}
                  </div>

                  {/* SCENARIO GRID */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 ${!userProgress.tutorialCompleted ? 'opacity-20 pointer-events-none' : ''}`}>
                      {SCENARIOS.filter(s => difficultyFilter === 'All' || s.difficulty === difficultyFilter).map(scenario => (
                          <ScenarioCard 
                            key={scenario.id} 
                            scenario={scenario} 
                            onSelect={handleCardClick} 
                            userLevel={userProgress.level} 
                            apiKey={apiKey}
                          />
                      ))}
                  </div>
              </div>
          )}

          {/* VIEW: CHAT */}
          {currentView === 'chat' && state.currentScenario && (
              <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
                  {/* CHAT CONTAINER */}
                  <div className="flex-grow flex flex-col h-full bg-dark-900 relative">
                      {/* HEADER */}
                      <div className="h-16 border-b-4 border-white bg-deep flex items-center justify-between px-4 shrink-0 z-20">
                          <button onClick={resetSimulation} className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black px-3 py-2 border-2 border-transparent hover:border-black transition-all">
                              <ChevronLeft size={16} /> EXIT
                          </button>
                          
                          {/* PERSISTENT VISUAL TIMER */}
                          <div className="hidden md:flex flex-grow justify-center max-w-xs mx-4">
                              <VisualTimer durationMinutes={5} isActive={true} />
                          </div>

                          <div className="flex items-center gap-2">
                              <button onClick={() => setShowUSFLUGuide(true)} className="p-2 border-2 border-white text-white hover:bg-white hover:text-black"><Book size={18} /></button>
                              <button onClick={() => setState(p => ({...p, showFeedback: !p.showFeedback}))} className={`p-2 border-2 border-white ${state.showFeedback ? 'bg-acid text-black' : 'text-white hover:bg-white hover:text-black'}`}><Brain size={18} /></button>
                          </div>
                      </div>

                      {/* RE-ROLL BUTTON (Absolute for quick access) */}
                      <button 
                        onClick={handleReRoll} 
                        className="absolute top-20 right-4 z-10 bg-hazard text-white border-2 border-white p-2 font-mono text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-2 shadow-hard-white"
                        title="Re-Roll Context"
                      >
                         <RefreshCw size={14} /> Re-Roll
                      </button>

                      {/* MESSAGES */}
                      <div className="flex-grow overflow-y-auto p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] scroll-tension pt-12">
                          {state.messages.map((msg, idx) => (
                              <ChatBubble 
                                  key={msg.id} message={msg} partnerName={state.currentScenario!.partnerName} avatarUrl={state.currentScenario!.avatarUrl}
                                  isLatestModelMessage={idx === state.messages.length - 1 && msg.role === 'model'} isSpeaking={isSpeaking}
                              />
                          ))}
                          {state.isTyping && state.currentScenario && (
                              <ChatBubble 
                                  message={{ id: 'typing', role: 'model', text: '', timestamp: Date.now() }} 
                                  partnerName={state.currentScenario.partnerName} 
                                  avatarUrl={state.currentScenario.avatarUrl} 
                                  isLoading={true} 
                              />
                          )}
                          <div ref={messagesEndRef} />
                      </div>

                      {/* INPUT AREA with Data Stream Border */}
                      <div className={`p-4 bg-deep border-t-4 border-transparent data-stream-border shrink-0 ${state.isTyping ? 'processing' : ''}`}>
                           {hint && <div className="mb-2 font-mono text-xs bg-cyan/20 p-2 border-l-4 border-cyan text-white">{hint}</div>}
                           <div className="flex gap-0 shadow-hard-white bg-deep relative z-10">
                              <button onClick={handleGetHint} disabled={state.isTyping} className="bg-dark-800 text-white px-4 border-y-4 border-l-4 border-white hover:bg-cyan hover:text-black transition-colors"><Sparkles size={20} /></button>
                              {/* Focus Hum Animation on Input */}
                              <input 
                                type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="TYPE_MESSAGE_HERE..." disabled={state.isTyping}
                                className="flex-grow p-4 font-mono text-sm bg-deep text-white border-4 border-white outline-none focus:bg-dark-800 uppercase placeholder-gray-500 focus-hum"
                              />
                              <button 
                                onClick={handleSendMessage} 
                                disabled={!inputText.trim() || state.isTyping} 
                                className="bg-white text-black px-6 border-y-4 border-r-4 border-white font-display uppercase tracking-wider disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-acid hover:scale-110 hover:-rotate-3 hover:z-20 hover:shadow-hard-white active:scale-95 active:rotate-0 active:shadow-none origin-center"
                              >
                                SEND
                              </button>
                           </div>
                      </div>
                  </div>
                  
                  {/* FEEDBACK PANEL (Desktop: Side / Mobile: Overlay) */}
                  {state.showFeedback && (
                      <div className="w-full md:w-80 bg-deep border-l-4 border-white p-0 shrink-0 absolute md:static inset-0 z-30 md:z-auto flex flex-col">
                          <div className="md:hidden p-4 border-b-4 border-white bg-acid text-black flex justify-between items-center">
                              <span className="font-display">ANALYSIS</span>
                              <button onClick={() => setState(p => ({...p, showFeedback: false}))}><X size={24} /></button>
                          </div>
                          <div className="flex-grow overflow-y-auto p-4 scroll-tension">
                            <FeedbackPanel lastModelMessage={state.messages.filter(m => m.role === 'model').pop()} rapportScore={state.rapportScore} />
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* VIEW: PROFILE */}
          {currentView === 'profile' && (
              <div className="flex-1 overflow-y-auto p-8 scroll-tension">
                  <h1 className="font-display text-5xl uppercase mb-8 text-white">Operator<br/>Profile</h1>
                  
                  {/* MOOD HISTORY GRAPH */}
                  <div className="bg-deep border-4 border-white shadow-hard-white p-6 mb-8">
                     <h3 className="font-display text-xl uppercase text-white mb-4">Emotional Thermometer</h3>
                     <div className="flex items-end gap-1 h-24 border-b-2 border-white pb-2">
                         {userProgress.moodHistory.slice(-15).map((log, idx) => (
                             <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1 hover:scale-110 transition-transform cursor-help" title={`${new Date(log.timestamp).toLocaleDateString()} - ${log.tag}`}>
                                 <div className={`w-full ${log.tag === 'Stressed' ? 'bg-hazard' : log.tag === 'Focused' ? 'bg-acid' : 'bg-cyan'}`} style={{ height: '20px' }}></div>
                                 <span className="text-xl">{log.emoji}</span>
                             </div>
                         ))}
                         {userProgress.moodHistory.length === 0 && <span className="text-gray-500 font-mono text-xs w-full text-center">No Data Recorded</span>}
                     </div>
                  </div>

                  <div className="bg-deep border-4 border-white shadow-hard-white p-6 mb-8 flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center relative">
                          <span className={`font-display text-5xl text-white ${isLevelingUp ? 'level-up-flicker' : ''}`}>{userProgress.level}</span>
                          <div className="absolute inset-0 border-4 border-acid rounded-full animate-spin" style={{clipPath: `inset(0 0 ${100 - xpPercent}% 0)`}}></div>
                      </div>
                      <div className="flex-grow text-white">
                          <h2 className="font-display text-2xl uppercase">Social Architect</h2>
                          <div className="w-full h-6 border-4 border-white bg-dark-800 mt-2 relative">
                              <div className="h-full bg-acid" style={{width: `${xpPercent}%`}}></div>
                          </div>
                          <p className="font-mono text-xs mt-2 text-right">{userProgress.currentXp} / {userProgress.level * XP_PER_LEVEL_BASE} XP</p>
                      </div>
                  </div>
                  <h2 className="font-display text-2xl uppercase mb-4 border-b-4 border-white inline-block text-white">Badges</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ACHIEVEMENTS.map(ach => {
                          const unlocked = userProgress.unlockedAchievements.includes(ach.id);
                          return (
                              <div key={ach.id} className={`p-4 border-4 border-white ${unlocked ? 'bg-cyan text-black shadow-hard-white' : 'bg-dark-800 text-gray-500 opacity-50 grayscale'}`}>
                                  <div className="font-display uppercase text-sm mb-1">{ach.title}</div>
                                  <div className="font-mono text-[10px] leading-tight">{ach.description}</div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}
      </main>
    </div>
  );
};

export default App;
