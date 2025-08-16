
import React, { useState, useEffect } from 'react';
import { generateSubtasks } from '../../../lib/ai/task-management/subtask-generator';
import { SparklesIcon, PlusIcon } from '../../../components/icons';
import type { SubTask, Category } from '../../../types';

interface AddTaskModalProps {
  onClose: () => void;
  onAddTask: (title: string, subtasks: Pick<SubTask, 'content' | 'timeEstimate' | 'difficulty'>[], categoryId?: string) => Promise<void>;
  categories: Category[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onAddTask, categories }) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [step, setStep] = useState(1); // 1: title, 2: review
  const [subtasks, setSubtasks] = useState<Pick<SubTask, 'content' | 'timeEstimate' | 'difficulty'>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleGenerateBreakdown = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const generated = await generateSubtasks(title);
      if (generated.length > 0) {
        setSubtasks(generated);
        setStep(2);
      } else {
        setError("The AI couldn't break down this task. Try rephrasing the title.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCreateTask = async () => {
    if (!title.trim()) return;
    setError(null);
    setIsGenerating(true); // Re-use for "creating" state
    try {
        await onAddTask(title, subtasks, categoryId || undefined);
    } catch (err) {
        setError("Failed to create the task. Please try again.");
        setIsGenerating(false);
    }
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 id="add-task-title" className="text-2xl font-bold text-brand-text-primary">Create a New Task</h2>
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-md text-sm">{error}</div>}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-brand-text-secondary mb-1">Task Title</label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Plan weekend trip"
                className="w-full bg-brand-background border border-brand-primary rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-accent"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && !isGenerating && title.trim() && handleGenerateBreakdown()}
              />
            </div>
             <div>
                <label htmlFor="task-category" className="block text-sm font-medium text-brand-text-secondary mb-1">Category (Optional)</label>
                <select id="task-category" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-brand-background border border-brand-primary rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-accent">
                    <option value="">No Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
            <button
              onClick={handleGenerateBreakdown}
              disabled={!title.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-md font-semibold disabled:opacity-50 hover:bg-red-500 transition-colors"
            >
              <SparklesIcon className="w-5 h-5" />
              {isGenerating ? 'Breaking it down...' : 'Break Down with AI'}
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 id="add-task-title" className="text-xl font-bold text-brand-text-primary">Suggested Plan for "{title}"</h2>
            <p className="text-sm text-brand-text-secondary">Review the AI's plan below, or create the task now.</p>
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-md text-sm">{error}</div>}
            
            <ul className="space-y-2 bg-brand-background p-3 rounded-md border border-brand-primary max-h-60 overflow-y-auto">
                {subtasks.length > 0 ? subtasks.map((st, index) => (
                    <li key={index} className="text-brand-text-primary list-disc list-inside">{st.content} <span className="text-xs text-brand-text-secondary">({st.timeEstimate}m, {st.difficulty})</span></li>
                )) : (
                    <p className="text-brand-text-secondary italic">No sub-tasks were generated.</p>
                )}
            </ul>

            <div className="flex flex-col sm:flex-row gap-2">
                 <button
                    onClick={() => setStep(1)}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-md font-semibold disabled:opacity-50 hover:bg-blue-500 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleCreateTask}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-semibold disabled:opacity-50 hover:bg-green-500 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>{isGenerating ? 'Creating...' : 'Create Task'}</span>
                </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
    >
      <div className="bg-brand-surface border border-brand-primary rounded-lg shadow-2xl w-full max-w-lg relative transition-all duration-300">
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-text-secondary hover:text-white text-2xl leading-none z-10" aria-label="Close modal">&times;</button>
        
        <div className="p-6 min-h-[420px]">
            {isGenerating && <div className="absolute inset-0 bg-brand-surface/50 flex items-center justify-center z-20"><div className="w-8 h-8 border-4 border-t-transparent border-brand-accent rounded-full animate-spin"></div></div>}
            {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
