# Ember Galaxies - Technische Spezifikation & Entwicklungsplan

## Vision
Ein minimalistisches Mobile-First Weltraum-Strategiespiel mit Death Stranding-inspiriertem asynchronem Multiplayer. Schwarzer Hintergrund, weiße Terminal-Schrift, poetisches "Ember" (Glut) Konzept - Spieler entdecken Spuren vergangener Zivilisationen ohne direkte PvP-Interaktion.

**Entwicklungsphilosophie:** Solo-Passion-Projekt ohne Monetarisierungsdruck. Fokus auf Charakterentwicklung und authentische Experience. Mögliche spätere Veröffentlichung nur wenn das Spiel organisch zu etwas Besonderem wird.

## Finaler Tech Stack

### Phase 1: Offline Singleplayer (Mobile-Only)
```
Frontend: React Native
Database: SQLite (lokal auf Gerät)
Plattformen: Android + iOS
State Management: Redux/Zustand
Navigation: React Navigation
Styling: StyleSheet (minimalistisch, Terminal-Look)
```

### Phase 2-3: Cloud Integration
```
Backend: Node.js + Express
Database: PostgreSQL (Server)
Cloud Storage: Firebase/Supabase für Saves
Real-time: Socket.io (für Ghost Universe)
Hosting: Heroku/DigitalOcean ($5-6/Monat)
```

## Entwicklungsansatz & Learning Goals

### Developer Background
- Erfahrung mit Siemens PLC Programmierung (State Machines, Event-driven Logic, Timer)
- Grundlagen Hochsprachen aus Studium + Hobby-Projekte (Microcontroller)
- Ziel: Dieses Projekt als Sprungbrett für modernes App Development nutzen

### Claude Code Integration Strategy
**Kontrollierter Lernpfad mit AI-Unterstützung:**

```bash
# Spezifische, begrenzte Änderungen
claude "Füge neue ASCII-Art für Planeten hinzu, ändere nur planetVisuals.js"

# Erklärungen einfordern
claude "Erkläre mir diesen Code als wäre ich ein PLC-Programmierer"

# Vor Änderungen Preview anfordern
claude "Zeige mir erst was du ändern willst, bevor du es machst"
```

**Architektur-Prinzip: "Progressiv Professionell"**
- Start: Bewusst einfach und verständlich
- Schrittweise Professionalisierung wenn Verständnis wächst
- Jedes Feature in eigener Datei (modulare Entwicklung)
- Git Commits vor jeder größeren Änderung

## Entwicklungsphasen

### Phase 1: Offline Foundation (3-6 Monate)
**Ziel:** Vollständiges Singleplayer-Spiel ohne Server-Abhängigkeit

**Core Features:**
- Lokale SQLite Datenbank für kompletten Spielstand
- Prozedurale Galaxie-Generation (200 Systeme, 5-15 Planeten)
- Ressourcen-Management (Eisen, Silber, Uderon, Wasserstoff, Energie)
- Gebäudebau mit Echtzeit-Timer (auch bei geschlossener App)
- Forschungsbaum
- Scout-Schiffe für Erkundung
- "Fog of War" System
- Push Notifications für fertige Gebäude

