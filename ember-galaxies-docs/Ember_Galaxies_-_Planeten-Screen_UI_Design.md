# Ember Galaxies - Planeten-Screen UI Design

## Überblick

Das UI-Design für den Planeten-Screen folgt einem Hybrid-Ansatz zwischen Terminal-Authentizität und moderner Mobile-UX. Der Hauptscreen bleibt kompakt und terminal-ähnlich, während Detail-Screens bei Bedarf scrollbar sind.

## Design-Philosophie

### Terminal-Purismus vs. Praktikabilität
- **Hauptbildschirm**: Terminal-Style ohne Scrollen
- **Detail-Screens**: Scroll erlaubt für Listen und umfangreiche Inhalte
- **Navigation**: 3-4 Klicks für wichtige Aktionen (genre-typisch)
- **Mobile-First**: Touch-optimierte Bedienung

## Planeten-ASCII Art

### Runde Planeten-Darstellung

#### Kleiner Planet (13x13 Zeichen):
```
     ▄▄▄▄▄
   ▄▓▓▓▓▓▓▓▄
  ▄▓▓██▓▓██▓▓▄
 ▄▓▓▓████▓▓▓▓▓▄
▄▓▓██████████▓▓▄
▓▓▓████████████▓
▓▓████████████▓▓
▓▓▓████████████▓
▀▓▓██████████▓▓▀
 ▀▓▓▓████▓▓▓▓▓▀
  ▀▓▓██▓▓██▓▓▀
   ▀▓▓▓▓▓▓▓▀
     ▀▀▀▀▀
```

#### Mittlerer Planet (15x15 Zeichen):
```
      ▄▄▄▄▄▄▄
    ▄▓▓▓▓▓▓▓▓▓▄
   ▄▓▓▓██▓▓██▓▓▓▄
  ▄▓▓██████████▓▓▄
 ▄▓▓▓████████████▓▓▄
▄▓▓████████████████▓▄
▓▓▓██████████████████▓
▓▓████████████████████
▓▓▓██████████████████▓
▀▓▓████████████████▓▓▀
 ▀▓▓▓████████████▓▓▓▀
  ▀▓▓██████████▓▓▀
   ▀▓▓▓██▓▓██▓▓▓▀
    ▀▓▓▓▓▓▓▓▓▓▀
      ▀▀▀▀▀▀▀
```

### Verschiedene Planeten-Typen

#### Wüstenplanet:
```
     ▄▄▄▄▄
   ▄▒▒▒▒▒▒▒▄
  ▄▒▒▓▓▒▒▓▓▒▒▄
 ▄▒▒▒▓▓▓▓▒▒▒▒▒▄
▄▒▒▓▓▓▓▓▓▓▓▓▒▒▄
▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒
▒▒▓▓▓▓▓▓▓▓▓▓▓▒▒
▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒
▀▒▒▓▓▓▓▓▓▓▓▓▒▒▀
 ▀▒▒▒▓▓▓▓▒▒▒▒▒▀
  ▀▒▒▓▓▒▒▓▓▒▒▀
   ▀▒▒▒▒▒▒▒▀
     ▀▀▀▀▀
```

#### Eisplanet:
```
     ▄▄▄▄▄
   ▄▒▒▒▒▒▒▒▄
  ▄▒▒██▒▒██▒▒▄
 ▄▒▒▒████▒▒▒▒▒▄
▄▒▒██████████▒▒▄
▒▒▒████████████▒
▒▒████████████▒▒
▒▒▒████████████▒
▀▒▒██████████▒▒▀
 ▀▒▒▒████▒▒▒▒▒▀
  ▀▒▒██▒▒██▒▒▀
   ▀▒▒▒▒▒▒▒▀
     ▀▀▀▀▀
```

## Screen-Layout Design

### Haupt-Planet-Screen (Terminal-Style, kein Scroll)

