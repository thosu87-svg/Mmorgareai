# No-Code Agent Install Guide for the Merged Package

## Ziel

Der Agent soll dieses gemergte Paket installieren und entweder:

- die sofort startbare Runtime in `brain-framework/` starten
- oder die Bridge-Dateien in das vorhandene Projekt integrieren

## Schnellste Route

### 1. Entpacken
ZIP vollständig entpacken.

### 2. Runtime-Ordner öffnen
In den Ordner wechseln:

```bash
cd brain-framework
```

### 3. Node prüfen

```bash
node -v
npm -v
```

### 4. Abhängigkeiten installieren

```bash
npm install
```

### 5. Server starten

```bash
npm start
```

### 6. Browser öffnen

```text
http://localhost:3000
http://localhost:3000/dashboard.html
```

## Für Integration in den vorhandenen Code

Prüfen und ansehen:

- `src/integration/HeuristicBrainBridge.ts`
- `src/integration/ServiceFieldAdapter.ts`
- `src/integration/README.md`

Der Agent soll dann die bestehenden Services des Projekts mit diesen Bridge-Dateien verbinden.

## Validierung

Der Agent soll prüfen:

- ob `brain-framework` startbar ist
- ob `/dashboard.html` Daten zeigt
- ob `src/integration` im Projekt existiert
- ob keine Originaldateien gelöscht wurden
