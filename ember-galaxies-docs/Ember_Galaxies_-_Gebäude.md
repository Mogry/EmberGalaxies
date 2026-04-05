# Ember Galaxies - Gebäude
















## Ideen zur technischen Umsetzung

In War of Galaxy habe ich das Gebäudebauscript der Seite ausgelesen und es ist folgendes:
Die erste Funktion berechnet die Restzeit der Gebäudebauzeit in Stunden, Minuten und Sekunden. Kann ich so klauen. Man sieht auch wie der Premiumaccount über Payaccess == 1 geregelt wurde. 
Es werden dann einfach noch mehr if Anweisungen abgefragt.

```function countgeb() {
    s = Math.floor(gcoun);
    m = 0;
    h = 0;
    if (s <= 0) {
        document.getElementById("gendzeit").innerHTML = "Fertig<br><a href=gebauede.php>weiter</a>";
        location.replace('gebauede.php');
    } else {
        if (s > 59) {
            m = Math.floor(s / 60);
            s = s - m * 60;
        }
        if (m > 59) {
            h = Math.floor(m / 60);
            m = m - h * 60;
        }
        if (s < 10) {
            s = "0" + s;
        }
        if (m < 10) {
            m = "0" + m;
        }
        bx = h + ":" + m + ":" + s;
        document.getElementById("gendzeit").innerHTML = bx;
    }
    gcoun--;
    setTimeout("countgeb()", 999)
}
function gebaude_einblenden(anzeige) {
    var gdaten = new Array();
    var gdatenname = new Array();
    var gdatenhidden = new Array();
    gdaten[0] = '<font size="1">Bauaufträge werden hier koordiniert. Ausbau verringert die Bauzeit</font><br>';
    gdaten[1] = '<font size="1">F&ouml;rdert die Eisenvorkommen des Planeten und macht sie nutzbar</font><br>';
    gdaten[2] = '<font size="1">F&ouml;rdert die Silbervorkommen des Planeten und macht sie nutzbar</font><br>';
    gdaten[3] = '<font size="1">Veredelt das kostbare Mineral</font><br>';
    gdaten[4] = '<font size="1">Erzeugt Wasserstoff aus Meerwasser und gewinnt daraus dessen schwere und überschwere Isotope, die f&uuml;r die Kernfusion ben&ouml;tigt werden</font><br>';
    gdaten[5] = '<font size="1">Gewinnt mittels Kernfusion Energie aus Wasserstoffisotopen</font><br>';
    gdaten[6] = '<font size="1">Koordiniert die verschiedenen Forschungsteams. Ausbau verringert die Forschungszeiten</font><br>';
    gdaten[7] = '<font size="1">Riesiger Industriekomplex der zur Endmontage von Raumschiffen benötigt wird</font><br>';
    gdaten[8] = '<font size="1">Orbitale Trägerplattform für multiple weitreichende Waffensysteme</font><br>';
    gdaten[9] = '<font size="1">Verhindert das Ausspähen von Informationen aus dem Orbit</font><br>';
    gdaten[10] = '<font size="1">Erzeugt ein planetenumspannendes Energiefeld, das den Beschu&szlig; aus dem Orbit abwehren kann</font><br>';
    gdaten[99] = '<font size="1">Ein Dummy-Gebäude, das nichts kostet, wodurch man dann aber Fastbuild weiter nutzen kann, selbst wenn keine Ressourcen auf dem Planeten sind.</font><br>';
    gdatenname[0] = 'Zentrale&nbsp;';
    gdatenname[1] = 'Eisenmine&nbsp;';
    gdatenname[2] = 'Silbermine&nbsp;';
    gdatenname[3] = 'Uderon-Raffinerie&nbsp;';
    gdatenname[4] = 'Wasserstoff-Raffinerie&nbsp;';
    gdatenname[5] = 'Fusionskraftwerk&nbsp;';
    gdatenname[6] = 'Forschungszentrum &nbsp;';
    gdatenname[7] = 'Werft&nbsp;';
    gdatenname[8] = 'Raumstation&nbsp;';
    gdatenname[9] = 'Anti-Spionage-Schild&nbsp;';
    gdatenname[10] = 'Planetarer Schirmfeldgenerator&nbsp;';
    gdatenname[99] = 'Dummy-Bau&nbsp;';
    gdatenhidden[0] = '<input type="hidden" name="todox" value="1">';
    gdatenhidden[1] = '<input type="hidden" name="todox" value="3">';
    gdatenhidden[2] = '<input type="hidden" name="todox" value="4">';
    gdatenhidden[3] = '<input type="hidden" name="todox" value="5">';
    gdatenhidden[4] = '<input type="hidden" name="todox" value="6">';
    gdatenhidden[5] = '<input type="hidden" name="todox" value="7">';
    gdatenhidden[6] = '<input type="hidden" name="todox" value="2">';
    gdatenhidden[7] = '<input type="hidden" name="todox" value="8">';
    gdatenhidden[8] = '<input type="hidden" name="todox" value="9">';
    gdatenhidden[9] = '<input type="hidden" name="todox" value="10">';
    gdatenhidden[10] = '<input type="hidden" name="todox" value="11">';
    gdatenhidden[99] = '<input type="hidden" name="todox" value="99">';
    for (er = 0; er <= 10; er++) {
        if ((anzeige == 1) && (document.getElementById("gout" + er))) {
            document.getElementById("gout" + er).innerHTML = gdaten[er];
        }
        if (document.getElementById("g" + er)) {
            document.getElementById("g" + er).innerHTML = gdatenname[er];
        }
        if (document.getElementById("wformh" + er)) {
            document.getElementById("wformh" + er).innerHTML = gdatenhidden[er];
        }
        if (document.getElementById("wbutton" + er)) {
            document.getElementById("wbutton" + er).innerHTML = '<input type="submit" class="galbutton" value="Bauen" name="submit" onMouseOver="className=\'headbrowser\';" onMouseOut="className=\'galbutton\'">';
        }
    }
    if (paaccyes == 1) {
        if ((anzeige == 1) && (document.getElementById("gout" + 99))) {
            document.getElementById("gout99").innerHTML = gdaten[99];
        }
        if (document.getElementById("g99")) {
            document.getElementById("g99").innerHTML = gdatenname[99];
        }
        if (document.getElementById("wformh99")) {
            document.getElementById("wformh99").innerHTML = gdatenhidden[99];
        }
        if (document.getElementById("wbutton99")) {
            document.getElementById("wbutton99").innerHTML = '<input type="submit" class="galbutton" value="Bauen" name="submit" onMouseOver="className=\'headbrowser\';" onMouseOut="className=\'galbutton\'">';
        }
    }
}
function gebaude_komplett_ausgabe(gpfad, techtree, stufe, kosten, gtarget, ambau, bbutton, wasbauen, jcounter, einblenden, zu1, zu2, zu3, zu4, showpics) {
    var der = 0;
    var er = 0;
    var ginfo = new Array('zent','emine','smine','uraff','h2raff','fusion','forsch','werftg','station','asp','psg');
    var toshow = new Array(0,6,1,2,3,4,5,7,8,9,10);
    var bilder = new Array('zentrale_klein.jpg','fe_klein.jpg','silbermine_klein.jpg','uderonraff_klein.jpg','H2raffweb_klein.jpg','fusion_klein.jpg','fz2_klein.jpg','werft_klein.jpg','raumstation_klein.jpg','anti_spy_klein.jpg','schild_klein.jpg');
    gtarget = gtarget + '?rndnum=' + (Math.floor(Math.random() * 10)) + (Math.floor(Math.random() * 15)) + (Math.floor(Math.random() * 20));
    document.writeln('<br><br>');
    document.writeln('<center>');
    document.writeln('<table border="0" cellpadding="0" cellspacing="0" width="90%">');
    document.writeln('<tr>');
    document.writeln('<td class="ress" style="vertical-align:middle; background-size: 100% 100%; background-image: url(' + gpfad + 'rahmen/ganzoben.gif);"  class="rahmen" width="100%" height="50" >');
    document.writeln('<p align="center" class="rahmen" style="text-align:center; vertical-align:middle;">Gebäude</td>');
    document.writeln('</tr>');
    document.writeln('<tr>');
    document.writeln('<td class="ress"  style="background-size: 100% 100%; background-image: url(' + gpfad + 'rahmen/oben.gif);" width="100%" height="7">');
    document.writeln('<tr>');
    document.writeln('<td class="ress" style="background-size: 100% 100%; background-image: url(' + gpfad + 'rahmen/mitte.gif);" width="100%">');
    document.writeln('<table width="80%" align="center" border="0" cellspacing="2" cellspadding="2">');
    for (fer = 0; fer <= 10; fer++) {
        er = toshow[fer];
        if (techtree[er] == true) {
            der++;
            document.writeln('<tr>');
            document.writeln('<td class="ress">');
            if (bilder[er] != '') {
                if (showpics > 0) {
                    document.writeln('<a href="info.php?w=' + ginfo[er] + '" id="g' + er + 'a"><img border="0" src="' + gfx_pfad + 'grafik/bilder/' + bilder[er] + '"></a>');
                }
            }
            document.writeln('</td>');
            document.writeln('<td width="90%">');
            document.writeln('<table width="100%"><tr><td align="left"><a href="info.php?w=' + ginfo[er] + '" id="g' + er + '"></a>');
            if (stufe[er] > 0) {
                document.writeln('(Stufe ' + stufe[er]);
                if (ginfo[er] == 'emine') {
                    document.writeln(' - <a href="rohstoffe.php" class="transport"><span class="transport">' + modfe + '%</span></a>');
                } else if (ginfo[er] == 'smine') {
                    document.writeln(' - <a href="rohstoffe.php" class="transport"><span class="transport">' + modag + '%</span></a>');
                } else if (ginfo[er] == 'uraff') {
                    document.writeln(' - <a href="rohstoffe.php" class="transport"><span class="transport">' + modud + '%</span></a>');
                } else if (ginfo[er] == 'h2raff') {
                    document.writeln(' - <a href="rohstoffe.php" class="transport"><span class="transport">' + modh2 + '%</span></a>');
                }
                document.writeln(')');
            }
            document.writeln('</td><td align="right" class="transport">[Fertig: <b id="count_' + der + '" class="transport"></b>]</td></tr></table>');
            document.writeln('<font id="gout' + er + '"></font>');
            document.writeln(kosten[er]);
            document.writeln('</td>');
            document.writeln('<td class="ress" align="center" onMouseOver="className=\'ress\';" onMouseOut="className=\'ress\'"; bordercolor="#000066">');
            document.writeln('<form action="' + gtarget + '" method="post" name="' + fer + fer + der + der + fer + '">');
            document.writeln('<b id="wformh' + er + '"></b>');
            if (ambau < 1) {
                if (bbutton[er] == true) {
                    document.writeln('<b id="wbutton' + er + '"></b>');
                }
            } else {
                if (wasbauen == er) {
                    document.writeln('<font id="gendzeit">');
                    document.writeln('</font>');
                    document.writeln('<br><a href="gebauede.php?todo=900" target="_self" class="angriff">Abbrechen</a>');
                    countgeb();
                }
            }
            document.writeln('<input type="hidden" name="todocheck" value="YES"></form>');
            document.writeln('</td></tr>');
        }
    }
    if (paaccyes == 1) {
        document.writeln('<tr>');
        document.writeln('<td class="ress">');
        document.writeln('</td>');
        document.writeln('<td width="90%">');
        document.writeln('<table width="100%">');
        document.writeln('<tr>');
        document.writeln('<td align="left"><a href="info.php?dummy=' + ginfo[99] + '" id="g99"></a></td>');
        document.writeln('</tr>');
        document.writeln('</table>');
        document.writeln('<font id="gout99"></font>');
        document.writeln(kosten[99]);
        document.writeln('</td>');
        document.writeln('<td class="ress" align="center" onMouseOver="className=\'ress\';" onMouseOut="className=\'ress\'"; bordercolor="#000066">');
        document.writeln('<form action="' + gtarget + '" method="post" name="99er">');
        document.writeln('<b id="wformh99"></b>');
        if (ambau < 1) {
            if (bbutton[99] == true) {
                document.writeln('<b id="wbutton99"></b>');
            }
        } else {
            if (wasbauen == 99) {
                document.writeln('<font id="gendzeit">');
                document.writeln('</font>');
                document.writeln('<br><a href="gebauede.php?todo=900" target="_self" class="angriff">Abbrechen</a>');
                countgeb();
            }
        }
        document.writeln('<input type="hidden" name="todocheck" value="YES"></form>');
        document.writeln('</td></tr>');
    }
    document.writeln('</table>');
    gebaude_einblenden(einblenden);
    switch_build_einblenden_ausgabe(zu1, zu2, zu3, zu4);
    document.writeln('</td>');
    document.writeln('</tr>');
    document.writeln('<tr>');
    document.writeln('<td class="ress" style="background-size: 100% 100%; background-image: url(' + gpfad + 'rahmen/unten.gif);" width="100%" height="52">');
    document.writeln('</tr>');
    document.writeln('</table>');
    document.writeln('</center>');
}
```
