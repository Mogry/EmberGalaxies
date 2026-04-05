# Ember Galaxies - Galaxie & Planeten Modell

## Weltstruktur (Hierarchie)

```
Universum
├── Galaxie 1
│   ├── System 1 (Sonne + 11-25 Planeten)
│   ├── System 2 (Sonne + 11-25 Planeten)
│   └── ... (bis zu 300 Systeme)
├── Galaxie 2
└── ... (weitere Galaxien)
```

## System-Generierung

### Sonnen-Eigenschaften
- **Temperatur**: Variable Werte (niedrig bis hoch)
- **Größe**: Klein, mittel, groß
- **Energie-Output**: Direkt abhängig von Temperatur
  - Heißere Sonne = höherer Energie-Ertrag für alle Planeten im System
  - Kältere Sonne = geringerer Energie-Ertrag für alle Planeten im System

### Planeten pro System
- **Anzahl**: 11-25 Planeten (Zufallsverteilung)
- **Verteilung**: Normalverteilung um ~18 Planeten (Mitte zwischen 11-25)
- **Wahrscheinlichkeit**: 
  - 16-20 Planeten = häufigste Konfiguration
  - 11-15 oder 21-25 Planeten = seltener

## Ressourcen-Modifikatoren pro Planet

### Basis-Ressourcen (Iron, Silver, Ember, H2)
- **Modifier-Range**: 80% - 120%
- **Verteilung**: Normalverteilung um 100%
- **Wahrscheinlichkeit**:
  - 95-105% = häufigste Werte
  - 80-90% oder 110-120% = seltener
  - Extreme (80% oder 120%) = sehr selten

### Energie (spezielle Behandlung)
- **Basis-Ertrag**: Abhängig von Sonnen-Temperatur des Systems
- **Planet-Modifier**: Zusätzlich 80-120% auf den System-Basis-Wert

## Beispiel-System

**System "Kepler-Alpha"**
- Sonne: Heiß, groß → Energie-Basis: 110%
- Planeten: 17 Stück
- Planet 1: Iron 95%, Silver 102%, Ember 88%, H2 115%, Energie 107% (von 110% Basis)
- Planet 2: Iron 103%, Silver 98%, Ember 119%, H2 91%, Energie 95% (von 110% Basis)
- ...

## Erkundungs-System

### Sichtweiten-Mechanik
- **Basis-Sichtweite**: 10 Systeme vom aktuellen Standort
- **Forschungs-Progression**: Erweitert Sichtweite auf bis zu 20 Systeme
- **Scout-Schiffe**: Für Erkundung jenseits der Sichtweite erforderlich

### System-Intel Stufen
1. **Fernbeobachtung** (innerhalb Sichtweite):
   - Sonnen-Temperatur sichtbar
   - Anzahl Planeten im System sichtbar
   - **NICHT sichtbar**: Individuelle Planeten-Modifier

2. **Scout-Erkundung** (Scout-Schiff erforderlich):
   - Bestätigt Fernbeobachtung
   - Enthüllt weitere System-Details
   - **NOCH NICHT**: Individuelle Planeten-Stats

3. **Kolonisation** (erst bei Besiedlung):
   - **Vollständige Intel**: Alle Planeten-Modifier werden enthüllt
   - **RNG-Moment**: "Lootbox-Effekt" beim Kolonisieren
   - **Strategische Entscheidung**: Blind investieren oder weiterscouten?

### Scout-Schiff Mechanik
- **Zweck**: Erkundung außerhalb der Forschungs-Sichtweite
- **Intel-Sammlung**: Sonnen-Temperatur + Planeten-Anzahl für entfernte Systeme
- **Rückkehr**: Scout bringt Intel zurück (oder permanente Aufklärung?)
- **Kosten**: Günstiger als Kolonisationsschiffe, aber H2-Verbrauch für Antrieb

## Live-Sichtbarkeit & FOMO-Design

### Vollständige Galaxie-Sicht von Spielstart
- **Komplette Karte verfügbar**: Alle Systeme und deren Eigenschaften sichtbar
- **Live Bot-Aktivitäten**: Echtzeit-Anzeige was Bots gerade machen
- **Keine Fog of War**: Maximale Transparenz für strategische Entscheidungen
- **FOMO-Intensität**: Permanenter Zeitdruck wie bei klassischen Browser-Games

