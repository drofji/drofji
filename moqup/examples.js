/*!
 * Moqup — fertige Beispielkonfigurationen. Werden auf der Dokumentationsseite angezeigt (Tab „Beispiele“).
 * Jedes Beispiel = { title, description, icon, map, colors?, demo?, logo? } — dieselben Parameter wie im Link.
 * Als Vorlage für die KI verwenden: die Struktur von map ist hier „Referenz“.
 */
window.MOQUP_EXAMPLES = {

  /* ======================= 1. Logistik + Lager (WWS/WMS) ======================= */
  logistics: {
    title: 'NordCargo — Logistik, Lager (WMS), Automatisierungen',
    description: 'Auftrags-CRUD, Routenkarte mit Fahrzeugen, Lager, Automatisierungs-Workflows, Integrationen, Logs, Berechtigungen, KI-Chat und Demo mit Finale.',
    icon: '🚚',
    logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#6c7cff"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><path d="M14 40V22h20v18M34 28h9l7 7v5H34" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><circle cx="22" cy="43" r="4.5" fill="#fff"/><circle cx="43" cy="43" r="4.5" fill="#fff"/></svg>',
    colors: { primary: '#6c7cff', accent: '#22d3ee' },
    map: {
      app: {
        title: 'NordCargo', subtitle: 'Logistics OS', lang: 'de',
        user: { name: 'Anna Keller', role: 'Leitung Operations' },
        notifications: [
          { text: '**Verspätung** Tour HH → MUC um 40 Min.', tone: 'warning', time: 'vor 5 Min.', action: 'navigate:fleet' },
          { text: 'DATEV: Rechnungsexport für November bereit', tone: 'success', time: 'vor 1 Std.', action: 'navigate:finance' },
        ],
        footer: 'NordCargo Logistics OS · Prototyp · Demodaten',
      },
      menu: [
        { section: 'Betrieb' },
        { id: 'dashboard', title: 'Übersicht', icon: '📊', subtitle: 'Kennzahlen in Echtzeit',
          actions: [{ label: 'Bericht', icon: '📑', style: 'secondary', action: 'toast:Bericht erstellt und per E-Mail versendet', busy: 900 }, { label: 'Neuer Auftrag', icon: '＋', style: 'primary', action: 'navigate:orders', id: 'new-order' }],
          widgets: [
            { type: 'stat', label: 'Aufträge heute', value: 1284, icon: '📦', trend: '+12%', trendText: 'ggü. gestern', spark: [8, 10, 9, 13, 12, 15, 14, 18], tone: 'primary', action: 'navigate:orders' },
            { type: 'stat', label: 'Unterwegs', value: 342, icon: '🚚', trend: '+4%', spark: [5, 6, 6, 7, 9, 8, 9, 10], tone: 'accent', action: 'navigate:fleet' },
            { type: 'stat', label: 'Pünktlich zugestellt', value: 97.4, suffix: '%', icon: '⏱', progress: 97.4, progressText: 'Ziel 96 %', tone: 'success' },
            { type: 'stat', label: 'Umsatz (Monat)', value: 284500, currency: 'EUR', icon: '💶', trend: '+8,1%', variant: 'solid', tone: 'primary', action: 'navigate:finance' },
            { type: 'chart', kind: 'area', title: 'Versand der letzten 14 Tage', subtitle: 'Paletten / Tag', w: 8, labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
              series: [{ name: 'Versendet', data: [320, 340, 310, 390, 420, 380, 300, 450, 470, 440, 500, 520, 490, 560] }, { name: 'Retouren', data: [12, 18, 10, 22, 15, 17, 9, 20, 14, 19, 16, 12, 18, 15], color: 'warning' }] },
            { type: 'chart', kind: 'donut', title: 'Auftragskanäle', w: 4, centerLabel: 'Aufträge', data: [{ label: 'Shopify', value: 540 }, { label: 'EDI / SAP', value: 380 }, { label: 'API', value: 220 }, { label: 'Manuell', value: 144 }] },
            { type: 'routes', id: 'map-main', title: 'Aktuelle Routen', subtitle: 'Punkt oder Fahrzeug anklicken', w: 8,
              regions: [{ x: 30, y: 30, rx: 22, ry: 26, label: 'Nord' }, { x: 70, y: 70, rx: 24, ry: 24, label: 'Süd' }],
              points: [
                { id: 'hh', label: 'Hamburg Hub', x: 34, y: 16, type: 'hub', info: ['Auslastung: **82 %**', 'Freie Rampen: 3 / 12'], action: 'navigate:zones', actionLabel: 'Lager →' },
                { id: 'b', label: 'Berlin', x: 72, y: 30, info: ['12 Fahrzeuge unterwegs'] },
                { id: 'k', label: 'Köln', x: 14, y: 52, info: ['ETA: 14:20'] },
                { id: 'f', label: 'Frankfurt', x: 34, y: 64, type: 'warehouse', info: ['Lager FRA-2', 'Bestand: 4.210 Paletten'] },
                { id: 'm', label: 'München', x: 66, y: 86, info: ['⚠ Verspätung 40 Min.'], tone: 'warning' },
              ],
              routes: [
                { from: 'hh', to: 'b', vehicles: 2, speed: 9, label: 'A24' },
                { from: 'hh', to: 'k', vehicles: 1, speed: 11 },
                { from: 'k', to: 'f', vehicles: 1, speed: 7 },
                { from: 'f', to: 'm', vehicles: 2, speed: 10, status: 'Verspätung', tone: 'warning', info: 'Stau auf der A9' },
                { from: 'b', to: 'm', vehicles: 1, speed: 14, dashed: true, label: 'geplant' },
              ] },
            { type: 'status', title: 'Dienste', w: 4, items: [
              { name: 'API Gateway', status: 'online', latency: 84, uptime: 99.98, icon: '🧩' },
              { name: 'SAP S/4HANA', status: 'online', latency: 210, uptime: 99.9, icon: '🗄' },
              { name: 'DHL Tracking', status: 'degraded', latency: 1240, uptime: 98.7, icon: '📡' },
              { name: 'Telematik', status: 'online', latency: 120, uptime: 99.95, icon: '🛰' }] },
            { type: 'process', id: 'order-flow', title: 'Lebenszyklus eines Auftrags', subtitle: '„Auftrag durchlaufen“ klicken, um alle Phasen abzuspielen', runnable: true, runLabel: 'Auftrag durchlaufen', w: 12, steps: [
              { title: 'Auftrag erhalten', desc: 'Shopify / EDI', status: 'done', icon: '📥' },
              { title: 'Prüfung', desc: 'Adresse, Gewicht, Zahlung', status: 'done', icon: '🔍' },
              { title: 'Kommissionierung', desc: 'Lager FRA-2', status: 'active', icon: '📦', meta: '12 Min.' },
              { title: 'Verladung', desc: 'Rampe 4', icon: '🚚' },
              { title: 'Unterwegs', desc: 'Telematik', icon: '🛰' },
              { title: 'Zugestellt', desc: 'E-Signatur', icon: '✅' }] },
            { type: 'timeline', title: 'Letzte Ereignisse', w: 6, capture: true, items: [
              { time: '10:42', title: 'Auftrag #48211 zugestellt', text: 'Bäckerei Schmidt GmbH, Unterschrift erhalten', tone: 'success', icon: '✓' },
              { time: '10:31', title: 'Verspätung auf der A9', text: 'ETA München +40 Min., Kunde automatisch benachrichtigt', tone: 'warning', icon: '!' },
              { time: '10:05', title: 'SAP-Synchronisierung', text: '1.284 Positionen aktualisiert', tone: 'info', icon: '⟳' }] },
            { type: 'list', title: 'Erfordert Aufmerksamkeit', w: 6, items: [
              { title: 'Auftrag #48177 — kein Rampen-Slot', subtitle: 'Hamburg Hub · 18:00', icon: '⚠', tone: 'warning', badge: 'hoch', badgeTone: 'danger', action: 'navigate:orders' },
              { title: 'LKW B-NC 2041 — Wartung in 2 Tagen', subtitle: 'Laufleistung 148.200 km', icon: '🔧', tone: 'info', meta: '2 Tage', action: 'navigate:fleet' },
              { title: 'DHL-API antwortet langsam', subtitle: 'Mittlere Latenz 1,2 s', icon: '📡', tone: 'danger', badge: 'eingeschränkt', action: 'navigate:integrations' },
              { title: 'SKU-1182 unter Mindestbestand', subtitle: 'Stretchfolie 23 µm', icon: '📉', tone: 'warning', meta: '42 Stk.', action: 'navigate:stock' }] },
          ] },
        { id: 'orders', title: 'Aufträge', icon: '📦', badge: 12, subtitle: 'Aufträge anlegen, bearbeiten und löschen (CRUD)',
          widgets: [
            { type: 'form', id: 'quick-order', title: 'Schnellauftrag', icon: '⚡', w: 4, md: 12,
              fields: [
                { name: 'client', label: 'Kunde', required: true, placeholder: 'Firma' },
                { name: 'route', label: 'Route', type: 'select', options: ['Hamburg → Berlin', 'Köln → Frankfurt', 'Frankfurt → München', 'Hamburg → Köln'] },
                { name: 'weight', label: 'Gewicht, kg', type: 'number', w: 6, value: 800 },
                { name: 'eta', label: 'Liefertermin', type: 'date', w: 6, value: '2026-12-02' },
                { name: 'express', label: 'Expresszustellung', type: 'toggle' }],
              submit: { label: 'Auftrag anlegen', icon: '＋', addTo: 'orders-table', delay: 800 } },
            { type: 'table', id: 'orders-table', title: 'Aufträge', w: 8, md: 12, crud: true, export: true, pageSize: 7, currency: 'EUR', addLabel: 'Neuer Auftrag',
              columns: [
                { key: 'id', label: 'Nr.', auto: 'id', prefix: '#4', editable: false, width: 80 },
                { key: 'client', label: 'Kunde', type: 'avatar', required: true },
                { key: 'route', label: 'Route', filter: true, options: ['Hamburg → Berlin', 'Köln → Frankfurt', 'Frankfurt → München', 'Hamburg → Köln'] },
                { key: 'weight', label: 'Gewicht', type: 'number', unit: 'kg' },
                { key: 'status', label: 'Status', type: 'status', filter: true, default: 'Neu', options: ['Neu', 'Kommissionierung', 'Unterwegs', 'Geliefert', 'Verspätet', 'Storniert'],
                  tones: { 'Kommissionierung': 'warning', 'Verspätet': 'warning' } },
                { key: 'eta', label: 'Lieferung', type: 'date' },
                { key: 'amount', label: 'Betrag', type: 'money', default: 690 }],
              rows: [
                ['#48211', 'Bäckerei Schmidt GmbH', 'Hamburg → Berlin', 1200, 'Geliefert', '2026-11-27', 1450],
                ['#48207', 'Autohaus Weber', 'Köln → Frankfurt', 3400, 'Unterwegs', '2026-11-28', 3890],
                ['#48199', 'Mode Lindner KG', 'Frankfurt → München', 640, 'Verspätet', '2026-11-27', 720],
                ['#48190', 'BioMarkt Nord', 'Hamburg → Köln', 2100, 'Kommissionierung', '2026-11-29', 2310],
                ['#48185', 'TechParts AG', 'Hamburg → Berlin', 900, 'Neu', '2026-11-30', 980],
                ['#48177', 'Möbel Krause', 'Köln → Frankfurt', 5200, 'Kommissionierung', '2026-11-29', 5600],
                ['#48160', 'Pharma Süd', 'Frankfurt → München', 300, 'Geliefert', '2026-11-26', 1290],
                ['#48151', 'Getränke Huber', 'Hamburg → Köln', 4100, 'Storniert', '2026-11-25', 0]] },
          ] },
        { id: 'fleet', title: 'Routen & Fuhrpark', icon: '🚚',
          widgets: [
            { type: 'routes', title: 'Tourenkarte', w: 12, ratio: 0.42, vehicleIcon: '🚛',
              points: [{ id: 'hh', label: 'Hamburg', x: 30, y: 15, type: 'hub' }, { id: 'b', label: 'Berlin', x: 75, y: 30 }, { id: 'k', label: 'Köln', x: 10, y: 55 }, { id: 'f', label: 'Frankfurt', x: 38, y: 70, type: 'warehouse' }, { id: 'm', label: 'München', x: 70, y: 88 }, { id: 'l', label: 'Leipzig', x: 62, y: 50 }],
              routes: [{ from: 'hh', to: 'b', vehicles: 3, speed: 12 }, { from: 'b', to: 'l', vehicles: 1, speed: 6 }, { from: 'l', to: 'm', vehicles: 2, speed: 9 }, { from: 'k', to: 'f', vehicles: 2, speed: 8 }, { from: 'f', to: 'm', vehicles: 1, speed: 9, tone: 'warning' }, { from: 'hh', to: 'k', vehicles: 2, speed: 13 }],
              legend: [{ label: 'Planmäßig', tone: 'primary' }, { label: 'Verspätung', tone: 'warning' }] },
            { type: 'table', title: 'Fuhrpark', w: 8, crud: true, columns: [
              { key: 'plate', label: 'Kennzeichen' }, { key: 'driver', label: 'Fahrer', type: 'avatar' }, { key: 'type', label: 'Typ', filter: true },
              { key: 'load', label: 'Auslastung', type: 'progress' }, { key: 'status', label: 'Status', type: 'status', tones: { 'Wartung bald': 'warning', 'Frei': 'info' } }],
              rows: [['HH-NC 1021', 'Jonas Becker', 'Sattelzug 40 t', 92, 'Unterwegs'], ['B-NC 2041', 'Olga Petrova', 'Sattelzug 40 t', 64, 'Wartung bald'], ['K-NC 3302', 'Mehmet Yilmaz', 'Transporter 3,5 t', 40, 'Aktiv'], ['F-NC 4410', 'Laura Fischer', 'Kühlfahrzeug', 78, 'Unterwegs'], ['M-NC 5120', 'Piotr Nowak', 'Sattelzug 40 t', 0, 'Frei']] },
            { type: 'gauge', title: 'Fuhrpark-Auslastung', w: 4, value: 78, unit: '%', label: '23 von 30 Fahrzeugen im Einsatz', thresholds: [{ value: 0, tone: 'success' }, { value: 70, tone: 'warning' }, { value: 90, tone: 'danger' }] },
          ] },
        { id: 'wms', title: 'Lager (WMS)', icon: '🏭', open: true, children: [
          { id: 'stock', title: 'Bestände', icon: '📋', subtitle: 'Lagerverwaltung · Online-Bestände je SKU',
            widgets: [
              { type: 'callout', tone: 'warning', title: '3 Artikel unter Mindestbestand', text: 'Die Automatisierung „Nachbestellung“ erstellt eine Lieferantenanfrage, wenn der Bestand 2 Stunden unter dem Minimum bleibt.', buttons: [{ label: 'Automatisierung öffnen', action: 'navigate:automations' }] },
              { type: 'table', title: 'Bestände', crud: true, export: true, columns: [
                { key: 'sku', label: 'SKU' }, { key: 'name', label: 'Artikel' }, { key: 'zone', label: 'Zone', filter: true },
                { key: 'qty', label: 'Menge', type: 'number' }, { key: 'fill', label: 'Fachbelegung', type: 'progress' }, { key: 'state', label: 'Status', type: 'badge', tones: { 'Normal': 'success', 'Niedrig': 'warning', 'Leer': 'danger' } }],
                rows: [['SKU-1001', 'Europalette 1200×800', 'A', 820, 70, 'Normal'], ['SKU-1182', 'Stretchfolie 23 µm', 'B', 42, 15, 'Niedrig'], ['SKU-2040', 'Wellpappkarton 600×400', 'B', 3100, 88, 'Normal'], ['SKU-3301', 'Thermoetikett 100×150', 'C', 0, 0, 'Leer'], ['SKU-4120', 'Klebeband 48 mm', 'C', 96, 22, 'Niedrig'], ['SKU-5005', 'Kantenschutz', 'A', 1400, 64, 'Normal']] },
            ] },
          { id: 'zones', title: 'Zonen & Auslastung', icon: '🗺',
            widgets: [
              { type: 'heatmap', title: 'Zonenauslastung nach Uhrzeit', w: 7, unit: '%', rows: ['Zone A', 'Zone B', 'Zone C', 'Rampen', 'Verpackung'], cols: ['6', '8', '10', '12', '14', '16', '18', '20'],
                data: [[20, 45, 80, 90, 75, 60, 40, 20], [30, 50, 70, 95, 85, 70, 50, 25], [10, 30, 50, 60, 55, 50, 35, 15], [40, 80, 95, 70, 60, 85, 90, 40], [15, 40, 65, 80, 90, 85, 60, 30]] },
              { type: 'progress', title: 'Lagerkapazität', w: 5, items: [{ label: 'Hamburg Hub', value: 82 }, { label: 'Frankfurt FRA-2', value: 64 }, { label: 'Leipzig', value: 93 }, { label: 'München (Cross-Dock)', value: 35 }] },
              { type: 'chart', kind: 'bar', title: 'Kommissionierung nach Uhrzeit', w: 12, stacked: true, labels: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'],
                series: [{ name: 'Schicht A', data: [40, 80, 120, 140, 150, 130, 90, 0, 0, 0, 0, 0] }, { name: 'Schicht B', data: [0, 0, 0, 0, 0, 40, 80, 130, 150, 160, 120, 70] }] },
            ] },
        ] },
        { section: 'Automatisierung' },
        { id: 'automations', title: 'Automatisierungen', icon: '⚡', badge: 'neu', badgeTone: 'success', subtitle: 'Wenn-dann-Regeln und Workflows ohne Code',
          widgets: [
            { type: 'automations', id: 'rules', title: 'Regeln', triggers: ['Neuer Auftrag', 'Status geändert', 'Bestand unter Minimum', 'Tourverspätung', 'Täglich 07:00'], items: [
              { name: 'Kunde über Verspätung informieren', icon: '📣', trigger: 'Tourverspätung > 20 Min.', actions: ['ETA neu berechnen', 'SMS + E-Mail an Kunden', 'Aufgabe für Disposition'], runs: 1284, lastRun: '10:31', success: 99.6 },
              { name: 'Verpackung nachbestellen', icon: '📦', trigger: 'Bestand unter Minimum', conditions: ['2 Stunden in Folge'], actions: ['Anfrage an Lieferanten', 'Freigabe in Slack'], runs: 86, lastRun: 'gestern' },
              { name: 'Rechnung nach Zustellung', icon: '🧾', trigger: 'Status = Geliefert', actions: ['Rechnung erstellen', 'Export nach DATEV', 'E-Mail an Kunden'], runs: 9310, lastRun: '10:42', success: 100 },
              { name: 'Morgenbericht für die Geschäftsführung', icon: '📊', trigger: 'Täglich 07:00', actions: ['KPIs sammeln', 'KI-Zusammenfassung', 'Per Telegram senden'], runs: 312, lastRun: 'heute 07:00', enabled: false }] },
            { type: 'flow', id: 'shopify-flow', title: 'Workflow: Shopify-Auftrag → Zustellung → Rechnung', runLabel: 'Simulation', nodes: [
              { id: 'shop', label: 'Shopify', sub: 'neuer Auftrag', icon: '🛒', tone: 'success' },
              { id: 'check', label: 'Prüfung', sub: 'Adresse · Zahlung', icon: '🔍' },
              { id: 'sap', label: 'SAP', sub: 'Lieferung anlegen', icon: '🗄', col: 2, row: 0 },
              { id: 'wms', label: 'WMS', sub: 'Lagerreservierung', icon: '🏭', col: 2, row: 1 },
              { id: 'tms', label: 'TMS', sub: 'Route und Tour', icon: '🚚', tone: 'accent' },
              { id: 'notify', label: 'Kunde', sub: 'Sendungsnummer', icon: '📣', col: 4, row: 0 },
              { id: 'invoice', label: 'DATEV', sub: 'Rechnung', icon: '🧾', col: 4, row: 1, tone: 'warning' }],
              edges: [{ from: 'shop', to: 'check' }, { from: 'check', to: 'sap' }, { from: 'check', to: 'wms' }, { from: 'sap', to: 'tms' }, { from: 'wms', to: 'tms' }, { from: 'tms', to: 'notify', label: 'SMS' }, { from: 'tms', to: 'invoice' }] },
          ] },
        { id: 'integrations', title: 'Integrationen', icon: '🔌',
          widgets: [
            { type: 'integrations', id: 'integ', title: 'Angebundene Systeme', items: [
              { name: 'SAP S/4HANA', category: 'ERP', desc: 'Aufträge, Lieferungen, Materialien', connected: true, lastSync: 'vor 2 Min.', color: '#0a6ed1', metric: '12.840 Datensätze / Tag' },
              { name: 'DATEV', category: 'Buchhaltung', desc: 'Export von Rechnungen und Buchungen', connected: true, lastSync: 'vor 1 Std.', color: '#2b8a3e' },
              { name: 'Shopify', category: 'E-Commerce', desc: 'Aufträge der Onlineshops', connected: true, lastSync: 'gerade eben', color: '#5e8e3e', icon: '🛒' },
              { name: 'DHL / DPD API', category: 'Versanddienstleister', desc: 'Tracking und Etiketten', connected: true, lastSync: 'vor 5 Min.', color: '#d40511' },
              { name: 'Slack', category: 'Kommunikation', desc: 'Freigaben und Alarme', connected: true, color: '#611f69' },
              { name: 'Telegram', category: 'Kommunikation', desc: 'Berichte an die Geschäftsführung', connected: false, color: '#229ed9', icon: '✈' },
              { name: 'Google Sheets', category: 'Berichte', desc: 'Exporte für Partner', connected: false, color: '#188038' },
              { name: 'OpenAI / Claude', category: 'KI', desc: 'Zusammenfassungen, E-Mail-Klassifizierung, Chat-Assistent', connected: true, color: '#7c3aed', icon: '✦' }] },
            { type: 'status', title: 'Zustand der Integrationen', w: 5, items: [{ name: 'SAP RFC', status: 'online', latency: 180, uptime: 99.9 }, { name: 'DHL API', status: 'degraded', latency: 1240, uptime: 98.7 }, { name: 'Shopify Webhooks', status: 'online', latency: 60, uptime: 100 }, { name: 'DATEV Connect', status: 'maintenance', uptime: 99.5 }] },
            { type: 'logs', title: 'Synchronisierungsprotokoll', w: 7, h: 300, live: { interval: 2600 }, lines: [
              { level: 'success', source: 'sap', text: 'Lieferungen: 128 neu, 12 aktualisiert' }, { level: 'warn', source: 'dhl', text: 'Antwort 1.240 ms (Schwelle 800 ms)' }, { level: 'info', source: 'shopify', text: 'Webhook orders/create ×14' }] },
          ] },
        { id: 'logs', title: 'Logs & Ereignisse', icon: '📜',
          widgets: [
            { type: 'logs', title: 'Live-Protokoll', w: 8, h: 460, live: { interval: 1500, pool: [
              { level: 'info', source: 'api', text: 'POST /v1/orders 201 · 96 ms' }, { level: 'success', source: 'tms', text: 'Tour HH-NC 1021: Stopp 3/7 erreicht' },
              { level: 'warn', source: 'telematics', text: 'Standzeit überschritten: K-NC 3302' }, { level: 'info', source: 'wms', text: 'Fach B-12-04: Wareneingang 24 Paletten' },
              { level: 'error', source: 'dhl', text: 'Label-API-Timeout — neuer Versuch in 30 s' }, { level: 'success', source: 'automation', text: '„Rechnung nach Zustellung“ ausgeführt' },
              { level: 'debug', source: 'worker', text: 'queue=orders depth=3' }] } },
            { type: 'timeline', title: 'Audit-Trail', w: 4, capture: true, items: [
              { time: '10:12', user: 'Anna K.', title: 'Rechte der Rolle „Disponent“ geändert', tone: 'info' },
              { time: '09:48', user: 'System', title: 'Backup abgeschlossen', tone: 'success' },
              { time: '09:30', user: 'Jonas B.', title: 'Anmeldung von neuem Gerät', tone: 'warning' }] },
          ] },
        { section: 'Verwaltung' },
        { id: 'tasks', title: 'Aufgaben', icon: '🗂', subtitle: 'Karten zwischen den Spalten verschieben',
          widgets: [
            { type: 'kanban', title: 'Dispo-Board', columns: [
              { title: 'Eingang', tone: 'info', cards: [{ title: 'Slot an Rampe 4 abstimmen', tags: ['HH'], user: 'Jonas Becker', due: '2026-11-28' }, { title: 'Reklamation Möbel Krause prüfen', tags: ['Reklamation'], user: 'Olga Petrova' }] },
              { title: 'In Arbeit', tone: 'warning', cards: [{ title: 'Tour auf der A9 umplanen', tags: ['dringend'], user: 'Anna Keller', tone: 'danger' }, { title: 'Onboarding Spediteur TransLog', user: 'Laura Fischer' }] },
              { title: 'Prüfung', tone: 'primary', cards: [{ title: 'Tarif Q1 für BioMarkt', tags: ['Vertrieb'] }] },
              { title: 'Erledigt', tone: 'success', done: true, cards: [{ title: 'Shopify-Integration', tags: ['IT'], user: 'Mehmet Yilmaz' }] }] },
          ] },
        { id: 'finance', title: 'Finanzen', icon: '💶',
          widgets: [
            { type: 'stat', label: 'Umsatz', value: 284500, currency: 'EUR', trend: '+8,1%', icon: '💶', w: 4 },
            { type: 'stat', label: 'Kosten', value: 191200, currency: 'EUR', trend: '+2,4%', inverse: true, icon: '📉', tone: 'warning', w: 4 },
            { type: 'stat', label: 'Marge', value: 32.8, suffix: '%', trend: '+1,9 Pp.', icon: '📈', tone: 'success', w: 4 },
            { type: 'chart', kind: 'bar', title: 'Umsatz und Kosten', w: 8, currency: 'EUR', labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov'], series: [{ name: 'Umsatz', data: [210000, 228000, 236000, 251000, 263000, 284500] }, { name: 'Kosten', data: [160000, 170000, 168000, 178000, 185000, 191200], color: 'warning' }] },
            { type: 'chart', kind: 'pie', title: 'Kostenstruktur', w: 4, data: [{ label: 'Kraftstoff', value: 38 }, { label: 'Personal', value: 34 }, { label: 'Miete', value: 14 }, { label: 'IT', value: 6 }, { label: 'Sonstiges', value: 8 }] },
            { type: 'tabs', title: 'Rechnungen', tabs: [
              { title: 'Offen', badge: 3, widgets: [{ type: 'table', search: false, currency: 'EUR', columns: [{ key: 'n', label: 'Rechnung' }, { key: 'c', label: 'Kunde' }, { key: 's', label: 'Betrag', type: 'money' }, { key: 'st', label: 'Status', type: 'status' }], rows: [['RE-2026-1182', 'Autohaus Weber', 3890, 'Wartet auf Zahlung'], ['RE-2026-1179', 'Mode Lindner KG', 720, 'Überfällig'], ['RE-2026-1175', 'TechParts AG', 980, 'Wartet auf Zahlung']] }] },
              { title: 'Bezahlt', widgets: [{ type: 'table', search: false, currency: 'EUR', columns: [{ key: 'n', label: 'Rechnung' }, { key: 'c', label: 'Kunde' }, { key: 's', label: 'Betrag', type: 'money' }, { key: 'st', label: 'Status', type: 'status' }], rows: [['RE-2026-1170', 'Bäckerei Schmidt GmbH', 1450, 'Bezahlt'], ['RE-2026-1168', 'Pharma Süd', 1290, 'Bezahlt']] }] },
              { title: 'DATEV-Export', text: 'Export für **November** bereit: 412 Buchungen. Nächster automatischer Export — 01.12. um 06:00.' }] },
          ] },
        { id: 'access', title: 'Berechtigungen', icon: '🔐', subtitle: 'Rollen, Rechte und Benutzer',
          widgets: [
            { type: 'matrix', title: 'Rechtematrix', w: 7, roles: ['Admin', 'Disponent', 'Lager', 'Buchhaltung', 'Kunde'], permissions: [
              { group: 'Aufträge' }, { label: 'Aufträge ansehen', values: [1, 1, 1, 1, 1] }, { label: 'Anlegen / bearbeiten', values: [1, 1, 0, 0, 0] }, { label: 'Löschen', values: [1, 0, 0, 0, 0], desc: 'mit Audit-Eintrag' },
              { group: 'Lager' }, { label: 'Bestände und Wareneingang', values: [1, 0, 1, 0, 0] },
              { group: 'Finanzen' }, { label: 'Rechnungen und Exporte', values: [1, 0, 0, 1, 0] }, { label: 'Systemeinstellungen', values: [1, 0, 0, 0, 0], locked: true }] },
            { type: 'table', title: 'Benutzer', w: 5, crud: true, search: false, pageSize: 6, columns: [{ key: 'name', label: 'Name', type: 'avatar', sub: 'mail' }, { key: 'role', label: 'Rolle', options: ['Admin', 'Disponent', 'Lager', 'Buchhaltung', 'Kunde'] }, { key: 'mfa', label: '2FA', type: 'bool' }, { key: 'mail', label: 'E-Mail', editable: true }],
              rows: [{ name: 'Anna Keller', role: 'Admin', mfa: true, mail: 'a.keller@nordcargo.example' }, { name: 'Jonas Becker', role: 'Disponent', mfa: true, mail: 'j.becker@nordcargo.example' }, { name: 'Olga Petrova', role: 'Lager', mfa: false, mail: 'o.petrova@nordcargo.example' }, { name: 'Laura Fischer', role: 'Buchhaltung', mfa: true, mail: 'l.fischer@nordcargo.example' }] },
          ] },
      ],
      chat: {
        title: 'Nord AI', subtitle: 'kennt Ihre Aufträge, Lager und Touren', avatar: '✦',
        messages: [{ from: 'bot', text: 'Guten Tag, Anna! Heute gibt es **1.284** Aufträge und 2 verspätete Touren. Wie kann ich helfen?' }],
        suggestions: ['Bericht zu Verspätungen', 'Wo ist Auftrag #48207?', 'Wie sind die Bestände?', 'Erstelle eine Automatisierung'],
        replies: [
          { match: ['verspät', 'verzög'], text: 'Aktuell sind **2 Touren** verspätet:\n• F-NC 4410 Frankfurt → München: +40 Min. (Stau auf der A9)\n• K-NC 3302 Köln: +15 Min.\nDie Kunden wurden bereits automatisch benachrichtigt.', widget: { type: 'chart', kind: 'bar', h: 140, labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr'], series: [{ name: 'Verspätungen', data: [4, 2, 5, 3, 2], color: 'warning' }] }, buttons: [{ label: 'Karte öffnen', action: 'navigate:fleet' }] },
          { match: ['48207', 'wo ist'], text: 'Auftrag **#48207** (Autohaus Weber) ist *unterwegs*, LKW HH-NC 1021, ETA morgen 11:30. Soll ich dem Kunden den Tracking-Link senden?', buttons: [{ label: 'Ja, senden', action: 'toast:Tracking-Link an den Kunden gesendet' }, { label: 'Zu den Aufträgen', action: 'navigate:orders' }] },
          { match: ['bestand', 'bestände', 'lager'], text: '3 Artikel liegen unter dem Mindestbestand: **SKU-1182** Stretchfolie (42 Stk.), **SKU-3301** Thermoetikett (0), **SKU-4120** Klebeband (96). Soll ich eine Lieferantenanfrage erstellen?', buttons: [{ label: 'Anfrage erstellen', action: { type: 'toast', text: 'Lieferantenanfrage erstellt', log: 'KI: Lieferantenanfrage für 3 Artikel erstellt' } }, { label: 'Bestände', action: 'navigate:stock' }] },
          { match: ['automatis', 'regel', 'workflow'], text: 'Vorschlag: **„Wenn der Kunde die Ware 24 Std. nicht abholt → Erinnerung + Aufgabe für den Vertrieb“**. Ich öffne den Automatisierungs-Editor.', action: { type: 'navigate', to: 'automations', then: { type: 'add', target: 'rules' }, delay: 700 } },
          { match: ['bericht', 'report', 'kpi'], text: 'Fertig. KPIs der Woche: Pünktlichkeit **97,4 %** (+0,6), Umsatz **+8,1 %**, durchschnittlicher Auftragswert **1.120 €**. Das PDF wurde per E-Mail versendet.' },
        ],
        fallback: 'Verstanden! In der Produktivversion antworte ich auf Basis der Daten aus SAP, WMS und TMS. Im Prototyp probieren Sie: „Bericht zu Verspätungen“, „Wo ist Auftrag #48207?“, „Wie sind die Bestände?“.',
      },
    },
    demo: {
      speed: 1,
      steps: [
        { do: 'say', say: '👋 Das ist der Prototyp von **NordCargo Logistics OS** — erstellt aus einer einzigen JSON-Datei in wenigen Minuten.', ms: 2600 },
        { do: 'highlight', target: 'w:map-main', say: 'Live-Karte: Touren, Fahrzeuge und Lager in Echtzeit.', ms: 2400 },
        { do: 'click', target: 'w:order-flow run', say: 'Prozesse lassen sich „durchspielen“ — jede Phase des Auftrags ist sichtbar.', ms: 4200 },
        { do: 'navigate', to: 'orders', say: 'Der Bereich Aufträge — vollständiges CRUD.' },
        { do: 'type', target: 'w:quick-order field:client', text: 'Bäckerei Müller GmbH', say: 'Wir legen einen Auftrag über das Schnellformular an…' },
        { do: 'select', target: 'w:quick-order field:route', value: 'Frankfurt → München' },
        { do: 'type', target: 'w:quick-order field:weight', text: '1450' },
        { do: 'click', target: 'w:quick-order field:express' },
        { do: 'click', target: 'w:quick-order submit', say: '…und er erscheint sofort in der Tabelle, in den Logs und in den Benachrichtigungen.', ms: 1800 },
        { do: 'highlight', target: 'w:orders-table', ms: 1800 },
        { do: 'navigate', to: 'automations', say: 'Automatisierungen ohne Code: Auslöser → Bedingungen → Aktionen.' },
        { do: 'click', target: 'w:rules run:0', say: 'Wir starten die Regel „Kunde über Verspätung informieren“.', ms: 2600 },
        { do: 'click', target: 'w:shopify-flow run', say: 'Und hier der durchgängige Workflow Shopify → SAP → WMS → TMS → DATEV.', ms: 5200 },
        { do: 'navigate', to: 'integrations', say: 'Integrationen mit ERP, Buchhaltung, Versanddienstleistern und KI.' },
        { do: 'click', target: 'w:integ sync:0', say: 'SAP-Synchronisierung mit einem Klick.', ms: 2200 },
        { do: 'navigate', to: 'access', say: 'Rollen und Berechtigungen — transparent und mit Audit-Trail.' },
        { do: 'click', target: 'perm:2:1', ms: 900 },
        { do: 'chat', text: 'Bericht zu Verspätungen', say: 'Und das Wichtigste — ein KI-Assistent, der die Unternehmensdaten kennt.', ms: 2600 },
        { do: 'finale', title: 'NordCargo Logistics OS', text: 'Aufträge, Lager, Touren, Automatisierungen und KI — **in einem System**. MVP-Start in **6–8 Wochen**.' },
      ],
      finale: { cta: { label: 'Projekt besprechen', style: 'primary', action: 'toast:Vielen Dank! Wir melden uns noch heute bei Ihnen.' } },
    },
  },

  /* ======================= 2. Vertrieb / CRM ======================= */
  crm: {
    title: 'VertriebsCockpit — CRM, Marketing, Buchhaltung',
    description: 'Pipeline-Kanban, Kontakte (CRUD), Marketing-Funnel, Rechnungen, KI-Chat und Demo.',
    icon: '🤝',
    logo: 'VC',
    colors: { primary: '#10b981', primary2: '#0ea5e9', accent: '#f59e0b', chart: ['#10b981', '#0ea5e9', '#f59e0b', '#a78bfa', '#f472b6', '#22d3ee', '#84cc16', '#ef4444'] },
    map: {
      app: { title: 'VertriebsCockpit', subtitle: 'CRM · Marketing · Finanzen', lang: 'de', user: { name: 'Max Hoffmann', role: 'Vertriebsleiter' },
        notifications: [{ text: 'Angebot **A-2291** wurde geöffnet', tone: 'info', time: 'vor 3 Min.' }] },
      menu: [
        { id: 'start', title: 'Übersicht', icon: '📊', widgets: [
          { type: 'stat', label: 'Pipeline-Wert', value: 1240000, currency: 'EUR', icon: '💼', trend: '+14%', spark: [5, 7, 6, 9, 10, 12] },
          { type: 'stat', label: 'Neue Leads', value: 318, icon: '🎯', trend: '+22%', tone: 'accent' },
          { type: 'stat', label: 'Abschlussquote', value: 27.5, suffix: '%', icon: '🏆', progress: 27.5, tone: 'success' },
          { type: 'stat', label: 'Offene Rechnungen', value: 48200, currency: 'EUR', icon: '🧾', trend: '-6%', inverse: true, tone: 'warning', action: 'navigate:rechnungen' },
          { type: 'funnel', title: 'Vertriebstrichter', w: 6, stages: [{ label: 'Leads', value: 1200 }, { label: 'Qualifiziert', value: 640 }, { label: 'Angebot', value: 310 }, { label: 'Verhandlung', value: 140 }, { label: 'Gewonnen', value: 86 }] },
          { type: 'chart', kind: 'line', title: 'Umsatz nach Kanal', w: 6, currency: 'EUR', labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov'], series: [{ name: 'Direkt', data: [42000, 48000, 51000, 56000, 61000] }, { name: 'Partner', data: [21000, 22000, 26000, 25000, 31000] }, { name: 'Online', data: [12000, 15000, 18000, 23000, 27000] }] },
        ] },
        { id: 'pipeline', title: 'Pipeline', icon: '🤝', badge: 24, widgets: [
          { type: 'kanban', title: 'Deals', columns: [
            { title: 'Neu', tone: 'info', cards: [{ title: 'Stadtwerke Kiel — Wartungsvertrag', tags: ['45 T€'], user: 'Max Hoffmann' }, { title: 'Brauerei Adler — Pilot', tags: ['8 T€'] }] },
            { title: 'Angebot', tone: 'warning', cards: [{ title: 'Kühne Logistik — Lizenz 200 User', tags: ['120 T€'], user: 'Sarah Wolf', due: '2026-12-05' }] },
            { title: 'Verhandlung', tone: 'primary', cards: [{ title: 'MediCare GmbH — Rahmenvertrag', tags: ['310 T€'], user: 'Max Hoffmann', tone: 'danger' }] },
            { title: 'Gewonnen', tone: 'success', done: true, cards: [{ title: 'Elektro Bauer — Erweiterung', tags: ['22 T€'] }] }] },
        ] },
        { id: 'kontakte', title: 'Kontakte', icon: '👥', widgets: [
          { type: 'table', id: 'contacts', title: 'Kontakte', crud: true, export: true, columns: [
            { key: 'name', label: 'Name', type: 'avatar', sub: 'firma', required: true }, { key: 'firma', label: 'Firma' }, { key: 'phase', label: 'Phase', type: 'status', filter: true, options: ['Neu', 'Qualifiziert', 'Angebot', 'Gewonnen', 'Verloren'] },
            { key: 'wert', label: 'Wert', type: 'money', currency: 'EUR' }, { key: 'score', label: 'Lead-Score', type: 'progress' }],
            rows: [['Julia Schneider', 'MediCare GmbH', 'Angebot', 310000, 86], ['Thomas Braun', 'Kühne Logistik', 'Qualifiziert', 120000, 71], ['Aylin Demir', 'Stadtwerke Kiel', 'Neu', 45000, 40], ['Lukas Vogel', 'Elektro Bauer', 'Gewonnen', 22000, 95], ['Nina Krüger', 'Brauerei Adler', 'Verloren', 8000, 12]] },
        ] },
        { id: 'marketing', title: 'Marketing', icon: '📣', widgets: [
          { type: 'chart', kind: 'bar', title: 'Leads pro Kampagne', w: 7, labels: ['LinkedIn', 'Google Ads', 'Messe', 'Newsletter', 'Webinar'], series: [{ name: 'Leads', data: [120, 96, 64, 48, 81] }, { name: 'SQL', data: [34, 22, 30, 9, 26] }] },
          { type: 'automations', title: 'Marketing-Automationen', w: 5, add: false, items: [
            { name: 'Lead-Nurturing', trigger: 'Formular ausgefüllt', actions: ['E-Mail-Serie', 'Score +10'], runs: 812 },
            { name: 'Webinar-Follow-up', trigger: 'Webinar besucht', actions: ['Aufzeichnung senden', 'Aufgabe für Vertrieb'], runs: 144 }] },
        ] },
        { id: 'rechnungen', title: 'Buchhaltung', icon: '🧾', widgets: [
          { type: 'table', title: 'Rechnungen', crud: true, currency: 'EUR', columns: [{ key: 'nr', label: 'Nr.' }, { key: 'kunde', label: 'Kunde' }, { key: 'betrag', label: 'Betrag', type: 'money' }, { key: 'faellig', label: 'Fällig', type: 'date' }, { key: 'status', label: 'Status', type: 'status', options: ['Offen', 'Bezahlt', 'Überfällig'] }],
            rows: [['RE-1042', 'MediCare GmbH', 18400, '2026-12-10', 'Offen'], ['RE-1039', 'Elektro Bauer', 22000, '2026-11-20', 'Bezahlt'], ['RE-1031', 'Brauerei Adler', 7800, '2026-11-02', 'Überfällig']] },
          { type: 'integrations', title: 'Schnittstellen', items: [{ name: 'DATEV', category: 'Buchhaltung', connected: true, lastSync: 'vor 1 Std.' }, { name: 'lexoffice', category: 'Buchhaltung', connected: false }, { name: 'HubSpot', category: 'CRM', connected: true }, { name: 'Outlook 365', category: 'E-Mail', connected: true }] },
        ] },
      ],
      chat: { title: 'Vertriebs-KI', messages: [{ from: 'bot', text: 'Guten Morgen, Max! **3 Deals** brauchen heute Aufmerksamkeit.' }], suggestions: ['Welche Deals sind gefährdet?', 'Forecast Dezember'],
        replies: [
          { match: ['gefährdet', 'risiko'], text: '**MediCare GmbH** (310 T€): seit 9 Tagen keine Antwort. Vorschlag: Follow-up-Call mit Entscheider.', buttons: [{ label: 'Aufgabe anlegen', action: 'toast:Aufgabe angelegt' }] },
          { match: ['forecast', 'prognose'], text: 'Forecast Dezember: **412 T€** (gewichtet), Best Case **590 T€**.' }] },
    },
    demo: { steps: [
      { do: 'say', say: 'Willkommen im **VertriebsCockpit** — Prototyp aus einer JSON-Konfiguration.', ms: 2200 },
      { do: 'navigate', to: 'kontakte', say: 'Kontakte verwalten: anlegen, bearbeiten, löschen.' },
      { do: 'click', target: 'w:contacts add' },
      { do: 'type', target: 'modal field:name', text: 'Felix Neumann' },
      { do: 'type', target: 'modal field:firma', text: 'Neumann Bau AG' },
      { do: 'type', target: 'modal field:wert', text: '64000' },
      { do: 'click', target: 'modal:save', say: 'Gespeichert — sofort in der Tabelle sichtbar.', ms: 1600 },
      { do: 'navigate', to: 'pipeline', say: 'Pipeline als Kanban-Board.' },
      { do: 'chat', text: 'Welche Deals sind gefährdet?', say: 'Und die KI kennt jeden Deal.', ms: 2200 },
      { do: 'finale', title: 'VertriebsCockpit', text: 'CRM, Marketing und Buchhaltung — **in einem System**.' },
    ] },
  },
};
