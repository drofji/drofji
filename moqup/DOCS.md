# Moqup — Dokumentation der JSON-Konfiguration

Moqup verwandelt JSON in einen **klickbaren Prototyp eines Admin-Panels / Dashboards**: Menü, Bereiche, KPIs, Diagramme, CRUD-Tabellen, Formulare, Automatisierungen, Integrationen, Logs, Berechtigungen, Routenkarte, Kanban, KI-Chat und einen Demo-Modus mit interaktivem Cursor und einem „Wow“-Finale.

Ablauf: Kunden beschreiben (Branche, Abteilungen, Integrationen, Prozesse) → KI erzeugt JSON nach dieser Dokumentation → in den Link einfügen → Prototyp im Termin präsentieren.

---

## 1. Link-Parameter

| Parameter | Pflicht | Format | Zweck |
|---|---|---|---|
| `map` | **ja** | JSON | Gesamte Struktur: `app`, `menu`, `pages`, `chat`, `layout` |
| `colors` | nein | JSON | Farbpalette. Fehlende Werte → Standard |
| `demo` | nein | JSON | Demo-Ablauf: Cursor-Schritte, Untertitel, Finale |
| `logo` | nein | String | SVG-Markup, `data:image/…`, Bild-URL oder 1–3 Zeichen |
| `page` | nein | String | ID des Bereichs, der zuerst geöffnet wird |

Parameter können nach `?` oder nach `#` übergeben werden (empfohlen: `#` — lange Links gehen nicht an den Server und stoßen nicht an dessen Limits):

```
dashboard.html#map=z:3Vbbb...&colors={"primary":"#10b981"}&demo=z:...&logo=NC
```

### Kodierung des JSON-Werts

| Präfix | Bedeutung | Wann verwenden |
|---|---|---|
| *(keins)* | normales JSON, URL-kodiert | kurze Konfigurationen, manuelles Bearbeiten |
| `json:` | dasselbe, explizit | — |
| `b64:` | base64url aus UTF-8-JSON | wenn Sonderzeichen stören |
| `z:` | deflate-raw + base64url | **Standard**: 3–6× kürzer |
| `pako:` | zlib (wie `pako.deflate`) + base64url — Format von mermaid.live | wenn der Link mit einem externen Tool erzeugt wird |

Am einfachsten erhält man den fertigen Link im Tab **„Link-Generator“** (erscheint, wenn `dashboard.html` ohne Parameter geöffnet wird). Per Kommandozeile:

```bash
# z: (deflate-raw) — Python
python3 -c "import zlib,base64,json,sys;d=json.dumps(json.load(open(sys.argv[1])),ensure_ascii=False,separators=(',',':')).encode();c=zlib.compressobj(9,zlib.DEFLATED,-15);print('z:'+base64.urlsafe_b64encode(c.compress(d)+c.flush()).decode().rstrip('='))" map.json

# pako: (zlib) — Node.js
node -e "const z=require('zlib');const s=JSON.stringify(require('./map.json'));console.log('pako:'+z.deflateSync(s,{level:9}).toString('base64url'))"
```

In der Browser-Konsole auf der Seite: `await Moqup.encode(JSON.stringify(cfg))` → `"z:…"`.

### Fehler

* Kein `map` → mittig die Meldung „Parameter map fehlt“ + diese Dokumentation, Link-Generator und Beispiele.
* JSON fehlerhaft → zuerst der Fehler mit **Zeile/Spalte**, Ausschnitt und Hinweisen (überflüssiges Komma, einfache Anführungszeichen, Schlüssel ohne Anführungszeichen, Kommentare, abgeschnittener Link), danach die Dokumentation; der Generator ist mit Ihrem JSON vorausgefüllt, damit Sie es direkt korrigieren können.
* Kleinere Probleme (unbekannter Widget-Typ, doppelte IDs, unbekannter Schlüssel, ungültige Farbe) brechen die Seite nicht ab: In der Topbar erscheint das Symbol **⚠ N** mit einer Liste der Hinweise.

---

## 2. Wurzel von `map`

```json
{
  "app":    { "title": "NordCargo", "subtitle": "Logistics OS", "lang": "de" },
  "layout": { "sidebarWidth": 260, "gap": 16, "density": "comfortable" },
  "menu":   [ ... ],
  "pages":  { ... },
  "chat":   { ... },
  "colors": { ... },
  "demo":   { ... },
  "logo":   "..."
}
```

