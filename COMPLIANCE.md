VERDICT: CHANGES_REQUESTED

Der Projekttyp `web-static` ist eine öffentliche Web-UI mit rein clientseitiger Verarbeitung. Ich beurteile nur, was in den gezeigten Dateien tatsächlich vorhanden ist.

## Gesamtbeurteilung

Der Habit-Tracker ist datenschutzfreundlich aufgebaut: Keine Netzwerkzugriffe (`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `document.cookie`), keine Cookies/Tracking, LocalStorage als ausschließlicher Speicherort, XSS-sichere DOM-Ausgabe per `textContent`, Import-Validierung mit Entfernung gefährlicher Schlüssel. Für die Marktreife bestehen aber behebbare Lücken, vor allem fehlerhafte bzw. platzhalterhafte Pflichttexte, unvollständige lokale Zustandsvalidierung und einige Barrierefreiheitsdefizite. Keine fundamentalen rechtlichen Verstöße, daher **CHANGES_REQUESTED**.

---

## 1. Datenschutz (DSGVO)

### 1.1 Impressum enthält Platzhalterdaten
- **Schweregrad:** kritisch / hoch
- **Datei:** `impressum.html`
- **Problem:** Die Angaben `Musterstraße 1`, `10115 Berlin`, `Max Mustermann`, `kontakt@habit-tracker.example` sind offensichtlich fiktiv. Ein nach § 5 DDG vorgeschriebenes Impressum muss eine ladungsfähige Anschrift und tatsächlich erreichbare Kontaktdaten nennen; Platzhalter erfüllen die gesetzliche Identifizierungspflicht nicht.
- **Konkrete Abhilfe:** In `impressum.html` die realen Betreiberdaten eintragen: vollständiger Name/Firma, ladungsfähige Anschrift, Vertretungsberechtigter, Telefonnummer und eine echte E-Mail-Adresse. `kontakt@habit-tracker.example` durch eine existierende Domain ersetzen. Falls der Betreiber eine natürliche Person ist, Datenschutzhinweis nach § 5 DDG entsprechend anpassen.

### 1.2 Datenschutzerklärung teilweise unvollständig / rechtlich ungenau
- **Schweregrad:** hoch
- **Datei:** `datenschutz.html`
- **Problem:**  
  - Im Abschnitt 2/3 wird pauschal „keine personenbezogenen Daten erhoben, verarbeitet" behauptet. Abschnitt 6 räumt dann ein, dass beim Hosting technisch notwendige Zugriffsdaten (z. B. IP-Adresse) verarbeitet werden können. Diese Verarbeitung findet nicht durch den Nutzer, sondern durch den Betreiber bzw. dessen Hosting-Dienst statt. Eine Datenschutzerklärung darf diese Verantwortung nicht einfach auf den Nutzer oder „Ihren Hosting-Anbieter" abwälzen.  
  - Die Kontakt-E-Mail ist ebenfalls eine `.example`-Adresse und damit nicht erreichbar.
- **Konkrete Abhilfe:**  
  In `datenschutz.html` Abschnitt 1 die echte Identität des Verantwortlichen angeben. Abschnitt 6 neu formulieren, z. B.:  
  „Beim Aufruf dieser Website verarbeitet unser Hosting-Anbieter technisch notwendige Zugriffsdaten (IP-Adresse, Datum/Uhrzeit, Zeitzone, angeforderte Ressource, Browsertyp). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren Bereitstellung der Website). Die IP-Adresse wird nach spätestens 7 Tagen gelöscht."  
  Falls ein Auftragsverarbeitungsvertrag mit dem Hosting-Anbieter besteht, sollte dies als Standardabschnitt aufgenommen werden.

### 1.3 Lokale Speicherung ist als lokale Verarbeitung grundsätzlich DSGVO-konform
- **Schweregrad:** niedrig / Hinweis
- **Datei:** `js/store.js`, `js/io.js`, `js/grid.js`
- **Bewertung:** Es findet keine Übertragung an Server statt; `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket` und `document.cookie` sind nicht vorhanden. Die Speicherung im LocalStorage ist eine rein lokale Verarbeitung durch den Nutzer. Personenbezogene Nutzereingaben (Gewohnheitstitel) liegen nicht beim Betreiber. Eine Einwilligungspflicht wie bei Cookies besteht nicht. Positive Feststellung.

### 1.4 Kein PII-Leak in Logs / Plaintext-Netzwerkverkehr
- **Schweregrad:** niedrig / Hinweis
- **Datei:** gesamt, insb. `js/io.js`
- **Bewertung:** Es wird nichts geloggt oder über das Netz übertragen. Exporte sind bewusst Nutzer-initiiert (`Blob`, `a[download]`) und lokal. Der Plaintext-JSON-Export ist vertretbar, da er auf dem Endgerät erzeugt wird und dem Nutzer die Kontrolle bleibt. Keine Beanstandung.

---

## 2. EU Cyber Resilience Act (CRA)

### 2.1 Fehlende dokumentierte Sicherheitseigenschaften / SBOM
- **Schweregrad:** mittel
- **Datei:** `README.md`, ggf. `DESIGN.md`
- **Problem:** Die App ist ein Produkt mit digitalen Elementen. Der CRA verlangt dokumentierte Sicherheitseigenschaften und eine Software-Stücklisten-Übersicht (SBOM). Die Vorlage enthält zwar Tests und gute Sicherheitsmaßnahmen, aber keine explizite Sicherheitsdokumentation und keine Abhängigkeitsliste.
- **Konkrete Abhilfe:** In `README.md` einen Abschnitt „Security & SBOM" ergänzen:  
  - Festhalten, dass keine Drittanbieter-Bibliotheken oder Build-Abhängigkeiten verwendet werden.  
  - Sicherheitsmerkmale dokumentieren: XSS-geschützte DOM-Erzeugung (`textContent`, keine dynamische Ausführung), JSON-Import-Validierung, Entfernung von `__proto__`/`constructor`/`prototype`, defensives LocalStorage-Lesen (`try/catch`).  
  - Beschreiben, wie Updates bereitgestellt werden (statisches Deployment; serverseitiges Überspielen). Ein mechanischer Update-Mechanismus innerhalb der App ist bei einer statischen Website weder notwendig noch sinnvoll; die Bereitstellung liegt beim Hoster.

### 2.2 Grundlegende Security-by-Design-Praktiken vorhanden
- **Schweregrad:** niedrig / Hinweis
- **Datei:** `js/store.js`, `js/io.js`, `js/grid.js`, `js/habits.js`
- **Bewertung:** Die Implementierung nutzt `textContent`, keine `eval`/`new Function`/`document.write`, kein Einsetzen von Benutzerdaten als HTML. Der Import-Filter entfernt gefährliche Schlüssel. Positiv.

---

## 3. EU AI Act

### 3.1 Keine KI-Funktion vorhanden
- **Schweregrad:** entfällt
- **Bewertung:** Es werden keine KI-Modelle trainiert, eingebettet oder als Dienst aufgerufen. Der AI Act ist hier nicht einschlägig, es sind keine Kennzeichnungs- oder Transparenzpflichten anwendbar.

---

## 4. Pflichttexte und User Interface

### 4.1 Impressum und Datenschutzerklärung verlinkt
- **Bewertung:** Beide Dokumente sind von `index.html`, `impressum.html` und `datenschutz.html` aus im Footer verlinkt. Die Verlinkung selbst erfüllt den strukturellen Anspruch; die inhaltlichen Mängel sind unter 1.1 und 1.2 behandelt.

### 4.2 Kein Cookie-/Consent-Banner erforderlich
- **Bewertung:** Es werden nachweislich keine Cookies und keine Tracking-/Analysewerkzeuge eingesetzt. Ein Consent-Banner würde keine zusätzliche Rechtmäßigkeit schaffen und wäre ein unnötiger Eingriff in die Nutzung. **Nicht als Anforderung stellen.**

### 4.3 Kein Widerrufsrecht/Widerrufsbelehrung nötig
- **Bewertung:** Es werden keine Waren oder Dienstleistungen gegen Entgelt angeboten; kein Fernabsatzvertrag. Eine Widerrufsbelehrung ist nicht erforderlich.

---

## 5. Barrierefreiheit (WCAG/BITV/EAA)

### 5.1 Canvas-Diagramm ist für assistive Technologien unsichtbar
- **Schweregrad:** mittel / hoch
- **Datei:** `js/habits.js`
- **Problem:** Das `<canvas>`-Element (Acht-Wochen-Balkendiagramm) erhält in `renderHabitCard` nur `className` und `data-role="chart"`. Screenreader können den Inhalt nicht interpretieren; es fehlt eine zugängliche Alternative (ARIA-Rolle, Bezeichnung oder versteckte Textalternative).
- **Konkrete Abhilfe:** In `js/habits.js` bei Erzeugung des Canvas zusätzlich setzen:
  ```javascript
  chart.setAttribute('role', 'img');
  chart.setAttribute(
    'aria-label',
    `Acht-Wochen-Diagramm: Wochenquoten ${computeWeekFractions(habit).map(f => Math.round(f * 100) + '%').join(', ')}`
  );
  ```
  Alternativ eine visuell versteckte Tabelle/Liste hinter dem Canvas ergänzen, die WCAG 1.1.1 (Textalternativen) erfüllt.

### 5.2 Aktiver Filter ist nicht programmatisch erkennbar
- **Schweregrad:** mittel
- **Datei:** `js/habits.js`
- **Problem:** Die Filterpill-Buttons wechseln nur visuell die aktive Klasse; der aktuelle Auswahlzustand ist nicht per `aria-pressed` oder `aria-selected` erfahrbar.
- **Konkrete Abhilfe:** In `updateFilterPills` für beide Buttons `setAttribute('aria-pressed', String(activeFilter === 'active'))` bzw. `String(activeFilter === 'archived')` ergänzen. Beim Erstellen der Pills in `index.html` zusätzlich `aria-pressed="false"` initial setzen.

### 5.3 Grundsätzlich gute Tastatur- und Screenreader-Unterstützung
- **Schweregrad:** niedrig / Hinweis
- **Datei:** `index.html`, `js/grid.js`, `css/*.css`
- **Bewertung:** Fokus-Stile, 44-Pixel-Touch-Flächen, visuell versteckte Labels, `aria-label`, `aria-pressed` bei den Tageszellen, `role="group"` und `aria-label` für den 30-Tage-Raster sind vorhanden. Positive Feststellung.

---

## 6. Datenintegrität und Security (ergänzend)

### 6.1 LocalStorage-Ladevalidierung prüft keine Datumsschlüsselformate
- **Schweregrad:** mittel
- **Datei:** `js/store.js`
- **Problem:** `isValidHabit` prüft bei `checks` lediglich, dass Werte booleans sind; Datumsschlüssel werden **nicht** auf das erwartete Format `YYYY-MM-DD` und Realität des Kalendertags geprüft. Damit kann ein manipulierter LocalStorage-Eintrag mit Schlüsseln wie `"heute"` oder `"2026-99-99"` als gültig durchgehen. AC-14 verlangt aber „auf erwartete Struktur geprüft".
- **Konkrete Abhilfe:** In `js/store.js` `isValidHabit` um eine Datumsschlüssel-Validierung analog zu `js/io.js` (`DATE_KEY_RE`, `daysInMonth`, `isValidDateKey`) erweitern. Nur Schlüssel, die einem realen Kalendertag entsprechen, akzeptieren; andernfalls `loadState` den leeren Standardzustand zurückgeben lassen.

### 6.2 Einstellungsobjekt wird nicht auf gefährliche Schlüssel geprüft
- **Schweregrad:** niedrig / mittel
- **Datei:** `js/store.js`
- **Problem:** In `isValidState` wird `value.settings` auf `null`/Typ geprüft, aber nicht auf gefährliche `__proto__`-, `constructor`- oder `prototype`-Schlüssel. Dadurch könnte ein manipulierter LocalStorage-Eintrag mit einem gefährlichen Schlüssel im Settings-Objekt durchschlüpfen. Aktuell wird nur `settings.theme` gelesen; das Risiko ist gering, aber der defensive Ansatz ist lückenhaft.
- **Konkrete Abhilfe:** In `isValidState` für `value.settings` einen `hasDangerousKey`-Aufruf einbauen (analog zu `js/io.js`) und bei Fund `false` zurückgeben.

---

## Fazit

Die App ist funktional und datenschutzfreundlich umgesetzt; die Sicherheitsarchitektur ist solide. Die offenen Punkte sind behebbar: reales Impressum und korrigierte Datenschutzerklärung, barrierefreie Canvas-Alternative und Filterzustände, vollständige LocalStorage-Validierung. Wegen der inhaltlichen Mängel in den Pflichttexten sowie der nicht vollständig defensiven LocalStorage-Prüfung ist die Auslieferung an echte Nutzer noch nicht ohne Nachbesserung zu empfehlen. Die implementierten Selbstbeschränkungen (keine Cookies, keine externen Aufrufe, lokale Speicherung) stehen im Einklang mit der Produktfunktion und brechen keine eigenen Features.