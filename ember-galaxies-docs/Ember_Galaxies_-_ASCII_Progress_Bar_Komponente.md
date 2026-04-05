# Ember Galaxies - ASCII Progress Bar Komponente

## Überblick

Die Progress Bar Komponente ist ein zentraler UI-Baustein für Ember Galaxies, der das Terminal-Feeling des Spiels verstärkt und überall für Fortschrittsanzeigen verwendet werden kann.

## Basis-Implementierung

### Standard Progress Bar
```javascript
// components/ProgressBar.js
import React from 'react';
import { Text } from 'react-native';

function ProgressBar({ current, max, width = 10, label }) {
  // Prozent berechnen (maximal 100%)
  const percentage = Math.min(current / max, 1.0);
  
  // Anzahl gefüllter vs. leerer Zeichen
  const filledChars = Math.floor(percentage * width);
  const emptyChars = width - filledChars;
  
  // ASCII-Balken zusammenbauen
  const bar = '█'.repeat(filledChars) + '░'.repeat(emptyChars);
  
  return (
    <Text style={styles.monospace}>
      {label && `${label}: `}
      {bar} {Math.floor(percentage * 100)}%
    </Text>
  );
}

const styles = {
  monospace: {
    fontFamily: 'Courier', // Terminal-Schrift
    color: '#ffffff',
    backgroundColor: '#000000',
    fontSize: 14
  }
};

export default ProgressBar;
```

### Verwendungsbeispiele
```javascript
// Ressourcen-Anzeige
<ProgressBar current={2847} max={5000} label="Eisen" />
// Ausgabe: Eisen: ████████░░ 57%

// Gebäude-Fortschritt
<ProgressBar current={480} max={600} width={15} label="Eisenmine Bau" />
// Ausgabe: Eisenmine Bau: ████████████░░░ 80%

// Forschung
<ProgressBar current={1200} max={3000} label="Warp-Antrieb" />
// Ausgabe: Warp-Antrieb: ████░░░░░░ 40%
```

## Erweiterte Versionen

### Multi-Style Progress Bar
```javascript
function StyledProgressBar({ current, max, width = 10, label, type = 'default' }) {
  const percentage = Math.min(current / max, 1.0);
  const filledChars = Math.floor(percentage * width);
  const emptyChars = width - filledChars;
  
  // Verschiedene ASCII-Zeichen für verschiedene Zwecke
  const barStyles = {
    default: { filled: '█', empty: '░' },
    energy: { filled: '▓', empty: '▒' },
    health: { filled: '♥', empty: '♡' },
    building: { filled: '■', empty: '□' },
    research: { filled: '●', empty: '○' }
  };
  
  const { filled, empty } = barStyles[type] || barStyles.default;
  const bar = filled.repeat(filledChars) + empty.repeat(emptyChars);
  
  return (
    <Text style={styles.monospace}>
      {label && `${label}: `}
      {bar} {Math.floor(percentage * 100)}%
    </Text>
  );
}
```

### Farbige Progress Bar
```javascript
function ColoredProgressBar({ current, max, width = 10, label, showPercentage = true }) {
  const percentage = Math.min(current / max, 1.0);
  const filledChars = Math.floor(percentage * width);
  const emptyChars = width - filledChars;
  
  const bar = '█'.repeat(filledChars) + '░'.repeat(emptyChars);
  
  // Farbe basierend auf Füllstand
  const getColor = () => {
    if (percentage > 0.7) return '#00ff41'; // Matrix-Grün
    if (percentage > 0.4) return '#ffff00'; // Gelb
    if (percentage > 0.2) return '#ff8800'; // Orange
    return '#ff0041'; // Rot
  };
  
  return (
    <Text style={[styles.monospace, { color: getColor() }]}>
      {label && `${label}: `}
      {bar}
      {showPercentage && ` ${Math.floor(percentage * 100)}%`}
    </Text>
  );
}
```

## Spezial-Effekte für Ember Galaxies

### Animierte Progress Bar (für laufende Prozesse)
```javascript
import { useState, useEffect } from 'react';

function AnimatedProgressBar({ current, max, label, isActive = true }) {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 1500); // Alle 1.5 Sekunden blinken
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  const percentage = Math.min(current / max, 1.0);
  const filledChars = Math.floor(percentage * 10);
  const emptyChars = 10 - filledChars;
  
  const bar = '█'.repeat(filledChars) + '░'.repeat(emptyChars);
  
  return (
    <Text style={[
      styles.monospace, 
      { opacity: pulse ? 0.6 : 1.0, color: '#00ff41' }
    ]}>
      {label}: {bar} {Math.floor(percentage * 100)}%
    </Text>
  );
}
```