`colors`, `demo` und `logo` können auch direkt in `map` stehen — gleichnamige Link-Parameter haben Vorrang.

### `app`

| Schlüssel | Typ | Standard | Beschreibung |
|---|---|---|---|
| `title` | String | `Moqup` | Systemname (Sidebar, Ladebildschirm, Browser-Tab) |
| `subtitle` | String | — | Unterzeile unter dem Namen |
| `lang` | `de` \| `en` \| `ru` | `de` | Sprache der Systemtexte (Buttons, CRUD, Chat) |
| `locale` | String | nach `lang` | Zahlen-/Datumsformat, z. B. `de-DE` |
| `mode` | `dark` \| `light` | `dark` | Standard-Theme (Umschalter 🌓 in der Topbar) |
| `user` | `{name, role, avatar}` | — | Profil in Sidebar und Topbar |
| `notifications` | Array | — | `{text, tone, time, action}` — Glocke 🔔 |
| `home` | String | erster Bereich | ID des Startbereichs |
| `search` | bool | `true` | Suche / Befehlspalette (Strg/⌘ + K) |
| `sidebarCollapsed` | bool | `false` | Menü auf Icons einklappen |
| `footer` | String | — | Fußzeile (Mini-Markdown) |
| `logo` | String | — | Logo (wie Parameter `logo`) |

### `layout`

| Schlüssel | Beschreibung |
|---|---|
| `sidebarWidth` | Menübreite in px (Standard 260) |
| `gap` | Abstand zwischen Blöcken in px (16) |
| `maxWidth` | maximale Inhaltsbreite in px (1680) |
| `radius` | Eckenradius der Karten in px (14) |
| `density` | `comfortable` \| `compact` |
| `background` | `glow` (Farbverlauf-Leuchten) \| `plain` |

---

## 3. Menü und Bereiche

`menu` ist ein Array von Einträgen. Ein Eintrag **ohne** `children` ist eine Seite; ein Eintrag **mit** `children` eine aufklappbare Gruppe (beliebig tief verschachtelt).

```json
"menu": [
  { "section": "Betrieb" },
  { "id": "dashboard", "title": "Übersicht", "icon": "📊", "subtitle": "KPIs in Echtzeit",
    "actions": [ { "label": "Neuer Auftrag", "style": "primary", "action": "navigate:orders" } ],
    "widgets": [ ... ] },
  { "id": "wms", "title": "Lager (WMS)", "icon": "🏭", "open": true, "children": [
    { "id": "stock", "title": "Bestände", "widgets": [ ... ] },
    { "id": "zones", "title": "Zonen", "page": "zones" }
  ] }
]
```

| Schlüssel | Beschreibung |
|---|---|
| `id` | eindeutige ID (für `navigate:id`, Demo, `?page=`). Fehlt sie, wird sie aus dem Titel gebildet |
| `title` | Bezeichnung |
| `icon` | Emoji (empfohlen) oder Name: `dashboard, orders, users, truck, warehouse, money, invoice, bolt, plug, log, lock, chat, ai, calendar, mail, tasks, cart, report, map, database, crm, marketing, settings…` |
| `badge`, `badgeTone` | Badge rechts (`12`, `neu`) und seine Farbe |
| `section` | nur `{ "section": "Überschrift" }` — Gruppentrenner |
| `children` | untergeordnete Einträge |
| `open` | Gruppe beim Laden aufgeklappt |
| `subtitle` | Untertitel der Seite (Mini-Markdown) |
| `actions` | Buttons im Seitenkopf (siehe „Buttons“) |
| `widgets` | Inhalt der Seite |
| `page` | Verweis auf ein Objekt in `map.pages` (statt `widgets` direkt im Menü) |
| `header` | `false` — Seitenkopf ausblenden |

`pages` ist ein Wörterbuch `{ "id": { "title", "subtitle", "actions", "widgets" } }`. Seiten, auf die das Menü nicht verweist, werden **versteckt** — erreichbar nur per Aktion `navigate:id` (praktisch für Kundendetails, Auftragsdetails usw.).

---

## 4. Widgets: gemeinsame Eigenschaften und Größen

Jedes Element in `widgets` ist ein Objekt mit `type`. Das Raster hat **12 Spalten**.

