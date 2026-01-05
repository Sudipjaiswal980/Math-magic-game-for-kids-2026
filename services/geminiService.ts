
import { GoogleGenAI } from "@google/genai";
import { MathProblem } from "../types";

// Always use a named parameter for apiKey and use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates the main 3D logo for the app.
 */
export const generateAppLogo = async (): Promise<string | null> => {
  const prompt = `A 3D colorful and vibrant text logo saying 'MathMagic', stylized for kids, glossy finish, rainbow colors, Pixar style, high quality 3D render, solid white background, centered, clean, simple, no background elements.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

/**
 * Generates a 3D badge for a specific difficulty level.
 */
export const generateDifficultyBadge = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

/**
 * Generates a 3D 'Encouragement Shield' for mistakes.
 */
export const generateEncouragementBadge = async (): Promise<string | null> => {
  const prompt = `A cute 3D heart-shaped crystal shield with angel wings, Pixar style, vibrant colors, 3D render, solid white background, high quality.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export const generateMathStory = async (problem: MathProblem): Promise<string> => {
  const opSymbol = {
    addition: '+',
    subtraction: '-',
    multiplication: 'x',
    division: '÷'
  }[problem.operation];

  const prompt = `Persona: ${problem.character}.
  Task: Create a 1-sentence whimsical word problem for a child using numbers ${problem.num1} and ${problem.num2} with ${opSymbol}.
  Rules: Be very brief. Mention the reward: ${problem.reward}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.9 }
    });
    return response.text?.trim() || `Complete this quest to win ${problem.reward}! ✨`;
  } catch (error) {
    return `Complete this quest to win ${problem.reward}! ✨`;
  }
};

export const generateCharacterReaction = async (character: string, isCorrect: boolean): Promise<string | null> => {
  const reaction = isCorrect ? "celebrating happily with thumbs up" : "looking encouraging and kind";
  const prompt = `A cute 3D Pixar style version of ${character} ${reaction}, 3D render, high quality, solid white background, vibrant colors.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export const generateRewardImage = async (topic: string): Promise<string | null> => {
  const prompt = `A high-quality 3D render of ${topic}, shiny, Pixar Disney style, solid white background, vibrant colors, magical glow.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export const generateMotivationalFeedback = async (isCorrect: boolean, streak: number): Promise<string> => {
  const prompt = isCorrect 
    ? `High-energy 5-word cheer for a child getting a math question right! Current streak: ${streak}.`
    : `10-word kind and supportive encouragement for a child who made a math mistake. 🦉`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || (isCorrect ? "Amazing job! Keep it up!" : "Don't worry, you're learning!");
  } catch (error) { 
    return isCorrect ? "Amazing job! Keep it up!" : "Don't worry, you're learning!"; 
  }
};
