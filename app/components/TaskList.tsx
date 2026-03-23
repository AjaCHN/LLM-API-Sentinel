// app/components/TaskList.tsx v4.0.1
'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'inProgress' | 'done';
  createdAt: any;
}

interface TaskListProps {
  tasks: Task[];
  addTask: (title: string) => void;
  updateTaskStatus: (id: string, status: 'todo' | 'inProgress' | 'done') => void;
  deleteTask: (id: string) => void;
}

export default function TaskList({ tasks, addTask, updateTaskStatus, deleteTask }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'inProgress':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="border border-border bg-card/50 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/20">
        <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic font-serif mb-4">Task Management</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-primary text-primary-foreground p-1.5 rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[400px]">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm font-mono">
            No tasks found.
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={cn(
                "group flex items-center justify-between p-3 rounded-md border border-transparent hover:border-border hover:bg-muted/30 transition-all",
                task.status === 'done' && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button 
                  onClick={() => {
                    const nextStatus = task.status === 'todo' ? 'inProgress' : task.status === 'inProgress' ? 'done' : 'todo';
                    updateTaskStatus(task.id, nextStatus);
                  }}
                  className="shrink-0 hover:scale-110 transition-transform"
                  title={`Current status: ${task.status}. Click to change.`}
                >
                  {getStatusIcon(task.status)}
                </button>
                <span className={cn(
                  "text-sm truncate",
                  task.status === 'done' && "line-through"
                )}>
                  {task.title}
                </span>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                  className="text-xs bg-background border border-border rounded px-1 py-0.5 focus:outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
