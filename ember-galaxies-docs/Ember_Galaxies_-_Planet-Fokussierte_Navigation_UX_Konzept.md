# Ember Galaxies - Planet-Fokussierte Navigation UX Konzept

## Design-Philosophie

**Kernidee:** Der Spieler ist immer auf einem spezifischen Planeten "eingeloggt" und alle Aktionen beziehen sich auf diesen aktuellen Planeten. Die Ressourcen-Anzeige zeigt immer den aktuell ausgewählten Planeten, wodurch ein immersives "Ich bin hier vor Ort" Gefühl entsteht.

**Browser-Game Nostalgie:** Diese Mechanik war das Herzstück klassischer Spiele wie War of Galaxy und erzeugt das charakteristische strategische Spielgefühl, bei dem jeder Planetenwechsel eine bewusste Entscheidung ist.

## Screen-Layout Konzept

### Permanente Elemente (immer sichtbar)

#### Ressourcen-Header (Top Bar)
```
┌─ HEIMATWELT [47:832:5] ──────────────┐
│ 🔩2.847 🥈891 ✨234 ⛽1.456 ⚡567    │
│ [PLANET WECHSELN] [OVERVIEW]          │
└───────────────────────────────────────┘
```

**Mobile-Optimierung:**
- Kompakte Icon-basierte Darstellung
- Aktueller Planet-Name + Koordinaten prominent
- Touch-freundliche Buttons für Navigation

#### Quick-Navigation (Bottom Bar)
```
┌─────────────────────────────────────┐
│ [BAUEN] [FLOTTEN] [FORSCHUNG] [MEHR]│
└─────────────────────────────────────┘
```

### Planet-Wechsel Mechaniken

#### 1. Planet-Browser (Hauptmethode)
**Trigger:** "PLANET WECHSELN" Button
**Funktion:** Vollbildschirm-Overlay mit Planet-Liste
**Features:**
- Sortierbar nach: Name, Ressourcen, Koordinaten, Aktivität
- Filterbar nach: System, Planet-Typ, Baustatus
- Quick-Info pro Planet: Ressourcen-Status + aktuelle Bauprojekte
- "Favoriten" System für wichtige Planeten

```
┌─ PLANET AUSWAHL ──────────────────────┐
│ [FAVORITEN] [ALLE] [NACH SYSTEM]       │
│                                       │
│ ⭐ Heimatwelt [47:832:5]              │
│    🔩2.8k 🥈891 • 2 Bauprojekte       │
│                                       │
│ 🏭 Industriewelt [47:832:12]         │
│    🔩15k 🥈4.2k • Werft aktiv         │
│                                       │
│ ⛽ H2-Station [48:112:3]              │
│    ⛽8.9k • Raffinerie Lv.25          │
│                                       │
│ [SCHLIEßEN]                           │
└───────────────────────────────────────┘
```

#### 2. Quick-Jump Buttons
**Positionierung:** Swipe-Gesten oder Seitliche Buttons
**Funktion:** Zwischen häufig genutzten Planeten springen
- "Nächster Planet" im aktuellen System
- "Letzter Planet" (History-Funktion)
- "Hauptwelt" (immer verfügbar)
- "Werft-Planet" (zum Schiffe bauen)

#### 3. Smart-Context-Switching
**Automatische Vorschläge basierend auf Aktion:**
- Bei Schiffsbau → "Zu Planet mit Werft wechseln?"
- Bei Ressourcen-Mangel → "Zu ressourcenreichem Planet?"
- Bei Forschung → "Zu Planet mit Forschungslabor?"

## Mobile-First UX Patterns

### Swipe-Navigation
- **Links-Swipe:** Vorheriger Planet (History)
- **Rechts-Swipe:** Nächster Planet (System-Reihenfolge)
- **Oben-Swipe:** Planet-Browser öffnen
- **Unten-Swipe:** Quick-Actions Menu

### Haptic Feedback
- Planet-Wechsel: Kurze Vibration
- Ressourcen-Update: Sanfte Vibration
- Bauprojekt fertig: Deutlichere Vibration

### Adaptive Interface
```
Hochformat (Standard):
├── Ressourcen-Header (kompakt)
├── Planet-Haupt-Content
├── Scroll-Bereich für Details
└── Bottom-Navigation

Querformat (Optional):
├── Sidebar: Planet-Quick-List
├── Haupt-Content: Aktueller Planet
└── Split-View möglich
```

## Navigation-Flow Beispiele

### Szenario 1: Gebäude bauen
1. Spieler ist auf "Heimatwelt"
2. Tippt "BAUEN" → Gebäude-Liste des aktuellen Planeten
3. Wählt "Eisenmine ausbauen" → Aktion läuft auf Heimatwelt
4. Will auf anderem Planet bauen → "PLANET WECHSELN"
5. Wählt "Industriewelt" → Ressourcen-Header ändert sich
6. Tippt "BAUEN" → Gebäude-Liste der Industriewelt