### Bot-Aktivitäten Live-Tracking
- **Kolonisation**: "Bot_Zephyr kolonisiert System 47 (2/15 Planeten)"
- **Baufortschritt**: "Bot_Nova baut Kolonisationsschiff (fertig in 3h)"
- **Flottenbewegungen**: "Bot_Alpha's Flotte: 2h bis System 23"
- **Forschung**: "Bot_Omega erforscht Antrieb 3 (65% komplett)"

### Echtes Echtzeit-Gameplay
- **Permanent aktiv**: Spiel läuft 24/7 weiter, auch offline
- **Kein Pause-Modus**: Bots arbeiten permanent weiter
- **Hardcore-Zielgruppe**: Für Spieler die "echte" Browser-Game-Intensität wollen
- **Adrenalin-Rush**: Nächtliche Wecker, permanente Anspannung
- **WoG-Nostalgie**: Authentisches "frühe 2000er Browser-Game" Gefühl

## Zielgruppen-Strategie

### Nischen-Fokus statt Masse
- **Zielgruppe**: 10.000-20.000 Hardcore-Strategy-Fans weltweit
- **Premium-Community**: Wenige, aber ultra-loyale zahlende Spieler
- **Qualität über Quantität**: 1.000 Subscriptions á $5-10/Monat = nachhaltiges Business
- **Internationale Reichweite**: App Store ermöglicht weltweite Nischen-Suche

### Marketing-Positionierung
- **"Das letzte echte Echtzeit-Strategiespiel"**
- **"Nichts für Casual-Gamer"** (Warnung als Feature)
- **"Nostalgische Browser-Game-Intensität meets moderne Mobile-App"**
- **Zielgruppe**: Ehemalige WoG/Eve Online/Hardcore-MMO-Veteranen

### Expansion-Strategien
- **Komplette Systeme**: Einfacher zu verteidigen, keine Bot-Konkurrenz im System
- **Cherry-Picking**: Beste Planeten in verschiedenen Systemen (riskanter)
- **Defensive Expansion**: Große Systeme blockieren um Bots fernzuhalten
- **Aggressive Infiltration**: In Bot-Systeme eindringen (wie aggressive Bots auch)

## Kolonisation & Antriebssystem

### Kolonisations-Kosten
- **Feste Kosten**: Kolonisationsschiff-Bau (immer gleich)
- **Variable Kosten**: H2-Verbrauch abhängig von Entfernung und Antrieb
- **Carrier-System**: Größere Schiffe können kleinere Schiffe transportieren

### Antriebssystem-Grundlagen
- **Antrieb 1**: 
  - **Reichweite**: Gesamte Galaxie (theoretisch)
  - **Effizienz**: Optimal im eigenen System
  - **Praktikabilität**: 
    - Eigenes System: Schnell und günstig
    - Nachbarsystem: Langsam, aber noch machbar
    - 10-20 Systeme: Möglich, aber sehr zeitaufwendig
    - Darüber hinaus: Praktisch unbrauchbar (zu langsam/teuer)
- **Antrieb 2**: Galaxie-intern, deutlich effizienter für mittlere/weite Distanzen
- **Antrieb 3-4**: Sehr effizient für Galaxie-weite Operationen
- **Antrieb 5**: **EINZIGER** Inter-Galaktischer Antrieb

### Early Game Progression mit Antrieb 1
- **Erste Phase**: Heimatsystem vollständig erschließen (optimal)
- **Zweite Phase**: 1-3 Nachbarsysteme kolonisieren (langsam aber machbar)
- **Dritte Phase**: Scout-Missionen bis ~20 Systeme Entfernung (sehr zeitaufwendig)
- **Antrieb-Forschung**: Wird essentiell für effiziente Expansion über Nahbereich hinaus

### Flotten-Carrier-Mechanik
- **Schiffsgröße bestimmt verfügbare Antriebe**: Große Schiffe = bessere Antriebe möglich
- **Hangar-Kapazität**: Größere Schiffe können kleinere Schiffe transportieren
- **Antrieb-Limitierung**: Nur verfügbar wenn Flotten-Zusammensetzung passt
- **Beispiel**: Fly (kleinstes Schiff) = nur Antrieb 1, alleine fliegend

## Strategische Gameplay-Mechaniken

### "System-Rushing" Strategie gegen Bots
- **Ziel**: Kleine Systeme (11-13 Planeten) schnell komplett kolonisieren
- **Vorteil**: Keine Bot-Konkurrenz im System, leichter zu koordinieren
- **Bot-Verhalten**: Bots versuchen dasselbe = Race um die besten kleinen Systeme
- **Risiko**: Aggressive Bots können trotzdem in "deine" Systeme eindringen

