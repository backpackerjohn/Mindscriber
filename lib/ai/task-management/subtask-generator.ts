

import { GoogleGenAI, Type } from "@google/genai";
import type { SubTask } from "../../../types";

const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | undefined;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

const enhancedSubtaskSchema = {
    type: Type.OBJECT,
    properties: {
        subtasks: {
            type: Type.ARRAY,
            description: "Array of 3-7 subtasks.",
            items: {
                type: Type.OBJECT,
                properties: {
                    content: {
                        type: Type.STRING,
                        description: "The action-oriented description of the subtask."
                    },
                    timeEstimate: {
                        type: Type.INTEGER,
                        description: "The estimated time in minutes to complete the subtask."
                    },
                    difficulty: {
                        type: Type.STRING,
                        description: "The difficulty of the subtask: 'easy', 'medium', or 'hard'."
                    }
                },
                required: ["content", "timeEstimate", "difficulty"]
            }
        }
    },
    required: ["subtasks"]
};

export async function generateSubtasks(taskTitle: string): Promise<Pick<SubTask, 'content' | 'timeEstimate' | 'difficulty'>[]> {
    if (!ai) {
        console.warn("VITE_GEMINI_API_KEY environment variable not set. AI subtask generation is disabled.");
        return [];
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Your task is to break down the user's goal into a series of actionable subtasks.
User's Goal: "${taskTitle}"

You MUST respond with a JSON object containing a "subtasks" array. Each object in the array should have "content" (string), "timeEstimate" (integer in minutes), and "difficulty" (string: 'easy', 'medium', or 'hard').

Guidelines for the subtasks:
1. Create 3-7 subtasks.
2. Subtask descriptions should start with a verb and be clear and action-oriented.
3. Time estimates should be realistic for someone with ADHD. Keep individual steps under 45 minutes.
4. Difficulty should be based on cognitive load and time (e.g., easy < 10min, medium 10-30min, hard > 30min).

Do not include any other text, explanations, or markdown formatting in your response. Only the JSON object is allowed.`,
            config: {
                systemInstruction: "You are an AI assistant acting as an energetic and practical productivity coach for a user with ADHD. Your goal is to break down big, overwhelming tasks into small, clear, actionable steps that include realistic time estimates.",
                responseMimeType: "application/json",
                responseSchema: enhancedSubtaskSchema,
                temperature: 0.4,
            }
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed && Array.isArray(parsed.subtasks)) {
            return parsed.subtasks;
        }
        return [];

    } catch (error) {
        console.error("Error generating enhanced subtasks with Gemini API:", error);
        throw new Error("The AI failed to break down your task. Please try again.");
    }
}