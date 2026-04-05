# Ember Galaxies ASCII-Art Generator Tool - Fokussierte Spezifikation

## Projekt-Übersicht

**Ziel:** Ein Web-Tool zur Erstellung von ASCII-Art für Ember Galaxies mit Multi-Font-Support für verschiedene Bildgrößen.

**Kernproblem gelöst:** Verschiedene Schriftgrößen in derselben App - winzige Schrift für detaillierte Portraits, normale Schrift für UI.

## Tech-Stack
```
Frontend: React + TypeScript
Styling: CSS Modules
Canvas: HTML5 Canvas 
Build: Vite
```

## Größen-System

### **Font-Modi**
```typescript
interface FontModes {
  uiNormal: { fontSize: 12, usage: 'UI-Text, Buttons, Listen' };
  uiSmall: { fontSize: 8, usage: 'Kleine Icons, Inventar' };
  portraitTiny: { fontSize: 4, usage: 'Detaillierte Portraits 60x40' };
  portraitMicro: { fontSize: 2, usage: 'Maximale Details 100x60' };
}
```

### **Größen-Kategorien**
```typescript
interface SizeCategories {
  // Für normale UI (12px/8px Schrift)
  iconSmall: '8x6';
  iconMedium: '15x10';
  
  // Für winzige Schrift (4px/2px) 
  portraitMedium: '40x30';    // 160x120px Display
  portraitLarge: '60x40';     // 240x160px Display  
  portraitXL: '80x50';        // 160x100px Display (2px Font)
}
```

## Haupt-Modi

### **1. Quick Generator**
- Dropdown: Planet | Ship | Character | Artefakt
- Parameter-Slider je nach Typ
- Live-Preview mit Font-Größen-Switcher
- Export für React Native

### **2. Drag & Drop Painter** 
- Grid-Canvas zum Malen
- ASCII-Zeichen-Palette: █▓▒░■□●○►◄
- Verschiedene Brush-Größen
- Zoom für Details
- **Hauptsächlich für Schiffe gedacht**

### **3. Portrait Editor**
- Speziell für Charaktere/Aliens
- Template-basiert mit anpassbaren Teilen
- Kopf, Körper, Ausrüstung einzeln editierbar
- **Fokus auf 60x40 Portraits mit 4px Schrift**

### **4. Artefakt Creator**
- Für Gegenstände, Waffen, Tech
- Einfache Formen kombinierbar
- Verschiedene Stile (antik, modern, alien)

## Export-Funktionen

### **React Native Ready**
```javascript
// Automatischer Export:
export const alienPortrait = `[60x40 ASCII]`;

export const styles = StyleSheet.create({
  portraitLarge: {
    fontFamily: 'Courier',
    fontSize: 4,
    lineHeight: 4,
    color: '#ffffff'
  },
  uiIcon: {
    fontFamily: 'Courier', 
    fontSize: 12,
    lineHeight: 12,
    color: '#ffffff'
  }
});
```

### **Multi-Size Export**
- Checkbox-Liste: Welche Größen exportieren?
- Ein Asset in mehreren Größen gleichzeitig
- Zip-Download mit allen Varianten

## UI-Layout

```
┌─ ASCII Generator ──────────────────────────┐
│ Mode: [Quick▼] [Paint] [Portrait] [Items]  │
│ ┌─ Controls ─────┐ ┌─ Preview ───────────┐ │
│ │ Type: [Ship▼]  │ │ Font: [4px▼]       │ │
│ │ Size: [60x40▼] │ │                    │ │
│ │ Style: [▓██▓]  │ │   [ASCII Preview]  │ │
│ │                │ │                    │ │
│ │ Export Sizes:  │ │ Display: 240x160px │ │
│ │ ☑ 8x6 (12px)   │ │ Chars: 2,400       │ │
│ │ ☑ 60x40 (4px)  │ │                    │ │
│ │ ☐ 80x50 (2px)  │ │                    │ │
│ │                │ └────────────────────┘ │
│ │ [Generate]     │                       │ │
│ │ [Export RN]    │                       │ │
│ └────────────────┘                       │ │
└────────────────────────────────────────────┘
```

## Canvas-Tools

### **Paint-Modus**
- Pixel-Grid mit ASCII-Zeichen
- Brush-Palette: █▓▒░■□●○►◄▲▼
- Tools: Pencil, Line, Rectangle, Circle, Fill
- Zoom: 1x, 2x, 4x für Details

### **Portrait-Modus**  
- Gesichts-Templates laden
- Einzelne Bereiche editieren
- Pose-Varianten
- Equipment hinzufügen

## Technische Details

### **Live-Preview**
```typescript
interface PreviewCanvas {
  showMultipleFontSizes: boolean;
  currentFontSize: 2 | 4 | 8 | 12;
  displayCalculatedSize: string;
  zoomLevel: number;
}
```

### **Persistierung**
- LocalStorage für Projects & Templates
- JSON Export/Import
- Template-Library

### **Performance**
- Canvas-Optimierung für große ASCII (100x60)
- Debounced Live-Preview
- Lazy Loading für Templates

## Getting Started für Claude Code

**Entwicklungsreihenfolge:**
1. Basic Canvas mit Font-Size-Switcher
2. Simple Planet-Generator (Test der Multi-Font-Logik)  
3. Paint-Tools für Schiffe
4. Portrait-Editor für Charaktere
5. Export-Funktionen
6. Template-System

**Hauptfokus:** 
- Multi-Font-System funktioniert
- Paint-Tools sind intuitiv
- Export ist React Native ready

**Nicht implementieren:**
- Komplexe KI-Features
- Community/Sharing
- Animations-Export
- 20+ Schiffs-Varianten

Das Tool soll **einfach und fokussiert** sein - aber die Multi-Font-Funktionalität für verschiedene Bereiche ist der Schlüssel!