### Live-Intel vs. Racing-Strategien
- **Vollständige Transparenz**: Alle System-Eigenschaften sofort sichtbar
- **Bot-Race-Beobachtung**: Live mitverfolgen welche Bots wo aktiv sind
- **Infiltrations-Gameplay**: In Bot-Systeme eindringen bevor sie "geschlossen" werden
- **Zeit-kritische Entscheidungen**: Permanent unter Druck durch sichtbare Bot-Konkurrenz

### Flotten-Antrieb-Strategien
- **Kleine Flotten**: Schnell, aber limitierte Antriebe (Fly = nur Antrieb 1)
- **Große Flotten**: Bessere Antriebe, aber teurer und komplexer
- **Carrier-Optimierung**: Richtige Schiffs-Mischung für gewünschten Antrieb
- **Inter-Galaktisch**: Nur mit entsprechend großen Carrier-Schiffen + Antrieb 5

## Energie-Verteilung (Gleichmäßiges System-Bonus)
- **Alle Planeten** im System profitieren **gleich** von der Sonnen-Temperatur
- **Keine Entfernungs-Modifikatoren** (vereinfacht Balancing)
- **System-Energie-Basis** × **individueller Planet-Modifier** = finaler Energie-Ertrag

### Beispiel:
- System mit heißer Sonne: Energie-Basis 115%
- Planet A: Energie-Modifier 95% → Finaler Ertrag: 115% × 95% = 109%
- Planet B: Energie-Modifier 110% → Finaler Ertrag: 115% × 110% = 127%

## Strategische Überlegungen

### System-Hunting
- **Heiße Sonnen-Systeme**: Premium-Ziele für Energie-Empire
- **Große Systeme (23-25 Planeten)**: Mehr Auswahl für Spezialisierung
- **Ausgewogene vs. Spezialisierte Systeme**: Trade-off zwischen Vielseitigkeit und Effizienz

### Planeten-Spezialisierung
- **Energie-Farmen**: Planeten in heißen Systemen + hohe Energie-Modifier
- **Rohstoff-Minen**: Planeten mit 115-120% in Iron/Silver/Ember
- **H2-Tankstellen**: Planeten mit hohem H2-Modifier für Flotten-Logistik

## Massive Expansion & Episches Scale-Gefühl

### Planeten-Anzahl ohne Limits
- **Keine Planeten-Begrenzung**: Spieler können theoretisch 500-1000+ Planeten besitzen
- **Kolonieforschung**: Bestimmt maximale gleichzeitige Kolonisationsschiffe
- **WoG-Style Empire**: Episches Gefühl eines riesigen, galaxienspannenden Reichs
- **Macro-Management**: Einzelne Planeten weniger wichtig, Gesamtstrategie entscheidend

### Bot-Expansion parallel
- **Bots skalieren mit**: Auch Bots können hunderte Planeten erreichen
- **Exponentielles Wachstum**: Alle Parteien expandieren permanent weiter
- **Platz-Konkurrenz**: Führt zu natürlicher Ressourcen-Knappheit über Zeit

## Dynamische Galaxie-Erweiterung

### Basis-Universum (Spielstart)
- **Start-Galaxien**: 5 Galaxien verfügbar
- **Initiale Kapazität**: ~15.000 Planeten (5 × 300 Systeme × ~18 Planeten)
- **Erste Expansion-Phase**: Genug Platz für Early-Mid Game

### Automatische Expansion-Events
- **Trigger-System**: Unsichtbare Grenzwerte für Gesamt-Kolonisation
- **Beispiel-Trigger**: 60% aller verfügbaren Planeten kolonisiert
- **Event-Ankündigung**: "Neue Galaxie entdeckt - Zugang in 48h freigeschaltet"
- **Lore-Begründung**: Wissenschaftliche Durchbrüche, Wurmloch-Entdeckungen, etc.

## Welt-Generierung & Skalierung

### Hybrid-Generierung
- **Basis-Universum**: 5 Galaxien beim Spielstart komplett generiert
- **Expansion-Galaxien**: Werden bei Bedarf prozedural hinzugefügt
- **Pre-Generation**: Neue Galaxien werden 48h vor Freischaltung generiert
- **Konsistenz**: Einmal generierte Eigenschaften bleiben unveränderlich

### Datenbank-Struktur
```sql
galaxies (id, name, unlock_date, is_active)
systems (id, galaxy_id, sun_temperature, energy_base, planet_count)
planets (id, system_id, position, iron_mod, silver_mod, ember_mod, h2_mod, energy_mod)
```

## Endlose Progression & New Game Plus