**UI Design:**
- Schwarzer Hintergrund (#000000)
- Weiße Terminal-Schrift (#ffffff, Courier New)
- ASCII-Art Elemente
- "A Dark Room" minimalistische Ästhetik
- Touch-optimierte Buttons (44px+ Mindestgröße)

**Technische Architektur - Lernfreundlich:**
```javascript
// Phase 1: Bewusst einfach und nachvollziehbar
const gameState = {
  planets: [
    { id: 1, name: "Homeworld", iron: 100, silver: 50 }
  ],
  buildings: [
    { planetId: 1, type: "iron_mine", level: 1, completionTime: null }
  ]
};

// Einfache, verständliche Funktionen
function buildMine(planetId) {
  const planet = gameState.planets.find(p => p.id === planetId);
  planet.iron += 10;
  // PLC-Style: Klare Sequenzen, nachvollziehbare Logik
}

// Später: Schrittweise Professionalisierung
class PlanetManager {
  constructor(database) {
    this.db = database;
  }
  
  async buildMine(planetId) {
    // Immer noch verständlich, aber robuster
    // Nur wenn Developer bereit für nächsten Schritt
  }
}
```

### Phase 2: Cloud Save Integration (1 Monat)
**Ziel:** Spielstand-Synchronisation zwischen Geräten

**Features:**
- Firebase/Supabase Cloud Backup
- Offline-First bleibt erhalten
- Konfliktauflösung bei Multi-Device
- Vorbereitung für Multiplayer-Infrastruktur

### Phase 3: "Ghost Universe" - Asynchrones Multiplayer (2-3 Monate)
**Ziel:** Death Stranding-inspirierte indirekte Spieler-Interaktion

**Features:**
- Verlassene Basen werden zu erforschbaren Ruinen
- Text-Korruption basierend auf Alter der Ruinen
- "Archäologie-System" für alte Zivilisationen
- Zeitverzögerte Synchronisation (nicht Echtzeit)
- Fragmentierte Technologie-Funde

**"Ember" Mechaniken:**
```javascript
// Ruinen-System
class PlayerRuin {
  originalPlayerId: string;
  ageInDays: number;
  corruptionLevel: number; // 0.0 - 0.9
  
  corruptText(original: string): string {
    // Je älter, desto mehr ████ Zeichen
    return original.split('').map(char => 
      Math.random() < this.corruptionLevel ? '█' : char
    ).join('');
  }
}

// Echo-Typen
const EchoTypes = {
  ABANDONED_OUTPOST: 'Verblasste Koordinaten...',
  BATTLE_SITE: 'Trümmerfeld mit Energiesignaturen...',
  RESEARCH_CACHE: 'Fragmentierte Datenbank...',
  TRADE_ROUTE: 'Schwache Navigationssignale...'
};
```

## Datenbankschema

### SQLite (Phase 1)
```sql
-- Spieler-Daten
CREATE TABLE players (
    id INTEGER PRIMARY KEY,
    name TEXT,
    created_at INTEGER,
    last_active INTEGER
);

-- Planeten
CREATE TABLE planets (
    id INTEGER PRIMARY KEY,
    system_id INTEGER,
    name TEXT,
    iron INTEGER DEFAULT 0,
    silver INTEGER DEFAULT 0,
    uderon INTEGER DEFAULT 0,
    hydrogen INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 0,
    last_resource_update INTEGER
);

-- Gebäude
CREATE TABLE buildings (
    id INTEGER PRIMARY KEY,
    planet_id INTEGER,
    type TEXT, -- 'iron_mine', 'silver_mine', etc.
    level INTEGER DEFAULT 1,
    completion_time INTEGER, -- NULL wenn fertig
    status TEXT DEFAULT 'completed' -- 'building', 'completed'
);

-- Events für spätere Synchronisation
CREATE TABLE game_events (
    id TEXT PRIMARY KEY,
    timestamp INTEGER,
    event_type TEXT,
    planet_id INTEGER,
    data TEXT -- JSON
);
```

### PostgreSQL (Phase 2+)
```sql
-- Zusätzlich zu obigen Tabellen:
CREATE TABLE ghost_universe (
    id SERIAL PRIMARY KEY,
    original_player_id UUID,
    ruin_type TEXT,
    coordinates POINT,
    age_in_days INTEGER,
    corruption_level DECIMAL(3,2),
    echo_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Entwicklungsrichtlinien

### Mobile-First Prinzipien
- Touch-First Design (keine Hover-Effekte)
- Thumb-freundliche Navigation
- Offline-Funktionalität
- Battery-optimiert
- 3-5 Sekunden maximale Ladezeit

### Performance-Targets
- < 50MB App-Größe
- < 100MB SQLite Database (auch nach Monaten Spielzeit)
- 60fps smooth scrolling
- < 2 Sekunden zwischen Screen-Wechseln

### Code-Architektur
```javascript
// Modulare Struktur
src/
├── components/           // UI Komponenten
├── screens/             // Screen-Level Komponenten  
├── services/
│   ├── database.js      // SQLite Abstraction
│   ├── gameLogic.js     // Core Game Mechanics
│   ├── notifications.js // Push Notifications
│   └── sync.js          // Cloud Sync (Phase 2+)
├── utils/
│   ├── gameEvents.js    // Event System
│   ├── timeUtils.js     // Timer/Countdown Logic
│   └── textCorruption.js // Ruin Text Effects
└── constants/
    ├── gameConfig.js    // Balancing Values
    └── styles.js        // Terminal UI Theme
```

## Lernpfad mit Claude Code

### Woche 1-2: Grundlagen verstehen
```bash
claude "Erstelle eine einfache React Native App mit einem Button 
der 'Hello Ember Galaxies' anzeigt. Erkläre jeden Schritt."

claude "Zeige mir wie React Native Components funktionieren, 
verwende einfache Beispiele"
```

### Woche 3-4: Datenbanken einführen  
```bash
claude "Füge eine simple SQLite Datenbank hinzu die einen 
einzigen Planet speichert. Halte es so einfach wie möglich."

claude "Erkläre mir wie SQLite in React Native funktioniert, 
vergleiche es mit PLC-Datenbausteinen"
```

### Monat 2: Features einzeln erweitern
```bash
claude "Erweitere nur buildingManager.js um Timer-Funktionalität.
Ändere keine anderen Dateien. Erkläre was du machst."

claude "Füge nur ASCII-Art für neue Planeten hinzu in planetVisuals.js.
Lass die gesamte restliche Logik unberührt."
```

### Monat 3+: Schrittweise Professionalisierung
```bash
claude "Refaktoriere die einfachen Funktionen zu Klassen,
aber nur wenn ich sage dass ich bereit bin. Erkläre warum."

claude "Zeige mir moderne React Patterns, aber implementiere 
sie erst wenn ich das Grundprinzip verstanden habe."
```

## Warum dieser Stack?

1. **React Native**: Cross-Platform mit nativer Performance
2. **SQLite**: Zuverlässig, offline-fähig, perfekt für lokale Spieldaten  
3. **Mobile-Only Start**: Fokus auf eine perfekte Experience statt Kompromisse
4. **Modulare Architektur**: Jedes Feature isoliert änderbar (Anti-Chaos)
5. **Schrittweise Entwicklung**: Jede Phase ist spielbar und testbar
6. **PLC-Developer friendly**: State-basiert, Event-driven, nachvollziehbare Sequenzen

## Deployment Strategy

### Phase 1: Learning & Development
- React Native CLI Build  
- Direkte APK Installation auf eigenem Handy
- Git für Versionskontrolle und Rollback-Sicherheit
- Keine Server-Kosten während Lernphase

### Phase 2+: Wenn das Spiel gut wird
- Cloud Backup Integration
- Eventuell Beta-Testing mit Freunden
- Später: Mögliche App Store Veröffentlichung (nur wenn organisch entstanden)

## Success Metrics (persönlich)

1. **Lernziel**: Moderne App-Entwicklung verstehen und anwenden können
2. **Projektziel**: Ein charaktervolles Spiel ohne Monetarisierungsdruck  
3. **Technisches Ziel**: Saubere, modulare Codebase die erweiterbar ist
4. **Persönliches Ziel**: Ein 4 Jahre altes Herzensprojekt endlich realisieren

## Next Steps - Gentle Start
1. React Native Development Environment Setup
2. Einfache "Hello World" App mit Claude Code
3. Schritt-für-Schritt SQLite Integration  
4. Basis Terminal-UI Framework
5. Erstes simples Feature: Ein Planet, ein Ressource, ein Gebäude
6. Nur erweitern wenn vorheriger Schritt 100% verstanden