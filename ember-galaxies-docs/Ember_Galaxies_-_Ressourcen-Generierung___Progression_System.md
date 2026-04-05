# Ember Galaxies - Ressourcen-Generierung & Progression System

## Überblick

Das Ressourcen-System von Ember Galaxies ist darauf ausgelegt, ein langfristiges, strategisches Spielerlebnis zu bieten, das über Monate oder sogar Jahre hinweg motiviert. Die Progression ist bewusst gemächlich gestaltet, um ein klassisches Browser-Game-Feeling zu erzeugen, bei dem Spieler regelmäßig reinschauen, aber nicht durchgehend aktiv sein müssen.

## Ressourcen-Typen

1. **Iron** - Basis-Ressource für alle Strukturen
2. **Silver** - Fortgeschrittene Ressource für höherwertige Gebäude
3. **Ember** - Seltene Elite-Ressource für Endgame-Content
4. **H2** - Treibstoff für Flottenbewegungen
5. **Energy** - Premium-Ressource (nicht raidbar)

## Produktions-Formel

```
Produktion = Basis * Level * (1.08 ^ Level) * Planet-Modifier * Forschungs-Bonus
```

### Forschungs-Bonus Berechnung:
```
Forschungs-Bonus = 1 + (Forschungsstufe * 0.05)
```

Beispiel: Eisenforschung Stufe 10 = 1 + (10 * 0.05) = 1.5 = +50% Produktion

### Basis-Produktionswerte:
- Iron: 20/h
- Silver: 12/h
- Ember: 5/h
- H2: 25/h

## Produktions-Progression

### Early Game (Level 1-10)
| Level | Iron/h | Silver/h | Ember/h | H2/h |
|-------|--------|----------|---------|------|
| 1     | 22     | 13       | 5       | 27   |
| 5     | 122    | 73       | 30      | 153  |
| 10    | 345    | 207      | 86      | 431  |

### Mid Game (Level 20-30) mit Forschung
| Level | Iron/h (ohne) | Iron/h (Forschung 10) | Iron/h (Forschung 20) | Iron/h (Forschung 40) |
|-------|---------------|----------------------|------------------------|------------------------|
| 20    | 1,330         | 1,995                | 2,660                  | 3,990                  |
| 25    | 2,115         | 3,173                | 4,230                  | 6,345                  |
| 30    | 3,240         | 4,860                | 6,480                  | 9,720                  |

*Forschung 40 = +200% Produktion, aber astronomische Kosten*

### Late Game (Level 35-40)
| Level | Iron/h | Silver/h | Ember/h | H2/h |
|-------|--------|----------|---------|------|
| 35    | 4,830  | 2,898    | 1,208   | 6,038|
| 40    | 7,040  | 4,224    | 1,760   | 8,800|

## Kosten-Formel

```
Kosten = Basis * (1.25 ^ Level)
```

### Beispiel Eisenmine-Ausbaukosten:
- Basis: 150 Iron, 50 Silver

| Level | Kosten Iron | Kosten Silver | Wartezeit (Solo) |
|-------|-------------|---------------|------------------|
| 1→2   | 150         | 50            | 7h / 4h         |
| 10→11 | 1,400       | 465           | 4h / 2.2h       |
| 20→21 | 13,000      | 4,300         | 10h / 5.4h      |
| 30→31 | 120,000     | 40,000        | 37h / 21h       |
| 40→41 | 1.1M        | 370k          | 156h / 88h      |

## Kolonisations-Progression

### Erstes Kolonisationsschiff:
- **Kosten:** 15,000 Iron, 8,000 Silver, 500 Ember
- **Zeit bis Erreichen:** 2-3 Tage aktives Spielen (solo)
- **Mit Raids:** Möglicherweise nach 1-2 Tagen

### Kolonisations-Timeline (ohne Raids):
1. Schiff: Tag 2-3
2. Schiff: Tag 5-7
3. Schiff: Tag 10-12
4. Schiff: Tag 16-20
5. Schiff: Tag 25-30