### Persistente Spielwelt (Standard)
- **Kein Zwangs-Reset**: Spiel läuft theoretisch endlos weiter
- **Persönliche Entscheidung**: Nur Spieler entscheidet wann neu gestartet wird
- **Kontinuierliche Expansion**: Galaxien werden bei Bedarf hinzugefügt
- **Langzeit-Projekte**: 1000+ Planeten-Imperien möglich

### New Game Plus System
- **Freischaltung**: Ab bestimmten Achievements verfügbar
- **Beispiel-Trigger**: 
  - 500 Planeten erreicht
  - 3 Galaxien vollständig kolonisiert
  - Alle Antriebe erforscht
- **Bonus-Optionen**: Mögliche Startvorteile für erfahrene Spieler
- **Wahlfreiheit**: Normal-Neustart oder New Game Plus verfügbar

### Achievement-System (Kuratiert & Meaningful)

#### Expansion-Achievements
- **"Systemherr"**: Erstes System vollständig kolonisiert
- **"Galaktischer Eroberer"**: Erste Galaxie zu 50% kolonisiert
- **"Sternenkaiser"**: 1000 Planeten erreicht
- **"Interdimensionaler Pionier"**: Erste inter-galaktische Kolonisation

#### Forschungs-Achievements  
- **"Technologieführer"**: Alle Antriebe erforscht
- **"Innovator"**: Ersten Antrieb 5 gebaut
- **"Wissenschaftsgenie"**: Forschungsbaum zu 100% abgeschlossen

#### Strategische Achievements
- **"Schnellstarter"**: 100 Planeten in ersten 30 Tagen
- **"Effizienzmeister"**: Perfekte Ressourcen-Balance erreicht
- **"Bot-Dominator"**: Ersten Bot vollständig aus Galaxie verdrängt

#### Meta-Achievements (für New Game Plus)
- **"Veteran"**: 3 verschiedene Spiele zu Achievement X gebracht
- **"Grandmaster"**: Alle anderen Achievements freigeschaltet
- **"Legende"**: [Ultra-seltenes Endgame-Achievement]

### Achievement-Design-Prinzipien
- **Qualität vor Quantität**: 20-30 sinnvolle statt 200 sinnlose Achievements
- **Fortschritts-Milestones**: Zeigen echte Spielentwicklung auf
- **Langzeit-Motivation**: Monate/Jahre erreichbare Ziele
- **New Game Plus Gates**: Achievements schalten Wiederspielwert frei
- **Mutually Exclusive Design**: Manche Achievements schließen sich gegenseitig aus

### Wiederspielbarkeit durch Spielstil-Konflikte

#### Beispiele für sich ausschließende Achievement-Paare
- **"Sternenkaiser"** (1000+ Planeten) vs. **"Technokrat"** (Alle Forschungen mit <100 Planeten)
- **"Blitzkrieger"** (Dominanz in 6 Monaten) vs. **"Ewiger Stratege"** (Perfekte Effizienz über 2+ Jahre)
- **"Rohstoff-Baron"** (Maximale Iron/Silver-Produktion) vs. **"Energie-Purist"** (90% aller Planeten Energie-spezialisiert)
- **"Expansionist"** (Erste Galaxie in 3 Monaten kolonisiert) vs. **"Perfektionist"** (Jeder Planet optimal ausgebaut)
- **"Bot-Crusher"** (Aggressive Verdrängung) vs. **"Koexistenz-Meister"** (Friedliche Nebeneinander-Strategie)

#### Account-Level Achievement-Tracking
- **Persistente Sammlung**: Achievements bleiben über alle Spiele hinweg erhalten
- **Spielstil-Zwang**: Verschiedene Runs erforderlich für 100% Achievement-Rate  
- **Strategische Planung**: Spieler muss vor Spielstart Ziel-Achievements definieren
- **Experimentier-Anreiz**: Neue Spielstile gegen verschiedene Bot-Archetypen testen

#### Bot-Diversity unterstützt Wiederspielbarkeit
- **Expansions-Bots**: Fördern "Technokrat"-Achievements (Forschung vs. Landgrabbing)
- **Tech-Bots**: Fördern "Sternenkaiser"-Achievements (Masse vs. Qualität)
- **Ressourcen-Bots**: Fördern spezialisierte Wirtschafts-Achievements
- **Aggressive Bots**: Fördern Verteidigungs-/Effizienz-basierte Achievements
- **Verschiedene Bot-Kombinationen**: Jeder Spielstart hat andere strategische Herausforderungen