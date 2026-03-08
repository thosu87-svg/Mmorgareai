# Integration Layer

Diese Dateien sind die Brücke zwischen deinem vorhandenen MMORPG-Studio-Code und dem neuen World-Brain-System.

## Ziel

Bestehende Services wie:

- `ChunkManager`
- `CombatManager`
- `EconomyManager`
- `HeuristicIntelligence`
- `QuestManager`
- `SkillSystem`
- `DungeonGenerator`

werden in einen gemeinsamen World-State übersetzt, damit der neue heuristische Brain-Kern darauf reagieren kann.

## Dateien

- `ServiceFieldAdapter.ts`  
  liest Services und erzeugt ein Brain-kompatibles Weltbild

- `HeuristicBrainBridge.ts`  
  ruft das Brain auf, sammelt Aktionen und gibt sie an das Host-Projekt zurück

## Einbauidee

Im Host-Projekt pro Tick / Update / Server-Sync:

```ts
const bridge = new HeuristicBrainBridge();
const snapshot = await ServiceFieldAdapter.buildSnapshot();
const actions = bridge.tick(snapshot);
```
