# Funktionen im Detail zu Ember Galaxies

## Wie funktioniert das Ausbauen von Gebäuden

Ich möchte, dass der komplette Spielstand auf dem Server und in der Datenbank abgebildet ist. Es darf keine Lücke entstehen. Also muss auch der Ausbaustatus in der Datenbank gespeichert werden.

Dafür braucht das Schema "Planet" auch mehrere Felder, die den Ausbau abbilden. 

1. Welches Gebäude baut aus?
2. Startzeit
3. Endzeit
4. Zuletzt aktualisiert

Die Bauzeit wird über eine Funktion ermittelt, bei der zunächst geguckt wird welches Gebäude gebaut werden soll, welche Stufe gebaut wird und welche Stufe die Zentrale hat, die dann einen Geschwindigkeitsbonus bietet.


### Was ist, wenn ein Spieler ausbaut und sich dann länger nicht einloggt?
Wenn ein Spieler ausbaut aber sich lange nicht einloggt, dann muss das Script, das die aktuellen Ress des Planeten bei einer Interaktion berechnet und aktualisiert, diesen Umstand berücksichtigen. Weil die Endzeit des Ausbaus in der Datenbank festgeschrieben wird, kann ich die Berechnung der Ressourcen zweiteilen. Zum einen in den Teil bis zur Fertigstellung des Ausbaus und den zweiten Teil für den Rest der Zeit. 
Dafür brauche ich den Zeitstempel von "Zuletzt aktualisiert". 


## Wie funktioniert das Erzeugen von Ressourcen

Damit der Spieler keine Chance hat zu cheaten, muss die echte Erzeugung auf dem Server passieren. Dort hat er keinen Zugriff auf die Mechanik.
Das passiert am besten in periodischen Abständen und spätestens, wenn der Spieler die Ressourcen braucht. 
Durch den Zeitstempel "Zuletzt aktualisiert", weiß der Server immer wie viel Ressourcen auf dem Planeten zu diesem Zeitpunkt liegen müssen. Dem Spieler wird das dann angezeigt, wenn er mit dem Planeten interagiert, wenn er ausspioniert wird oder wenn ein Kampf stattfindet.

Währenddessen bekommt der Spieler laufend eine steigen

## Wie komme ich mit der Event Queue von Useractions klar?
Hier ist ein super Beitrag von Reddit: https://www.reddit.com/r/gamedev/comments/18b0ro/how_do_timebased_actions_in_browserbased_games/
Dazu: [Priority Queue](https://en.wikipedia.org/wiki/Priority_queue)


I'm currently in the process of building such a game and have built one in the past (both are school projects).

What I did was make sure that the client doesn't do anything except show you what the server is doing. Example:

-   Player A presses a button to construct a building at 10:25:13, this structure will take 15 seconds to complete.
    
-   Server acknowledges that Player A wants to build something, the server will do several checks. Does the player have enough resources? Is this build possible? Anything suspicious about this event? Once these checks are completed the server sends back the required information to show that something has actually happened. The most important thing is the completion time, which is 10:25:28.
    
-   Player A now has a timer in his screen. On the client side you will have an actual timer running, once that timer has been completed the client will ask the server for an update on that structure.
    
-   Server now checks if the structure should be finished, if there's a mistake with the timing, don't do anything with it, just send back a new time for completion. Save a log that this mistake happened. If it happens more than x amount of times you can send an auto-warning to your admins to check the account.
    

I used AJAX to call the database.

I preferred this approach as opposed to cron, mainly because at any given time, there would be roughly 20% of the total active players online. Why put additional stress on the server for players who aren't online? If a player becomes relevant again (a.k.a. an interaction happens with another player that requires up-to-date data or the player logs in) the server will update that player to the correct status. If you save the time an action will be completed and the last time an update was done, you can easily jump them back to their correct status.

The only system that had a static time was the resources, which I updated every 5 minutes. What I did was save the last updated time of that action. When a client logs in, you take the floor((current_time-last_update) / (5*60)) and update the client with that many amount of 'ticks'. This gets slightly more complicated if a building was completed that generates resources while the client was offline, but nothing too difficult.