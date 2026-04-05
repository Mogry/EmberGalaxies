# SQLite zu Drift Migration Guide für Ember Galaxies

## Vorbereitung (5 Minuten)

### 1. Backup erstellen
```bash
git add .
git commit -m "Vor SQLite zu Drift Migration"
```

### 2. Drift Dependencies hinzufügen
```bash
claude "Füge Drift dependencies zu pubspec.yaml hinzu für Flutter"
```

## Phase 1: Schema Migration (30 Minuten)

### 3. READ-ONLY Drift parallel zu SQLite
```bash
# Schritt für Schritt - nicht alles auf einmal!
claude "Erstelle eine Drift database Klasse mit dem planets Schema aus meiner SQLite DB. Nutze die gleichen Spaltennamen. Erstelle die Datei lib/database/drift_database.dart"

# Dann für die anderen Tabellen einzeln:
claude "Füge die buildings Tabelle zum Drift Schema hinzu"
claude "Füge die game_events Tabelle zum Drift Schema hinzu"
```

### 4. Test-Read mit Drift
```bash
claude "Erstelle eine Funktion die alle Planeten aus Drift liest und in der Konsole ausgibt, um zu testen ob das Schema stimmt"
```

## Phase 2: Parallelbetrieb (1 Stunde)

### 5. Sync-Service erstellen
```bash
claude "Erstelle einen Service der Änderungen von SQLite nach Drift kopiert. Der Service soll bei jedem SQLite write auch in Drift schreiben. Datei: lib/services/database_sync_service.dart"
```

### 6. Einen Screen umbauen als Test
```bash
# Nimm erstmal nur einen simplen Screen
claude "Baue den PlanetResourcesView um, sodass er Drift Streams statt SQLite nutzt. Lass SQLite erstmal noch drin als Fallback"
```

## Phase 3: Schrittweise Migration (Rest des Nachmittags)

### 7. Service für Service umbauen
```bash
# Wichtig: Immer nur EINEN Service!
claude "Ersetze in der game_logic.dart alle SQLite Aufrufe durch Drift. Zeige mir erst die Änderungen bevor du sie machst"

# Nach jedem Service: Testen!
flutter run
# Spielen, checken ob alles läuft

# Dann der nächste Service:
claude "Ersetze in der building_manager.dart alle SQLite Aufrufe durch Drift"
```

## Phase 4: Cleanup (Morgen oder später)

### 8. SQLite entfernen
```bash
# Erst wenn ALLES läuft!
claude "Entferne alle SQLite dependencies und alten Code. Zeige mir eine Liste was du löschen würdest"
```

## Wichtige Claude Code Tipps

### ✅ DO's
```bash
# Immer nach Erklärung fragen
claude "Erkläre mir was diese Drift Migration macht bevor du sie ausführst"

# Kleine Schritte
claude "Migrate NUR die watchPlanet Funktion zu Drift"

# Backup-Punkte
claude "Erstelle einen Git commit mit Message 'Drift: Planets table migrated'"
```

### ❌ DON'Ts
```bash
# Nicht alles auf einmal
claude "Migrate mein ganzes Projekt zu Drift" # NEIN!

# Keine blinden Änderungen
claude "Ändere alle Database Aufrufe" # ZU VIEL!
```

## Debugging-Hilfe

### Wenn etwas schief läuft:
```bash
claude "Ich bekomme diesen Fehler: [ERROR]. Die Drift migration hat das verursacht. Wie fixe ich das?"

# Oder Rollback:
git checkout -- lib/services/game_logic.dart
```

## Zeitplan für heute Nachmittag

- **14:00-14:30**: Schema Setup (Phase 1)
- **14:30-15:30**: Parallel-Betrieb testen (Phase 2)
- **15:30-16:00**: Pause, mit Kids spielen 😊
- **16:00-17:30**: 2-3 Services migrieren (Phase 3)
- **17:30**: Commit & Feierabend!

## Pro-Tipps

1. **Stabilität vor Geschwindigkeit**: Wenn nach 2 Services alles gut läuft, lass es für heute dabei!
2. **Immer testen**: Nach jeder Migration kurz die App starten und die migrierten Features checken
3. **Git ist dein Freund**: Lieber einen Commit zu viel als zu wenig
4. **Claude Code Limits**: Wenn Claude sagt "das ist zu viel", dann teile die Aufgabe auf

## Migrations-Checkliste

- [ ] Backup/Git Commit erstellt
- [ ] Drift dependencies hinzugefügt
- [ ] Drift Schema erstellt
- [ ] Test-Read funktioniert
- [ ] Sync-Service läuft
- [ ] Erster Screen verwendet Streams
- [ ] Game Logic migriert
- [ ] Building Manager migriert
- [ ] Resource Manager migriert
- [ ] Alle Tests grün
- [ ] SQLite Code entfernt
- [ ] Final Commit

Viel Erfolg! 🚀