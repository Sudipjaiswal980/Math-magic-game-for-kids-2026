
import { GoogleGenAI } from "@google/genai";
import { MathProblem } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMathStory = async (problem: MathProblem): Promise<string> => {
  const opSymbol = {
    addition: '+',
    subtraction: '-',
    multiplication: 'x',
    division: '÷'
  }[problem.operation];

  const prompt = `Persona: ${problem.character}.
  Task: Create a 1-sentence whimsical word problem for a child using numbers ${problem.num1} and ${problem.num2} with ${opSymbol}.
  Rules: Be very brief. Include a thematic emoji. Mention the reward: ${problem.reward}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.9 }
    });
    return response.text?.trim() || `Solve this to win a ${problem.reward}! ✨`;
  } catch (error) {
    return `Solve this to win a ${problem.reward}! ✨`;
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
  // Enhanced prompt to handle Money and Gift Cards specifically
  const prompt = topic.includes('$') 
    ? `A 3D stack of shiny dollar bills with a gold ribbon, Pixar style, high quality render, solid white background, vibrant green and gold colors.`
    : `A 3D magical game gift card for ${topic}, colorful holographic design, Pixar style, 3D render, solid white background.`;

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
    ? `High-energy 5-word cheer for getting a math question right! Streak: ${streak}.`
    : `10-word kind encouragement for a mistake. 🦉`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Amazing!";
  } catch (error) { return "Amazing!"; }
};
