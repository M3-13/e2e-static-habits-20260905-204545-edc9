# Habit-Tracker

Ein vollständig clientseitiger Habit-Tracker als rein statische Web-App – ohne Framework, Build-Schritt oder externe Bibliotheken. Nutzer verwalten Gewohnheiten, haken die letzten 30 Tage pro Gewohnheit ab, sehen Serien und Wochenquoten, erhalten ein Acht-Wochen-Balkendiagramm auf einem Canvas, archivieren und filtern Einträge, wechseln den Dark Mode und exportieren/importieren ihren gesamten Datenbestand als JSON. Alle Daten liegen ausschließlich im LocalStorage des Browsers.

## Tech-Stack

- **Sprache**: JavaScript (ES2020+)
- **Markup**: HTML5
- **Styling**: CSS3 mit CSS-Variablen für die Theme-Umschaltung
- **Speicherung**: LocalStorage (Schlüssel `habit-tracker.state.v1`)
- **Diagramm**: HTML Canvas 2D API
- **Laufzeit**: statisch im Browser, kein Server

## Installation

Keine Installation nötig – die App ist eine statische Seite ohne Abhängigkeiten.

## Start

Die App besteht aus statischen Dateien und muss über einen HTTP-Server ausgeliefert werden (kein `file://`, da ES-Module darüber nicht laden). Im Repository-Root:

```
python3 -m http.server 8000
```

Anschließend im Browser `http://localhost:8000` öffnen. Alternativ funktioniert auch die VS-Code-Erweiterung „Live Server".

## Bedienung

- **Gewohnheit anlegen**: Im Eingabeformular oben einen Namen eingeben und „Hinzufügen" klicken.
- **Abhaken**: Im 30-Tage-Raster einer Gewohnheit pro Tag ein Häkchen setzen oder wieder entfernen.
- **Filtern**: Über die Pills „Aktiv" / „Archiviert" zwischen aktiven und archivierten Gewohnheiten wechseln.
- **Archivieren / Wiederherstellen**: Über die Aktionen an einer Gewohnheit.
- **Dark Mode**: Über den Umschalter oben rechts im Header wechseln; die Auswahl bleibt gespeichert.
- **Export**: Den gesamten Datenbestand als JSON-Datei herunterladen.
- **Import**: Eine zuvor exportierte JSON-Datei wieder einlesen (ungültige Dateien werden mit einer Fehlermeldung abgewiesen).
- **Rechtliches**: Über die Links im Footer sind Impressum und Datenschutzerklärung erreichbar.

## Features

- Gewohnheiten anlegen, umbenennen, löschen, archivieren und filtern
- 30-Tage-Raster mit Häkchen pro Gewohnheit (persistiert)
- Aktuelle und längste Serie sowie Wochenquote in Prozent
- Acht-Wochen-Balkendiagramm auf einem Canvas
- Dark Mode mit Persistenz
- Export und Import des Datenbestands als JSON
- Defensives Lesen und Validieren der LocalStorage-Daten beim Start
- Impressum und Datenschutzerklärung
