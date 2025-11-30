
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { ChatMessage, Scenario, FeedbackData, Category } from '../types';

// The structured output schema we want from Gemini
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    characterReply: {
      type: Type.STRING,
      description: "The verbatim response from the character to the user. Natural, conversational, and consistent with the persona.",
    },
    internalThought: {
      type: Type.STRING,
      description: "What the character is thinking but not saying. Used to explain their mood, hidden reactions, or interpretation of what the user said.",
    },
    coachFeedback: {
      type: Type.STRING,
      description: "Constructive feedback for the user. Focus on tone, appropriateness, subtext, and clarity. Be encouraging but direct about social mistakes.",
    },
    rapportDelta: {
      type: Type.INTEGER,
      description: "An integer between -10 and +10 indicating how the rapport score changed based on the last interaction.",
    },
    socialCues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific social cues the user noticed or missed (e.g., 'Noticed sarcasm', 'Missed opportunity to ask back', 'Maintained good eye contact').",
    },
    tone: {
      type: Type.STRING,
      description: "The current emotional tone of the character (e.g., 'Amused', 'Annoyed', 'Interested', 'Bored').",
    },
  },
  required: ["characterReply", "internalThought", "coachFeedback", "rapportDelta", "tone"],
};

export const generateAIResponse = async (
  apiKey: string,
  history: ChatMessage[],
  scenario: Scenario
): Promise<{
  text: string;
  analysis: FeedbackData;
  internalThought: string;
}> => {
  const ai = new GoogleGenAI({ apiKey });

  // Filter history to simple format for context
  const conversationHistory = history.map(msg => 
    `${msg.role === 'user' ? 'User' : scenario.partnerName}: ${msg.text}`
  ).join('\n');

  // Construct a robust system prompt that embodies the "AI Design" requirements
  const genderInstruction = scenario.gender 
    ? `You are roleplaying as a ${scenario.gender} character named ${scenario.partnerName}.` 
    : `You are roleplaying as ${scenario.partnerName}.`;

  const prompt = `
    System Context:
    You are an advanced social dynamics simulator designed to help users practice social skills, small talk, and dating.
    
    Your Configuration:
    - ${genderInstruction}
    - Scenario Description: ${scenario.description}
    - Personality & Goals: ${scenario.systemPrompt}
    
    Task:
    1.  **Analyze**: Read the User's latest message. Interpret their tone, subtext, and social appropriateness.
    2.  **Roleplay**: Generate the next response as ${scenario.partnerName}. 
        -   Stay strictly in character.
        -   If the user is awkward but trying, be realistic (maybe slightly confused but polite).
        -   If the user is rude or creepy, react negatively.
        -   Keep responses natural length (don't monologue unless the persona would).
    3.  **Coach**: Provide separate meta-analysis for the user.
        -   Did they miss a cue?
        -   Was the tone appropriate?
        -   How did this make the character feel?
    
    Current Conversation History:
    ${conversationHistory}
    
    Respond strictly in JSON format according to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8, // Slightly higher for more varied personality simulation
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const parsed = JSON.parse(jsonText);

    return {
      text: parsed.characterReply,
      internalThought: parsed.internalThought,
      analysis: {
        feedback: parsed.coachFeedback,
        score: parsed.rapportDelta, // This is a delta, will be added to total in state
        tone: parsed.tone,
        socialCues: parsed.socialCues || [],
        suggestion: "", // We could generate this, but let's keep it simple for now
      }
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateHint = async (
    apiKey: string,
    history: ChatMessage[],
    scenario: Scenario
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    
    const conversationHistory = history.map(msg => 
        `${msg.role === 'user' ? 'User' : scenario.partnerName}: ${msg.text}`
    ).join('\n');

    const prompt = `
        Context: ${scenario.systemPrompt}
        Roleplay Character: ${scenario.partnerName} (${scenario.gender || 'Unspecified'})
        Conversation So Far:
        ${conversationHistory}
        
        Task: Provide 3 short, distinct, and socially socially intelligent options for what the user could say next.
        Focus on building rapport, de-escalating tension, or advancing the conversation naturally.
        Format as a simple numbered list.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text || "Try asking a follow-up question related to what they just said.";
};

/**
 * Generates a high-quality single static portrait for the character.
 * Uses Gemini 2.5 Flash Image ("Nano Banana").
 */
export const generateCharacterImage = async (
    apiKey: string,
    scenario: Scenario
): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey });
    
    // Determine expression based on category/context
    let expression = "neutral and friendly";
    
    // Detailed mappings for new scenarios
    if (scenario.category === Category.Dating) expression = "slightly flirty, warm, engaging eye contact";
    if (scenario.id === 'blind-date-shy') expression = "shy, nervous smile, looking slightly down";
    if (scenario.id === 'advanced-flirting-bar') expression = "confident, smirking, playful, alluring";
    
    if (scenario.category === Category.Professional) expression = "professional, focused, confident, business attire";
    if (scenario.id === 'salary-negotiation') expression = "poker face, serious, evaluating, corporate boardroom setting";
    if (scenario.id === 'networking-event') expression = "polite corporate smile, sharp business suit";
    
    if (scenario.title.includes("Conflict")) expression = "slightly annoyed, stern, serious expression";
    if (scenario.title.includes("Party")) expression = "energetic, happy, laughing, party lighting";
    if (scenario.title.includes("Gym")) expression = "slightly sweaty, focused, athletic wear, gym background";
    if (scenario.title.includes("Grocery")) expression = "polite but slightly awkward, casual streetwear, grocery aisle background";

    const prompt = `
        A high-quality, cinematic, photorealistic portrait of ${scenario.partnerName}.
        Demographics: ${scenario.gender || 'neutral gender'}, ${scenario.description}.
        Expression: ${expression}.
        Lighting: Cinematic, professional, appropriate for the scene (${scenario.title}).
        Style: Realistic photography, sharp focus, 8k resolution, highly detailed.
        Aspect Ratio: Portrait (9:16).
        NO text, NO sprites, NO interface elements. Just the character.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                // responseMimeType is not supported for nano banana
                imageConfig: {
                    aspectRatio: "9:16"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Failed to generate image:", e);
        return null;
    }
};

/**
 * Generates speech for the character using Gemini 2.5 Flash TTS.
 */
export const generateCharacterSpeech = async (
    apiKey: string,
    text: string,
    gender: 'male' | 'female' | undefined
): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey });

    // Select voice based on gender
    const voiceName = gender === 'female' ? 'Kore' : 'Fenrir'; 

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (e) {
        console.error("Failed to generate speech:", e);
        return null;
    }
};

/**
 * Decodes base64 Raw PCM audio data from Gemini TTS.
 * The model returns 24kHz, mono, 16-bit linear PCM.
 */
export const decodeAudioData = (
  base64String: string,
  audioContext: AudioContext
): AudioBuffer => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  
  // Ensure we have an even number of bytes for 16-bit PCM
  const safeLen = len - (len % 2);
  const bytes = new Uint8Array(safeLen);
  
  for (let i = 0; i < safeLen; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini TTS output format: 24000Hz, 1 Channel, Int16
  const sampleRate = 24000;
  const numChannels = 1;
  
  // Create Int16 view of the data
  // Note: This assumes Little Endian, which is standard for most PCM
  const int16Data = new Int16Array(bytes.buffer);
  
  // Create AudioBuffer
  const buffer = audioContext.createBuffer(numChannels, int16Data.length, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Convert Int16 to Float32 (-1.0 to 1.0)
  for (let i = 0; i < int16Data.length; i++) {
    channelData[i] = int16Data[i] / 32768.0;
  }

  return buffer;
};
