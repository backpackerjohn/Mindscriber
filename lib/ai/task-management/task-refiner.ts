

import { GoogleGenAI, Type } from "@google/genai";
import type { SubTask, ClarifyingQuestion } from "../../../types";

const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | undefined;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. AI features will be disabled.");
}

const clarifyingQuestionsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "Array of 3-4 multiple-choice clarifying questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The clarifying question to ask the user." },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 2-4 short, distinct answer options.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["question", "options"]
            }
        }
    },
    required: ["questions"]
};

export async function generateClarifyingQuestions(taskTitle: string): Promise<Omit<ClarifyingQuestion, 'id'>[]> {
    if (!ai) {
        console.warn("VITE_GEMINI_API_KEY environment variable not set. AI question generation is disabled.");
        return [];
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `To help me break down the task "${taskTitle}", I need to ask a few questions to understand the goal. Generate 3-4 multiple-choice questions to reduce ambiguity and define the scope. Each question should have 2-4 short, distinct options.
            
            Example for "plan a trip": "What is the primary goal of this trip?" with options ["Relaxation", "Adventure", "Family Time"].
            
            The questions should be practical and help define the task's boundaries or goals. Return a JSON object matching the provided schema.
            `,
            config: {
                systemInstruction: "You are an AI assistant acting as an energetic and practical productivity coach for a user with ADHD. Your goal is to help them clarify tasks to make them less overwhelming.",
                responseMimeType: "application/json",
                responseSchema: clarifyingQuestionsSchema,
                temperature: 0.5,
            }
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed && Array.isArray(parsed.questions)) {
            return parsed.questions;
        }
        return [];

    } catch (error) {
        console.error("Error generating clarifying questions with Gemini API:", error);
        throw new Error("The AI failed to generate clarifying questions. The response might have been blocked or invalid.");
    }
}


const refinedSubtasksSchema = {
    type: Type.OBJECT,
    properties: {
        subtasks: {
            type: Type.ARRAY,
            description: "Array of 3-7 subtasks with time estimates and difficulty ratings.",
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


export async function refineSubtasks(taskTitle: string, answers: Record<string, string>): Promise<Pick<SubTask, 'content' | 'timeEstimate' | 'difficulty'>[]> {
    if (!ai) {
        console.warn("VITE_GEMINI_API_KEY environment variable not set. AI subtask refinement is disabled.");
        return [];
    }

    const answersString = Object.entries(answers)
        .map(([question, answer]) => `- For the question "${question}", the user chose: "${answer}".`)
        .join('\n');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Your task is to create a refined action plan for the user's goal, based on their answers to clarifying questions.
User's Goal: "${taskTitle}"

User's Answers:
---
${answersString}
---

You MUST respond with a JSON object containing a "subtasks" array. Each object in the array should have "content" (string), "timeEstimate" (integer in minutes), and "difficulty" (string: 'easy', 'medium', or 'hard').

Based on the user's answers, generate a new list of 3-7 subtasks that are small, clear, and actionable.

Do not include any other text, explanations, or markdown formatting in your response. Only the JSON object is allowed.`,
            config: {
                systemInstruction: "You are an AI assistant acting as an energetic and practical productivity coach for a user with ADHD. You've just asked some clarifying questions and now you're creating the perfect, tailored action plan with time estimates and difficulty ratings.",
                responseMimeType: "application/json",
                responseSchema: refinedSubtasksSchema,
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
        console.error("Error refining subtasks with Gemini API:", error);
        throw new Error("The AI failed to refine your task breakdown. Please try again.");
    }
}