```
┌─ EMBER GALAXIES ─────────┐
│      ▄▄▄▄▄▄▄            │
│    ▄▓▓▓▓▓▓▓▓▓▄          │
│   ▄▓▓▓██▓▓██▓▓▓▄        │
│  ▄▓▓████████▓▓▓▓▄       │
│ ▄▓▓▓██████████▓▓▓▄      │
│▄▓▓████████████████▓▄    │
│▓▓▓████████████████▓▓    │
│▀▓▓████████████████▓▓▀   │
│ ▀▓▓▓██████████▓▓▓▀      │
│  ▀▓▓████████▓▓▓▓▀       │
│   ▀▓▓▓██▓▓██▓▓▓▀        │
│    ▀▓▓▓▓▓▓▓▓▓▀          │
│      ▀▀▀▀▀▀▀            │
│                         │
│ [47:832:5] HEIMATWELT   │
│ Typ: Erdähnlich         │
│                         │
│ ▓▓▓▓▓░░░ Eisen: 2.847   │
│ ▓▓░░░░░░ Silber: 891    │
│                         │
│ Aktuelle Bauten:        │
│ ■ Kraftwerk ████████░░  │
│                         │
│ [RESSOURCEN] [GEBÄUDE]  │
│ [FORSCHUNG]  [FLOTTEN]  │
└─────────────────────────┘
```

### Gebäude-Detail-Screen (Scroll erlaubt)

```
┌─ GEBÄUDE ────────────────┐
│ ═══ HEIMATWELT ═══      │
│                         │
│ ▓▓▓▓▓░░░ Eisen: 2.847   │
│ ▓▓░░░░░░ Silber: 891    │
│ ▓▓▓░░░░░ Energie: 1.234 │
│                         │
│ □ Zentrale Lv.3         │
│   [MAX STUFE]           │
│                         │
│ □ Eisenmine Lv.2 → Lv.3 │
│   Kosten: 500🔩 200🥈   │
│   [BAUEN] [INFO]        │
│                         │
│ ■ Kraftwerk Lv.1 → Lv.2 │
│   ████████░░ 78%        │
│   Fertig: 02:34         │
│                         │
│ □ Forschungslabor Lv.1  │ ← Hier kann gescrollt
│   Kosten: 800🔩 400🥈   │   werden für mehr
│   [BAUEN] [INFO]        │   Gebäude
│                         │
│ ■ Werft                 │
│   [GESPERRT] Tech nötig │
│                         │
│ [ZURÜCK] [SCHNELLBAU]   │
└─────────────────────────┘
```

## Navigation & UX-Flow

### Standard-Navigation (4-Klick-Regel)
```
Planet Overview → Gebäude → Gebäude auswählen → Bauen
Planet Overview → Forschung → Tech auswählen → Forschen  
Planet Overview → Flotten → Schiff auswählen → Bauen
```

### Optimierte Quick-Actions
```
Planet Overview:
│ Quick Actions:           │
│ [+MINE] [+KRAFT] [ALLE]  │ ← 2-Klick für Standard-Gebäude

Gebäude-Screen:
│ □ Eisenmine Lv.2 → Lv.3  │
│   Kosten: 500🔩 200🥈    │ ← Kosten direkt sichtbar
│   [BAUEN] [INFO]         │ ← Bauen-Button sofort verfügbar
```

## Technische Implementierung

### React Native Struktur
```javascript
function PlanetScreen({ planet }) {
  return (
    <View style={styles.container}>
      {/* Planet ASCII Art - fest oben */}
      <View style={styles.planetHeader}>
        <Text style={styles.ascii}>
          {getPlanetAsciiArt(planet.type)}
        </Text>
        
        {/* Planet Info */}
        <Text style={styles.coordinates}>
          [{planet.galaxy}:{planet.system}:{planet.planetNumber}]
        </Text>
        <Text style={styles.planetName}>
          {planet.name.toUpperCase()}
        </Text>
        <Text style={styles.planetInfo}>
          Typ: {planet.type} • Größe: {planet.size} km
        </Text>
      </View>

      {/* Ressourcen-Quick-View */}
      <View style={styles.resourceSection}>
        <ProgressBar current={planet.iron} max={planet.ironCap} label="Eisen" />
        <ProgressBar current={planet.silver} max={planet.silverCap} label="Silber" />
        <ProgressBar current={planet.energy} max={planet.energyCap} label="Energie" />
      </View>

      {/* Aktuelle Bauprojekte */}
      <View style={styles.currentBuilds}>
        <Text style={styles.sectionHeader}>Aktuelle Bauten:</Text>
        {planet.activeBuilds.map(build => (
          <AnimatedProgressBar 
            key={build.id}
            current={build.timeElapsed}
            max={build.totalTime}
            label={build.name}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationGrid}>
        <NavigationButton title="RESSOURCEN" onPress={() => navigate('Resources')} />
        <NavigationButton title="GEBÄUDE" onPress={() => navigate('Buildings')} />
        <NavigationButton title="FORSCHUNG" onPress={() => navigate('Research')} />
        <NavigationButton title="FLOTTEN" onPress={() => navigate('Fleets')} />
      </View>
    </View>
  );
}
```