| Schlüssel | Beschreibung |
|---|---|
| `type` | Widget-Typ (siehe unten) |
| `id` | eindeutige ID (nötig für `addTo`, Demo, `run:`, Suche) |
| `title`, `subtitle`, `icon` | Kartenkopf |
| `w` | Breite auf dem Desktop ≥ 1200 px, 1–12 |
| `md` | Breite auf dem Tablet 768–1199 px (Standard: `w ≤ 6 → 6`, sonst 12) |
| `sm` | Breite auf dem Smartphone < 768 px (Standard 12; bei `stat`/`gauge` 6 — zwei pro Zeile) |
| `h` | Höhe des Inhalts (Zahl = px, oder `"300px"`, `"40vh"`) |
| `minH` | Mindesthöhe |
| `tone` | farbiger Streifen oben an der Karte |
| `tools` | zusätzliche Buttons im Kartenkopf |
| `footer` | String (Markdown) oder `{label, action}` — Link unten |
| `collapsible` | `false` — Buttons „einklappen/maximieren“ entfernen |

Standardbreite: `stat/gauge` 3, `list/status/progress/image/chart pie|donut` 4, `chart/form/timeline/logs/matrix/heatmap/funnel/text/accordion` 6, `routes` 8, alle übrigen 12.

**Farben (`tone`, `color`)**: `primary, accent, success, warning, danger, info, muted` (+ Synonyme `green, red, orange, blue, purple, cyan, gray`), `c1…c8` (Diagrammpalette) oder `#hex` / `rgb()` / `hsl()`.

**Mini-Markdown** in Texten: `**fett**`, `*kursiv*`, `` `Code` ``, `~~durchgestrichen~~`, `[Link](https://…)`, Zeilenumbruch `\n`.

---

## 5. Widget-Katalog

### `stat` — KPI-Kachel (Synonyme: `kpi`, `box`, `infobox`)
```json
{ "type": "stat", "label": "Aufträge heute", "value": 1284, "icon": "📦", "tone": "primary",
  "trend": "+12%", "trendText": "ggü. gestern", "spark": [8,10,9,13,12,15], "action": "navigate:orders" }
```
`value` — Zahl (animierter Zähler) oder String. `prefix`, `suffix`, `unit`, `currency` (`EUR`, `USD` … oder Symbol), `decimals`. `trend` — String (`+` grün, `-` rot) oder `{value, tone, text}`; `inverse: true` — Anstieg ist schlecht (Kosten). `progress` (0–100) + `progressText`. `variant`: `soft` (Standard) \| `solid` \| `outline`. `action` macht die Kachel klickbar.

### `chart` — Diagramme
```json
{ "type": "chart", "kind": "area", "title": "Versand", "labels": ["Mo","Di","Mi"],
  "series": [ {"name": "2026", "data": [5,8,6]}, {"name": "2025", "data": [4,6,7], "color": "warning"} ] }
```
`kind`: `line` \| `area` \| `bar` \| `pie` \| `donut`. Für Balken `stacked: true`. Für `pie/donut`: `data: [{label, value, color}]` oder `labels` + `values`; `center`, `centerLabel` — Text in der Donut-Mitte. Allgemein: `h` (Höhe, 260), `currency`, `unit`, `smooth: false`, `legend: false`. Tooltips beim Überfahren, Einblend-Animation.

### `table` — Tabelle / CRUD
```json
{ "type": "table", "id": "orders-table", "title": "Aufträge", "crud": true, "export": true, "pageSize": 8,
  "columns": [
    {"key": "id", "label": "Nr.", "auto": "id", "prefix": "#", "editable": false},
    {"key": "client", "label": "Kunde", "type": "avatar", "required": true},
    {"key": "status", "label": "Status", "type": "status", "filter": true, "options": ["Neu","Unterwegs","Geliefert"]},
    {"key": "amount", "label": "Betrag", "type": "money", "currency": "EUR"}
  ],
  "rows": [ ["#1001", "Bäckerei Schmidt", "Unterwegs", 1450] ] }
```
* `rows` — Arrays (in Spaltenreihenfolge) oder Objekte `{key: value}`.
* `crud: true` = Anlegen + Bearbeiten + Löschen (oder `{create, edit, delete}`). Löschen mit Bestätigung, Massenlöschung über Checkboxen.
* Spaltentypen: `text`, `number` (`unit`), `money` (`currency`), `percent`, `progress` (0–100), `status`/`badge` (Farbe nach Wortbedeutung oder `tones: {"Bezahlt": "success"}`), `avatar` (+ `sub`: Schlüssel der Unterzeile), `bool`, `tags`, `date` (`YYYY-MM-DD`), `rating` (0–5), `code`, `link` (+ `action`, `{key}`-Platzhalter möglich: `"navigate:client-{id}"`).
* Spalte: `filter: true` — Dropdown-Filter; `options` — Auswahlwerte im Formular; `default`; `required`; `editable: false`; `auto: "id"` — automatische Nummer; `sortable: false`; `width`.
* Tabelle: `search` (true), `export` (CSV), `selectable`, `addLabel`, `addTitle`, `emptyText`, `h` (max. Höhe mit Scrollen), `rowAction`: `"details"` (Standard — Datensatzkarte), `"edit"`, `false` oder beliebige Aktion, `rowActions` — Buttons in der Zeile.
* Auf dem Smartphone werden Zeilen zu Karten „Feld — Wert“.