## Multi-Planet Breakpoints

### Level 1-15: Ein-Planet-Phase
- Kolonisation möglich aber herausfordernd
- Spieler lernt Grundmechaniken
- Raids können Progression beschleunigen

### Level 16-25: Frühe Expansion (2-5 Planeten)
- Hauptplanet erreicht Effizienz-Grenzen
- Support-Planeten werden notwendig
- Erste strategische Entscheidungen

### Level 26-35: Mittlere Expansion (10-50 Planeten)
- Planeten-Netzwerke werden wichtig
- Spezialisierung einzelner Planeten
- Großprojekte dauern Tage/Wochen

### Level 36-40: Endgame (100+ Planeten)
- Maximale Minen nur mit massiver Unterstützung
- Monatelange Mega-Projekte
- 500+ Planeten als ultimatives Langzeitziel

## Raid-System Integration

Das Raid-System bietet aktiven Spielern eine Möglichkeit, ihre Progression zu beschleunigen:

- **Bot-Raids:** Frühe Ressourcen-Quelle für aktive Spieler
- **Spieler-Raids:** 4 von 5 Ressourcen raidbar (Energy geschützt)
- **Risk/Reward:** Aggressive Expansion vs. sichere Entwicklung
- **Skill-Expression:** Gute Raider können schneller wachsen

## Langzeit-Progression Erwartungen

### Nach 1 Woche:
- 2-3 Planeten
- Minen Level 10-15
- Erste kleine Flotten

### Nach 1 Monat:
- 10-20 Planeten
- Hauptplanet Minen Level 20-25
- Mittlere Technologien freigeschaltet

### Nach 6 Monaten:
- 100-200 Planeten
- Hauptplaneten Level 30-35
- Zugang zu Endgame-Technologien

### Nach 1+ Jahr:
- 500+ Planeten möglich
- Level 40 Minen auf Hauptwelten
- Teilnahme an Mega-Projekten

## Forschungs-System

### Ressourcen-Forschungen:
- **Eisenförderung:** +5% Iron-Produktion pro Stufe (keine Obergrenze)
- **Silberförderung:** +5% Silver-Produktion pro Stufe (keine Obergrenze)
- **Ember-Extraktion:** +5% Ember-Produktion pro Stufe (keine Obergrenze)
- **H2-Raffinierung:** +5% H2-Produktion pro Stufe (keine Obergrenze)
- **Energie-Effizienz:** +5% Energy-Produktion pro Stufe (keine Obergrenze)

### Forschungs-Kosten:
- Exponentiell steigend: Kosten = Basis * (1.5 ^ Stufe)
- Höhere Stufen erfordern mehrere Planeten zur Finanzierung
- Forschung läuft parallel zur Gebäude-Entwicklung
- **Keine Obergrenze:** Spieler entscheiden selbst, wann Kosten/Nutzen nicht mehr stimmt
- **Extreme Forschung:** Stufe 30+ wird zur Prestige-Entscheidung (Forschungs-Bonus: +150%!)
- **Diminishing Returns:** Kosten steigen schneller als Nutzen

1. **Langzeit-Motivation:** Progression über Monate/Jahre, nicht Tage
2. **Casual-Friendly:** Regelmäßiges Reinschauen reicht, kein Dauerstress
3. **Skill-Expression:** Raids erlauben schnellere Progression für Aktive
4. **Keine Pay-to-Win:** Zeit und Strategie entscheiden, nicht Geld
5. **Episches Scale:** 500+ Planeten als erreichbares Prestige-Ziel

## Balancing-Prinzipien

- **Frühe Erfolge:** Erstes Kolonisationsschiff als wichtiger Meilenstein
- **Stetige Progression:** Immer ein erreichbares nächstes Ziel
- **Exponentielle Herausforderung:** Höhere Level werden progressiv schwieriger
- **Multi-Planet-Zwang:** Ab Level 20+ unmöglich ohne Expansion
- **Raid-Balance:** Beschleunigt, aber ersetzt nicht reguläre Produktion