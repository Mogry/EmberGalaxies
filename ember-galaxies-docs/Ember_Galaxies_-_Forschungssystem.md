# Ember Galaxies - Forschungssystem

## Antriebsforschungen

### 1. Combustion Drive / Verbrennungsantrieb
- **Optimal für:** System-interne Flüge
- **Treibstoff:** Nur H2
- **Besonderheit:** Höchste Effizienz bei kurzen Distanzen
- **Ermöglicht:** Fly, Bumblebee, Corvette

### 2. Plasma Drive / Plasmaantrieb
- **Optimal für:** System-interne bis kurze Intersystem-Flüge
- **Treibstoff:** Nur H2
- **Besonderheit:** Balance zwischen Geschwindigkeit und Reichweite
- **Ermöglicht:** Light Cruiser, Heavy Cruiser

### 3. Linear Drive / Linearantrieb
- **Optimal für:** Schnelle galaktische Operationen
- **Treibstoff:** Nur H2
- **Besonderheit:** Beste Geschwindigkeit für Galaxie-weite Angriffe
- **Ermöglicht:** Battleship
- **Limitierung:** Kann NICHT zwischen Galaxien reisen

### 4. Nexus Drive / Nexusantrieb
- **Optimal für:** Lange galaktische Strecken
- **Treibstoff:** Nur H2
- **Besonderheit:** Effizienter als Linear bei sehr weiten Distanzen
- **Ermöglicht:** Battleship of Nexus Class
- **Limitierung:** Immer noch auf eine Galaxie begrenzt

### 5. Ember Drive / Emberantrieb
- **Optimal für:** Intergalaktische Expansion
- **Treibstoff:** H2 + Ember
- **Besonderheit:** EINZIGER Antrieb für intergalaktische Reisen
- **Ermöglicht:** Battleship of Ember Class, Carrier Titan
- **Strategie:** Bei kurzen Strecken Verschwendung von Ember

## Waffenforschungen (Klassisches Sci-Fi)

### 1. Railgun / Schienenkanone
- Kinetische Projektilwaffe
- Effektiv gegen leichte Panzerung
- Basis-Waffensystem

### 2. Laser Cannon / Laserkanone
- Fokussierte Energiestrahlen
- Mittlere Durchschlagskraft
- Präzise gegen einzelne Ziele

### 3. Plasma Cannon / Plasmakanone
- Hochenergie-Plasmageschosse
- Hoher Schaden gegen schwere Ziele
- Area-of-Effect Potential

### 4. Ion Cannon / Ionenkanone
- Stört Schilde und Systeme
- Mittlerer direkter Schaden
- Taktischer Vorteil durch Systemstörung

### 5. Antimatter Torpedo / Antimaterie-Torpedo
- Höchste Schadenswerte
- Maximale Durchschlagskraft
- Endgame-Waffe

## Verteidigungsforschungen (Klassisches Sci-Fi)

### 1. Titanium Armor / Titanpanzerung
- Physischer Basisschutz
- Effektiv gegen kinetische Waffen
- Keine Energiekosten

### 2. Deflector Shield / Deflektorschild
- Standard-Energieschild
- Regeneriert sich langsam
- Schwach gegen Ionenwaffen

### 3. Adaptive Shield / Adaptivschild
- Passt sich an eingehenden Schaden an
- Mittlere Regeneration
- Ausgeglichener Schutz

### 4. Phase Shield / Phasenschild
- Reduziert eingehenden Schaden signifikant
- Hoher Energieverbrauch
- Fortgeschrittene Technologie

### 5. Quantum Barrier / Quantenbarriere
- Höchste Schutzwerte
- Schnelle Regeneration
- Endgame-Verteidigung

## Kolonieverwaltung

### Imperial Administration / Imperiale Verwaltung
- **Startwert:** 5 Planeten
- **Progression:** Exponentiell steigend
- **Stufe 20:** ~500 Planeten

#### Progression-Tabelle (Beispielwerte):
| Stufe | Max. Planeten | Kosten-Multiplikator |
|-------|---------------|---------------------|
| 1     | 5             | 1x                  |
| 5     | 15            | 8x                  |
| 10    | 50            | 100x                |
| 15    | 175           | 2.000x              |
| 20    | 500           | 50.000x             |

