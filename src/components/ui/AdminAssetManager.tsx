
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = '/api/admin';

interface Asset {
  id: number;
  admin_id: number;
  filename: string;
  original_name: string;
  asset_type: string;
  file_path: string;
  file_size: number;
  processing_status: string;
  metadata: any;
  draco_compressed: boolean;
  created_at: string;
}

interface LodEntry {
  id: number;
  asset_id: number;
  lod_level: number;
  file_path: string;
  polygon_count: number;
  distance_min: number;
  distance_max: number;
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('oscc_access_token') : null;
  const headers: any = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) throw new Error('SESSION_EXPIRED');
  return res;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    ready: { bg: '#0a1a0a', border: '#0f0', text: '#0f0' },
    processing: { bg: '#1a1a0a', border: '#ff0', text: '#ff0' },
    pending: { bg: '#0a0a1a', border: '#08f', text: '#08f' },
    failed: { bg: '#1a0a0a', border: '#f44', text: '#f44' }
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{
      padding: '2px 8px', fontSize: 9, letterSpacing: 1, borderRadius: 2,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      textTransform: 'uppercase', fontWeight: 'bold'
    }}>
      {status}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function ThreePreview({ asset, lodEntries }: { asset: Asset; lodEntries: LodEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const frameRef = useRef<number>(0);

  const [ambientIntensity, setAmbientIntensity] = useState(0.6);
  const [directionalIntensity, setDirectionalIntensity] = useState(0.8);
  const [wireframe, setWireframe] = useState(false);
  const [activeLod, setActiveLod] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadModel = useCallback(async (filePath: string) => {
    try {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      if (!containerRef.current) return;

      if (rendererRef.current) {
        cancelAnimationFrame(frameRef.current);
        rendererRef.current.dispose();
        containerRef.current.innerHTML = '';
      }

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight || 400;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a14);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(3, 2, 3);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const controls = new (OrbitControls as any)(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;

      const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
      ambientLight.name = 'ambient';
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, directionalIntensity);
      dirLight.position.set(5, 5, 5);
      dirLight.name = 'directional';
      scene.add(dirLight);

      const gridHelper = new THREE.GridHelper(10, 10, 0x1a3a1a, 0x111118);
      scene.add(gridHelper);

      setLoading(true);
      setError('');

      const loader = new (GLTFLoader as any)();
      const url = '/' + filePath;
      loader.load(
        url,
        (gltf: any) => {
          if (modelRef.current && sceneRef.current) {
            sceneRef.current.remove(modelRef.current);
          }
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / (maxDim || 1);
          model.scale.setScalar(scale);
          model.position.sub(center.multiplyScalar(scale));

          model.traverse((child: any) => {
            if (child.isMesh && child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m: any) => { m.wireframe = wireframe; });
            }
          });

          scene.add(model);
          modelRef.current = model;

          const dist = 3;
          camera.position.set(dist, dist * 0.7, dist);
          controls.target.set(0, 0, 0);
          controls.update();

          setLoading(false);
        },
        undefined,
        (err: any) => {
          setError('Failed to load model: ' + (err?.message || 'Unknown error'));
          setLoading(false);
        }
      );

      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        if (controlsRef.current) controlsRef.current.update();
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

    } catch (err: any) {
      setError('Three.js initialization failed: ' + err.message);
      setLoading(false);
    }
  }, [ambientIntensity, directionalIntensity, wireframe]);

  useEffect(() => {
    const selectedLod = lodEntries.find(l => l.lod_level === activeLod);
    const filePath = selectedLod ? selectedLod.file_path : asset.file_path;
    loadModel(filePath);

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [asset.file_path, activeLod, lodEntries, loadModel]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => { m.wireframe = wireframe; });
        }
      });
    }
  }, [wireframe]);

  useEffect(() => {
    if (sceneRef.current) {
      const ambient = sceneRef.current.getObjectByName('ambient');
      if (ambient) ambient.intensity = ambientIntensity;
    }
  }, [ambientIntensity]);

  useEffect(() => {
    if (sceneRef.current) {
      const dir = sceneRef.current.getObjectByName('directional');
      if (dir) dir.intensity = directionalIntensity;
    }
  }, [directionalIntensity]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div ref={containerRef} style={{ flex: 1, minHeight: 400, position: 'relative', background: '#0a0a14' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,10,20,0.8)', color: '#0f0', fontSize: 12, zIndex: 10
          }}>
            ▓ LOADING MODEL...
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,10,20,0.8)', color: '#f44', fontSize: 12, zIndex: 10, padding: 20, textAlign: 'center'
          }}>
            ⚠ {error}
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px', background: '#0a0a12', borderTop: '1px solid #1a3a1a' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>
              AMBIENT: {ambientIntensity.toFixed(1)}
            </label>
            <input type="range" min={0} max={200} value={ambientIntensity * 100}
              onChange={e => setAmbientIntensity(Number(e.target.value) / 100)}
              style={{ width: '100%', accentColor: '#0f0' }} />
          </div>

          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ color: '#0a0', fontSize: 9, letterSpacing: 1, display: 'block', marginBottom: 2 }}>
              DIRECTIONAL: {directionalIntensity.toFixed(1)}
            </label>
            <input type="range" min={0} max={300} value={directionalIntensity * 100}
              onChange={e => setDirectionalIntensity(Number(e.target.value) / 100)}
              style={{ width: '100%', accentColor: '#0f0' }} />
          </div>

          <button onClick={() => setWireframe(!wireframe)} style={{
            padding: '4px 10px', background: wireframe ? '#0a2a0a' : '#0a0a12',
            border: `1px solid ${wireframe ? '#0f0' : '#1a3a1a'}`,
            color: wireframe ? '#0f0' : '#555', fontFamily: "'Courier New', monospace",
            fontSize: 10, cursor: 'pointer', borderRadius: 2
          }}>
            {wireframe ? '◉ WIREFRAME' : '○ WIREFRAME'}
          </button>

          {lodEntries.length > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {lodEntries.map(l => (
                <button key={l.lod_level} onClick={() => setActiveLod(l.lod_level)} style={{
                  padding: '4px 8px', background: activeLod === l.lod_level ? '#0a2a0a' : '#0a0a12',
                  border: `1px solid ${activeLod === l.lod_level ? '#0f0' : '#1a3a1a'}`,
                  color: activeLod === l.lod_level ? '#0f0' : '#555',
                  fontFamily: "'Courier New', monospace", fontSize: 9, cursor: 'pointer', borderRadius: 2
                }}>
                  LOD{l.lod_level} ({l.polygon_count} tri)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAssetManager() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedLod, setSelectedLod] = useState<LodEntry[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [generatingLod, setGeneratingLod] = useState<number | null>(null);
  const [assignBiome, setAssignBiome] = useState('');
  const [assignIntensity, setAssignIntensity] = useState(0.6);
  const [assignTiling, setAssignTiling] = useState(1.0);
  const [assigningTexture, setAssigningTexture] = useState(false);
  const [textureAssignments, setTextureAssignments] = useState<Record<string, { asset_id: number; target_value: string; intensity: number; tiling_x: number }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTextureAssignments = useCallback(async () => {
    try {
      const res = await adminFetch('/assets/texture-map');
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, any> = {};
        for (const a of (data.assignments || [])) {
          map[`${a.target_type}:${a.target_value}`] = a;
        }
        setTextureAssignments(map);
      }
    } catch {}
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      let queryStr = '/assets';
      const params: string[] = [];
      if (filterType) params.push(`type=${filterType}`);
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (params.length > 0) queryStr += '?' + params.join('&');

      const res = await adminFetch(queryStr);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch assets:', err.message);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    fetchAssets();
    fetchTextureAssignments();
  }, [fetchAssets, fetchTextureAssignments]);

  const handleAssignTexture = async (assetId: number) => {
    if (!assignBiome) return;
    setAssigningTexture(true);
    try {
      const res = await adminFetch(`/assets/${assetId}/assign-texture`, {
        method: 'POST',
        body: JSON.stringify({
          target_type: 'biome',
          target_value: assignBiome,
          blend_mode: 'overlay',
          intensity: assignIntensity,
          tiling_x: assignTiling,
          tiling_y: assignTiling
        })
      });
      if (res.ok) {
        setAssignBiome('');
        await fetchTextureAssignments();
      }
    } catch (err: any) {
      console.error('Assign failed:', err.message);
    }
    setAssigningTexture(false);
  };

  const handleUnassignTexture = async (assetId: number, targetType: string, targetValue: string) => {
    try {
      await adminFetch(`/assets/${assetId}/assign-texture`, {
        method: 'DELETE',
        body: JSON.stringify({ target_type: targetType, target_value: targetValue })
      });
      await fetchTextureAssignments();
    } catch (err: any) {
      console.error('Unassign failed:', err.message);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await adminFetch('/assets/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
          const data = await res.json();
          console.error(`Upload failed for ${file.name}:`, data.message);
        }
      } catch (err: any) {
        failCount++;
        console.error(`Upload error for ${file.name}:`, err.message);
      }
    }

    setUploadProgress(`Done: ${successCount} uploaded, ${failCount} failed`);
    setUploading(false);
    await fetchAssets();
    setTimeout(() => setUploadProgress(''), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await adminFetch(`/assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedAsset?.id === id) {
          setSelectedAsset(null);
          setSelectedLod([]);
        }
        setDeleteConfirm(null);
        await fetchAssets();
      }
    } catch (err: any) {
      console.error('Delete failed:', err.message);
    }
  };

  const handleGenerateLod = async (id: number) => {
    setGeneratingLod(id);
    try {
      const res = await adminFetch(`/assets/${id}/generate-lod`, { method: 'POST' });
      if (res.ok) {
        await fetchAssets();
        if (selectedAsset?.id === id) {
          await selectAsset(id);
        }
      }
    } catch (err: any) {
      console.error('LOD generation failed:', err.message);
    }
    setGeneratingLod(null);
  };

  const selectAsset = async (id: number) => {
    try {
      const res = await adminFetch(`/assets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAsset(data.asset);
        setSelectedLod(data.lod || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch asset:', err.message);
    }
  };

  const parseMetadata = (meta: any): any => {
    if (typeof meta === 'string') {
      try { return JSON.parse(meta); } catch { return {}; }
    }
    return meta || {};
  };

  return (
    <div style={{
      display: 'flex', flex: 1, height: 'calc(100vh - 45px)', overflow: 'hidden',
      fontFamily: "'Courier New', monospace", color: '#0f0'
    }}>
      <div style={{
        width: 460, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid #1a3a1a', background: '#0a0a10'
      }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            margin: 12, padding: 24, border: `2px dashed ${dragOver ? '#0f0' : '#1a3a1a'}`,
            borderRadius: 4, textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(0,255,0,0.05)' : '#0a0a14',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>{dragOver ? '⬇' : '📁'}</div>
          <div style={{ fontSize: 11, color: dragOver ? '#0f0' : '#555', letterSpacing: 1 }}>
            {uploading ? uploadProgress : 'DROP FILES OR CLICK TO UPLOAD'}
          </div>
          <div style={{ fontSize: 9, color: '#333', marginTop: 4 }}>
            GLTF · GLB · PNG · JPG · WEBP (MAX 50MB)
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".gltf,.glb,.png,.jpg,.jpeg,.webp,.tga,.bmp"
            style={{ display: 'none' }}
            onChange={e => handleUpload(e.target.files)}
          />
        </div>

        {uploadProgress && !uploading && (
          <div style={{
            margin: '0 12px 8px', padding: '6px 10px', fontSize: 10,
            background: '#0a1a0a', border: '1px solid #0f0', borderRadius: 2, color: '#0f0'
          }}>
            ✓ {uploadProgress}
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, padding: '0 12px 8px' }}>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{
            flex: 1, padding: '4px 6px', background: '#0a0a12', border: '1px solid #1a3a1a',
            color: '#0f0', fontFamily: 'inherit', fontSize: 10, borderRadius: 2
          }}>
            <option value="">ALL TYPES</option>
            <option value="gltf">3D MODELS</option>
            <option value="texture">TEXTURES</option>
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
            flex: 1, padding: '4px 6px', background: '#0a0a12', border: '1px solid #1a3a1a',
            color: '#0f0', fontFamily: 'inherit', fontSize: 10, borderRadius: 2
          }}>
            <option value="">ALL STATUS</option>
            <option value="ready">READY</option>
            <option value="processing">PROCESSING</option>
            <option value="pending">PENDING</option>
            <option value="failed">FAILED</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#0a0a14', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', color: '#0a0', letterSpacing: 1, borderBottom: '1px solid #1a3a1a' }}>NAME</th>
                <th style={{ padding: '6px 4px', textAlign: 'center', color: '#0a0', letterSpacing: 1, borderBottom: '1px solid #1a3a1a' }}>TYPE</th>
                <th style={{ padding: '6px 4px', textAlign: 'right', color: '#0a0', letterSpacing: 1, borderBottom: '1px solid #1a3a1a' }}>SIZE</th>
                <th style={{ padding: '6px 4px', textAlign: 'center', color: '#0a0', letterSpacing: 1, borderBottom: '1px solid #1a3a1a' }}>STATUS</th>
                <th style={{ padding: '6px 4px', textAlign: 'center', color: '#0a0', letterSpacing: 1, borderBottom: '1px solid #1a3a1a' }}>LOD</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', color: '#0a0', letterSpacing: 1, borderBottom: '1px solid #1a3a1a' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#333' }}>
                    NO ASSETS FOUND
                  </td>
                </tr>
              )}
              {assets.map(asset => {
                const meta = parseMetadata(asset.metadata);
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => selectAsset(asset.id)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#0a1a0a' : 'transparent',
                      borderBottom: '1px solid #111'
                    }}
                  >
                    <td style={{ padding: '6px 8px', color: '#0f0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {asset.asset_type === 'texture' && asset.processing_status === 'ready' && (
                          <img
                            src={'/' + asset.file_path}
                            alt=""
                            style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 2, border: '1px solid #1a3a1a' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <span title={asset.original_name}>{asset.original_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#555' }}>
                      {asset.asset_type === 'gltf' ? '🎮' : '🖼'} {asset.asset_type.toUpperCase()}
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#555' }}>
                      {formatFileSize(asset.file_size)}
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <StatusBadge status={asset.processing_status} />
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#555' }}>
                      {asset.asset_type === 'gltf' ? (
                        meta.lodGenerated ? (
                          <span style={{ color: '#0f0', fontSize: 9 }}>✓ {meta.lodLevels || 3}L</span>
                        ) : (
                          <span style={{ color: '#333', fontSize: 9 }}>—</span>
                        )
                      ) : (
                        <span style={{ color: '#333', fontSize: 9 }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        {asset.asset_type === 'gltf' && asset.processing_status === 'ready' && (
                          <button
                            onClick={() => handleGenerateLod(asset.id)}
                            disabled={generatingLod === asset.id}
                            title="Generate LOD"
                            style={{
                              padding: '2px 6px', background: '#0a0a12',
                              border: '1px solid #0ff', color: generatingLod === asset.id ? '#333' : '#0ff',
                              fontFamily: 'inherit', fontSize: 9, cursor: generatingLod === asset.id ? 'wait' : 'pointer',
                              borderRadius: 2
                            }}
                          >
                            {generatingLod === asset.id ? '⏳' : '◈ LOD'}
                          </button>
                        )}
                        {deleteConfirm === asset.id ? (
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button onClick={() => handleDelete(asset.id)} style={{
                              padding: '2px 6px', background: '#1a0a0a', border: '1px solid #f44',
                              color: '#f44', fontFamily: 'inherit', fontSize: 9, cursor: 'pointer', borderRadius: 2
                            }}>
                              YES
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                              padding: '2px 6px', background: '#0a0a12', border: '1px solid #555',
                              color: '#555', fontFamily: 'inherit', fontSize: 9, cursor: 'pointer', borderRadius: 2
                            }}>
                              NO
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(asset.id)} title="Delete" style={{
                            padding: '2px 6px', background: '#0a0a12', border: '1px solid #3a1a1a',
                            color: '#f44', fontFamily: 'inherit', fontSize: 9, cursor: 'pointer', borderRadius: 2
                          }}>
                            ✗
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{
          padding: '6px 12px', borderTop: '1px solid #1a3a1a', fontSize: 9, color: '#333',
          display: 'flex', justifyContent: 'space-between'
        }}>
          <span>{assets.length} ASSETS</span>
          <span>{assets.filter(a => a.asset_type === 'gltf').length} MODELS · {assets.filter(a => a.asset_type === 'texture').length} TEXTURES</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedAsset ? (
          selectedAsset.asset_type === 'gltf' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '8px 12px', background: '#0a0a14', borderBottom: '1px solid #1a3a1a',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 'bold' }}>{selectedAsset.original_name}</span>
                  <span style={{ fontSize: 9, color: '#555', marginLeft: 8 }}>{formatFileSize(selectedAsset.file_size)}</span>
                </div>
                <StatusBadge status={selectedAsset.processing_status} />
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <ThreePreview asset={selectedAsset} lodEntries={selectedLod} />
              </div>

              {selectedLod.length > 0 && (
                <div style={{
                  padding: '8px 12px', background: '#0a0a14', borderTop: '1px solid #1a3a1a'
                }}>
                  <div style={{ fontSize: 9, color: '#0a0', letterSpacing: 2, marginBottom: 6, fontWeight: 'bold' }}>LOD LEVELS</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {selectedLod.map(l => (
                      <div key={l.lod_level} style={{
                        flex: 1, padding: '6px 8px', background: '#0a0a12',
                        border: '1px solid #1a3a1a', borderRadius: 2
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 'bold', color: '#0f0' }}>LOD {l.lod_level}</div>
                        <div style={{ fontSize: 9, color: '#555' }}>{l.polygon_count.toLocaleString()} triangles</div>
                        <div style={{ fontSize: 9, color: '#333' }}>{l.distance_min}m – {l.distance_max === 9999 ? '∞' : l.distance_max + 'm'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              <div style={{
                padding: '8px 12px', background: '#0a0a14', borderBottom: '1px solid #1a3a1a',
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'absolute', top: 0, left: 0
              }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 'bold' }}>{selectedAsset.original_name}</span>
                  <span style={{ fontSize: 9, color: '#555', marginLeft: 8 }}>{formatFileSize(selectedAsset.file_size)}</span>
                </div>
                <StatusBadge status={selectedAsset.processing_status} />
              </div>
              {selectedAsset.processing_status === 'ready' ? (
                <img
                  src={'/' + selectedAsset.file_path}
                  alt={selectedAsset.original_name}
                  style={{
                    maxWidth: '70%', maxHeight: '45vh', objectFit: 'contain',
                    border: '1px solid #1a3a1a', borderRadius: 4
                  }}
                />
              ) : (
                <div style={{ color: '#555', fontSize: 12 }}>
                  TEXTURE PREVIEW UNAVAILABLE
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 10, color: '#555' }}>
                {(() => {
                  const meta = parseMetadata(selectedAsset.metadata);
                  return meta.width ? `${meta.width} × ${meta.height} · ${meta.format || 'unknown'}` : '';
                })()}
              </div>

              <div style={{
                marginTop: 16, padding: 12, background: '#0a0a14', border: '1px solid #1a3a1a',
                borderRadius: 4, width: '90%', maxWidth: 400
              }}>
                <div style={{ fontSize: 9, color: '#0a0', letterSpacing: 2, marginBottom: 8, fontWeight: 'bold' }}>
                  ASSIGN TO BIOME
                </div>

                {(() => {
                  const currentAssignments = Object.entries(textureAssignments)
                    .filter(([, a]) => a.asset_id === selectedAsset.id);
                  return currentAssignments.length > 0 ? (
                    <div style={{ marginBottom: 8 }}>
                      {currentAssignments.map(([key, a]) => (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '4px 8px', background: '#0a1a0a', border: '1px solid #0f04',
                          borderRadius: 2, marginBottom: 4, fontSize: 10
                        }}>
                          <span style={{ color: '#0f0' }}>{a.target_value}</span>
                          <span style={{ color: '#555' }}>intensity: {a.intensity} · tiling: {a.tiling_x}x</span>
                          <button onClick={() => handleUnassignTexture(selectedAsset.id, key.split(':')[0], a.target_value)} style={{
                            padding: '1px 6px', background: '#1a0a0a', border: '1px solid #f44',
                            color: '#f44', fontSize: 8, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit'
                          }}>REMOVE</button>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}

                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={assignBiome} onChange={e => setAssignBiome(e.target.value)} style={{
                    padding: '4px 6px', background: '#0a0a12', border: '1px solid #1a3a1a',
                    color: '#0f0', fontFamily: 'inherit', fontSize: 10, borderRadius: 2, flex: 1, minWidth: 80
                  }}>
                    <option value="">SELECT BIOME</option>
                    <option value="CITY">CITY</option>
                    <option value="FOREST">FOREST</option>
                    <option value="MOUNTAIN">MOUNTAIN</option>
                    <option value="DESERT">DESERT</option>
                    <option value="SWAMP">SWAMP</option>
                    <option value="PLAINS">PLAINS</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <label style={{ fontSize: 8, color: '#555' }}>INT</label>
                    <input type="range" min="0.1" max="1.0" step="0.1" value={assignIntensity}
                      onChange={e => setAssignIntensity(parseFloat(e.target.value))}
                      style={{ width: 50 }} />
                    <span style={{ fontSize: 8, color: '#0f0', width: 20 }}>{assignIntensity}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <label style={{ fontSize: 8, color: '#555' }}>TILE</label>
                    <input type="range" min="0.5" max="4.0" step="0.5" value={assignTiling}
                      onChange={e => setAssignTiling(parseFloat(e.target.value))}
                      style={{ width: 50 }} />
                    <span style={{ fontSize: 8, color: '#0f0', width: 20 }}>{assignTiling}x</span>
                  </div>
                  <button
                    onClick={() => handleAssignTexture(selectedAsset.id)}
                    disabled={!assignBiome || assigningTexture}
                    style={{
                      padding: '4px 10px', background: assignBiome ? '#0a1a0a' : '#0a0a12',
                      border: `1px solid ${assignBiome ? '#0f0' : '#333'}`,
                      color: assignBiome ? '#0f0' : '#333', fontFamily: 'inherit', fontSize: 9,
                      cursor: assignBiome ? 'pointer' : 'not-allowed', borderRadius: 2, fontWeight: 'bold'
                    }}
                  >
                    {assigningTexture ? 'ASSIGNING...' : 'ASSIGN'}
                  </button>
                </div>
                <div style={{ fontSize: 8, color: '#333', marginTop: 6 }}>
                  Assigned textures will blend with the procedural terrain in the game world.
                </div>
              </div>
            </div>
          )
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8
          }}>
            <div style={{ fontSize: 32, opacity: 0.2 }}>◈</div>
            <div style={{ fontSize: 11, color: '#333', letterSpacing: 2 }}>SELECT AN ASSET TO PREVIEW</div>
            <div style={{ fontSize: 9, color: '#222', letterSpacing: 1 }}>
              3D MODELS · ORBIT CONTROLS · LOD SWITCHING · WIREFRAME
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
