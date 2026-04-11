# Ember Galaxies - Spielewelt Beschreibung

## Endgültige Beschreibung für die MVP
Es ist jetzt 2025. Mein erster Entwurf des Spieles war 2021. In den letzten vier Jahren habe ich immer wieder an das Projekt gedacht, aber hatte nie die Zeit oder den Antrieb hier weiter zu machen.

Das Spiel wird in erster Linie ein Singleplayer Game sein. Später werden dann asynchrone Multiplayer Elemente hinzugeschaltet. Außerdem will ich die Botspieler einmal zunächst in einer fest programmierten Weise anbieten. Dann aber ein Upgrade zu LLM gesteuerten Bots machen. Dadurch sollten sich interessante Geschichten ergeben, die Einfluss auf das Spiel haben können. Das ist aber erst in einer sehr späten Version des Spiels geplant. 

Meinen Techstack habe ich in einer anderen Datei definiert. 


##### Wie sieht die Welt nun konkret aus?
Ich starte mit:
- 1 Galaxie
- 200 Systemen pro Galaxie
- 5-15 Planeten pro System
Damit habe ich am Anfang des Spiels eine maximale Planetenzahl von 3000 Stück

Das Spiel soll in einer fortgeschrittenen Version allerdings viel mehr Galaxien haben. Ich kann mir eine Obergrenze von ca. 100.000 Planeten pro Game vorstellen. Eine Berechnung mit Gemini hat ergeben, dass ich mit meinem Techstack auch mit diesen großen Zahlen sehr gut zurecht kommen sollte. 



Wenn man sich die Galaxie ansieht, dann gibt es für den Spieler nur links und rechts. Ich könnte sowas wie bei [[Melvor Idle]] machen und völlig distanzlose Orte bauen. Dadurch, dass ich aber Flotten habe, die in Echtzeit fliegen, wird es schwierig dem Spieler ein Gefühl für Flugzeiten und Entfernungen zu vermitteln. Wenn ich einen Bot programmieren will, der sich auch durch die Systeme baut, dann wird es zusätzlich sehr schwer positionelles Gameplay darzustellen. Woher soll der Spieler wissen wie nah der Bot sich ihm bereits genähert hat, wenn er keine Ansicht hat, auf der er die Karte sehen kann? Damit würde ich die Idee erstmal abhaken. 

Eine andere Variante wäre es Galaxien unterschiedlich zu machen. Ringgalaxien würden es erlauben vom letzten direkt zum ersten Planet zu fliegen, weil ein letztes System "300" direkt im Ring neben System 100 liegen würde. 

IDEE: Man könnte ein großes Ereignis zufällig passieren lassen, bei dem eine Galaxie von einem Schlauch zu einem Ring wird und sich dadurch die Machtverhältnisse auf einen Schlag ändern. 

Der Spieler kann direkt auf alle Planeten und Systeme in einem gewissen Umkreis zugreifen. Ein optionales Fog of War System könnte später implementiert werden. 
































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
