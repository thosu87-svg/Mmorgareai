"use client";

import { useStore, TimeOfDay } from '@/store';
import { Moon, Sparkles, Box, Globe, Zap, ShieldCheck, Sun, Sunrise } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export const ShaderController = () => {
  const shaderSettings = useStore(state => state.shaderSettings);
  const setShaderSetting = useStore(state => state.setShaderSetting);
  const timeOfDay = useStore(state => state.timeOfDay);
  const setTimeOfDay = useStore(state => state.setTimeOfDay);

  const controls = [
    { key: 'enableStars', label: 'Star Field', icon: Sparkles },
    { key: 'enableAmbient', label: 'Ambient Light', icon: Moon },
    { key: 'enableEnvironment', label: 'IBL Maps', icon: Globe },
    { key: 'forceEmissive', label: 'Force Glow', icon: Zap },
  ];

  const times: { id: TimeOfDay; icon: any; label: string }[] = [
    { id: 'day', icon: Sun, label: 'Day' },
    { id: 'dusk', icon: Sunrise, label: 'Dusk' },
    { id: 'night', icon: Moon, label: 'Night' },
  ];

  return (
    <div className="bg-axiom-dark/90 backdrop-blur-2xl border border-axiom-cyan/30 rounded-3xl p-6 w-72 shadow-2xl pointer-events-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Box className="w-5 h-5 text-axiom-cyan" />
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Simulation Deck</h3>
      </div>

      <div className="space-y-3">
        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Time of Day</label>
        <div className="flex gap-2">
          {times.map((t) => (
            <Button
              key={t.id}
              onClick={() => setTimeOfDay(t.id)}
              variant={timeOfDay === t.id ? 'default' : 'outline'}
              className={`flex-1 h-10 p-0 ${timeOfDay === t.id ? 'axiom-gradient border-0' : 'border-white/10 bg-white/5'}`}
              title={t.label}
            >
              <t.icon size={14} className={timeOfDay === t.id ? 'text-white' : 'text-gray-500'} />
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Axiomatic Subsystems</label>
        {controls.map((ctrl) => {
          const Icon = ctrl.icon;
          const isActive = (shaderSettings as any)[ctrl.key];
          
          return (
            <div key={ctrl.key} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-axiom-cyan/10 text-axiom-cyan' : 'bg-white/5 text-gray-600'}`}>
                  <Icon size={14} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {ctrl.label}
                </span>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={(val) => setShaderSetting(ctrl.key as any, val)}
                className="scale-75"
              />
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <p className="text-[8px] text-emerald-400 leading-tight uppercase font-black italic">
            Visual integrity stabilized. High-science clarity protocol active.
          </p>
        </div>
      </div>
    </div>
  );
};