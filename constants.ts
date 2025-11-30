
import { Category, Difficulty, Scenario, Achievement, QuizQuestion } from './types';

export const XP_PER_LEVEL_BASE = 100;

export const STARTER_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    context: "Concept: Open-Ended vs. Closed Questions. \nTo keep a conversation going, it's best to ask questions that require more than a 'Yes' or 'No' answer.",
    question: "You are talking to someone new at a coffee shop. Which question is best for starting a conversation?",
    options: [
      {
        id: 'a',
        text: "Do you like coffee?",
        isCorrect: false,
        explanation: "This is a closed question. They can just say 'Yes' and the conversation stops."
      },
      {
        id: 'b',
        text: "What do you recommend getting here?",
        isCorrect: true,
        explanation: "Perfect! This invites them to share an opinion and gives you a follow-up topic."
      },
      {
        id: 'c',
        text: "The weather is nice.",
        isCorrect: false,
        explanation: "This is a statement, not a question. It puts the burden on them to think of a reply."
      }
    ]
  },
  {
    id: 2,
    context: "Concept: Validation & Empathy. \nWhen someone shares a negative emotion, the first step is to validate their feeling before offering solutions.",
    question: "Your friend says: 'I had the worst day at work today. My boss yelled at me for a mistake I didn't make.'",
    options: [
      {
        id: 'a',
        text: "You should quit your job.",
        isCorrect: false,
        explanation: "Jumping straight to extreme solutions can feel dismissive of the immediate pain."
      },
      {
        id: 'b',
        text: "Well, did you explain to him that you didn't do it?",
        isCorrect: false,
        explanation: "This sounds interrogating. It focuses on the logic rather than their feelings."
      },
      {
        id: 'c',
        text: "That sounds incredibly frustrating. I'm so sorry that happened.",
        isCorrect: true,
        explanation: "Correct. This validates their anger and shows support before trying to fix it."
      }
    ]
  },
  {
    id: 3,
    context: "Concept: Reading Body Language. \nPeople speak with their bodies. Crossed arms and looking away usually indicates discomfort or disinterest.",
    question: "You are talking to someone at a party. They are looking over your shoulder at the door and their feet are pointed away from you.",
    options: [
      {
        id: 'a',
        text: "Talk louder to get their attention back.",
        isCorrect: false,
        explanation: "This will likely annoy them further."
      },
      {
        id: 'b',
        text: "Politely wrap up the conversation and let them go.",
        isCorrect: true,
        explanation: "Correct. They are signaling a desire to leave or move on. Respecting that shows high social intelligence."
      },
      {
        id: 'c',
        text: "Ask them a personal question to hook them.",
        isCorrect: false,
        explanation: "If they are already disengaged, deepening the conversation will feel intrusive."
      }
    ]
  },
  {
    id: 4,
    context: "Concept: The 'Ping Pong' Rule. \nA conversation should go back and forth. If you talk for 5 minutes without them speaking, you are monologuing.",
    question: "You just spent 2 minutes telling a story about your cat. What should you do next?",
    options: [
      {
        id: 'a',
        text: "Tell another story about your dog.",
        isCorrect: false,
        explanation: "You're dominating the conversation. Give them a turn."
      },
      {
        id: 'b',
        text: "Stop talking and stare at them.",
        isCorrect: false,
        explanation: "This creates awkward silence."
      },
      {
        id: 'c',
        text: "Ask: 'Do you have any pets?'",
        isCorrect: true,
        explanation: "Correct! Pass the ball back to them to keep the 'game' going."
      }
    ]
  },
  {
    id: 5,
    context: "Concept: Appropriate Vulnerability. \nSharing too much personal info too soon (Oversharing) can make people uncomfortable.",
    question: "You are on a first date. Which topic is appropriate?",
    options: [
      {
        id: 'a',
        text: "Your detailed medical history and recent surgeries.",
        isCorrect: false,
        explanation: "Too heavy and graphic for a first meeting."
      },
      {
        id: 'b',
        text: "Your hobbies and what you do for fun.",
        isCorrect: true,
        explanation: "Perfect. It's positive, personal but safe, and helps you get to know each other."
      },
      {
        id: 'c',
        text: "How much you hate your ex.",
        isCorrect: false,
        explanation: "Bringing up exes negatively is a major red flag on a first date."
      }
    ]
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'graduate',
    title: 'Academy Graduate',
    description: 'Pass the Social Skills 101 Course.',
    icon: 'trophy',
    xpReward: 300
  },
  {
    id: 'first_step',
    title: 'Hello World',
    description: 'Send your first message.',
    icon: 'zap',
    xpReward: 50
  },
  {
    id: 'smooth_operator',
    title: 'Smooth Operator',
    description: 'Reach 90% Rapport in a conversation.',
    icon: 'heart',
    xpReward: 200
  },
  {
    id: 'conversationalist',
    title: 'Chatterbox',
    description: 'Send 20 messages total.',
    icon: 'star',
    xpReward: 150
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Complete 5 different sessions.',
    icon: 'trophy',
    xpReward: 500
  }
];

