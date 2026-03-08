async function refresh() {
  const res = await fetch('/api/world');
  const world = await res.json();
  document.getElementById('metrics').textContent = JSON.stringify(world.metrics, null, 2);
  document.getElementById('guilds').textContent = JSON.stringify(world.guilds, null, 2);
  document.getElementById('actions').textContent = JSON.stringify(world.brainActions, null, 2);
  document.getElementById('players').textContent = JSON.stringify(world.players, null, 2);
  document.getElementById('npcs').textContent = JSON.stringify(world.npcs.slice(0, 20), null, 2);
  document.getElementById('market').textContent = JSON.stringify(world.marketPrices, null, 2);
}
setInterval(refresh, 1000);
refresh();