Status-Farben werden automatisch erkannt (Deutsch, Englisch, Russisch), z. B. *Geliefert, Bezahlt, Aktiv* → grün; *Unterwegs, In Arbeit, Wartet* → gelb; *Storniert, Überfällig, Fehler* → rot; *Neu, Entwurf, Geplant* → blau. Andernfalls `tones` setzen.

### `form` — Formular
```json
{ "type": "form", "id": "quick-order", "title": "Schnellauftrag",
  "fields": [
    {"name": "client", "label": "Kunde", "required": true},
    {"name": "route", "label": "Route", "type": "select", "options": ["HH → B", "K → F"]},
    {"name": "weight", "label": "Gewicht", "type": "number", "w": 6},
    {"name": "eta", "label": "Datum", "type": "date", "w": 6},
    {"name": "express", "label": "Express", "type": "toggle"}
  ],
  "submit": { "label": "Anlegen", "addTo": "orders-table", "toast": "Auftrag angelegt", "log": "Auftrag für {client} angelegt" } }
```
Feldtypen: `text, email, tel, number, money, password, date, time, datetime, color, url, select, radio, textarea, checkbox, toggle, range (min,max,step,unit), file`. Feld: `label`, `placeholder`, `value`, `required`, `help`, `w` (Breite von 12), `options` (Strings oder `{value,label}`).
`submit`: `label`, `icon`, `addTo` (ID einer Tabelle — der Datensatz wird dort eingefügt; Feldnamen = `key` der Spalten), `toast`, `log`, `action`, `reset` (true), `delay` (ms „Senden“). `reset: "Leeren"` am Formular — Zurücksetzen-Button.

### `list` — Liste (`todo` / `checklist: true` — Checkliste)
`items: [{title, subtitle, icon | avatar, tone, badge, badgeTone, meta, action, done}]`

### `timeline` — Ereignis-Feed (`activity`)
`items: [{time, user, title, text, icon, tone}]`. `capture: true` — Systemereignisse (CRUD, Automatisierungen, Synchronisierungen) erscheinen automatisch oben im Feed.

### `logs` — Protokoll (`terminal`)
```json
{ "type": "logs", "title": "Live-Protokoll", "h": 360, "live": {"interval": 1500, "pool": [{"level": "info", "source": "api", "text": "GET /orders 200"}]},
  "lines": [{"time": "10:42", "level": "success", "source": "sap", "text": "Synchronisierung abgeschlossen"}] }
```
Level: `info, success, warn, error, debug`. Filter nach Level, Pause, Leeren. `live` — neue Zeilen per Timer (`true` = eingebauter Satz). `capture` (Standard `true`) — alle Aktionen im Prototyp werden hier protokolliert. `{n}` im Text → Zufallszahl.

### `process` — Prozesslinie (`pipeline`, `steps`)
`steps: [{title, desc, icon, status: done|active|pending|error, meta, action, fail}]`. `runnable: true` + `runLabel` — Button „▶ Starten“ spielt die Phasen animiert mit Logs durch (`fail: true` — Abbruch mit Fehler in diesem Schritt). `vertical: true`. `stepDelay` (ms). Auf dem Smartphone vertikal.

