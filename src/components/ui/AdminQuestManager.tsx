
"use client";

import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/admin';

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('oscc_access_token') : null;
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('oscc_refresh_token') : null;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('oscc_access_token', data.accessToken);
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          return fetch(`${API_BASE}${path}`, { ...options, headers });
        }
      } catch (_) {}
    }
    throw new Error('SESSION_EXPIRED');
  }
  return res;
}

interface QuestLine {
  id: number;
  title: string;
  description: string;
  required_level: number;
  xp_reward: number;
  gold_reward: number;
  item_rewards: any[];
  unlock_conditions: any;
  npc_id: string | null;
  dialog_tree: any[];
  quest_steps: QuestStep[];
  status: string;
  created_by: number;
  created_at: string;
}

interface QuestStep {
  type: string;
  description: string;
  target?: string;
  count?: number;
}

interface NpcDialog {
  id: number;
  npc_id: string;
  quest_line_id: number;
  dialog_key: string;
  speaker: string;
  text: string;
  options: any[];
  trigger_conditions: any;
  created_at: string;
}

interface LoreEntry {
  id: number;
  title: string;
  theme: string;
  region: string;
  faction: string;
  content: string;
  npc_background: string;
  conflict_hook: string;
  generated_by: string;
  created_at: string;
}

const STEP_TYPES = ['kill', 'gather', 'explore', 'talk'];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a',
  color: '#0f0', fontFamily: "'Courier New', monospace", fontSize: 12, borderRadius: 2,
  outline: 'none', boxSizing: 'border-box'
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical'
};

const btnStyle = (color: string, disabled?: boolean): React.CSSProperties => ({
  padding: '6px 12px', background: disabled ? '#111' : '#0a0a12',
  border: `1px solid ${disabled ? '#222' : color}`, color: disabled ? '#333' : color,
  fontFamily: "'Courier New', monospace", fontSize: 11, cursor: disabled ? 'not-allowed' : 'pointer',
  borderRadius: 2, letterSpacing: 1, transition: 'all 0.2s'
});

const labelStyle: React.CSSProperties = {
  color: '#0a0', fontSize: 10, letterSpacing: 1, display: 'block', marginBottom: 4
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#0a0', fontSize: 10, letterSpacing: 3, marginBottom: 10, fontWeight: 'bold',
  borderBottom: '1px solid #1a3a1a', paddingBottom: 4
};

