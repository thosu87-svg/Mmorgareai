
"use client";

import { useState, useEffect, useCallback } from 'react';

interface ShopItem {
  id: number;
  content_type: string;
  reference_id: number | null;
  title: string;
  description: string;
  price: number;
  currency: string;
  is_free: boolean;
  season_tag: string | null;
  preview_image: string | null;
  emissive_shader: boolean;
  status: string;
  created_at: string;
}

const CONTENT_TYPES = ['quest_line', 'lore_pack', 'cosmetic', 'legendary_skin'];
const CURRENCIES = ['matrix_energy', 'gold', 'free'];
const STATUSES = ['active', 'archived', 'seasonal'];

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('oscc_access_token') : null;
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`/api/admin${path}`, { ...options, headers });
}

export default function AdminShopManager() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ShopItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('content_type', filterType);
      if (filterStatus) params.set('status', filterStatus);
      params.set('limit', '50');
      const res = await adminFetch(`/shop?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
    setLoading(false);
  }, [filterType, filterStatus]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async () => {
    if (!editingItem || !editingItem.title || !editingItem.content_type) {
      setFeedback({ type: 'error', message: 'Title and content type are required.' });
      return;
    }

    try {
      const isEdit = editingItem.id !== undefined;
      const res = await adminFetch(isEdit ? `/shop/${editingItem.id}` : '/shop', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(editingItem)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      setFeedback({ type: 'success', message: isEdit ? 'Item updated.' : 'Item created.' });
      setEditingItem(null);
      setIsCreating(false);
      fetchItems();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this shop item?')) return;
    try {
      const res = await adminFetch(`/shop/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setFeedback({ type: 'success', message: 'Item deleted.' });
      fetchItems();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const startCreate = () => {
    setEditingItem({
      content_type: 'cosmetic',
      title: '',
      description: '',
      price: 0,
      currency: 'matrix_energy',
      is_free: false,
      season_tag: null,
      preview_image: null,
      emissive_shader: false,
      status: 'active'
    });
    setIsCreating(true);
  };

  const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const statusColor = (s: string) => s === 'active' ? '#0f0' : s === 'seasonal' ? '#ff0' : '#555';

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: '#0a0', fontSize: 10, letterSpacing: 3, fontWeight: 'bold' }}>SHOP CONTENT MANAGER</div>
        <button onClick={startCreate} style={{
          padding: '6px 14px', background: '#0a2a0a', border: '1px solid #0f0', color: '#0f0',
          fontFamily: "'Courier New', monospace", fontSize: 11, cursor: 'pointer', borderRadius: 2, letterSpacing: 1
        }}>
          + NEW ITEM
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{
          padding: '4px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0',
          fontFamily: 'inherit', fontSize: 11, borderRadius: 2
        }}>
          <option value="">All Types</option>
          {CONTENT_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
          padding: '4px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0',
          fontFamily: 'inherit', fontSize: 11, borderRadius: 2
        }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{typeLabel(s)}</option>)}
        </select>
        <span style={{ color: '#555', fontSize: 10, alignSelf: 'center' }}>{total} items</span>
      </div>

      {feedback && (
        <div style={{
          padding: '6px 12px', marginBottom: 12, borderRadius: 2, fontSize: 11,
          background: feedback.type === 'success' ? '#0a1a0a' : '#1a0a0a',
          border: `1px solid ${feedback.type === 'success' ? '#0f0' : '#f44'}`,
          color: feedback.type === 'success' ? '#0f0' : '#f44'
        }}>
          {feedback.message}
        </div>
      )}

      {(editingItem && (isCreating || editingItem.id !== undefined)) && (
        <div style={{
          background: '#0a0a14', border: '1px solid #1a3a1a', borderRadius: 4, padding: 16, marginBottom: 16
        }}>
          <div style={{ color: '#0a0', fontSize: 10, letterSpacing: 2, marginBottom: 12, fontWeight: 'bold' }}>
            {isCreating ? 'CREATE NEW ITEM' : 'EDIT ITEM'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>TITLE</label>
              <input value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>CONTENT TYPE</label>
              <select value={editingItem.content_type || 'cosmetic'} onChange={e => setEditingItem({ ...editingItem, content_type: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2 }}>
                {CONTENT_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>DESCRIPTION</label>
            <textarea value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
              rows={3} style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>PRICE</label>
              <input type="number" value={editingItem.price || 0} onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>CURRENCY</label>
              <select value={editingItem.currency || 'matrix_energy'} onChange={e => setEditingItem({ ...editingItem, currency: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2 }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{typeLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>STATUS</label>
              <select value={editingItem.status || 'active'} onChange={e => setEditingItem({ ...editingItem, status: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2 }}>
                {STATUSES.map(s => <option key={s} value={s}>{typeLabel(s)}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>SEASON TAG</label>
              <input value={editingItem.season_tag || ''} onChange={e => setEditingItem({ ...editingItem, season_tag: e.target.value || null })}
                placeholder="e.g. winter_2025"
                style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>REFERENCE ID</label>
              <input type="number" value={editingItem.reference_id || ''} onChange={e => setEditingItem({ ...editingItem, reference_id: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Optional"
                style={{ width: '100%', padding: '6px 8px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0f0', fontFamily: 'inherit', fontSize: 12, borderRadius: 2, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0a0', fontSize: 11, cursor: 'pointer' }}>
              <input type="checkbox" checked={editingItem.is_free || false} onChange={e => setEditingItem({ ...editingItem, is_free: e.target.checked })} />
              FREE ITEM
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0a0', fontSize: 11, cursor: 'pointer' }}>
              <input type="checkbox" checked={editingItem.emissive_shader || false} onChange={e => setEditingItem({ ...editingItem, emissive_shader: e.target.checked })} />
              EMISSIVE SHADER
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{
              padding: '8px 16px', background: '#0a2a0a', border: '1px solid #0f0', color: '#0f0',
              fontFamily: 'inherit', fontSize: 11, cursor: 'pointer', borderRadius: 2, letterSpacing: 1
            }}>
              {isCreating ? 'CREATE' : 'SAVE'}
            </button>
            <button onClick={() => { setEditingItem(null); setIsCreating(false); }} style={{
              padding: '8px 16px', background: '#0a0a12', border: '1px solid #333', color: '#555',
              fontFamily: 'inherit', fontSize: 11, cursor: 'pointer', borderRadius: 2, letterSpacing: 1
            }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ color: '#555', textAlign: 'center', padding: 24 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ color: '#555', textAlign: 'center', padding: 24, fontSize: 12 }}>No shop items found.</div>
        ) : (
          items.map(item => (
            <div key={item.id} style={{
              padding: '10px 12px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ color: '#0f0', fontWeight: 'bold', fontSize: 12 }}>{item.title}</span>
                  <span style={{
                    fontSize: 9, padding: '1px 6px', borderRadius: 2,
                    background: item.content_type === 'legendary_skin' ? '#2a1a0a' : '#0a0a1a',
                    border: `1px solid ${item.content_type === 'legendary_skin' ? '#f80' : '#1a3a1a'}`,
                    color: item.content_type === 'legendary_skin' ? '#f80' : '#0a0'
                  }}>
                    {typeLabel(item.content_type)}
                  </span>
                  <span style={{ fontSize: 9, color: statusColor(item.status) }}>
                    [{item.status.toUpperCase()}]
                  </span>
                </div>
                <div style={{ color: '#555', fontSize: 10 }}>
                  {item.is_free ? 'FREE' : `${item.price} ${item.currency}`}
                  {item.season_tag ? ` · Season: ${item.season_tag}` : ''}
                  {item.emissive_shader ? ' · ✨ Emissive' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { setEditingItem({ ...item }); setIsCreating(false); }} style={{
                  padding: '4px 10px', background: '#0a0a12', border: '1px solid #1a3a1a', color: '#0a0',
                  fontFamily: 'inherit', fontSize: 10, cursor: 'pointer', borderRadius: 2
                }}>
                  EDIT
                </button>
                <button onClick={() => handleDelete(item.id)} style={{
                  padding: '4px 10px', background: '#0a0a12', border: '1px solid #3a1a1a', color: '#f44',
                  fontFamily: 'inherit', fontSize: 10, cursor: 'pointer', borderRadius: 2
                }}>
                  DEL
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