### `flow` — Workflow- / Integrationsschema (`workflow`, `graph`)
```json
{ "type": "flow", "title": "Shopify → SAP → DATEV",
  "nodes": [ {"id": "shop", "label": "Shopify", "sub": "Auftrag", "icon": "🛒"}, {"id": "sap", "label": "SAP", "icon": "🗄"}, {"id": "datev", "label": "DATEV", "icon": "🧾", "tone": "warning"} ],
  "edges": [ {"from": "shop", "to": "sap", "label": "Webhook"}, {"from": "sap", "to": "datev"} ] }
```
Knoten werden automatisch nach Ebenen angeordnet; manuell über `col`, `row`. Ohne `edges` werden die Knoten der Reihe nach verbunden. Über die Kanten laufen Datenpunkte (`animate: false` — aus). Button „▶ Simulation“ hebt die Knoten nacheinander hervor und schreibt in die Logs (`runnable: false` — entfernen). Knoten: `desc` (Hinweis beim Klick), `action`, `log`. `rowHeight`.

### `routes` — Routen- / Wegekarte (`map`)
```json
{ "type": "routes", "title": "Touren", "ratio": 0.5, "vehicleIcon": "🚚",
  "points": [ {"id": "hh", "label": "Hamburg", "x": 30, "y": 15, "type": "hub", "info": ["Auslastung 82 %"], "action": "navigate:zones"},
              {"id": "m", "label": "München", "x": 70, "y": 88} ],
  "routes": [ {"from": "hh", "to": "m", "vehicles": 2, "speed": 9, "tone": "warning", "label": "A7", "dashed": false} ],
  "regions": [ {"x": 30, "y": 30, "rx": 20, "ry": 25, "label": "Nord"} ],
  "legend": [ {"label": "Verspätung", "tone": "warning"} ] }
```
`x, y` — Koordinaten in Prozent (0–100). Punkte: `type: hub|warehouse` (größer), `tone`, `info` (Zeilen im Popup), `action` + `actionLabel`. Route: `vehicles` (Anzahl fahrender Fahrzeuge), `speed` (Sekunden pro Durchlauf), `loop: "forward"` (Standard: hin und zurück), `icon`, `curve`, `status`, `info`, `action`. Geeignet für Logistik, Lieferketten, Customer Journeys.

### `kanban` — Board (`board`)
`columns: [{title, tone, done, cards: [{title, text, tags, user, due, tone}]}]`. Drag & Drop mit der Maus, Klick auf eine Karte — Details und Buttons „→ Spalte“ (funktioniert auch auf dem Smartphone), Karten hinzufügen (`add: false` — aus).

### `matrix` — Rechtematrix (`access`, `permissions`)
`roles: ["Admin","Vertrieb"]`, `permissions: [{group: "Aufträge"}, {label: "Löschen", values: [1,0], desc: "…", locked: true}]`. Schalter werden protokolliert.

### `status` — Dienststatus (`health`)
`items: [{name, status: online|degraded|offline|maintenance, latency, uptime, icon, desc, action}]`. Pulsierende Indikatoren, „live“ Latenz, Verfügbarkeitsbalken (`history: false`, `live: false`).

### `integrations` — Integrationen
`items: [{name, category, desc, connected, lastSync, color, icon, metric}]`. Verbindungsschalter, Synchronisierungs-Button, Filter nach Kategorie.

### `automations` — Wenn-dann-Regeln (`rules`)
```json
{ "type": "automations", "id": "rules", "triggers": ["Neuer Auftrag", "Tourverspätung"],
  "items": [ {"name": "Rechnung nach Zustellung", "icon": "🧾", "trigger": "Status = Geliefert", "conditions": ["Betrag > 0"],
              "actions": ["Rechnung erstellen", "Export nach DATEV"], "enabled": true, "runs": 9310, "lastRun": "10:42", "success": 100} ] }
```
Ein/aus, Start ▶ mit hervorgehobener Kette, Ausführungszähler, „＋ Hinzufügen“ — Formular für eine neue Automatisierung (`triggers` — Auswahlwerte; `add: false` — ausblenden).

### Weitere