### Szenario 2: Flotte verschicken
1. Spieler auf "H2-Station"
2. Tippt "FLOTTEN" → Flottenmenü für H2-Station
3. Wählt "Flotte verschicken" → Ziel-Planet auswählen
4. Flotte startet von H2-Station (aktueller Planet)
5. Spieler kann auf H2-Station bleiben oder wechseln

### Szenario 3: Ressourcen-Management
1. Spieler merkt: Wenig Silber auf aktuellem Planet
2. Quick-Swipe nach rechts → Nächster Planet automatisch
3. Oder: Planet-Browser → Sortierung nach Silber-Menge
4. Wechsel zu silberreichem Planet
5. Ressourcen-Header zeigt neue Werte sofort

## Status-Indikatoren & Feedback

### Planet-Status im Header
```
🔴 Heimatwelt - Ressourcen knapp
🟡 Industriewelt - Bau läuft (2h)
🟢 H2-Station - Bereit
⚪ Rohstoffwelt - Offline
```

### Visual Feedback bei Planet-Wechsel
- **Smooth Transition:** Fade-out/Fade-in Effekt
- **Ressourcen-Counter-Animation:** Zahlen ändern sich animiert
- **Planet-Info-Popup:** Kurze Einblendung der wichtigsten Infos
- **Loading-State:** Bei langsamer Verbindung

### Notification-System
- **Badge-Counts:** Auf Navigation-Buttons (z.B. "3" auf BAUEN = 3 fertige Projekte)
- **Planet-Alerts:** Push-Notifications mit Planet-Bezug
- **Quick-Info:** Tooltip bei Hover/Long-Press auf Planet-Namen

## Technical Implementation Hints

### State Management
```javascript
// Zentraler Current-Planet State
currentPlanet: {
  id: "planet_47_832_5",
  name: "Heimatwelt",
  coordinates: [47, 832, 5],
  resources: { iron: 2847, silver: 891, ... },
  buildQueue: [...],
  fleets: [...]
}

// Planet-Switch Funktionen
switchToPlanet(planetId)
getNextPlanet(direction) // für Swipe-Navigation
getPlanetHistory() // für Back-Navigation
```

### Offline-Funktionalität
- **Letzter Planet-State cached:** App startet auf letztem Planet
- **Resource-Updates:** Background-Sync wenn möglich
- **Offline-Actions:** Bauaufträge queue-en für später

### Performance-Optimierungen
- **Lazy Loading:** Nur aktueller Planet vollständig geladen
- **Resource-Polling:** Nur für aktuellen Planet in Echtzeit
- **Background-Updates:** Andere Planeten weniger frequent

## Accessibility & Usability

### Screen Reader Support
- Planet-Name und Koordinaten als Heading
- Ressourcen-Werte als strukturierte Liste
- Navigation-Context ("Aktuell auf Planet X")

### Power-User Features
- **Keyboard Shortcuts:** Für Desktop-Version
- **Bulk-Operations:** Multi-Planet-Aktionen wo sinnvoll
- **Customizable Layouts:** Ressourcen-Reihenfolge anpassbar

## Integration mit bestehenden Features

### Planet-ASCII-Art
- Bleibt prominent sichtbar auf Planet-Hauptscreen
- Evtl. kleinere Version im Header bei Untermenüs

### Progress-Bars
- Weiterhin für alle Gebäude/Forschung/etc.
- Zusätzlich: Planet-Übersichts-Bars für Quick-Info

### Terminal-Ästhetik
- Planet-Wechsel als "Terminal-Session-Switch"
- Koordinaten wie Terminal-Prompts "[47:832:5]$"
- ASCII-Border um Planet-Info

## Unique Selling Points

1. **Immersive Presence:** Spieler "ist" auf einem Planet, nicht abstrakt verwaltend
2. **Strategic Depth:** Jeder Planet-Wechsel ist bewusste Entscheidung
3. **Mobile-Native:** Swipe-Navigation + Touch-optimiert
4. **Nostalgic Authenticity:** Klassisches Browser-Game-Feeling
5. **Scale-Ready:** System funktioniert bei 10 oder 1000 Planeten

## Nächste Entwicklungsschritte

1. **Core-Navigation implementieren:** Planet-Switch + Resource-Header
2. **Planet-Browser erstellen:** Liste mit Sortierung/Filter
3. **Swipe-Gestures hinzufügen:** Links/Rechts für Navigation
4. **Context-Aware Suggestions:** Smart Planet-Wechsel-Vorschläge
5. **Performance-Testing:** Mit vielen Planeten testen