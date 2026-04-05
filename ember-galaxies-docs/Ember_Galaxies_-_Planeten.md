# Ember Galaxies - Planeten

In dem Spiel gibt es Planeten, die einen Teil des Grundmodells für Spieler darstellen. Auf Planeten können [[Ember Galaxies - Gebäude|Gebäude]] und Flotten stehen.

## Datenmodell eines Planeten:
- Aktuelle [[Ember Galaxies - Ressourcen|Ressourcen]]: Eisen, Silber, Uderon, Wasserstoff und Energie.
- Gebäude: 
	- 	Eisenmine
	- 	Silbermine
	- 	Uderonquetsche
	- 	Wasserstoffraffinerie
	- 	Forschungslabor
	- 	Werft
	- 	Raumstation
	- 	Warptor
	- 	
![[Pasted image 20210906115942.png]]
Hier greift das gleiche Schema wie bei Planeten und Spielern. Ein Spieler kann viele Planeten haben, aber ein Planet kann nur einem Spieler gehören.

## Ideen zur technischen Umsetzung

War of Galaxy macht es so, dass es die Planeten in einer Galaxie durchzählt

"http://www.warofgalaxy.com/planetenwechselnbauen.php?galaxy=22&planinr=3134"
Galaxie und Planinr. werden an das Backend übergeben und dann einmal gecheckt ob das mein Planet ist. Falls ja, wird er mir angezeigt.