| Typ | Schlüssel |
|---|---|
| `progress` | `items: [{label, value, max, unit, tone, meta}]` |
| `gauge` | `value, min, max, unit, label, tone, thresholds: [{value, tone}]` |
| `funnel` | `stages: [{label, value, tone}]`, `currency`, `unit` — Trichter mit Conversion |
| `heatmap` | `rows, cols, data: [[…]]`, `unit`, `tone`, `showValues` |
| `buttons` | `buttons: [Buttons]`, `align: left|center|right|between` |
| `text` | `text` (Markdown); `bare: true` — ohne Karte |
| `callout` (`alert`) | `tone, title, text, icon, buttons, dismissible` |
| `heading` | `text, subtitle, icon` — Abschnittsüberschrift im Raster |
| `image` | `src` (https / data:image / relativer Pfad), `alt`, `h`, `fit` |
| `tabs` | `tabs: [{title, icon, badge, text, widgets: […]}]` — **verschachtelte** Widgets |
| `accordion` | `items: [{title, icon, open, text, widgets}]`, `single: true` |
| `group` (`row`) | `widgets: […]` — verschachteltes Raster; mit `title` — in einer Karte |

---

## 6. Buttons und Aktionen

Button: `{ "id": "add", "label": "Neuer Auftrag", "icon": "＋", "style": "primary", "size": "sm", "busy": 900, "action": "…" }`.
`style`: `primary, secondary, success, danger, warning, info, ghost, outline`; `size`: `sm, lg`; `busy` — N ms Spinner vor der Aktion.

Aktion (`action`) — String `"typ:wert"` oder Objekt. Auch ein Array von Aktionen ist möglich.

| Aktion | Als String | Als Objekt |
|---|---|---|
| Zu Bereich wechseln | `navigate:orders` | `{"type":"navigate","to":"orders"}` |
| Toast-Meldung | `toast:Gespeichert` | `{"type":"toast","text":"…","tone":"warning"}` |
| Modal-Fenster | `modal:Text` | `{"type":"modal","title":"…","text":"…","size":"lg","widgets":[…],"fields":[…]}` |
| Link öffnen | `url:https://…` | `{"type":"url","href":"…"}` |
| In den KI-Chat schreiben | `chat:Wochenbericht` | `{"type":"chat","text":"…"}` |
| Log-Eintrag | `log:Text` | `{"type":"log","level":"warn","text":"…"}` |
| Benachrichtigung in 🔔 | `notify:Text` | `{"type":"notify","text":"…"}` |
| Hinzufügen-Formular öffnen | `add:orders-table` | bei `table` / `automations` |
| Starten | `run:order-flow` | bei `process` / `flow` |
| Hervorheben | `highlight:w:orders-table` | — |
| Konfetti / Finale / Demo / Theme | `confetti`, `finale`, `demo`, `theme` | `{"type":"finale","title":"…"}` |

Zusätzlich bei jedem Aktionsobjekt: `toast`, `log`, `notify` (Nebeneffekte), `then` + `delay` (Folgeaktion).

---

## 7. KI-Chat (`map.chat`)

```json
"chat": {
  "title": "Nord AI", "subtitle": "kennt Ihre Aufträge und das Lager", "avatar": "✦", "position": "right", "open": false,
  "messages": [ {"from": "bot", "text": "Guten Tag! Wie kann ich helfen?"}, {"from": "user", "text": "Zeig die Verspätungen"} ],
  "suggestions": ["Bericht zu Verspätungen", "Wie sind die Bestände?"],
  "replies": [
    {"match": ["verspät", "delay"], "text": "Aktuell sind **2 Touren** verspätet…",
     "buttons": [{"label": "Karte öffnen", "action": "navigate:fleet"}],
     "widget": {"type": "chart", "kind": "bar", "h": 140, "labels": ["Mo","Di"], "series": [{"name": "Verspätungen", "data": [4,2]}]},
     "action": "navigate:fleet", "delay": 900}
  ],
  "fallback": "In der Produktivversion antworte ich auf Basis Ihrer Unternehmensdaten."
}
```
Schwebender Button mit Badge für ungelesene Nachrichten, „schreibt…“-Indikator, Streaming-Ausgabe. `replies` werden gewählt, wenn ein Wort aus `match` enthalten ist (ohne Groß-/Kleinschreibung). In eine Bot-Antwort lässt sich **jedes Widget** (`widget`), Buttons und eine Aktion einbetten. `enabled: false` — Chat ausblenden. `typingSpeed` — Schreibgeschwindigkeit.

---

## 8. Farbpalette (`colors`)