**Formel-Ansatz:** 
- Planeten = 5 * (1.5^Stufe)
- Kosten = Basis * (1.8^Stufe)

## Ressourcen-Forschungen

### 1. Iron Mining / Eisenförderung
- +5% Iron-Produktion pro Stufe
- Keine Obergrenze

### 2. Silver Extraction / Silberextraktion
- +5% Silver-Produktion pro Stufe
- Keine Obergrenze

### 3. Ember Resonance / Ember-Resonanz
- +5% Ember-Produktion pro Stufe
- Keine Obergrenze

### 4. H2 Efficiency / H2-Effizienz
- +5% H2-Produktion pro Stufe
- Keine Obergrenze

### 5. Energy Optimization / Energieoptimierung
- +5% Energy-Produktion pro Stufe
- Keine Obergrenze

## Strategische Überlegungen

### Antriebsstrategie
- Verschiedene Flotten für verschiedene Aufgaben
- Lokale Verteidigung: Combustion/Plasma
- Galaxie-Raids: Linear Drive
- Expansion: Ember Drive

### Waffen vs. Schilde (Konter-System)
- Jede Waffe ist stark gegen einen bestimmten Schild (+30% Schaden)
- Jede Waffe ist schwach gegen einen anderen Schild (-30% Schaden)
- Neutrale Matchups bleiben bei 100% Schaden

### Schiffs-Zuordnung (aufsteigend)
1. **Fly** → Railgun + Titanium Armor
2. **Bumblebee** → Laser Cannon + Deflector Shield
3. **Corvette** → Plasma Cannon + Adaptive Shield
4. **Light Cruiser** → Ion Cannon + Phase Shield
5. **Heavy Cruiser** → Plasma Cannon + Adaptive Shield (Alternative für Vielfalt)
6. **Battleship** → Antimatter Torpedo + Quantum Barrier
7. **Battleship of Nexus Class** → Antimatter Torpedo + Quantum Barrier
8. **Battleship of Ember Class** → Antimatter Torpedo + Quantum Barrier
9. **Carrier Titan** → Antimatter Torpedo + Quantum Barrier (0 Angriff, massive Verteidigung)

### Konter-System innerhalb der Größenklassen

#### Kleine Schiffe (Fly, Bumblebee, Corvette)
- **Fly** (Railgun) → +30% Schaden gegen **Corvette** (Adaptive Shield)
- **Bumblebee** (Laser) → +30% Schaden gegen **Fly** (Titanium Armor)
- **Corvette** (Plasma) → +30% Schaden gegen **Bumblebee** (Deflector Shield)
- *Kreis: Fly > Corvette > Bumblebee > Fly*

#### Mittlere Schiffe (Light Cruiser, Heavy Cruiser)
- **Light Cruiser** (Ion) → +30% Schaden gegen **Heavy Cruiser** (Adaptive Shield)
- **Heavy Cruiser** (Plasma) → +30% Schaden gegen **Light Cruiser** (Phase Shield)
- *Gegenseitiger Konter für taktische Vielfalt*

#### Große Schiffe (Battleship-Klassen, Carrier Titan)
- **Battleship** → Standard-Effektivität
- **Battleship Nexus** → +10% gegen normale Battleships
- **Battleship Ember** → +10% gegen Nexus, +20% gegen normale Battleships
- **Carrier Titan** → 0 Angriffspunkte, massive Verteidigungspunkte, Hangar-Funktion

### Massen-Mechanik
- Konter-System gilt nur innerhalb der Größenklassen
- Große Schiffe-Überlegenheit durch höhere Angriffs-/Verteidigungspunkte
- Masse kann Klassenunterschiede ausgleichen (z.B. 300 Flies vs 1 Battleship)
- Beispiel: 1 Battleship = 10.000 Angriffspunkte, 1 Fly = 50 Angriffspunkte
- 300 Flies = 15.000 Angriffspunkte können theoretisch gewinnen

### Kolonieverwaltung
- Frühe Expansion begrenzt durch Verwaltung
- Mittleres Spiel: Balance zwischen Forschung und Expansion
- Spätes Spiel: Massive Imperien mit 500+ Planeten möglich