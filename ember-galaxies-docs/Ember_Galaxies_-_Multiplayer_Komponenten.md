# Multiplayer Komponenten

Dadurch, dass man niemals in direktem Konflikt mit anderen Spielern steht, wenn man es nicht möchte, kann man in den Multiplayerkomponenten auch offenen Handel von Rohstoffen oder Schiffen ermöglichen. Das Balancing ist dabei relativ einfach.

## Ideen
- Handel von Schiffen und Rohstoffen
- Politik
- Spielerprofil
- Spieler müssen für die Erreichung von Zielen zusammenarbeiten. Man bekommt ein Abzeichen auf seinem Profil, wenn man teilgenommen hat.
- Bedrohungen, die alle Spieler gleichermaßen in ihrem persönlichen Singleplayer Spiel betreffen. Zum Beispiel aggressive Alienrassen, Viren und Parasiten. So kann man das Spiel immer wieder neu und spannend halten.

## Beeinflussung auf die Architektur der App
Dadurch, dass ich Multiplayer einführe, muss ich Cheating verhindern. Bei [[Melvor Idle]] wird zum Beispiel nur ein Speicherstand lokal und in der Cloud gespeichert. Cheating ergibt hier keinen Sinn oder zumindest stört es niemanden, weil es einfach nur ein Singleplayer Spiel ist. 

Damit muss ich den State des Spieles und von jedem Account strikt Online auf dem Server speichern ohne, dass ein Spieler darauf zugreifen kann. Das bedeutet im Umkehrschluss: Kein Offline Spielen oder nur mit sehr geringen Features. 

Demnach ergibt sich das nächste Problem: Wie erreiche ich, dass jeder User eine große Welt bekommt, von der auch mein Server weiß und die nicht durch Cheating von außen beeinflussbar ist? 

Idee: Die Welt ist zunächst bei jedem Spieler sehr klein und er weiß nichts von umliegenden Systemen. Die kann er dann nach und nach erforschen. Die wenigsten Spieler werden das Spiel Hardcore bis zum Ende zocken und dadurch bleibt sehr viel Platz in der DB. Stichwort "Fog of War". So entsteht auch immer wieder ein OHaaaaaa Effekt, wenn der User die nächsten Systeme freischaltet und merkt wie groß die Welt eigentlich wirklich angelegt ist. 