// Replaced generic UI Avatars with high-quality, realistic stock portraits
// to match the "Nano Banana" generated aesthetic.
export const SCENARIOS: Scenario[] = [
  {
    id: 'small-talk-coffee',
    title: 'Coffee Shop Small Talk',
    description: 'Practice striking up a casual conversation with a stranger while waiting for your order.',
    category: Category.Social,
    difficulty: Difficulty.Beginner,
    avatarUrl: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Alex',
    initialMessage: "Hey, excuse me. Do you know if the seasonal latte is any good here?",
    systemPrompt: "You are Alex, a friendly but slightly busy stranger at a coffee shop. You are open to small talk but will disengage if the other person is rude, overly intense, or weird. Keep responses concise (1-2 sentences). Your goal is to help the user practice basic 'ping-pong' conversation flow.",
    requiredLevel: 1
  },
  {
    id: 'grocery-store',
    title: 'Grocery Store Aisle',
    description: 'You both reach for the last item on the shelf. Navigate this polite social friction.',
    category: Category.Social,
    difficulty: Difficulty.Beginner,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Sam',
    initialMessage: "Oh! Sorry, were you going for the last almond milk?",
    systemPrompt: "You are Sam, a polite shopper. You feel slightly awkward about the situation. You are willing to let the user have the item if they are polite, or split the difference. Test the user's ability to be polite yet assertive or gracious.",
    requiredLevel: 1
  },
  {
    id: 'gym-spotter',
    title: 'The Gym Spotter',
    description: 'Ask someone for a spot or how to use a machine without being annoying.',
    category: Category.Social,
    difficulty: Difficulty.Beginner,
    avatarUrl: 'https://images.unsplash.com/photo-1633687912644-88408cb904b7?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Riley',
    initialMessage: "*Takes out earbuds* Hmm? Did you need something?",
    systemPrompt: "You are Riley. You are focused on your workout but generally helpful. You appreciate brevity. If the user is respectful of your time, you are helpful. If they try to hit on you or waste time, you get annoyed.",
    requiredLevel: 2
  },
  {
    id: 'party-introduction',
    title: 'House Party Mixer',
    description: 'Navigate a group setting at a friend\'s house party. Practice introductions and finding common ground.',
    category: Category.Social,
    difficulty: Difficulty.Intermediate,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Jordan',
    initialMessage: "Oh hi! I don't think we've met yet. I'm Jordan, I work with Sarah.",
    systemPrompt: "You are Jordan, a sociable guest at a house party. You are energetic and ask follow-up questions. If the user gives one-word answers, you might feel awkward. Your goal is to test the user's ability to elaborate and show interest in others.",
    requiredLevel: 2
  },
  {
    id: 'networking-event',
    title: 'Industry Networking',
    description: 'You are meeting a senior figure in your field. Make a good impression without seeming desperate.',
    category: Category.Professional,
    difficulty: Difficulty.Intermediate,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Elena',
    initialMessage: "Hello. I don't believe we've met. I'm Elena, VP of Operations at TechCorp.",
    systemPrompt: "You are Elena. You are professional, sharp, and busy. You value competence and clear communication. You dislike flattery. You are testing if the user can deliver a concise 'elevator pitch' about themselves.",
    requiredLevel: 3
  },
  {
    id: 'first-date-dinner',
    title: 'First Date: Dinner',
    description: 'A classic first date scenario. Balance showing interest, sharing about yourself, and reading subtle cues.',
    category: Category.Dating,
    difficulty: Difficulty.Intermediate,
    avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Taylor',
    initialMessage: "This place is really nice. I'm glad you picked it. Have you been here before?",
    systemPrompt: "You are Taylor. You are on a first date with the user. You are cautiously optimistic but looking for red flags. You value humor, genuine curiosity, and emotional intelligence. If the user is too aggressive or too passive, you will lose interest. Flirt back only if the user builds genuine rapport.",
    requiredLevel: 3
  },
  {
    id: 'advanced-flirting-bar',
    title: 'The "Eye Contact" Challenge',
    description: 'Advanced flirting scenario. Practice reading non-verbal cues (described in text) and playful banter.',
    category: Category.Dating,
    difficulty: Difficulty.Advanced,
    avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Casey',
    initialMessage: "*Smiles playfully from across the bar and tilts head slightly* You look like you're plotting something over here.",
    systemPrompt: "You are Casey. You are very confident, playful, and sarcastic. You love banter. If the user is boring or literal, you will get bored. If they are creepy, you will shut them down. Test their ability to handle teasing and 'push-pull' dynamics.",
    requiredLevel: 4
  },
  {
    id: 'blind-date-shy',
    title: 'The Shy Date',
    description: 'Your date is very shy and nervous. It is up to you to carry the conversation and make them comfortable.',
    category: Category.Dating,
    difficulty: Difficulty.Advanced,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Jamie',
    initialMessage: "*Looks down at the table* Um, hi. Sorry, I'm... I'm a little nervous.",
    systemPrompt: "You are Jamie. You are extremely shy and socially anxious but sweet. You want to connect but struggle to speak up. If the user dominates the conversation too much, you withdraw. If they ask gentle, open-ended questions, you open up.",
    requiredLevel: 5
  },
  {
    id: 'work-conflict',
    title: 'Misunderstanding at Work',
    description: 'A coworker is annoyed because they think you missed a deadline. Resolve the conflict professionally.',
    category: Category.Professional,
    difficulty: Difficulty.Advanced,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Morgan',
    initialMessage: "Look, I needed that report by noon. Now I have to stay late to fix the presentation.",
    systemPrompt: "You are Morgan, a stressed coworker. You are currently annoyed but reasonable. You need empathy and a solution, not excuses. If the user gets defensive, you get angrier. If they apologize and offer a fix, you calm down.",
    requiredLevel: 5
  },
  {
    id: 'salary-negotiation',
    title: 'Salary Negotiation',
    description: 'You are asking your boss for a raise. They are skeptical but open to hearing your case.',
    category: Category.Professional,
    difficulty: Difficulty.Advanced,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    partnerName: 'Director Stone',
    initialMessage: "Take a seat. You mentioned you wanted to discuss your compensation?",
    systemPrompt: "You are Director Stone. You are a tough negotiator. You care about ROI and data. Emotional appeals do not work on you. You respect confidence and preparation. If the user is wishy-washy, you will deny the request.",
    requiredLevel: 6
  }
];

export const MOCK_API_KEY_INSTRUCTION = "To start the simulation, we need a valid API Key from Google AI Studio.";