### Responsive Design
```javascript
// Automatische Planet-Größe je nach Screen
const getPlanetSize = (screenWidth) => {
  if (screenWidth < 350) return 'small';   // 13x13
  if (screenWidth < 400) return 'medium';  // 15x15
  return 'large';                          // 17x17
};

// ASCII Art Auswahl
const getPlanetAsciiArt = (type, size = 'medium') => {
  const artLibrary = {
    earth: {
      small: earthPlanetSmall,
      medium: earthPlanetMedium,
      large: earthPlanetLarge
    },
    desert: {
      small: desertPlanetSmall,
      medium: desertPlanetMedium,
      large: desertPlanetLarge
    }
    // ... weitere Planeten-Typen
  };
  
  return artLibrary[type]?.[size] || artLibrary.earth.medium;
};
```

## Mobile-Optimierungen

### Touch-Targets
- **Mindestgröße**: 44x44px für alle interaktiven Elemente
- **Button-Spacing**: 8px Abstand zwischen Buttons
- **Safe Areas**: Berücksichtigung von Notch/Home-Indicator

### Swipe-Navigation
```javascript
// Horizontal swipe zwischen Planeten
<PanGestureHandler onGestureEvent={handlePlanetSwipe}>
  <View>{/* Planet Content */}</View>
</PanGestureHandler>

// Vertical swipe für schnelle Actions
<PanGestureHandler onGestureEvent={handleQuickActions}>
  <View>{/* Quick Action Menu */}</View>
</PanGestureHandler>
```

### Performance
- **Lazy Loading**: ASCII Art nur bei Bedarf laden
- **Memoization**: Planet-Komponenten mit React.memo() optimieren
- **Debounced Updates**: Ressourcen-Counter nicht bei jedem Tick neu rendern

## Styling-Konstanten

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  ascii: {
    fontFamily: 'Courier',
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
  },
  coordinates: {
    fontFamily: 'Courier',
    color: '#00ff41',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  planetName: {
    fontFamily: 'Courier',
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  planetInfo: {
    fontFamily: 'Courier',
    color: '#888888',
    textAlign: 'center',
    fontSize: 12,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  sectionHeader: {
    fontFamily: 'Courier',
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  }
});
```

## Zukünftige Erweiterungen

### Phase 1 Features
- Basis Planet-Screen mit ASCII Art
- Ressourcen-Anzeige mit Progress Bars
- Navigation zu Untermenüs
- Gebäude-Bauprozess

### Phase 2 Features  
- Verschiedene Planeten-Typen
- Animierte ASCII-Effekte
- Quick-Action Shortcuts
- Swipe-Navigation

### Phase 3 Features
- Planet-Customization
- Ruin-Effekte für verlassene Planeten
- Multi-Planet Management
- Batch-Operations

## Fazit

Das Terminal-hybrid Design ermöglicht authentisches Retro-Gaming-Feeling bei gleichzeitiger moderner Bedienbarkeit. Die 4-Klick-Navigation ist genre-typisch und gibt Spielern Zeit für strategische Entscheidungen, während Quick-Actions für Routine-Aufgaben sorgen.

**Nächste Schritte:**
1. Basis Planet-Screen implementieren
2. ASCII-Art Library aufbauen  
3. Navigation zwischen Screens testen
4. Performance optimieren
5. Quick-Actions hinzufügen