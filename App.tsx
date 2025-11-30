
import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, ChevronLeft, Sparkles, Key, Smile, Trophy, Star, Clock, Trash2, PlayCircle, Volume2, GraduationCap, Book, Home, Settings, UserCircle, Zap, X } from 'lucide-react';
import ScenarioCard from './components/ScenarioCard';
import ChatBubble from './components/ChatBubble';
import FeedbackPanel from './components/FeedbackPanel';
import AchievementToast from './components/AchievementToast';
import StarterCourse from './components/StarterCourse';
import { USFLUGuide } from './components/USFLUModules';
import { SCENARIOS, ACHIEVEMENTS, XP_PER_LEVEL_BASE } from './constants';
import { Scenario, SimulationState, ChatMessage, Category, PartnerGender, Difficulty, UserProgress, Achievement, SavedSession } from './types';
import { generateAIResponse, generateHint, generateCharacterImage, generateCharacterSpeech, decodeAudioData } from './services/geminiService';

type ViewMode = 'discovery' | 'profile' | 'chat' | 'settings';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [showKeyModal, setShowKeyModal] = useState(!process.env.API_KEY);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('discovery');

  // Staging state for scenario configuration
  const [selectedScenarioForConfig, setSelectedScenarioForConfig] = useState<Scenario | null>(null);

  // USFLU State
  const [showUSFLUGuide, setShowUSFLUGuide] = useState(false);

  // Filter state
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');

  // Gamification State
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
      const saved = localStorage.getItem('socialsim_progress');
      if (saved) return JSON.parse(saved);
      return {
          level: 1,
          currentXp: 0,
          xpToNextLevel: XP_PER_LEVEL_BASE,
          unlockedAchievements: [],
          totalMessagesSent: 0,
          highestRapport: 50,
          sessionsCompleted: 0,
          tutorialCompleted: false
      };
  });
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);

  // Saved Sessions State
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
      const saved = localStorage.getItem('socialsim_saves');
      return saved ? JSON.parse(saved) : [];
  });

  const [state, setState] = useState<SimulationState>({
    currentScenario: null,
    messages: [],
    rapportScore: 50, // Start neutral
    isTyping: false,
    showFeedback: true,
    apiKey: null
  });

  const [inputText, setInputText] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio & TTS Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Open Tutorial UI State
  const [showTutorial, setShowTutorial] = useState(false);

  // Persist progress
  useEffect(() => {
      localStorage.setItem('socialsim_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Persist saved sessions
  useEffect(() => {
      localStorage.setItem('socialsim_saves', JSON.stringify(savedSessions));
  }, [savedSessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isTyping]);

  // Initialize Audio Context on user interaction (handled in start/send)
  const initAudio = () => {
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Ensure context is running (browsers suspend it until user gesture)
      if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
      }
  };

  const playResponseAudio = (base64Audio: string) => {
      initAudio();
      if (!audioContextRef.current) return;

      try {
          // decodeAudioData is synchronous now (manual PCM decode)
          const buffer = decodeAudioData(base64Audio, audioContextRef.current);
          
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          
          source.onended = () => setIsSpeaking(false);
          
          setIsSpeaking(true);
          source.start(0);
      } catch (e) {
          console.error("Audio playback failed", e);
          setIsSpeaking(false);
      }
  };

  // --- GAME ENGINE LOGIC ---
  
  const addXp = (amount: number) => {
      setUserProgress(prev => {
          let newXp = prev.currentXp + amount;
          let newLevel = prev.level;
          let newXpToNext = prev.xpToNextLevel;

          // Simple leveling curve: 100 * Level to progress
          const needed = newLevel * XP_PER_LEVEL_BASE;
          
          if (newXp >= needed) {
              newXp -= needed;
              newLevel++;
              newXpToNext = newLevel * XP_PER_LEVEL_BASE;
          }

          return {
              ...prev,
              currentXp: newXp,
              level: newLevel,
              xpToNextLevel: newXpToNext
          };
      });
  };

  const checkAchievements = (trigger: 'message' | 'rapport' | 'session' | 'tutorial') => {
      const { totalMessagesSent, highestRapport, unlockedAchievements, sessionsCompleted, tutorialCompleted } = userProgress;
      
      const newAchievements: Achievement[] = [];

      ACHIEVEMENTS.forEach(ach => {
          if (unlockedAchievements.includes(ach.id)) return;

          let unlocked = false;
          if (ach.id === 'first_step' && totalMessagesSent >= 1) unlocked = true;
          if (ach.id === 'smooth_operator' && highestRapport >= 90) unlocked = true;
          if (ach.id === 'conversationalist' && totalMessagesSent >= 20) unlocked = true;
          if (ach.id === 'social_butterfly' && sessionsCompleted >= 5) unlocked = true;
          if (ach.id === 'graduate' && trigger === 'tutorial') unlocked = true;

          if (unlocked) {
              newAchievements.push(ach);
          }
      });

      if (newAchievements.length > 0) {
          // Grant rewards
          const totalReward = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
          addXp(totalReward);
          
          setUserProgress(prev => ({
              ...prev,
              unlockedAchievements: [...prev.unlockedAchievements, ...newAchievements.map(a => a.id)]
          }));

          // Show first one found
          setActiveAchievement(newAchievements[0]);
      }
  };

  // --- SAVE/LOAD LOGIC ---

  const handleSaveSession = () => {
    if (!state.currentScenario) return;

    const lastMsg = state.messages[state.messages.length - 1];
    const session: SavedSession = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        scenario: state.currentScenario,
        messages: state.messages,
        rapportScore: state.rapportScore,
        previewText: lastMsg ? lastMsg.text.substring(0, 60) + (lastMsg.text.length > 60 ? '...' : '') : "No messages yet"
    };

    setSavedSessions(prev => [session, ...prev]);
    alert("Session saved! You can resume it from the main menu.");
  };

  const handleLoadSession = (session: SavedSession) => {
    setState({
        currentScenario: session.scenario,
        messages: session.messages,
        rapportScore: session.rapportScore,
        isTyping: false,
        showFeedback: true,
        apiKey: state.apiKey || apiKey
    });
    setCurrentView('chat');
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this saved session?")) {
        setSavedSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- Tutorial Logic ---
  const handleCompleteTutorial = () => {
      setShowTutorial(false);
      setUserProgress(prev => ({ ...prev, tutorialCompleted: true }));
      // Trigger achievements manually since effect might be slow
      setTimeout(() => checkAchievements('tutorial'), 500);
  };

  // -------------------------

  const handleCardClick = (scenario: Scenario) => {
    if (!userProgress.tutorialCompleted) {
        alert("Please complete the Social Skills 101 Academy course to unlock scenarios.");
        return;
    }
    setSelectedScenarioForConfig(scenario);
  };

  const handleStartSimulation = async (gender: PartnerGender) => {
    if (!selectedScenarioForConfig) return;
    initAudio(); // Prepare audio context

    const activeScenario: Scenario = {
        ...selectedScenarioForConfig,
        gender: gender,
        avatarUrl: selectedScenarioForConfig.avatarUrl, // Temporary placeholder
    };

    setIsGeneratingImage(true);
    setSelectedScenarioForConfig(null); // Close modal
    setCurrentView('chat'); // Switch to Chat View
    
    // Set initial state without the AI image first
    setState({
      ...state,
      currentScenario: activeScenario,
      messages: [{
        id: 'init',
        role: 'model',
        text: activeScenario.initialMessage,
        timestamp: Date.now(),
        analysis: {
            tone: 'Neutral',
            feedback: 'Start the conversation naturally.',
            score: 0,
            socialCues: [],
            suggestion: ''
        }
      }],
      rapportScore: 50,
      showFeedback: true
    });
    setHint(null);

    // Generate custom avatar
    if (apiKey) {
        const generatedAvatar = await generateCharacterImage(apiKey, activeScenario);
        if (generatedAvatar) {
            setState(prev => ({
                ...prev,
                currentScenario: prev.currentScenario ? { ...prev.currentScenario, avatarUrl: generatedAvatar } : null
            }));
        }

        // Generate Intro Speech
        const speech = await generateCharacterSpeech(apiKey, activeScenario.initialMessage, gender);
        if (speech) {
            playResponseAudio(speech);
        }
    }
    setIsGeneratingImage(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !state.currentScenario || !apiKey) return;
    initAudio(); // Ensure audio context is awake

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    // 1. Update UI immediately
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isTyping: true
    }));
    setInputText('');
    setHint(null);

    // 2. Gamification: Message Sent
    setUserProgress(p => ({ ...p, totalMessagesSent: p.totalMessagesSent + 1 }));
    addXp(10); // 10 XP per message sent
    checkAchievements('message');

    try {
      const response = await generateAIResponse(
        apiKey,
        [...state.messages, userMsg],
        state.currentScenario
      );

      const newRapport = Math.min(100, Math.max(0, state.rapportScore + response.analysis.score));

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        internalThought: response.internalThought,
        analysis: response.analysis
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMsg],
        rapportScore: newRapport,
        isTyping: false
      }));

      // Generate and Play TTS
      const speech = await generateCharacterSpeech(apiKey, response.text, state.currentScenario.gender);
      if (speech) {
          playResponseAudio(speech);
      }

      // 3. Gamification: Rapport Check
      if (newRapport > userProgress.highestRapport) {
          setUserProgress(p => ({ ...p, highestRapport: newRapport }));
      }
      checkAchievements('rapport');

    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isTyping: false }));
      alert("Failed to get response. Check console or API key.");
    }
  };

  const handleGetHint = async () => {
      if(!state.currentScenario || !apiKey) return;
      setHint("Thinking...");
      try {
          const hintText = await generateHint(apiKey, state.messages, state.currentScenario);
          setHint(hintText);
      } catch(e) {
          setHint("Could not generate hint.");
      }
  };

  const resetSimulation = () => {
    // Session complete bonus logic? 
    if (state.messages.length > 5) {
        addXp(50); // Small bonus for completing a session
        setUserProgress(p => ({...p, sessionsCompleted: p.sessionsCompleted + 1}));
        checkAchievements('session');
    }

    setState({
      ...state,
      currentScenario: null,
      messages: [],
      rapportScore: 50
    });
    setSelectedScenarioForConfig(null);
    setIsSpeaking(false);
    setCurrentView('discovery');
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(apiKey.trim().length > 0) {
          setShowKeyModal(false);
      }
  };

  // --- API Key Modal ---
  if (showKeyModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
        <div className="bg-dark-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-dark-700">
            <div className="flex justify-center mb-6">
                <div className="p-3 bg-primary/20 rounded-full text-primary">
                    <Key size={32} />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome to SocialSim</h2>
            <p className="text-center text-gray-400 mb-6">
                Enter your Gemini API key to start.
            </p>
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <input 
                    type="password" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API Key (AI Studio)"
                    className="w-full p-3 bg-dark-900 border border-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary focus:outline-none placeholder-gray-600"
                />
                <button 
                    type="submit"
                    disabled={!apiKey}
                    className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                    Start Training
                </button>
            </form>
        </div>
      </div>
    );
  }

  // --- Partner Selection Modal ---
  if (selectedScenarioForConfig) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 z-50 fixed inset-0">
            <div className="bg-dark-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-dark-700 relative animate-in zoom-in-50">
                <button 
                    onClick={() => setSelectedScenarioForConfig(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-bold text-center text-white mb-2">Choose Your Partner</h2>
                <p className="text-center text-gray-400 mb-8 max-w-md mx-auto">
                    Who would you like to practice with for the <strong>"{selectedScenarioForConfig.title}"</strong> scenario?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                        onClick={() => handleStartSimulation('male')}
                        className="group relative bg-dark-900 hover:bg-dark-700 border-2 border-transparent hover:border-primary rounded-2xl p-6 transition-all flex flex-col items-center"
                    >
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-800 shadow-md mb-4 group-hover:scale-105 transition-transform border border-dark-700">
                             <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Male Partner" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                        </div>
                        <h3 className="font-bold text-gray-200 text-lg group-hover:text-primary">Male Partner</h3>
                    </button>

                    <button 
                         onClick={() => handleStartSimulation('female')}
                         className="group relative bg-dark-900 hover:bg-dark-700 border-2 border-transparent hover:border-pink-500 rounded-2xl p-6 transition-all flex flex-col items-center"
                    >
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-800 shadow-md mb-4 group-hover:scale-105 transition-transform border border-dark-700">
                             <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Female Partner" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                        </div>
                         <h3 className="font-bold text-gray-200 text-lg group-hover:text-pink-500">Female Partner</h3>
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- Tutorial View (Overlay) ---
  if (showTutorial) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 z-50 fixed inset-0">
             <StarterCourse onComplete={handleCompleteTutorial} />
        </div>
      );
  }

  // Calculate XP percentage
  const xpPercentage = (userProgress.currentXp / (userProgress.level * XP_PER_LEVEL_BASE)) * 100;
  const isTutorialLocked = !userProgress.tutorialCompleted;

  // --- RENDER MAIN LAYOUT ---
  return (
    <div className="h-screen w-full bg-dark-900 text-gray-100 font-sans selection:bg-primary selection:text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Overlays */}
      {showUSFLUGuide && <USFLUGuide onClose={() => setShowUSFLUGuide(false)} />}
      {activeAchievement && (
          <AchievementToast 
              achievement={activeAchievement} 
              onClose={() => setActiveAchievement(null)} 
          />
      )}

      {/* NAVIGATION SIDEBAR (Desktop) / BOTTOM BAR (Mobile) */}
      <nav className="md:w-24 bg-dark-950 border-t md:border-t-0 md:border-r border-dark-800 flex md:flex-col justify-between items-center py-2 md:py-8 fixed bottom-0 left-0 right-0 md:static z-40 h-16 md:h-full shrink-0">
          <div className="hidden md:flex flex-col items-center gap-2 mb-8">
              <div className="p-2 bg-gradient-to-br from-primary to-neon rounded-xl shadow-lg shadow-primary/20">
                  <Brain size={28} className="text-white" />
              </div>
          </div>

          <div className="flex md:flex-col w-full justify-around md:justify-start md:gap-8 px-4 md:px-0">
               <button 
                  onClick={() => setCurrentView('discovery')}
                  className={`p-3 rounded-2xl transition-all duration-300 ${currentView === 'discovery' ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
               >
                   <Home size={24} />
               </button>
               <button 
                  onClick={() => setCurrentView('profile')}
                  className={`p-3 rounded-2xl transition-all duration-300 ${currentView === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
               >
                   <UserCircle size={24} />
               </button>
               
               {/* Show active chat button only if active */}
               {state.currentScenario && (
                  <button 
                    onClick={() => setCurrentView('chat')}
                    className={`p-3 rounded-2xl transition-all duration-300 relative ${currentView === 'chat' ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                      <Send size={24} />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-neon rounded-full animate-pulse"></span>
                  </button>
               )}

               <button 
                  onClick={() => setCurrentView('settings')}
                  className={`p-3 rounded-2xl transition-all duration-300 ${currentView === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
               >
                   <Settings size={24} />
               </button>
          </div>

          <div className="hidden md:block mb-4">
              {/* Spacer */}
          </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full relative flex flex-col overflow-hidden">
          
          {/* VIEW: DISCOVERY */}
          {currentView === 'discovery' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 md:pb-8">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h1 className="text-3xl font-bold text-white mb-1">Discover</h1>
                          <p className="text-gray-400">Choose your next social challenge.</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                          <div className="hidden md:flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-full border border-dark-700">
                              <Trophy size={16} className="text-yellow-400" />
                              <span className="text-sm font-bold text-gray-200">Lvl {userProgress.level}</span>
                          </div>
                      </div>
                  </div>

                  {/* Tutorial Banner */}
                  {isTutorialLocked && (
                    <div className="mb-10 bg-gradient-to-r from-primary/20 to-neon/20 border border-primary/30 rounded-3xl p-8 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all" onClick={() => setShowTutorial(true)}>
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="p-4 bg-white/10 rounded-full backdrop-blur-md">
                                <GraduationCap size={40} className="text-white" />
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h2 className="text-2xl font-bold text-white mb-2">Social Skills Academy</h2>
                                <p className="text-gray-300 mb-4">Complete the introductory course to unlock simulations.</p>
                                <button className="bg-white text-dark-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">Start Learning</button>
                            </div>
                        </div>
                    </div>
                  )}

                  {/* Filter Bar */}
                  <div className={`flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide ${isTutorialLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                        <button 
                            onClick={() => setDifficultyFilter('All')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${difficultyFilter === 'All' ? 'bg-white text-dark-900' : 'bg-dark-800 text-gray-400 hover:bg-dark-700 border border-dark-700'}`}
                        >
                            All
                        </button>
                        {Object.values(Difficulty).map(level => (
                            <button
                                key={level}
                                onClick={() => setDifficultyFilter(level)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${difficultyFilter === level ? 'bg-white text-dark-900' : 'bg-dark-800 text-gray-400 hover:bg-dark-700 border border-dark-700'}`}
                            >
                                {level}
                            </button>
                        ))}
                  </div>

                  {/* Horizontal Scroll Deck */}
                  <div className={`relative ${isTutorialLocked ? 'pointer-events-none select-none grayscale' : ''}`}>
                      <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-4">Featured Scenarios</h3>
                      
                      <div className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory px-4 -mx-4 md:px-0 md:mx-0">
                          {SCENARIOS
                            .filter(s => difficultyFilter === 'All' || s.difficulty === difficultyFilter)
                            .map(scenario => (
                              <div key={scenario.id} className="min-w-[300px] md:min-w-[340px] snap-center">
                                  <ScenarioCard 
                                      scenario={scenario} 
                                      onSelect={handleCardClick}
                                      userLevel={userProgress.level}
                                  />
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Saved Sessions */}
                  {savedSessions.length > 0 && !isTutorialLocked && (
                    <div className="mb-10">
                        <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-4">Continue Learning</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedSessions.map(session => (
                                <div key={session.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-4 hover:border-primary/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-900 border border-dark-600">
                                                <img src={session.scenario.avatarUrl} alt={session.scenario.partnerName} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-200 text-sm">{session.scenario.title}</h4>
                                                <p className="text-xs text-gray-500">{new Date(session.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleDeleteSession(session.id, e)} className="text-dark-600 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                    <button 
                                        onClick={() => handleLoadSession(session)}
                                        className="w-full mt-2 py-2 bg-dark-700 hover:bg-dark-600 text-teal font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <PlayCircle size={16} /> Resume
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
              </div>
          )}

          {/* VIEW: PROFILE */}
          {currentView === 'profile' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 md:pb-8">
                  <h1 className="text-3xl font-bold text-white mb-8">My Progress</h1>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Level Card */}
                      <div className="bg-dark-800 rounded-3xl p-8 border border-dark-700 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                          
                          <div className="flex items-center gap-6 relative z-10">
                               <div className="relative w-32 h-32 flex items-center justify-center">
                                   {/* Circular Progress SVG */}
                                   <svg className="w-full h-full transform -rotate-90">
                                       <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-dark-700" />
                                       <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * xpPercentage) / 100} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
                                   </svg>
                                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                       <span className="text-4xl font-bold">{userProgress.level}</span>
                                       <span className="text-xs font-bold uppercase text-gray-500">Level</span>
                                   </div>
                               </div>
                               <div>
                                   <h3 className="text-xl font-bold text-white mb-2">Social Architect</h3>
                                   <p className="text-gray-400 text-sm mb-4">You are mastering the art of conversation.</p>
                                   <div className="text-sm font-mono text-primary-light">
                                       {userProgress.currentXp} / {userProgress.level * XP_PER_LEVEL_BASE} XP
                                   </div>
                               </div>
                          </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 flex flex-col justify-center items-center">
                               <div className="p-3 bg-teal/10 rounded-full text-teal mb-3"><Smile size={24} /></div>
                               <span className="text-2xl font-bold text-white">{userProgress.highestRapport}%</span>
                               <span className="text-xs text-gray-500 uppercase">Best Rapport</span>
                          </div>
                          <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 flex flex-col justify-center items-center">
                               <div className="p-3 bg-neon/10 rounded-full text-neon mb-3"><Send size={24} /></div>
                               <span className="text-2xl font-bold text-white">{userProgress.totalMessagesSent}</span>
                               <span className="text-xs text-gray-500 uppercase">Messages</span>
                          </div>
                          <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 flex flex-col justify-center items-center">
                               <div className="p-3 bg-purple-500/10 rounded-full text-purple-400 mb-3"><Clock size={24} /></div>
                               <span className="text-2xl font-bold text-white">{userProgress.sessionsCompleted}</span>
                               <span className="text-xs text-gray-500 uppercase">Sessions</span>
                          </div>
                          <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 flex flex-col justify-center items-center">
                               <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-400 mb-3"><Trophy size={24} /></div>
                               <span className="text-2xl font-bold text-white">{userProgress.unlockedAchievements.length}</span>
                               <span className="text-xs text-gray-500 uppercase">Unlocks</span>
                          </div>
                      </div>
                  </div>

                  {/* Achievements */}
                  <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ACHIEVEMENTS.map(ach => {
                          const isUnlocked = userProgress.unlockedAchievements.includes(ach.id);
                          return (
                              <div key={ach.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${isUnlocked ? 'bg-dark-800 border-primary/50' : 'bg-dark-900 border-dark-700 opacity-50'}`}>
                                  <div className={`p-3 rounded-full ${isUnlocked ? 'bg-primary/20 text-primary' : 'bg-dark-800 text-gray-600'}`}>
                                      {ach.icon === 'trophy' ? <Trophy size={20} /> : ach.icon === 'star' ? <Star size={20} /> : <Zap size={20} />}
                                  </div>
                                  <div>
                                      <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</h4>
                                      <p className="text-xs text-gray-500">{ach.description}</p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* VIEW: SETTINGS */}
          {currentView === 'settings' && (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-dark-800 p-8 rounded-full mb-6 border border-dark-700">
                      <Settings size={64} className="text-primary animate-spin-slow" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                  <p className="text-gray-400 mb-8">Customize your experience (Coming Soon)</p>
                  
                  <div className="w-full max-w-md space-y-4">
                      <div className="flex justify-between items-center p-4 bg-dark-800 rounded-xl border border-dark-700">
                          <span className="text-gray-300">Dark Mode</span>
                          <div className="w-12 h-6 bg-primary rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div></div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-dark-800 rounded-xl border border-dark-700">
                          <span className="text-gray-300">Sound Effects</span>
                          <div className="w-12 h-6 bg-dark-600 rounded-full relative"><div className="w-4 h-4 bg-gray-400 rounded-full absolute left-1 top-1"></div></div>
                      </div>
                  </div>
              </div>
          )}

          {/* VIEW: CHAT (Simulation) */}
          {currentView === 'chat' && state.currentScenario && (
              <div className="flex-1 flex flex-col md:flex-row bg-dark-900 animate-in fade-in duration-500 relative overflow-hidden">
                  
                  {/* Chat Area */}
                  <div className="flex-grow flex flex-col h-full bg-dark-950/50 relative overflow-hidden">
                      {/* Chat Header */}
                      <div className="flex items-center justify-between p-4 border-b border-dark-800 bg-dark-900/80 backdrop-blur-md z-20 shrink-0">
                          <div className="flex items-center gap-3">
                               <button onClick={resetSimulation} className="p-2 hover:bg-dark-800 rounded-full text-gray-400 transition-colors">
                                  <ChevronLeft size={24} />
                               </button>
                               <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full overflow-hidden border border-dark-700 relative ${isSpeaking ? 'ring-2 ring-neon ring-offset-2 ring-offset-dark-900' : ''}`}>
                                      <img 
                                          src={state.currentScenario.avatarUrl} 
                                          alt={state.currentScenario.partnerName} 
                                          className={`w-full h-full object-cover transition-all ${isGeneratingImage ? 'blur-sm grayscale' : ''}`} 
                                      />
                                      {isGeneratingImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Sparkles size={16} className="text-white animate-spin" /></div>}
                                  </div>
                                  <div>
                                      <h2 className="font-bold text-white flex items-center gap-2">
                                          {state.currentScenario.partnerName}
                                          {isSpeaking && <Volume2 size={16} className="text-neon animate-pulse" />}
                                      </h2>
                                      <div className="flex items-center gap-1 text-xs text-teal">
                                          <div className="w-2 h-2 rounded-full bg-teal animate-pulse"></div>
                                          Online
                                      </div>
                                  </div>
                               </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                               {/* Tools */}
                               <button onClick={() => setShowUSFLUGuide(true)} className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-xl" title="Guide"><Book size={20}/></button>
                               <button onClick={() => setState(p => ({...p, showFeedback: !p.showFeedback}))} className={`p-2 rounded-xl ${state.showFeedback ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-dark-800'}`} title="Feedback"><Brain size={20}/></button>
                          </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
                          {state.messages.map((msg, idx) => (
                              <ChatBubble 
                                  key={msg.id} 
                                  message={msg} 
                                  partnerName={state.currentScenario!.partnerName} 
                                  avatarUrl={state.currentScenario!.avatarUrl}
                                  avatarVideoUrl={state.currentScenario!.avatarVideoUrl}
                                  isLatestModelMessage={idx === state.messages.length - 1 && msg.role === 'model'}
                                  isSpeaking={isSpeaking}
                              />
                          ))}
                          
                          {state.isTyping && (
                              <div className="flex items-center gap-2 p-4 text-gray-500">
                                  <div className="flex gap-1">
                                      <span className="w-2 h-2 bg-primary rounded-full typing-dot"></span>
                                      <span className="w-2 h-2 bg-primary rounded-full typing-dot"></span>
                                      <span className="w-2 h-2 bg-primary rounded-full typing-dot"></span>
                                  </div>
                                  <span className="text-xs font-mono">{state.currentScenario.partnerName} is thinking...</span>
                              </div>
                          )}
                          <div ref={messagesEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="p-4 bg-dark-900 border-t border-dark-800 shrink-0">
                           {hint && (
                               <div className="mb-3 p-3 bg-primary/10 text-primary-light text-sm rounded-xl border border-primary/20 animate-in fade-in slide-in-from-bottom-2 flex items-start gap-2">
                                   <Sparkles size={16} className="mt-0.5 shrink-0" />
                                   <div className="whitespace-pre-wrap">{hint}</div>
                               </div>
                           )}
                           
                          <div className="flex gap-3">
                              <button 
                                  onClick={handleGetHint}
                                  disabled={state.isTyping}
                                  className="p-3 text-primary bg-dark-800 hover:bg-dark-700 rounded-2xl transition-all active:scale-95 disabled:opacity-50 border border-dark-700"
                                  title="Get a hint"
                              >
                                  <Sparkles size={20} />
                              </button>
                              <div className="flex-grow relative">
                                  <input
                                      type="text"
                                      value={inputText}
                                      onChange={(e) => setInputText(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                      placeholder={`Message ${state.currentScenario.partnerName}...`}
                                      disabled={state.isTyping}
                                      className="w-full p-3 bg-dark-800 border border-dark-700 text-white rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all placeholder-gray-500"
                                  />
                              </div>
                              <button 
                                  onClick={handleSendMessage}
                                  disabled={!inputText.trim() || state.isTyping}
                                  className="p-3 bg-primary hover:bg-primary-hover text-white rounded-2xl disabled:bg-dark-700 disabled:text-gray-500 transition-all active:scale-95 shadow-lg shadow-primary/20"
                              >
                                  <Send size={20} />
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Feedback Sidebar */}
                  {state.showFeedback && (
                      <div className="w-full md:w-80 lg:w-96 bg-dark-900 border-l border-dark-800 p-4 shrink-0 absolute md:static inset-0 z-30 md:z-auto">
                          <div className="md:hidden flex justify-end mb-2">
                              <button onClick={() => setState(p => ({...p, showFeedback: false}))}><X className="text-gray-400" /></button>
                          </div>
                          <FeedbackPanel 
                              lastModelMessage={state.messages.filter(m => m.role === 'model').pop()} 
                              rapportScore={state.rapportScore}
                          />
                      </div>
                  )}
              </div>
          )}

      </main>
    </div>
  );
};

export default App;
