
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function summarizeSlideContent(text: string): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this presentation slide content into a short, punchy title (max 5 words): "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING }
          },
          required: ["title"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.title || "Untitled Slide";
  } catch (error) {
    console.error("Gemini optimization failed:", error);
    return "New Slide";
  }
}
