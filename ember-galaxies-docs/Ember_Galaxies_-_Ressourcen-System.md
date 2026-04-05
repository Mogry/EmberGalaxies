# Ember Galaxies - Ressourcen-System

## Übersicht der 5 Ressourcen

### 1. Iron (Eisen)
- **Typ:** Basis-Ressource
- **Raidbar:** ✅ Ja
- **Verwendung:** Grundbaustoff für alle Strukturen und kleine Schiffe
- **Charakteristik:** Einfachste Ressource, jeder Planet kann sie produzieren
- **Progression:** Einstiegs-Level

### 2. Silver (Silber)
- **Typ:** Fortgeschrittene Ressource
- **Raidbar:** ✅ Ja
- **Verwendung:** Hochwertigere Gebäude und mittlere Schiffe
- **Charakteristik:** Wertvoller als Iron, nicht auf allen Planeten verfügbar
- **Progression:** Mittleres Level

### 3. Ember (Glut)
- **Typ:** Seltene/Elite Ressource
- **Raidbar:** ✅ Ja
- **Verwendung:** Endgame-Gebäude und Capital Ships
- **Charakteristik:** Mysteriöses Material aus den Überresten vergangener Zivilisationen
- **Progression:** High-End Level
- **Lore-Bezug:** Perfekte Verbindung zum Spielnamen "Ember Galaxies"

### 4. H2 (Wasserstoff)
- **Typ:** Treibstoff-Ressource
- **Raidbar:** ✅ Ja
- **Verwendung:** Treibstoff für Flottenbewegungen
- **Charakteristik:** 
  - Essentiell für große Flottenoperationen
  - Begrenzt Spieler-Aktionen strategisch
  - Zwingt zur Planung und Ressourcen-Logistik
- **Gameplay-Mechanik:** 
  - Große Flotten brauchen viel H2
  - Spieler müssen H2 von verschiedenen Planeten sammeln
  - Verhindert "easy mode" vom Hauptplaneten aus

### 5. Energy (Energie)
- **Typ:** Premium-Ressource
- **Raidbar:** ❌ NEIN - nicht raidbar!
- **Verwendung:** 
  - Spezielle Technologien
  - Forschung
  - Elite-Funktionen
- **Charakteristik:** 
  - Wertvollste Ressource
  - Kann nicht gestohlen werden
  - Schwer zu produzieren
  - Bleibt immer beim Besitzer

## Raid-System

### Raidbare Ressourcen (4 von 5):
- Iron ✅
- Silver ✅  
- Ember ✅
- H2 ✅

### Nicht raidbare Ressource (1 von 5):
- Energy ❌

## Strategische Gameplay-Mechaniken

### Treibstoff-System (H2):
- **Zweck:** Verhindert "One-Planet-Gameplay"
- **Mechanik:** Große Flotten brauchen entsprechend viel H2
- **Strategie:** Spieler müssen:
  - Mehrere Planeten entwickeln
  - H2 von verschiedenen Quellen sammeln
  - Flottenbewegungen planen
  - Logistik-Netzwerke aufbauen

### Ressourcen-Progression:
1. **Early Game:** Iron dominiert
2. **Mid Game:** Silver wird wichtig
3. **Late Game:** Ember für Endgame-Content
4. **Durchgehend:** H2 für Mobilität, Energy für Prestige

## Design-Philosophie

### Namen-Konventionen:
- **Bekannte Materialien:** Iron, Silver (vertraut, leicht verständlich)
- **Futuristisch:** H2 (klingt nach Zukunfts-Treibstoff)
- **Mystisch:** Ember (einzigartig, lore-relevant)
- **Abstrakt:** Energy (universell verständlich)

### Progression-Gefühl:
- Iron → Silver → Ember = Aufstieg in der Technologie
- H2 = Strategische Tiefe
- Energy = Exklusivität und Endgame-Power

## Technische Umsetzung

### Abkürzungen für UI:
- **Fe** - Iron
- **Ag** - Silver  
- **Em** - Ember
- **H2** - Wasserstoff
- **En** - Energy

### Raid-Protection:
```javascript
// Beispiel-Mechanik
const raidableResources = ['iron', 'silver', 'ember', 'h2'];
const protectedResources = ['energy'];

function calculateRaidLoot(targetPlanet, attackerCapacity) {
  // Energy kann nie geraidet werden
  // Andere Ressourcen normal raidbar
}
```

## Balancing-Überlegungen

### Ressourcen-Verfügbarkeit:
- **Alle Ressourcen** sind auf **jedem Planeten** verfügbar
- Unterschied liegt in den **erforderlichen Gebäuden/Minen**:
  - **Iron Mine** - Einfachste Mine
  - **Silver Mine** - Erweiterte Mine  
  - **Ember Extractor** - Komplexe Extraktionsanlage
  - **H2 Refinery** - Wasserstoff-Raffinerie
  - **Energy Generator** - Energie-Kraftwerk

### Progression durch Gebäude-Technologie:
- Schwierigkeit = Baukosten und Tech-Requirements
- Nicht durch Planeten-RNG limitiert
- Spieler-Entscheidung welche Ressourcen priorisiert werden

### Raid-Balance:
- 80% der Ressourcen raidbar (strategische Gefahr)
- 20% sicher (langfristige Progression gesichert)