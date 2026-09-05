VERDICT: CHANGES_REQUESTED

## Sicherheitsbericht

### Prüfumfang
- Manuelle Codeanalyse der gezeigten Dateien.
- Automatische Scanner: für dieses Projekt keine anwendbaren Security-Scanner vorhanden; es liegt kein Scanner-Output vor. Die Bewertung beruht ausschließlich auf der manuellen Analyse.
- `js/habits.js` ist im vorliegenden Zustand gekürzt; bewertet wird der sichtbare Teil. Der nicht sichtbare Rest konnte nicht analysiert werden.

### Gesamtergebnis
Es wurden keine kritischen oder hochkritischen Schwachstellen gefunden. Die Kernanforderungen zu XSS, Prototype-Pollution-Abwehr und sicherem DOM-Umgang sind gut umgesetzt. Zwei Validierungslücken beim defensiven Laden von LocalStorage sowie eine Härtungsempfehlung führen zu CHANGES_REQUESTED.

---

## Findings

### 1. Mittel – LocalStorage-Validierung akzeptiert ungültige Datumsschlüssel
- **Betroffene Stelle:** `js/store.js`, Funktionen `isValidHabit` und `isValidState`
- **Beschreibung:**  
  Die `checks`-Schlüssel einer Gewohnheit werden nur darauf geprüft, dass ihr Wert boolesch ist. Das Format `YYYY-MM-DD` und die Gültigkeit als reales Kalenderdatum werden nicht validiert. Ein manipulierter LocalStorage-Eintrag mit z. B. `"checks": {"heute": true}` wird daher beim Laden als gültig übernommen. In `js/stats.js` erzeugt `parseKey` aus solchen Schlüsseln ein `Invalid Date`; `dayOrdinal` liefert `NaN`. Das führt zu fehlerhaften Statistiken und verletzt die defensive Lese-Anforderung AC-14.
- **Konkreter Fix:**  
  Eine gemeinsame Funktion `isValidDateKey(key)` analog zur Implementierung in `js/io.js` verwenden oder in `js/store.js` duplizieren. In `isValidHabit` für jeden `Object.keys(value.checks)`-Schlüssel anwenden, sodass nur gültige Datums-Keys akzeptiert werden.

---

### 2. Niedrig – Settings werden nicht auf gefährliche Schlüssel geprüft
- **Betroffene Stelle:** `js/store.js`, Funktion `isValidState`
- **Beschreibung:**  
  Beim Import werden gefährliche Schlüssel wie `__proto__`, `constructor` und `prototype` korrekt entfernt bzw. abgelehnt. Im LocalStorage-Ladepfad (`isValidState`) fehlt diese Prüfung für `settings`. Ein direkt manipulierter LocalStorage-Eintrag mit `"settings": {"theme": "light", "__proto__": {...}}` würde nicht verworfen. JSON.parse selbst löst hier zwar keine Prototype-Pollution aus, aber der Zustand sollte bereits beim Laden als ungültig zurückgewiesen werden.
- **Konkreter Fix:**  
  In `isValidState` nach der Theme-Prüfung die `DANGEROUS_KEYS`-Liste auf `Object.keys(value.settings)` anwenden. Alternativ eine gemeinsame `hasDangerousKey`-Hilfsfunktion aus `js/io.js` extrahieren und in `js/store.js` wiederverwenden.

---

### 3. Niedrig – Empfohlen: Content-Security-Policy ergänzen
- **Betroffene Stelle:** `index.html`
- **Beschreibung:**  
  Die App ist rein statisch und nutzt keine Inline-Skripte oder externen Ressourcen. Eine restriktive CSP würde das Risiko im Fall einer künftigen XSS-Lücke deutlich minimieren.
- **Konkreter Fix:**  
  Folgende Meta-CSP in den `<head>` von `index.html` aufnehmen (vereinbar mit allen von der App genutzten Ressourcen):
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">
  ```
  Die produktiven Skripte und Styles stammen alle aus demselben Origin (`self`); programmatische CSSOM-Änderungen (`el.style.*`, `canvas.style.*`) werden von dieser CSP nicht blockiert.

---

## Nicht zutreffend / geprüft ohne Befund
- **Secrets:** Keine hardcoded Keys, Passwörter, Tokens oder URLs gefunden.
- **AuthN/AuthZ:** Entfällt, rein clientseitige Anwendung ohne Server.
- **Abhängigkeiten:** Keine externen Bibliotheken/Pakete vorhanden; kein anfälliges Drittanbieter-Paket sichtbar.
- **Konfiguration/Transport:** Kein Server, keine Cookies, kein `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket` oder `document.cookie` (AC-18 erfüllt).