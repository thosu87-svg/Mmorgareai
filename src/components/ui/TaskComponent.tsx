'use client';

import { useState } from 'react';
import { Agent } from '@/lib/agent';
import { Task } from '@/lib/types';
import { Plus, Trash2, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TaskComponentProps {
  agent: Agent;
  onUpdate: () => void;
}

export default function TaskComponent({ agent, onUpdate }: TaskComponentProps) {
  const [tasks, setTasks] = useState<Task[]>(agent.tasks);
  const [newTaskGoal, setNewTaskGoal] = useState('');

  const addTask = () => {
    if (newTaskGoal.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        goal: newTaskGoal,
        status: 'pending',
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      agent.tasks = updatedTasks;
      setNewTaskGoal('');
      onUpdate();
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        let nextStatus: Task['status'] = 'pending';
        if (t.status === 'pending') nextStatus = 'active';
        else if (t.status === 'active') nextStatus = 'done';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updatedTasks);
    agent.tasks = updatedTasks;
    onUpdate();
  };

  const removeTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    agent.tasks = updatedTasks;
    onUpdate();
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'active': return <PlayCircle className="h-4 w-4 text-accent animate-pulse" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 bg-secondary/10 border border-border rounded-[2rem] backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-headline font-black italic uppercase tracking-tighter text-white">
            Objectives: {agent.name}
          </h3>
          <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 italic">
            Neural Task Ledger
          </p>
        </div>
        <Badge variant="outline" className="border-accent/30 text-accent font-black text-[10px]">
          {tasks.length} ACTIVE_NODES
        </Badge>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          value={newTaskGoal}
          onChange={(e) => setNewTaskGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="New axiomatic objective..."
          className="bg-black/40 border-border italic text-xs text-white h-12 rounded-xl focus:ring-accent/50"
        />
        <Button 
          onClick={addTask} 
          className="axiom-gradient text-white h-12 px-6 rounded-xl font-black italic uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4 mr-2" />
          Manifest
        </Button>
      </div>

      <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="py-10 text-center opacity-30 italic text-xs text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            No active goals detected in memory cache.
          </div>
        ) : (
          tasks.map(task => (
            <li 
              key={task.id} 
              className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-accent/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className="hover:scale-110 transition-transform"
                >
                  {getStatusIcon(task.status)}
                </button>
                <span className={`text-xs font-medium tracking-tight italic ${
                  task.status === 'done' ? 'line-through text-muted-foreground opacity-50' : 'text-white/80'
                }`}>
                  {task.goal}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[8px] font-black text-accent/40 uppercase tracking-widest hidden group-hover:block">
                  {task.status}
                </span>
                <button 
                  onClick={() => removeTask(task.id)} 
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">
          Deterministic Sync: Active
        </span>
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 heartbeat-pulse" />
      </div>
    </div>
  );
}
