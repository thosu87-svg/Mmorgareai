
'use client';

import React, { useState } from 'react';
import { Key, BrainCircuit, Lock, AlertTriangle, X } from 'lucide-react';
import { useStore } from '@/store';

const UNIVERSAL_KEY = 'GENER4T1V33ALLACCESSNT1TYNPLU21P1K4TZE4I';
const ADMIN_EMAIL = 'pleyelp2@gmail.com';

interface AxiomHandshakeModalProps {
  onClose: () => void;
}

export const AxiomHandshakeModal: React.FC<AxiomHandshakeModalProps> = ({ onClose }) => {
  const [keyInput, setKeyInput] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(false);
  const { user, setAxiomAuthenticated } = useStore();

  if (user?.email !== ADMIN_EMAIL) return null;

  const handleHandshake = () => {
    if (keyInput.trim() === UNIVERSAL_KEY) {
      setIsSuccess(true);
      setError(false);
      setAxiomAuthenticated(true);
      setTimeout(onClose, 1500);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-6 font-sans backdrop-blur-3xl pointer-events-auto animate-in fade-in duration-700">
      <div className={`max-w-md w-full bg-[#0a0a0f] border-2 rounded-[3.5rem] p-12 text-center shadow-2xl relative overflow-hidden transition-all duration-500 ${
        isSuccess ? 'border-emerald-500/50 shadow-emerald-500/20' : 
        error ? 'border-red-500/50 shadow-red-500/20 animate-bounce' : 
        'border-accent/40 shadow-accent/20'
      }`}>
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${isSuccess ? 'bg-emerald-500' : error ? 'bg-red-500' : 'bg-accent'} animate-pulse shadow-[0_0_15px_currentColor]`} />
        
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-700 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 active:scale-90">
          <X className="h-6 w-6" />
        </button>

        <div className="mb-12 relative">
          <div className={`absolute inset-0 blur-3xl opacity-20 transition-colors duration-1000 ${isSuccess ? 'bg-emerald-500' : error ? 'bg-red-500' : 'bg-accent'}`} />
          {isSuccess ? (
            <BrainCircuit className="w-20 h-20 mx-auto text-emerald-400 animate-bounce" />
          ) : error ? (
            <AlertTriangle className="w-20 h-20 mx-auto text-red-500 animate-pulse" />
          ) : (
            <Lock className="w-20 h-20 mx-auto text-accent animate-pulse" />
          )}
        </div>

        <h2 className={`text-3xl font-headline font-black mb-3 uppercase tracking-tighter transition-colors duration-500 ${isSuccess ? 'text-emerald-400' : error ? 'text-red-500' : 'text-white'}`}>
          {isSuccess ? 'IDENTITY VERIFIED' : error ? 'ACCESS DENIED' : 'AXIOM HANDSHAKE'}
        </h2>

        {!isSuccess ? (
          <>
            <div className="relative mb-8 group">
              <div className="absolute left-6 top-6 transition-colors group-focus-within:text-accent">
                <Key className="w-5 h-5 text-gray-700" />
              </div>
              <input 
                type="password" 
                placeholder="UNIVERSAL KEY..." 
                className={`w-full bg-black/60 border rounded-3xl py-6 pl-16 pr-6 text-sm transition-all shadow-inner font-mono focus:outline-none ${error ? 'border-red-500/50 text-red-400 placeholder:text-red-900' : 'border-white/10 text-accent placeholder:text-gray-800 focus:border-accent/60'}`} 
                value={keyInput} 
                onChange={e => setKeyInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleHandshake()} 
              />
            </div>
            <button 
              onClick={handleHandshake} 
              className={`w-full py-6 rounded-3xl font-black text-xs transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.3em] ${error ? 'bg-red-600/20 text-red-500 border border-red-500/30' : 'bg-accent text-black hover:bg-white shadow-accent/40'}`}
            >
              {error ? 'RETRY HANDSHAKE' : 'GRANT ACCESS'}
            </button>
          </>
        ) : (
          <div className="py-10 space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="text-emerald-400 text-xs font-mono animate-pulse uppercase tracking-[0.4em]">[OVERSEER STATUS: ACTIVE]</div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-[10px] text-emerald-400/80 font-mono uppercase leading-loose">
              Matrix stabilization complete.<br/>Root privileges materialized.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
