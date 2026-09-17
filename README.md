# CnC-TA-Building_&_Off-Saver - HE

Tampermonkey-Script für **Command & Conquer: Tiberium Alliances**.

# Achtung! Wenn du dieses Script nutzen möchtest und zum Speichern deiner Angriffsformationen den Tiberium Alliances Formation Saver 2.3.3 aus dem SoO Script nutzt musst du diesen dort deaktivieren und durch den Tiberium Alliances Formation Saver hier aus der Reposity erstzen.


Das Script erweitert das Spiel um zwei getrennte Speicherfunktionen:

- **Building Saver** – Speichern und Laden von Gebäudeaufstellungen
- **Off-Saver** – Speichern und Laden von Off-Formationen

---

## Funktionen

### 🏗️ Building Saver

Mit dem Building Saver können Gebäudeaufstellungen gespeichert und später wieder geladen werden.

Funktionen:

- Gebäudeaufstellung speichern
- Gespeicherte Aufstellungen laden
- Mehrere Aufstellungen speichern
- Eigene Namen für Speicherstände vergeben
- Speicherstände dauerhaft im Browser speichern
- Speicherstände können über **X** gelöscht werden

Die Gebäudeaufstellungen werden getrennt pro eigener Basis gespeichert.

---

### ⚔️ Off-Saver

Der Off-Saver ermöglicht das Speichern und Laden von Off-Formationen.

Funktionen:

- Off-Formation speichern
- Gespeicherte Formation laden
- Mehrere Formationen speichern
- Eigene Namen für Speicherstände vergeben
- Speicherstände dauerhaft im Browser speichern
- Speicherstände können über **X** gelöscht werden

Die gespeicherten Formationen werden getrennt von den Gebäudeaufstellungen verwaltet.

---

## Installation

Das Script benötigt:

- **Tampermonkey**
- einen aktuellen Browser
- **Command & Conquer: Tiberium Alliances**

### Installation über GitHub

Das Script kann direkt über die Raw-Datei installiert werden:

**CnC-TA-Building_&_Off-Saver - HE**

Nach der Installation wird das Script von GitHub automatisch über die hinterlegte `@updateURL` aktualisiert.

---

## Verwendung

Nach der Installation befindet sich die zusätzliche Funktion direkt im Spiel.

Je nach aktueller Ansicht stehen die entsprechenden Funktionen zur Verfügung:

- **LAYOUT** → Gebäudeaufstellungen
- **Formation** → Off-Formationen

Die jeweiligen Untermenüs werden geöffnet, wenn die entsprechende Schaltfläche ausgewählt wird.

Beim Wechsel zwischen den Ansichten werden nicht mehr benötigte Untermenüs automatisch geschlossen.

---

## Speicher

Die gespeicherten Daten werden lokal im Browser über `localStorage` gespeichert.

Dadurch bleiben die gespeicherten Aufstellungen auch nach einem Neustart des Browsers erhalten.

**Hinweis:** Beim Löschen der Browserdaten bzw. der Website-Daten können auch die gespeicherten Aufstellungen verloren gehen.

---

## Version

**Version: 1.0.0**

### Changelog

#### 1.0.7
- Erste veröffentlichte Version
- Building Saver integriert
- Off-Saver integriert
- Benannte Speicherstände
- Löschen einzelner Speicherstände
- Speicherung pro eigener Basis
- Permanente lokale Speicherung

---

## Hinweis

Dieses Script ist eine **Harzi Edition (HE)** für C&C Tiberium Alliances.

Die Nutzung erfolgt auf eigene Verantwortung.
