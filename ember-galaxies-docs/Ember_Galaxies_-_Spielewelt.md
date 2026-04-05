# Ember Galaxies - Spielewelt Beschreibung

## Endgültige Beschreibung für die MVP
Ich wollte ursprünglich ein Singleplayer Spiel mit Multiplayer Elementen machen. Das hätte so ausgesehen, dass ich das jeweilige Singleplayer Spiel einzeln gesichert hätte und so jeder seine eigene Sandbox bekäme. 
Nun habe ich mich umentschieden und mache eine große zusammenhängende Welt aus mehreren Galaxien. Dort werden die Spieler dann auf ihr ganz eigenes Fleckchen geschickt, das für sie durch die anfängliche Begrenztheit erstmal sehr riesig erscheint. Durch die Koordinatenangabe ihres Startplaneten können sie erahnen, dass die Welt noch wesentlich größer ist. 

Durch Forschung und Bauen von Erkundungsschiffen, können sie sich Schritt für Schritt erstmal ihr eigenes Startsystem erschließen und dann weitere Systeme in der Umgebung erkunden. 

Wenn ein Spieler aufhört zu spielen, dann bleiben die Bauten auf seinen Planeten vorhanden. Nach einer Weile werden sie weniger, aber wenn ein neuer Spieler dort ankommt, kann er sehen, dass dort bereits etwas gewesen ist. Dadurch wird das Konzept des "Ember" aus Ember Galaxies manifestiert. Man wandelt auf den Spuren und der "Glut" der vorherigen Spieler. Manche Spieler werden es schaffen sehr alte Accounts zu spielen, aber ein Großteil wird aufgeben oder die Lust verlieren und deren Planeten werden die Geschichte dieses ursprünglichen Accounts weitererzählen.

##### Wie sieht die Welt nun konkret aus?
Ich starte mit:
- 1 Galaxie
- 200 Systemen pro Galaxie
- 5-15 Planeten pro System
Damit habe ich am Anfang des Spiels eine maximale Planetenzahl von 3000 Stück

Weil die Planeten die Datenbankintensivste Komponente des Spiels sind, komme ich damit für die ersten Wochen mit einer Probedatenbank PostgresQL auf Heroku aus. Danach müsste ich auf $9 pro Monat umsteigen.

Der Spieler startet dann irgendwo und hat mindestens fünf Systeme in jeder Richtung frei, bevor der nächste Spieler kommt.

Wenn man sich die Galaxie ansieht, dann gibt es für den Spieler nur links und rechts. Ich könnte sowas wie bei [[Melvor Idle]] machen und völlig distanzlose Orte bauen. Dadurch, dass ich aber Flotten habe, die in Echtzeit fliegen, wird es schwierig dem Spieler ein Gefühl für Flugzeiten und Entfernungen zu vermitteln. Wenn ich einen Bot programmieren will, der sich auch durch die Systeme baut, dann wird es zusätzlich sehr schwer positionelles Gameplay darzustellen. Woher soll der Spieler wissen wie nah der Bot sich ihm bereits genähert hat, wenn er keine Ansicht hat, auf der er die Karte sehen kann? Damit würde ich die Idee erstmal abhaken. 

Um neue Planeten und Systeme zu entdecken, muss der Spieler Scoutschiffe bauen und verschicken. Ein Fog of War versperrt ihm die Sicht auf den Rest des Universums. 
































## Neue alte Beschreibung
Nachdem ich mich viel mit den verwendeten Technologien für das Spiel beschäftigt habe, kommen mir Zweifel an der urpsprünglich geplanten Umsetzung. 
Ich möchte ein Spiel haben, das ich auf mehreren Plattformen anbieten kann. Außerdem soll es nun doch eher vornehmlich Singleplayer sein, aber auch Multiplayer Elemente enthalten. 
Es bleibt ein Aufbauspiel, bei dem einen Steine in den Weg gelegt werden, mit denen man klar kommen muss. So möchte ich beispielsweise gerne die Idee beibehalten, dass ein Bot im Hintergrund Aktionen ausführt. Die können theoretisch für alle oder für Gruppen von Spielern am Ende gleich bzw. zeitgleich sein.

### Feeling der Spielewelt
#### Größe der Map
Die Welt soll gleichzeitig riesig wirken, aber sich auch nach einer gewissen Spielzeit für den Spieler als 'conquered' anfühlen. Durch die Echtzeitkomponente soll sich der Spieler mit seinem Imperium über Monate und vielleicht sogar Jahre hinweg verbunden fühlen. Wenn der Account eine gewisse Größe erreicht hat, soll er an den [[Ember Galaxies - Multiplayer Komponenten|Multiplayer Komponenten]] teilhaben können. 



## Alte Beschreibung
[[Ember Galaxies]] spielt im Weltraum. Der Spieler übernimmt eine aufsteigende Zivilisation, die gerade dabei ist die Sterne zu erobern.

Die Spielewelt ist über die "Galaxie Ansicht" erreichbar.

#### Der Aufbau ist:

Galaxien -> Systeme -> Planeten

Es gibt beispielsweise 100 __Galaxien__, die in einer Reihe nebeneinander liegen. Will man von Galaxie 1 zu Galaxie 100 fliegen, dann muss man durch alle 99 Galaxien dazwischen Reisen. Sie sind wie auf einer Schnur.

Innerhalb einer Galaxie gibt es wieder bspw. 300 __Systeme__, die genauso nebeneinander auf einer Schnur liegen wie Galaxien.

Innerhalb eines Systems gibt es zwischen 5 und 30 __Planeten__, wobei die beiden Extreme seltener sind.

#### Wie der Spieler startet

Der Spieler startet mit einem Planeten in einem zufälligen System.  Er kann sich dann aufbauen und neue Planeten kolonisieren.


#### Hinweise zur Umsetzung
Die Systemansicht wird ein Table sein in der die Planeten des Systems aufgeführt sind. Dann werden die Informationen aus [[MongoDB]] herausgeholt und dort angezeigt.

