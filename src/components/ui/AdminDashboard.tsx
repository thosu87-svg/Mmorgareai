
"use client";

import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { soundManager } from '@/services/SoundManager';
import { Brain, X, Github, CloudUpload, Key, Loader2, CheckCircle2, AlertTriangle, Lock, ShieldCheck, Download, Database } from 'lucide-react';
import { GitHubSyncService } from '@/services/GitHubSyncService';
import { DatabaseExportService } from '@/services/DatabaseExportService';

/**
 * Safe serialization helper to avoid circular reference and complex object errors.
 */
const safeStringify = (obj: any) => {
  const cache = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return '[Circular]';
      cache.add(value);
    }
    if (typeof value === 'bigint') return value.toString();
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000).toISOString();
    }
    return value;
  }, 2);
};

export const AdminDashboard = () => {
    const user = useStore(state => state.user);
    const isAxiomAuthenticated = useStore(state => state.isAxiomAuthenticated);
    const isMatrixOverseerOpen = useStore(state => state.isMatrixOverseerOpen);
    const setMatrixOverseerOpen = useStore(state => state.setMatrixOverseerOpen);
    const setAxiomAuthenticated = useStore(state => state.setAxiomAuthenticated);
    const githubConfig = useStore(state => state.githubConfig);
    const setGithubConfig = useStore(state => state.setGithubConfig);
    
    const [handshakeInput, setHandshakeInput] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const ADMIN_EMAIL = 'pleyelp2@gmail.com';
    const UNIVERSAL_KEY = 'GENER4T1V33ALLACCESSNT1TYNPLU21P1K4TZE4I';

    const hasAccess = useMemo(() => {
        return user?.email === ADMIN_EMAIL && isMatrixOverseerOpen;
    }, [user?.email, isMatrixOverseerOpen]);

    if (!hasAccess) return null;

    const handleHandshake = () => {
        if (handshakeInput.trim() === UNIVERSAL_KEY) {
            setAxiomAuthenticated(true);
            soundManager.playUI('CLICK');
        } else {
            soundManager.playUI('ERROR');
        }
    };

    const handleFullExport = async () => {
        setIsExporting(true);
        soundManager.playUI('CLICK');
        try {
            await DatabaseExportService.downloadFullExport();
        } catch (e) {
            soundManager.playUI('ERROR');
        } finally {
            setIsExporting(false);
        }
    };

    const handleGitHubSync = async () => {
        const freshStoreState = useStore.getState();
        const config = freshStoreState.githubConfig;

        if (!config.token?.trim()) {
            setSyncMessage({ type: 'error', text: 'Protocol Error: Access Token required.' });
            soundManager.playUI('ERROR');
            return;
        }
        if (!config.owner?.trim()) {
            setSyncMessage({ type: 'error', text: 'Protocol Error: Repository Owner required.' });
            soundManager.playUI('ERROR');
            return;
        }
        if (!config.repo?.trim()) {
            setSyncMessage({ type: 'error', text: 'Protocol Error: Repository Name required.' });
            soundManager.playUI('ERROR');
            return;
        }

        setIsSyncing(true);
        setSyncMessage(null);
        soundManager.playUI('CLICK');

        try {
            const snapshotData = {
                timestamp: new Date().toISOString(),
                agents: freshStoreState.agents,
                chunks: freshStoreState.loadedChunks,
                meta: { 
                    version: '1.0.6', 
                    engine: 'Axiom Frontier',
                    node: `${config.owner}/${config.repo}`
                }
            };

            const snapshot = {
                'docs/matrix_state.json': safeStringify(snapshotData),
                'docs/BACKUP_MANIFEST.md': `# Axiom Frontier Backup\nGenerated: ${new Date().toLocaleString()}\nRepository: ${config.repo}\nStatus: COMMITTED`
            };

            const result = await GitHubSyncService.pushSnapshot(config, snapshot);
            
            if (result.errors.length > 0) {
                setSyncMessage({ type: 'error', text: `Sync Failure: ${result.errors[0]}` });
                soundManager.playUI('ERROR');
            } else {
                setSyncMessage({ type: 'success', text: 'Matrix state successfully committed to GitHub.' });
            }
        } catch (e: any) {
            console.error('[GITHUB_SYNC_FATAL]', e);
            setSyncMessage({ type: 'error', text: e.message || 'Fatal Connection Error' });
            soundManager.playUI('ERROR');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center font-sans backdrop-blur-3xl animate-in fade-in duration-300 pointer-events-auto">
            <div className="w-[900px] bg-[#0a0a0f] border-2 border-emerald-500/50 rounded-3xl shadow-[0_0_100px_rgba(16,185,129,0.2)] flex flex-col overflow-hidden max-h-[90vh] relative">
                
                <div className="bg-gradient-to-r from-emerald-900/40 to-black p-8 flex justify-between items-center border-b border-white/10">
                    <div>
                        <h2 className="text-3xl font-headline font-black text-white tracking-[0.2em] uppercase italic">Master Sync Dashboard</h2>
                        <p className="text-[10px] text-emerald-400 font-mono tracking-widest mt-1 uppercase">[Clearance: Authorized Administrator]</p>
                    </div>
                    <button 
                        onClick={() => setMatrixOverseerOpen(false)} 
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {!isAxiomAuthenticated ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-8 text-center">
                        <div className="p-6 bg-emerald-500/10 rounded-full border-2 border-emerald-500/30 animate-pulse">
                            <Lock className="w-16 h-16 text-emerald-500" />
                        </div>
                        <div className="space-y-4 max-w-md">
                            <h3 className="text-2xl font-headline font-bold text-white uppercase italic">Security Handshake Required</h3>
                            <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">Provide the access signature to materialize the synchronization protocols.</p>
                            <div className="relative group">
                                <Key className="absolute left-4 top-4 w-5 h-5 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    type="password" 
                                    value={handshakeInput} 
                                    onChange={e => setHandshakeInput(e.target.value)}
                                    placeholder="Enter Universal Key..."
                                    className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl pl-12 pr-4 text-emerald-400 font-mono outline-none focus:border-emerald-500/50 transition-all"
                                    onKeyDown={e => e.key === 'Enter' && handleHandshake()}
                                />
                            </div>
                            <button 
                                onClick={handleHandshake}
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                            >
                                Grant Master Access
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex p-8 gap-10 h-auto overflow-y-auto custom-scrollbar">
                        <div className="w-1/2 space-y-8">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
                                <h3 className="text-emerald-400 text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Github className="w-5 h-5" /> GitHub Config
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Personal Access Token</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                                            <input 
                                                type="password" 
                                                value={githubConfig.token} 
                                                onChange={e => setGithubConfig({ token: e.target.value })} 
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-xs text-emerald-400 font-mono outline-none focus:border-emerald-500/50" 
                                                placeholder="ghp_..." 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Owner</label>
                                            <input 
                                                type="text" 
                                                value={githubConfig.owner} 
                                                onChange={e => setGithubConfig({ owner: e.target.value })} 
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500/50" 
                                                placeholder="Username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Repository</label>
                                            <input 
                                                type="text" 
                                                value={githubConfig.repo} 
                                                onChange={e => setGithubConfig({ repo: e.target.value })} 
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500/50" 
                                                placeholder="Repo-Name"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleGitHubSync}
                                        disabled={isSyncing}
                                        className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 italic ${isSyncing ? 'bg-emerald-900/40 text-emerald-500 animate-pulse' : 'bg-emerald-600 text-white hover:bg-white hover:text-black shadow-lg shadow-emerald-900/30'}`}
                                    >
                                        {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
                                        Push GitHub Snapshot
                                    </button>
                                    {syncMessage && (
                                        <div className={`text-[10px] font-mono p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${syncMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                            {syncMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                            {syncMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 space-y-8">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
                                <h3 className="text-white text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Database className="w-5 h-5 text-emerald-400" /> Matrix Data Export
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-6 rounded-2xl border border-white/10 bg-black/40 text-[11px] text-gray-400 leading-relaxed italic">
                                        Download a full hierarchical snapshot of the project database as a ZIP archive containing all JSON manifests.
                                    </div>
                                    
                                    <button 
                                        onClick={handleFullExport}
                                        disabled={isExporting}
                                        className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 italic ${isExporting ? 'bg-blue-900/40 text-blue-500 animate-pulse' : 'bg-blue-600 text-white hover:bg-white hover:text-black shadow-lg shadow-blue-900/30'}`}
                                    >
                                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        Download Database ZIP
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                            <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Entities</div>
                                            <div className="text-2xl font-headline font-bold text-emerald-400 italic">{useStore.getState().agents.length}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                            <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Sync Status</div>
                                            <div className="text-2xl font-headline font-bold text-emerald-400 italic">LIVE</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 bg-black/80 text-center border-t border-white/5">
                    <span className="text-[10px] text-gray-700 font-mono tracking-[0.5em] uppercase">Matrix Node: {githubConfig.owner}/{githubConfig.repo}</span>
                </div>
            </div>
        </div>
    );
};
