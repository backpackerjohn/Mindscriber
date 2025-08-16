
export interface Thought {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  isTagging: boolean;
  isSaving: boolean;
  relatedTasks?: string[]; // For PRP 4
  convertedToTaskId?: string; // For Cross-System Integration
}

// PRP 2: AI-Powered Thought Organization
export type ViewMode = 'list' | 'cluster' | 'timeline' | 'topic';

export interface AIThoughtGroup {
  id: string;
  name: string;
  description: string;
  type: 'topic' | 'temporal' | 'actionable' | 'custom';
  thoughtIds: string[];
  thoughts: Thought[]; // For easier frontend rendering
  relevanceScore: number;
}

export interface AIInsight {
  id:string;
  content: string;
  type: 'pattern' | 'suggestion' | 'action' | 'connection';
  relatedThoughtIds?: string[];
  relatedTaskIds?: string[];
}

// PRP 3: Task Management
export interface Category {
    id: string;
    name: string;
    color: string;
}

export interface ADHDQuote {
    id: string;
    quote: string;
    author: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  options: string[];
}

// PRP 4: Cross-System Integration Foundation
export interface Task {
    id: string;
    title: string;
    description?: string;
    subtasks: SubTask[];
    categoryId?: string;
    completed: boolean;
    createdAt: string;
    aiBreakdownRan: boolean;
    relatedBrainDumpEntries: string[];
    sourceThoughtId?: string;
}

export interface SubTask {
  id: string;
  content: string;
  completed: boolean;
  timeEstimate?: number; // NEW: in minutes
  actualTime?: number; // NEW: tracked completion time
  difficulty?: 'easy' | 'medium' | 'hard'; // NEW: for gamification
  insights?: SubTaskInsight[]; // NEW: AI guidance
  completedAt?: string; // NEW: for streak tracking
}

export interface SubTaskInsight {
  id: string;
  type: 'framework' | 'tips' | 'examples' | 'quickstart';
  title: string;
  content: string;
  estimatedReadTime: number; // in seconds
}

export interface UserStats {
  tasksCompleted: number;
  currentStreak: number;
  totalFocusTime: number;
  achievements: string[]; // achievement IDs
  weeklyCompletions: number[];
}

export interface TaskRecommendation {
  taskId: string;
  reason: string;
}

export interface CrossSystemInsight {
  id: string;
  insight: string;
  source: 'brain-dump' | 'task-manager' | 'combined';
}

export type CrossSystemOperation = 'convert-thought-to-task' | 'link-thought-to-task' | 'generate-project-summary' | string;

export interface CoordinatedResult {
  success: boolean;
  details: string;
}

// Authentication System
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}