function QuestFormPanel({ quest, onSave, onCancel }: {
  quest: QuestLine | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(quest?.title || '');
  const [description, setDescription] = useState(quest?.description || '');
  const [requiredLevel, setRequiredLevel] = useState(quest?.required_level || 1);
  const [xpReward, setXpReward] = useState(quest?.xp_reward || 0);
  const [goldReward, setGoldReward] = useState(quest?.gold_reward || 0);
  const [itemRewards, setItemRewards] = useState<string>(JSON.stringify(quest?.item_rewards || [], null, 2));
  const [npcId, setNpcId] = useState(quest?.npc_id || '');
  const [status, setStatus] = useState(quest?.status || 'draft');
  const [steps, setSteps] = useState<QuestStep[]>(
    Array.isArray(quest?.quest_steps) ? quest.quest_steps :
    typeof quest?.quest_steps === 'string' ? JSON.parse(quest.quest_steps || '[]') : []
  );
  const [unlockPrereqQuest, setUnlockPrereqQuest] = useState(quest?.unlock_conditions?.prerequisite_quest || '');
  const [unlockLevel, setUnlockLevel] = useState(quest?.unlock_conditions?.level || '');
  const [unlockItem, setUnlockItem] = useState(quest?.unlock_conditions?.item || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addStep = () => {
    setSteps([...steps, { type: 'kill', description: '', target: '', count: 1 }]);
  };

  const updateStep = (idx: number, field: string, value: any) => {
    const updated = [...steps];
    (updated[idx] as any)[field] = value;
    setSteps(updated);
  };

  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const moveStep = (idx: number, dir: number) => {
    if (idx + dir < 0 || idx + dir >= steps.length) return;
    const updated = [...steps];
    [updated[idx], updated[idx + dir]] = [updated[idx + dir], updated[idx]];
    setSteps(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let parsedItems: any[] = [];
      try { parsedItems = JSON.parse(itemRewards); } catch { parsedItems = []; }

      const unlockConditions: any = {};
      if (unlockPrereqQuest) unlockConditions.prerequisite_quest = unlockPrereqQuest;
      if (unlockLevel) unlockConditions.level = parseInt(unlockLevel);
      if (unlockItem) unlockConditions.item = unlockItem;

      await onSave({
        title, description, required_level: requiredLevel,
        xp_reward: xpReward, gold_reward: goldReward,
        item_rewards: parsedItems,
        unlock_conditions: unlockConditions,
        npc_id: npcId || null,
        quest_steps: steps,
        status
      });
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={sectionTitleStyle}>{quest ? 'EDIT QUEST LINE' : 'CREATE QUEST LINE'}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>TITLE *</label>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Quest title" />
        </div>
        <div>
          <label style={labelStyle}>NPC ID</label>
          <input style={inputStyle} value={npcId} onChange={e => setNpcId(e.target.value)} placeholder="npc_merchant_01" />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>DESCRIPTION</label>
        <textarea style={textareaStyle} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Quest description..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>REQUIRED LEVEL</label>
          <input style={inputStyle} type="number" min={1} value={requiredLevel} onChange={e => setRequiredLevel(parseInt(e.target.value) || 1)} />
        </div>
        <div>
          <label style={labelStyle}>XP REWARD</label>
          <input style={inputStyle} type="number" min={0} value={xpReward} onChange={e => setXpReward(parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>GOLD REWARD</label>
          <input style={inputStyle} type="number" min={0} value={goldReward} onChange={e => setGoldReward(parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>STATUS</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>ITEM REWARDS (JSON)</label>
        <textarea style={textareaStyle} rows={2} value={itemRewards} onChange={e => setItemRewards(e.target.value)} placeholder='[{"item": "iron_sword", "quantity": 1}]' />
      </div>

      <div style={sectionTitleStyle}>UNLOCK CONDITIONS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>PREREQUISITE QUEST ID</label>
          <input style={inputStyle} value={unlockPrereqQuest} onChange={e => setUnlockPrereqQuest(e.target.value)} placeholder="quest_id" />
        </div>
        <div>
          <label style={labelStyle}>REQUIRED LEVEL</label>
          <input style={inputStyle} type="number" value={unlockLevel} onChange={e => setUnlockLevel(e.target.value)} placeholder="1" />
        </div>
        <div>
          <label style={labelStyle}>REQUIRED ITEM</label>
          <input style={inputStyle} value={unlockItem} onChange={e => setUnlockItem(e.target.value)} placeholder="item_key" />
        </div>
      </div>

      <div style={sectionTitleStyle}>QUEST STEPS (ORDERED OBJECTIVES)</div>
      {steps.map((step, idx) => (
        <div key={idx} style={{
          display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8,
          padding: 8, background: '#0a0a14', border: '1px solid #1a2a1a', borderRadius: 2
        }}>
          <span style={{ color: '#555', fontSize: 10, width: 20 }}>#{idx + 1}</span>
          <select style={{ ...inputStyle, width: 100, flex: '0 0 100px' }} value={step.type} onChange={e => updateStep(idx, 'type', e.target.value)}>
            {STEP_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <input style={{ ...inputStyle, flex: 1 }} value={step.description} onChange={e => updateStep(idx, 'description', e.target.value)} placeholder="Objective description" />
          <input style={{ ...inputStyle, width: 100, flex: '0 0 100px' }} value={step.target || ''} onChange={e => updateStep(idx, 'target', e.target.value)} placeholder="Target" />
          <input style={{ ...inputStyle, width: 60, flex: '0 0 60px' }} type="number" min={1} value={step.count || 1} onChange={e => updateStep(idx, 'count', parseInt(e.target.value) || 1)} />
          <button style={btnStyle('#555')} onClick={() => moveStep(idx, -1)} title="Move up">▲</button>
          <button style={btnStyle('#555')} onClick={() => moveStep(idx, 1)} title="Move down">▼</button>
          <button style={btnStyle('#f44')} onClick={() => removeStep(idx)} title="Remove">✕</button>
        </div>
      ))}
      <button style={{ ...btnStyle('#0f0'), marginBottom: 16 }} onClick={addStep}>+ ADD STEP</button>

      {error && (
        <div style={{ color: '#f44', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 2 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle('#0f0', saving)} onClick={handleSubmit} disabled={saving}>
          {saving ? '▓ SAVING...' : quest ? '✓ UPDATE QUEST' : '✓ CREATE QUEST'}
        </button>
        <button style={btnStyle('#555')} onClick={onCancel}>CANCEL</button>
      </div>
    </div>
  );
}

function DialogEditor({ questId }: { questId: number }) {
  const [dialogs, setDialogs] = useState<NpcDialog[]>([]);
  const [speaker, setSpeaker] = useState('');
  const [text, setText] = useState('');
  const [dialogKey, setDialogKey] = useState('');
  const [npcId, setNpcId] = useState('');
  const [options, setOptions] = useState('[]');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDialogs = useCallback(async () => {
    try {
      const res = await adminFetch(`/quests/${questId}/dialogs`);
      const data = await res.json();
      if (data.success) setDialogs(data.dialogs || []);
    } catch {}
  }, [questId]);

  useEffect(() => { fetchDialogs(); }, [fetchDialogs]);

  const addDialog = async () => {
    if (!speaker.trim() || !text.trim()) { setError('Speaker and text required.'); return; }
    setLoading(true);
    setError('');
    try {
      let parsedOpts: any[] = [];
      try { parsedOpts = JSON.parse(options); } catch { parsedOpts = []; }

      const res = await adminFetch(`/quests/${questId}/dialogs`, {
        method: 'POST',
        body: JSON.stringify({ npc_id: npcId || null, dialog_key: dialogKey || null, speaker, text, options: parsedOpts })
      });
      const data = await res.json();
      if (data.success) {
        setSpeaker(''); setText(''); setDialogKey(''); setOptions('[]');
        await fetchDialogs();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 12, background: '#0a0a10', border: '1px solid #1a3a1a', borderRadius: 2, marginTop: 12 }}>
      <div style={sectionTitleStyle}>DIALOG TREE — QUEST #{questId}</div>

      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
        {dialogs.length === 0 ? (
          <div style={{ color: '#555', fontSize: 11, padding: 8 }}>No dialogs yet.</div>
        ) : dialogs.map((d, idx) => (
          <div key={d.id} style={{
            padding: '6px 8px', borderBottom: '1px solid #111', fontSize: 11,
            display: 'flex', gap: 8
          }}>
            <span style={{ color: '#555', width: 20 }}>#{idx + 1}</span>
            <span style={{ color: '#0ff', fontWeight: 'bold', minWidth: 80 }}>{d.speaker}</span>
            <span style={{ color: '#0a0', flex: 1 }}>{d.text}</span>
            {d.dialog_key && <span style={{ color: '#555', fontSize: 9 }}>[{d.dialog_key}]</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>SPEAKER *</label>
          <input style={inputStyle} value={speaker} onChange={e => setSpeaker(e.target.value)} placeholder="NPC Name" />
        </div>
        <div>
          <label style={labelStyle}>NPC ID</label>
          <input style={inputStyle} value={npcId} onChange={e => setNpcId(e.target.value)} placeholder="npc_01" />
        </div>
        <div>
          <label style={labelStyle}>DIALOG KEY</label>
          <input style={inputStyle} value={dialogKey} onChange={e => setDialogKey(e.target.value)} placeholder="greeting_01" />
        </div>
        <div>
          <label style={labelStyle}>OPTIONS (JSON)</label>
          <input style={inputStyle} value={options} onChange={e => setOptions(e.target.value)} placeholder='[{"text":"Accept","next":"accept_01"}]' />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>DIALOG TEXT *</label>
        <textarea style={textareaStyle} rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="What the NPC says..." />
      </div>

      {error && <div style={{ color: '#f44', fontSize: 11, marginBottom: 8 }}>{error}</div>}

      <button style={btnStyle('#0ff', loading)} onClick={addDialog} disabled={loading}>
        {loading ? '▓ ADDING...' : '+ ADD DIALOG NODE'}
      </button>
    </div>
  );
}

function LorePanel() {
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [theme, setTheme] = useState('');
  const [region, setRegion] = useState('');
  const [faction, setFaction] = useState('');
  const [generating, setGenerating] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualNpcBg, setManualNpcBg] = useState('');
  const [manualConflict, setManualConflict] = useState('');
  const [manualTheme, setManualTheme] = useState('');
  const [manualRegion, setManualRegion] = useState('');
  const [manualFaction, setManualFaction] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingLore, setEditingLore] = useState<LoreEntry | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchLore = useCallback(async () => {
    try {
      const res = await adminFetch('/lore');
      const data = await res.json();
      if (data.success) setLoreEntries(data.lore || []);
    } catch {}
  }, []);

  useEffect(() => { fetchLore(); }, [fetchLore]);

  const generateLore = async () => {
    if (!theme && !region && !faction) { setFeedback({ type: 'error', msg: 'Provide at least one of theme, region, or faction.' }); return; }
    setGenerating(true);
    setFeedback(null);
    try {
      const res = await adminFetch('/lore/generate', {
        method: 'POST',
        body: JSON.stringify({ theme: theme || undefined, region: region || undefined, faction: faction || undefined })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', msg: `Lore generated: "${data.lore.title}"` });
        await fetchLore();
      } else {
        setFeedback({ type: 'error', msg: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    }
    setGenerating(false);
  };

  const saveLore = async () => {
    if (!manualTitle.trim()) { setFeedback({ type: 'error', msg: 'Title is required.' }); return; }
    setSaving(true);
    setFeedback(null);
    try {
      const url = editingLore ? `/lore/${editingLore.id}` : '/lore';
      const method = editingLore ? 'PUT' : 'POST';
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify({
          title: manualTitle, content: manualContent, npc_background: manualNpcBg,
          conflict_hook: manualConflict, theme: manualTheme || undefined,
          region: manualRegion || undefined, faction: manualFaction || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', msg: editingLore ? 'Lore updated.' : 'Lore created.' });
        setShowManualForm(false);
        setEditingLore(null);
        resetManualForm();
        await fetchLore();
      } else {
        setFeedback({ type: 'error', msg: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    }
    setSaving(false);
  };

  const deleteLore = async (id: number) => {
    if (!confirm('Delete this lore entry?')) return;
    try {
      const res = await adminFetch(`/lore/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', msg: 'Lore deleted.' });
        await fetchLore();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const editLore = (lore: LoreEntry) => {
    setEditingLore(lore);
    setManualTitle(lore.title);
    setManualContent(lore.content);
    setManualNpcBg(lore.npc_background);
    setManualConflict(lore.conflict_hook);
    setManualTheme(lore.theme || '');
    setManualRegion(lore.region || '');
    setManualFaction(lore.faction || '');
    setShowManualForm(true);
  };

  const resetManualForm = () => {
    setManualTitle(''); setManualContent(''); setManualNpcBg('');
    setManualConflict(''); setManualTheme(''); setManualRegion(''); setManualFaction('');
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={sectionTitleStyle}>AI LORE GENERATOR</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>THEME</label>
          <input style={inputStyle} value={theme} onChange={e => setTheme(e.target.value)} placeholder="Dark corruption, ancient war..." />
        </div>
        <div>
          <label style={labelStyle}>REGION</label>
          <input style={inputStyle} value={region} onChange={e => setRegion(e.target.value)} placeholder="Shadow Wastes, Crystal Peaks..." />
        </div>
        <div>
          <label style={labelStyle}>FACTION</label>
          <input style={inputStyle} value={faction} onChange={e => setFaction(e.target.value)} placeholder="Data Weavers, Void Walkers..." />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={btnStyle('#a0f', generating)} onClick={generateLore} disabled={generating}>
          {generating ? '▓ GENERATING...' : '✦ GENERATE LORE (AI)'}
        </button>
        <button style={btnStyle('#0f0')} onClick={() => { setShowManualForm(true); setEditingLore(null); resetManualForm(); }}>
          + MANUAL ENTRY
        </button>
      </div>

      {showManualForm && (
        <div style={{ padding: 12, background: '#0a0a14', border: '1px solid #1a3a1a', borderRadius: 2, marginBottom: 16 }}>
          <div style={sectionTitleStyle}>{editingLore ? 'EDIT LORE ENTRY' : 'NEW LORE ENTRY'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={labelStyle}>TITLE *</label>
              <input style={inputStyle} value={manualTitle} onChange={e => setManualTitle(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>THEME</label>
              <input style={inputStyle} value={manualTheme} onChange={e => setManualTheme(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>REGION</label>
              <input style={inputStyle} value={manualRegion} onChange={e => setManualRegion(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>FACTION</label>
              <input style={inputStyle} value={manualFaction} onChange={e => setManualFaction(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>CONTENT</label>
            <textarea style={textareaStyle} rows={3} value={manualContent} onChange={e => setManualContent(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={labelStyle}>NPC BACKGROUND</label>
              <textarea style={textareaStyle} rows={2} value={manualNpcBg} onChange={e => setManualNpcBg(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>CONFLICT HOOK</label>
              <textarea style={textareaStyle} rows={2} value={manualConflict} onChange={e => setManualConflict(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnStyle('#0f0', saving)} onClick={saveLore} disabled={saving}>
              {saving ? '▓ SAVING...' : editingLore ? '✓ UPDATE' : '✓ SAVE'}
            </button>
            <button style={btnStyle('#555')} onClick={() => { setShowManualForm(false); setEditingLore(null); }}>CANCEL</button>
          </div>
        </div>
      )}

      {feedback && (
        <div style={{
          marginBottom: 12, padding: '8px 12px', borderRadius: 2, fontSize: 11,
          background: feedback.type === 'success' ? '#0a1a0a' : '#1a0a0a',
          border: `1px solid ${feedback.type === 'success' ? '#0f0' : '#f44'}`,
          color: feedback.type === 'success' ? '#0f0' : '#f44'
        }}>
          {feedback.type === 'success' ? '✓ ' : '✗ '}{feedback.msg}
        </div>
      )}

      <div style={sectionTitleStyle}>LORE ENTRIES ({loreEntries.length})</div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loreEntries.length === 0 ? (
          <div style={{ color: '#555', fontSize: 11, padding: 8 }}>No lore entries yet.</div>
        ) : loreEntries.map(lore => (
          <div key={lore.id} style={{
            padding: 10, borderBottom: '1px solid #111', fontSize: 11
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#0f0', fontWeight: 'bold', fontSize: 12 }}>{lore.title}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 2,
                  background: lore.generated_by === 'ai' ? '#1a0a2a' : '#0a1a0a',
                  border: `1px solid ${lore.generated_by === 'ai' ? '#a0f' : '#0f0'}`,
                  color: lore.generated_by === 'ai' ? '#a0f' : '#0f0'
                }}>
                  {lore.generated_by === 'ai' ? 'AI' : 'MANUAL'}
                </span>
                <button style={{ ...btnStyle('#0ff'), padding: '2px 6px', fontSize: 9 }} onClick={() => editLore(lore)}>EDIT</button>
                <button style={{ ...btnStyle('#f44'), padding: '2px 6px', fontSize: 9 }} onClick={() => deleteLore(lore.id)}>DEL</button>
              </div>
            </div>
            <div style={{ color: '#555', fontSize: 9, marginBottom: 4 }}>
              {[lore.theme && `Theme: ${lore.theme}`, lore.region && `Region: ${lore.region}`, lore.faction && `Faction: ${lore.faction}`].filter(Boolean).join(' · ') || 'No tags'}
            </div>
            <div style={{ color: '#0a0', marginBottom: 4 }}>{lore.content?.slice(0, 200)}{lore.content?.length > 200 ? '...' : ''}</div>
            {lore.conflict_hook && (
              <div style={{ color: '#f80', fontSize: 10 }}>⚔ {lore.conflict_hook.slice(0, 150)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminQuestManager() {
  const [tab, setTab] = useState<'quests' | 'lore'>('quests');
  const [quests, setQuests] = useState<QuestLine[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<QuestLine | null>(null);
  const [editingQuest, setEditingQuest] = useState<QuestLine | null | 'new'>(null);
  const [showDialogs, setShowDialogs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await adminFetch(`/quests${params}`);
      const data = await res.json();
      if (data.success) setQuests(data.quests || []);
    } catch {}
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchQuests(); }, [fetchQuests]);

  const saveQuest = async (data: any) => {
    const isEdit = editingQuest && editingQuest !== 'new';
    const url = isEdit ? `/quests/${(editingQuest as QuestLine).id}` : '/quests';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await adminFetch(url, { method, body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Save failed.');
    setFeedback({ type: 'success', msg: isEdit ? 'Quest updated.' : 'Quest created.' });
    setEditingQuest(null);
    await fetchQuests();
  };

  const deleteQuest = async (id: number) => {
    if (!confirm('Delete this quest line? This cannot be undone.')) return;
    try {
      const res = await adminFetch(`/quests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', msg: 'Quest deleted.' });
        if (selectedQuest?.id === id) setSelectedQuest(null);
        if (showDialogs === id) setShowDialogs(null);
        await fetchQuests();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const statusColor = (s: string) => s === 'active' ? '#0f0' : s === 'draft' ? '#ff0' : '#555';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid #1a3a1a', background: '#0a0a10' }}>
        {(['quests', 'lore'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 14px', background: tab === t ? '#0a2a0a' : '#0a0a12',
            border: `1px solid ${tab === t ? '#0f0' : '#1a3a1a'}`, color: tab === t ? '#0f0' : '#555',
            fontFamily: "'Courier New', monospace", fontSize: 11, cursor: 'pointer', borderRadius: 2,
            letterSpacing: 2, textTransform: 'uppercase'
          }}>
            {t === 'quests' ? '⚔ QUESTS' : '📜 LORE'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'lore' ? <LorePanel /> : editingQuest ? (
          <QuestFormPanel
            quest={editingQuest === 'new' ? null : editingQuest}
            onSave={saveQuest}
            onCancel={() => setEditingQuest(null)}
          />
        ) : (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={sectionTitleStyle}>QUEST LINES ({quests.length})</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...inputStyle, width: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
                <button style={btnStyle('#0f0')} onClick={() => setEditingQuest('new')}>+ NEW QUEST</button>
              </div>
            </div>

            {feedback && (
              <div style={{
                marginBottom: 12, padding: '8px 12px', borderRadius: 2, fontSize: 11,
                background: feedback.type === 'success' ? '#0a1a0a' : '#1a0a0a',
                border: `1px solid ${feedback.type === 'success' ? '#0f0' : '#f44'}`,
                color: feedback.type === 'success' ? '#0f0' : '#f44'
              }}>
                {feedback.type === 'success' ? '✓ ' : '✗ '}{feedback.msg}
              </div>
            )}

            {loading ? (
              <div style={{ color: '#555', padding: 16, textAlign: 'center' }}>Loading quests...</div>
            ) : quests.length === 0 ? (
              <div style={{ color: '#555', padding: 16, textAlign: 'center' }}>No quests found. Create one to get started.</div>
            ) : (
              <div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 80px 100px 140px',
                  gap: 8, padding: '6px 8px', borderBottom: '1px solid #1a3a1a', fontSize: 10,
                  color: '#555', letterSpacing: 1
                }}>
                  <span>TITLE</span><span>NPC</span><span>LEVEL</span><span>XP</span><span>GOLD</span><span>STATUS</span><span>ACTIONS</span>
                </div>
                {quests.map(q => (
                  <div key={q.id}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 80px 100px 140px',
                      gap: 8, padding: '8px', borderBottom: '1px solid #111', fontSize: 11,
                      alignItems: 'center', cursor: 'pointer',
                      background: selectedQuest?.id === q.id ? '#0a1a0a' : 'transparent'
                    }} onClick={() => setSelectedQuest(selectedQuest?.id === q.id ? null : q)}>
                      <span style={{ color: '#0f0', fontWeight: 'bold' }}>{q.title}</span>
                      <span style={{ color: '#0a0' }}>{q.npc_id || '—'}</span>
                      <span style={{ color: '#0a0' }}>{q.required_level}</span>
                      <span style={{ color: '#ff0' }}>{q.xp_reward}</span>
                      <span style={{ color: '#ff0' }}>{q.gold_reward}</span>
                      <span style={{
                        color: statusColor(q.status), fontSize: 9, padding: '2px 6px',
                        border: `1px solid ${statusColor(q.status)}`, borderRadius: 2, textAlign: 'center',
                        textTransform: 'uppercase'
                      }}>
                        {q.status}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ ...btnStyle('#0ff'), padding: '3px 6px', fontSize: 9 }} onClick={e => { e.stopPropagation(); setEditingQuest(q); }}>EDIT</button>
                        <button style={{ ...btnStyle('#a0f'), padding: '3px 6px', fontSize: 9 }} onClick={e => { e.stopPropagation(); setShowDialogs(showDialogs === q.id ? null : q.id); }}>DIALOG</button>
                        <button style={{ ...btnStyle('#f44'), padding: '3px 6px', fontSize: 9 }} onClick={e => { e.stopPropagation(); deleteQuest(q.id); }}>DEL</button>
                      </div>
                    </div>

                    {selectedQuest?.id === q.id && (
                      <div style={{ padding: '8px 16px', background: '#0a0a14', borderBottom: '1px solid #1a3a1a', fontSize: 11 }}>
                        <div style={{ color: '#0a0', marginBottom: 4 }}>{q.description || 'No description.'}</div>
                        {Array.isArray(q.quest_steps) && q.quest_steps.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ color: '#555', fontSize: 10, letterSpacing: 1 }}>STEPS:</span>
                            {q.quest_steps.map((s: any, i: number) => (
                              <div key={i} style={{ color: '#0a0', paddingLeft: 12, marginTop: 2 }}>
                                #{i + 1} [{s.type?.toUpperCase()}] {s.description} {s.target ? `→ ${s.target}` : ''} {s.count ? `(×${s.count})` : ''}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.unlock_conditions && Object.keys(q.unlock_conditions).length > 0 && (
                          <div style={{ marginTop: 6, color: '#555', fontSize: 10 }}>
                            Unlock: {JSON.stringify(q.unlock_conditions)}
                          </div>
                        )}
                      </div>
                    )}

                    {showDialogs === q.id && <DialogEditor questId={q.id} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
