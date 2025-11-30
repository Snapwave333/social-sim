
export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced'
}

export enum Category {
  Social = 'Social Skills',
  Dating = 'Dating & Flirting',
  Professional = 'Professional'
}

export type PartnerGender = 'male' | 'female';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'flame' | 'zap' | 'heart';
  xpReward: number;
}

export interface UserProgress {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  unlockedAchievements: string[]; // IDs
  totalMessagesSent: number;
  highestRapport: number;
  sessionsCompleted: number;
  tutorialCompleted: boolean; // New flag for the starter course
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  systemPrompt: string;
  initialMessage: string;
  avatarUrl: string;
  avatarVideoUrl?: string; // New: Looping video URL for idle state
  partnerName: string;
  gender?: PartnerGender; // Optional, set at runtime based on user choice
  requiredLevel?: number; // Level required to unlock this character/scenario
}

export interface FeedbackData {
  tone: string;
  score: number; // 0-100 rapport score
  feedback: string;
  socialCues: string[]; // List of observed cues or missed cues
  suggestion: string; // Suggested next move if asked
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  // Metadata attached to model responses for the feedback panel
  analysis?: FeedbackData; 
  // Internal thought of the character (hidden from main view, shown in debug/learning mode)
  internalThought?: string;
}

export interface SimulationState {
  currentScenario: Scenario | null;
  messages: ChatMessage[];
  rapportScore: number;
  isTyping: boolean;
  showFeedback: boolean;
  apiKey: string | null;
}

export interface SavedSession {
  id: string;
  timestamp: number;
  scenario: Scenario;
  messages: ChatMessage[];
  rapportScore: number;
  previewText: string;
}

// Quiz Types
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string; // Why this answer is right or wrong
}

export interface QuizQuestion {
  id: number;
  question: string;
  context: string; // Brief lesson or scenario setup
  options: QuizOption[];
}