```json
{ "primary": "#6c7cff", "primary2": "#a26bff", "accent": "#22d3ee",
  "success": "#22c55e", "warning": "#f59e0b", "danger": "#ef4444", "info": "#38bdf8",
  "bg": "#0a0f1f", "bg2": "#0e1428", "surface": "#121a33", "surface2": "#1a2445", "text": "#e8ecff", "muted": "#8c97c2", "border": "rgba(148,163,255,.12)",
  "sidebar": "#0b1124", "sidebarText": "#a9b3dc", "sidebarActive": "rgba(108,124,255,.16)", "topbar": "rgba(10,15,31,.72)", "primaryContrast": "#fff", "logoBg": "#111",
  "chart": ["#6c7cff", "#22d3ee", "#a26bff", "#22c55e", "#f59e0b", "#f472b6", "#38bdf8", "#ef4444"],
  "radius": 14, "font": "Inter, sans-serif", "mode": "dark",
  "light": { "bg": "#f7f8fc" }, "dark": { "bg": "#05070f" } }
```
Jeder Schlüssel ist optional. `light` / `dark` — Überschreibungen für das jeweilige Theme. Farben: `#hex`, `rgb()/rgba()`, `hsl()`, CSS-Farbnamen.

---

## 9. Logo (`logo`)

* SVG-Markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">…</svg>` (wird als `<img>` ausgegeben — Skripte darin werden nicht ausgeführt);
* `data:image/png;base64,…`, `https://…/logo.svg`, relativer Pfad `logo.png`;
* `b64:` + base64 eines SVG;
* beliebiger kurzer Text / Emoji (`NC`, `🚚`) — Plakette mit Farbverlauf.

Ohne Logo — Initialen von `app.title`.

---

## 10. Demo-Modus (`demo`)

In der Topbar erscheint der Button **▶ Demo**. Der Cursor führt selbstständig durch das System, klickt, tippt in Felder, wählt Werte, hebt Blöcke hervor und schreibt in den Chat; unten laufen Untertitel für die Präsentation (Pause ⏸, Überspringen ⏭, Stopp ✕ / Esc). Am Ende folgt ein Finale mit Konfetti und Zählern (Bereiche, Widgets, Automatisierungen, Integrationen).

```json
{
  "autoplay": false, "speed": 1, "loop": false, "pause": 350,
  "steps": [
    {"do": "say", "say": "Das ist der Prototyp von NordCargo", "ms": 2500},
    {"do": "navigate", "to": "orders", "say": "Bereich Aufträge"},
    {"do": "type", "target": "w:quick-order field:client", "text": "Bäckerei Müller"},
    {"do": "select", "target": "w:quick-order field:route", "value": "Frankfurt → München"},
    {"do": "click", "target": "w:quick-order submit", "say": "Der Auftrag steht sofort in der Tabelle"},
    {"do": "highlight", "target": "w:orders-table", "ms": 1800},
    {"do": "click", "target": "w:rules run:0"},
    {"do": "chat", "text": "Bericht zu Verspätungen"},
    {"do": "finale", "title": "NordCargo OS", "text": "MVP-Start in 6–8 Wochen"}
  ],
  "finale": { "title": "…", "text": "…", "stats": [{"value": 12, "label": "Abteilungen"}], "cta": {"label": "Projekt besprechen", "action": "toast:Vielen Dank!"} }
}
```

Schritte (`do`): `say` (nur Untertitel, `ms`), `wait` (`ms`), `navigate` (`to`), `click`, `type` (`text`, `clear`, `enter`, `speed`), `select` (`value` — Wert oder Textteil), `check`, `hover`, `highlight` (`ms`), `scroll`, `chat` (`text`, `close`), `close` (Modal schließen), `toast`, `notify`, `log`, `run` (beliebige Aktion in `run`), `theme`, `finale`. Jeder Schritt: `say` — Untertitel, `ms` — Pause danach, `pause`. Ein String statt Objekt = Untertitel. `demo` kann auch als Array von Schritten übergeben werden. `finale: false` — ohne Finale.

### Ziele (`target`)

Ein Ziel ist eine Kette von Referenzen, getrennt durch Leerzeichen; jede wird innerhalb der vorherigen gesucht:

