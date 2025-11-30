
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

export interface MoodLog {
  timestamp: number;
  emoji: string; // 😔, 😐, 🙂
  tag: string;   // "Stressed", "Neutral", "Focused"
}

export interface UserProgress {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  unlockedAchievements: string[]; // IDs
  totalMessagesSent: number;
  highestRapport: number;
  sessionsCompleted: number;
  tutorialCompleted: boolean; 
  moodHistory: MoodLog[]; // New: Emotional Thermometer Data
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
  avatarVideoUrl?: string; 
  partnerName: string;
  gender?: PartnerGender; 
  requiredLevel?: number; 
}

export interface FeedbackData {
  tone: string;
  score: number; 
  feedback: string;
  socialCues: string[]; 
  suggestion: string; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  analysis?: FeedbackData; 
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

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string; 
}

export interface QuizQuestion {
  id: number;
  question: string;
  context: string; 
  options: QuizOption[];
}
