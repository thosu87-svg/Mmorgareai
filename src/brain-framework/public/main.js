import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const statusEl = document.getElementById('status');
const statsEl = document.getElementById('stats');
const marketEl = document.getElementById('market');
const brainEl = document.getElementById('brain');
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x08111e);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000); camera.position.set(0, 16, 18); camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.1));
const dir = new THREE.DirectionalLight(0xffffff, 1); dir.position.set(12, 20, 10); scene.add(dir);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140, 16, 16), new THREE.MeshStandardMaterial({ color: 0x2c4c2a })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
scene.add(new THREE.GridHelper(140, 35, 0x6699cc, 0x335577));
const playerMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x66ccff })); playerMesh.position.y = 0.5; scene.add(playerMesh);
const npcMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc66 }); const npcMeshes = new Map();
let playerId = null; let worldState = null;
const ws = new WebSocket(`ws://${location.host}`);
ws.addEventListener('open', ()=>statusEl.textContent = 'verbunden');
ws.addEventListener('message', event => { const data = JSON.parse(event.data); if (data.type === 'welcome') playerId = data.id; if (data.type === 'state') { worldState = data.world; renderWorld(); } });
function ensureNpc(id, x, z) { if (!npcMeshes.has(id)) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, 1), npcMaterial); mesh.position.y = 0.7; scene.add(mesh); npcMeshes.set(id, mesh); } npcMeshes.get(id).position.set(x, 0.7, z); }
function renderWorld() {
  if (!worldState) return;
  const me = worldState.players.find(p => p.id === playerId);
  if (me) {
    playerMesh.position.set(me.x, 0.5, me.z); camera.position.x = me.x + 10; camera.position.z = me.z + 14; camera.lookAt(me.x, 0, me.z);
    statsEl.textContent = `Name: ${me.name}\nHP: ${me.hp}/${me.maxHp}\nGold: ${me.gold}\nGuild: ${me.guild ?? '-'}\nInv: ` + me.inventory.map(i => `${i.name} x${i.qty}`).join(', ');
  }
  worldState.npcs.forEach(npc => ensureNpc(npc.id, npc.x, npc.z));
  marketEl.textContent = `Markt:\n` + Object.entries(worldState.marketPrices).map(([k,v]) => `${k}: ${v}`).join('\n');
  brainEl.textContent = `Letzte Brain Aktionen:\n` + worldState.brainActions.map(a => a.type).join('\n');
}
const keys = new Set();
addEventListener('keydown', e => keys.add(e.key.toLowerCase()));
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
function send(type, extra = {}) { if (ws.readyState === 1) ws.send(JSON.stringify({ type, ...extra })); }
document.getElementById('attackBtn').onclick = ()=>send('attack');
document.getElementById('potionBtn').onclick = ()=>send('use-item', { itemId:'potion' });
document.getElementById('buyPotionBtn').onclick = ()=>send('buy', { itemId:'potion' });
document.getElementById('sellAppleBtn').onclick = ()=>send('sell', { itemId:'apple' });
document.getElementById('guildBtn').onclick = ()=>send('join-guild', { guildName:'Wanderers' });
function updateMovement() {
  if (!playerId || !worldState) return;
  const me = worldState.players.find(p => p.id === playerId); if (!me) return;
  let x = me.x, z = me.z; const speed = 0.3;
  if (keys.has('w') || keys.has('arrowup')) z -= speed;
  if (keys.has('s') || keys.has('arrowdown')) z += speed;
  if (keys.has('a') || keys.has('arrowleft')) x -= speed;
  if (keys.has('d') || keys.has('arrowright')) x += speed;
  send('move', { x, z });
}
function animate() { requestAnimationFrame(animate); updateMovement(); renderer.render(scene, camera); }
animate();
addEventListener('resize', ()=>{ camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