| Referenz | Findet |
|---|---|
| `menu:ID` | Menüeintrag |
| `w:ID` | Widget per `id` |
| `field:NAME` | Formularfeld (im Formular-Widget und im Modal) |
| `submit` | Absende-Button eines Formulars |
| `add`, `search`, `export`, `bulk-delete`, `filter:KEY` | Tabellenwerkzeuge |
| `row:N`, `edit`, `delete` | Tabellenzeile (ab 0 auf der aktuellen Seite) und ihre Buttons: `w:orders row:0 edit` |
| `run`, `run:N`, `toggle:N`, `sync:N`, `auto:N`, `integ:N` | Prozesse/Flow, Automatisierungen, Integrationen |
| `step:N`, `node:ID`, `item:N`, `svc:N`, `col:SLUG`, `perm:R:C`, `tab:SLUG`, `acc:N` | Prozessschritte, Flow-Knoten, Listeneinträge, Dienste, Kanban-Spalten, Matrixzellen, Tabs, Akkordeon |
| `btn:ID` | Button mit `id` |
| `modal`, `modal:save`, `modal:cancel`, `modal:close`, `modal:x`, `modal:edit` | Modal-Fenster und seine Buttons |
| `chat:toggle`, `chat:input`, `chat:send`, `chat:close`, `chat:sugg:N` | Chat |
| `demo`, `theme`, `notifications`, `search`, `menu-toggle` | Topbar |
| `text:Speichern` | sichtbares Element, das den Text enthält (das kürzeste) |
| `css:.selector` | beliebiger CSS-Selektor |

Wird ein Ziel nicht gefunden, zeigt die Demo „⚠ Ziel nicht gefunden“ und fährt fort.

---

## 11. Prompt für die KI (kopieren und mit Kontext ergänzen)

```
Du bist ein Generator für Admin-Panel-Prototypen für Moqup. Gib NUR gültiges JSON zurück (ohne Kommentare,
ohne Markdown) — ein Objekt mit den Schlüsseln "map", "colors", "demo", "logo" gemäß der Moqup-Dokumentation DOCS.md.

Kundenkontext:
- Unternehmen und Branche: <…>
- Abteilungen und Rollen: <…>
- Bestehende Systeme/Integrationen: <SAP, DATEV, Shopify, …>
- Prozesse und Schmerzpunkte: <…>
- Was automatisiert werden soll: <…>
- Sprache der Oberfläche: de | en | ru

Anforderungen:
1. 6–10 Bereiche in "menu" mit Gruppen ("section", "children"), je Bereich 3–8 Widgets.
2. Unbedingt zeigen: KPIs (stat + chart), CRUD-Tabelle mit Formular (form.submit.addTo = ID der Tabelle),
   Automatisierungen (automations + flow), Integrationen (integrations + status), Logs (logs live + timeline capture),
   Berechtigungen (matrix + Benutzertabelle), Prozess (process runnable), für Logistik — routes, für Aufgaben — kanban.
3. Realistische Daten für Branche und Land des Kunden (Namen, Beträge in EUR, Datumsangaben YYYY-MM-DD).
4. Alle IDs eindeutig, in lateinischen Buchstaben; Breiten w ergeben je Zeile 12; sm/md nach Bedarf.
5. "chat": 4–6 replies zu den Kernszenarien des Kunden, suggestions, wenn möglich ein widget in der Antwort.
6. "demo": 12–20 Schritte, die CRUD, Automatisierung, Integration, Berechtigungen und Chat zeigen; am Ende ein finale
   mit dem Nutzen für den Kunden. Ziele: menu:ID, w:ID field:NAME, w:ID submit, w:ID run:0, w:ID sync:0, perm:R:C, chat.
7. "colors" — passend zur Kundenmarke; "logo" — einfaches SVG 64×64 oder 2–3 Buchstaben.
```

Das erhaltene JSON in den **„Link-Generator“** einfügen (Felder `map`, `colors`, `demo`, `logo`) → „Link (komprimiert z:)“.

---

## 12. Dateien

| Datei | Zweck |
|---|---|
| `dashboard.html` | Seite + alle Styles (CSS-Variablen — für ein neues Design `:root` anpassen) |
| `helper.js` | Engine: Parameter lesen/dekodieren, Prüfung, Rendering, Widgets, Chat, Demo |
| `examples.js` | fertige Beispiele (Logistik/WMS, CRM/Vertrieb) — Referenzstruktur |
| `DOCS.md` | diese Dokumentation (wird auf der Seite ohne `map` angezeigt, wenn über http geöffnet) |

Keine Abhängigkeiten, kein Build: lokal öffnen (`file://`) oder auf beliebigem statischem Hosting ablegen (GitHub Pages usw.). Die Theme-Wahl (🌓) wird im Browser gespeichert. Alle Daten sind Demodaten und existieren nur im Speicher des Tabs.
