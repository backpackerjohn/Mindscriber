import { GoogleGenAI, Type } from "@google/genai";

// API_KEY is sourced from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTags = async (thoughtContent: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following thought and generate 3 to 5 relevant, concise tags for it. The user has ADHD, so the tags should be simple, intuitive, and action-oriented if possible. Avoid overly technical or abstract jargon.
      
      Thought: "${thoughtContent}"
      
      Return the tags as a JSON object with a single key "tags" containing an array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 3-5 suggested tags."
            }
          },
          required: ["tags"]
        },
        temperature: 0.2,
        topK: 10
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed && Array.isArray(parsed.tags)) {
      return parsed.tags;
    }
    
    return [];
  } catch (error) {
    console.error("Error generating tags with Gemini API:", error);
    // Graceful fallback: return empty array so the thought is still saved.
    return [];
  }
};