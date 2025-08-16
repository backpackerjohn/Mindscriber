
import React from 'react';
import type { SubTask } from '../../../types';
import { CheckCircleIcon, CircleIcon, ClockIcon } from '../../../components/icons';

interface SubtaskItemProps {
  subtask: SubTask;
  onToggle: () => void;
}

const TimeEstimateBadge: React.FC<{ minutes: number }> = ({ minutes }) => (
    <span className="flex items-center gap-1 text-xs text-brand-text-secondary bg-brand-primary px-2 py-1 rounded-full" title={`Estimated time: ${minutes} minutes`}>
        <ClockIcon className="h-3 w-3" />
        {minutes} min
    </span>
);

const DifficultyBadge: React.FC<{ level: 'easy' | 'medium' | 'hard' }> = ({ level }) => {
    const colors = {
        easy: 'bg-green-500/20 text-green-300',
        medium: 'bg-yellow-500/20 text-yellow-300',
        hard: 'bg-red-500/20 text-red-300',
    };
    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${colors[level]}`}>
            {level}
        </span>
    );
};


const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, onToggle }) => {
  return (
    <div 
        onClick={onToggle}
        className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-brand-primary/30 transition-colors"
    >
        <button className="flex-shrink-0" aria-label={`Mark subtask ${subtask.completed ? 'incomplete' : 'complete'}`}>
            {subtask.completed ? (
                <CheckCircleIcon className="h-6 w-6 text-brand-accent" />
            ) : (
                <CircleIcon className="h-6 w-6 text-brand-text-secondary" />
            )}
        </button>
        <span className={`flex-grow text-brand-text-primary ${subtask.completed ? 'line-through text-brand-text-secondary' : ''}`}>
            {subtask.content}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
            {subtask.difficulty && <DifficultyBadge level={subtask.difficulty} />}
            {subtask.timeEstimate != null && <TimeEstimateBadge minutes={subtask.timeEstimate} />}
        </div>
    </div>
  );
};

export default SubtaskItem;