### Glitch/Corruption Effekt (für Ruinen-System)
```javascript
function CorruptedProgressBar({ current, max, corruptionLevel = 0.1, label }) {
  const percentage = Math.min(current / max, 1.0);
  const filledChars = Math.floor(percentage * 10);
  const emptyChars = 10 - filledChars;
  
  let bar = '█'.repeat(filledChars) + '░'.repeat(emptyChars);
  
  // Zufällige Korruption der Zeichen
  const corruptedBar = bar.split('').map(char => {
    if (Math.random() < corruptionLevel) {
      const corruptChars = ['▓', '▒', '░', '█', '■', '□', '▄', '▀'];
      return corruptChars[Math.floor(Math.random() * corruptChars.length)];
    }
    return char;
  }).join('');
  
  // Label auch teilweise korrumpieren
  const corruptedLabel = label ? label.split('').map(char => 
    Math.random() < corruptionLevel * 0.3 ? '█' : char
  ).join('') : '';
  
  return (
    <Text style={[styles.monospace, { color: '#888888' }]}>
      {corruptedLabel && `${corruptedLabel}: `}
      {corruptedBar} ???%
    </Text>
  );
}
```

## Praktische Anwendungen im Spiel

### Planeten-Ressourcen Screen
```javascript
function PlanetResourcesView({ planet }) {
  return (
    <View>
      <Text style={styles.header}>═══ {planet.name.toUpperCase()} ═══</Text>
      
      <ColoredProgressBar 
        current={planet.iron} 
        max={planet.ironCapacity} 
        label="Eisen" 
        width={12} 
      />
      
      <ColoredProgressBar 
        current={planet.silver} 
        max={planet.silverCapacity} 
        label="Silber" 
        width={12} 
      />
      
      <ColoredProgressBar 
        current={planet.energy} 
        max={planet.energyCapacity} 
        label="Energie" 
        width={12} 
        type="energy"
      />
    </View>
  );
}
```

### Gebäude-Bau Interface
```javascript
function BuildingConstructionView({ buildings }) {
  return (
    <View>
      {buildings.filter(b => b.isBuilding).map(building => (
        <AnimatedProgressBar
          key={building.id}
          current={Date.now() - building.startTime}
          max={building.buildDuration}
          label={`${building.name} Lv.${building.targetLevel}`}
          isActive={true}
        />
      ))}
    </View>
  );
}
```

### Forschungs-Tree
```javascript
function ResearchView({ research }) {
  return (
    <View>
      {research.map(tech => (
        <StyledProgressBar
          key={tech.id}
          current={tech.currentPoints}
          max={tech.requiredPoints}
          label={tech.name}
          type="research"
          width={15}
        />
      ))}
    </View>
  );
}
```

## Technische Details

### Performance-Optimierung
- Verwende `React.memo()` für Progress Bars die sich selten ändern
- Limitiere Animationen auf aktive/sichtbare Komponenten
- Verwende `useMemo()` für komplexe Berechnungen

### Responsive Design
```javascript
// Automatische Breiten-Anpassung je nach Screen-Größe
const getProgressBarWidth = (screenWidth) => {
  if (screenWidth < 350) return 8;   // Kleine Phones
  if (screenWidth < 400) return 10;  // Standard Phones
  return 12;                         // Größere Phones/Tablets
};
```

### Accessibility
```javascript
// Screen Reader Support
<Text 
  style={styles.monospace}
  accessibilityLabel={`${label}: ${percentage}% complete`}
  accessibilityRole="progressbar"
>
  {bar}
</Text>
```

## Fazit

Die ASCII Progress Bar Komponente ist das Herzstück der Terminal-Ästhetik von Ember Galaxies. Durch die modulare Struktur kann sie überall eingesetzt werden und verleiht dem Spiel einen konsistenten, nostalgischen Sci-Fi Look.

**Vorteile:**
- Einmal schreiben, überall verwenden
- Konsistentes Design
- Leicht erweiterbar
- Performance-optimiert
- Retro-Charme

**Nächste Schritte:**
1. Basis-Komponente implementieren
2. In ersten Screen integrieren (Planeten-View)
3. Nach und nach Spezial-Effekte hinzufügen
4. Performance testen und optimieren