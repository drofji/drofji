/*!
 * Moqup helper.js — JSON → klickbarer Dashboard-/Admin-Prototyp.
 * Link-Parameter: map (Pflicht), colors, demo, logo, page (optional).
 * Vollständige Dokumentation: DOCS.md (liegt daneben).
 * Ohne Abhängigkeiten und Build. Alle Benutzertexte werden per textContent oder über
 * escapendes Mini-Markdown ausgegeben – JSON aus dem Link kann kein Skript einschleusen.
 */
(function () {
  'use strict';

  /* =====================================================================
   * 0. Konstanten und Zustand
   * ===================================================================== */
  const VERSION = '1.0.0';
  const KEYS = ['map', 'colors', 'demo', 'logo', 'page'];
  const NS = 'http://www.w3.org/2000/svg';
  const S = {
    cfg: null, colorsParam: null, demo: null, logo: null,
    pages: {}, pageList: [], current: null, widgets: {}, warnings: [], notifs: [],
    stats: { pages: 0, widgets: 0, automations: 0, integrations: 0, tables: 0, charts: 0 },
    lang: 'de', locale: 'de-DE', mode: 'dark', loading: null, raw: {}, chat: null, search: [],
  };
  const BUS = {};
  const on = (ev, fn) => (BUS[ev] = BUS[ev] || []).push(fn);
  const emit = (ev, d) => (BUS[ev] || []).forEach(fn => { try { fn(d); } catch (e) { console.error(e); } });

  /* =====================================================================
   * 1. Oberflächentexte (de / en / ru) — app.lang
   * ===================================================================== */
  const I18N = {
    ru: {
      search: 'Поиск…', searchPh: 'Найти раздел или виджет…', notifs: 'Уведомления', noNotifs: 'Нет новых уведомлений',
      markRead: 'Прочитать все', demo: 'Демо', add: 'Добавить', edit: 'Изменить', del: 'Удалить', save: 'Сохранить',
      cancel: 'Отмена', close: 'Закрыть', confirm: 'Удалить', confirmDel: 'Удалить запись?', confirmDelN: 'Удалить выбранные записи: {n}?',
      deleted: 'Запись удалена', saved: 'Изменения сохранены', added: 'Запись добавлена', records: 'записей', of: 'из',
      nothing: 'Ничего не найдено', all: 'Все', run: 'Запустить', running: 'Выполняется…', done: 'Готово',
      connected: 'Подключено', disconnected: 'Отключено', sync: 'Синхронизировать', synced: 'Синхронизировано', justNow: 'только что',
      chatPh: 'Напишите сообщение…', online: 'онлайн', warnings: 'Предупреждения конфигурации', collapse: 'Свернуть',
      maximize: 'Развернуть', theme: 'Светлая / тёмная тема', fullscreen: 'Полный экран', pause: 'Пауза', resume: 'Продолжить',
      next: 'Дальше', stop: 'Стоп', missing: 'Цель не найдена', newItem: 'Новая запись', actions: 'Действия',
      required: 'Заполните обязательные поля', selected: 'Выбрано', clear: 'Очистить', permUpd: 'Права доступа обновлены',
      moved: 'перемещена в', finTitle: 'Прототип готов', finText: 'Так может выглядеть ваша система — уже сегодня.',
      cont: 'Продолжить осмотр', again: 'Повторить демо', pages: 'Разделов', widgets: 'Виджетов', autos: 'Автоматизаций',
      integs: 'Интеграций', tables: 'CRUD-таблиц', built: 'Построено элементов', preparing: 'Подготовка…', details: 'Подробности',
      chatFallback: 'Понял вас! В прототипе я отвечаю на заранее заданные вопросы — в рабочей версии здесь будет ответ нейросети по данным вашей компании.',
      runs: 'запусков', last: 'последний', newAuto: 'Новая автоматизация', name: 'Название', trigger: 'Триггер',
      actionsLines: 'Действия (по одному в строке)', enabled: 'включена', disabled: 'выключена', executed: 'выполнена',
      move: 'Переместить в', addCard: '+ Карточка', sim: 'Симуляция', menu: 'Меню', live: 'Live', export: 'CSV',
      allowed: 'разрешено', denied: 'запрещено', role: 'Роль', created: 'создана', unknownPage: 'Раздел не найден',
      step: 'Шаг', online2: 'Работает', degraded: 'Деградация', offline: 'Недоступен', maintenance: 'Обслуживание',
    },
    en: {
      search: 'Search…', searchPh: 'Find a page or widget…', notifs: 'Notifications', noNotifs: 'No new notifications',
      markRead: 'Mark all read', demo: 'Demo', add: 'Add', edit: 'Edit', del: 'Delete', save: 'Save', cancel: 'Cancel',
      close: 'Close', confirm: 'Delete', confirmDel: 'Delete this record?', confirmDelN: 'Delete selected records: {n}?',
      deleted: 'Record deleted', saved: 'Changes saved', added: 'Record added', records: 'records', of: 'of',
      nothing: 'Nothing found', all: 'All', run: 'Run', running: 'Running…', done: 'Done', connected: 'Connected',
      disconnected: 'Disconnected', sync: 'Sync', synced: 'Synced', justNow: 'just now', chatPh: 'Type a message…',
      online: 'online', warnings: 'Configuration warnings', collapse: 'Collapse', maximize: 'Maximize', theme: 'Light / dark theme',
      fullscreen: 'Fullscreen', pause: 'Pause', resume: 'Resume', next: 'Next', stop: 'Stop', missing: 'Target not found',
      newItem: 'New record', actions: 'Actions', required: 'Please fill in required fields', selected: 'Selected', clear: 'Clear',
      permUpd: 'Permissions updated', moved: 'moved to', finTitle: 'Your prototype is ready',
      finText: 'This is how your system could look — today.', cont: 'Keep exploring', again: 'Replay demo', pages: 'Pages',
      widgets: 'Widgets', autos: 'Automations', integs: 'Integrations', tables: 'CRUD tables', built: 'Elements built',
      preparing: 'Preparing…', details: 'Details',
      chatFallback: 'Got it! In this prototype I answer predefined questions — in production an AI model will answer using your company data.',
      runs: 'runs', last: 'last', newAuto: 'New automation', name: 'Name', trigger: 'Trigger', actionsLines: 'Actions (one per line)',
      enabled: 'enabled', disabled: 'disabled', executed: 'executed', move: 'Move to', addCard: '+ Card', sim: 'Simulate',
      menu: 'Menu', live: 'Live', export: 'CSV', allowed: 'allowed', denied: 'denied', role: 'Role', created: 'created',
      unknownPage: 'Page not found', step: 'Step', online2: 'Operational', degraded: 'Degraded', offline: 'Down', maintenance: 'Maintenance',
    },
    de: {
      search: 'Suche…', searchPh: 'Bereich oder Widget finden…', notifs: 'Benachrichtigungen', noNotifs: 'Keine neuen Benachrichtigungen',
      markRead: 'Alle gelesen', demo: 'Demo', add: 'Hinzufügen', edit: 'Bearbeiten', del: 'Löschen', save: 'Speichern',
      cancel: 'Abbrechen', close: 'Schließen', confirm: 'Löschen', confirmDel: 'Eintrag löschen?', confirmDelN: 'Ausgewählte Einträge löschen: {n}?',
      deleted: 'Eintrag gelöscht', saved: 'Änderungen gespeichert', added: 'Eintrag hinzugefügt', records: 'Einträge', of: 'von',
      nothing: 'Nichts gefunden', all: 'Alle', run: 'Starten', running: 'Läuft…', done: 'Fertig', connected: 'Verbunden',
      disconnected: 'Getrennt', sync: 'Synchronisieren', synced: 'Synchronisiert', justNow: 'gerade eben', chatPh: 'Nachricht schreiben…',
      online: 'online', warnings: 'Konfigurationshinweise', collapse: 'Einklappen', maximize: 'Maximieren', theme: 'Helles / dunkles Design',
      fullscreen: 'Vollbild', pause: 'Pause', resume: 'Weiter', next: 'Weiter', stop: 'Stopp', missing: 'Ziel nicht gefunden',
      newItem: 'Neuer Eintrag', actions: 'Aktionen', required: 'Bitte Pflichtfelder ausfüllen', selected: 'Ausgewählt', clear: 'Leeren',
      permUpd: 'Berechtigungen aktualisiert', moved: 'verschoben nach', finTitle: 'Ihr Prototyp ist fertig',
      finText: 'So könnte Ihr System aussehen — schon heute.', cont: 'Weiter ansehen', again: 'Demo wiederholen', pages: 'Bereiche',
      widgets: 'Widgets', autos: 'Automatisierungen', integs: 'Integrationen', tables: 'CRUD-Tabellen', built: 'Elemente erstellt',
      preparing: 'Vorbereitung…', details: 'Details',
      chatFallback: 'Verstanden! Im Prototyp beantworte ich vordefinierte Fragen — im Produktivsystem antwortet hier eine KI mit Ihren Unternehmensdaten.',
      runs: 'Ausführungen', last: 'zuletzt', newAuto: 'Neue Automatisierung', name: 'Name', trigger: 'Auslöser',
      actionsLines: 'Aktionen (eine pro Zeile)', enabled: 'aktiviert', disabled: 'deaktiviert', executed: 'ausgeführt',
      move: 'Verschieben nach', addCard: '+ Karte', sim: 'Simulation', menu: 'Menü', live: 'Live', export: 'CSV',
      allowed: 'erlaubt', denied: 'verweigert', role: 'Rolle', created: 'erstellt', unknownPage: 'Bereich nicht gefunden',
      step: 'Schritt', online2: 'In Betrieb', degraded: 'Eingeschränkt', offline: 'Ausgefallen', maintenance: 'Wartung',
    },
  };
  const t = (k, vars) => {
    let s = (I18N[S.lang] && I18N[S.lang][k]) || I18N.de[k] || k;
    if (vars) for (const v in vars) s = s.replace('{' + v + '}', vars[v]);
    return s;
  };

  /* =====================================================================
   * 2. Hilfsfunktionen
   * ===================================================================== */
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const arr = v => (Array.isArray(v) ? v : v == null ? [] : [v]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const num = (v, d) => (v === '' || v == null || !isFinite(Number(v)) ? d : Number(v));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  let _uid = 0;
  const uid = p => (p || 'u') + (++_uid).toString(36);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s || '').toLowerCase().trim()
    .replace(/[äöüß]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c]))
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 48);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const nowTime = () => new Date().toLocaleTimeString(S.locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const cssEsc = s => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') {
        if (typeof v === 'string') el.style.cssText = v;
        else for (const p in v) { if (v[p] == null) continue; if (p.startsWith('--')) el.style.setProperty(p, v[p]); else el.style[p] = v[p]; }
      } else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v; // nur für eigenes Markup / escaptes Markdown
      else if (k === 'ref') el.setAttribute('data-ref', v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    return add(el, kids);
  }
  function add(el, kids) {
    for (const c of arr(kids).flat(Infinity)) {
      if (c == null || c === false || c === '') continue;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const STYLE_ATTRS = new Set(['fill', 'stroke', 'stop-color']);
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (STYLE_ATTRS.has(k)) el.style.setProperty(k, v);
      else if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style') el.style.cssText += ';' + v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    return el;
  }
  function px(v, d) {
    if (v == null || v === '') return d == null ? null : px(d);
    if (typeof v === 'number' || /^\d+(\.\d+)?$/.test(v)) return v + 'px';
    if (/^\d+(\.\d+)?(px|vh|vw|%|rem|em)$/.test(String(v)) || v === 'auto') return String(v);
    return d == null ? null : px(d);
  }
  function safeUrl(u) {
    const v = String(u || '').trim();
    return /^(https?:\/\/|mailto:|tel:|#|\.{0,2}\/)/i.test(v) || /^[\w.-]+\.(md|html|json|pdf)(#.*)?$/i.test(v) ? v : null;
  }

  // Mini-Markdown für Zeilen: **fett**, *kursiv*, `Code`, [Link](url), Zeilenumbrüche
  function md(text) {
    const codes = [];
    let x = esc(String(text == null ? '' : text)).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    x = x.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<i>$2</i>')
      .replace(/~~([^~]+)~~/g, '<s>$1</s>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => {
        const raw = u.replace(/&amp;/g, '&');
        if (!safeUrl(raw)) return a;
        const ext = /^https?:/i.test(raw);
        return `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ''}>${a}</a>`;
      })
      .replace(/\n/g, '<br>');
    return x.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[i]}</code>`);
  }
  const mdEl = (tag, text, cls) => h(tag, { class: cls, html: md(text) });

  // Block-Markdown — für DOCS.md auf der Dokumentationsseite
  function renderMarkdown(src) {
    const lines = String(src).replace(/\r/g, '').split('\n');
    let out = '', i = 0;
    const isList = l => /^\s*([-*]|\d+\.)\s/.test(l);
    const isBlock = l => /^(#{1,6}\s|```|\s*\||>|---+\s*$)/.test(l) || isList(l);
    while (i < lines.length) {
      const l = lines[i];
      if (/^```/.test(l)) {
        const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++; out += `<pre><code>${esc(buf.join('\n'))}</code></pre>`; continue;
      }
      const hm = l.match(/^(#{1,6})\s+(.*)$/);
      if (hm) { const n = hm[1].length; out += `<h${n} id="${esc(slug(hm[2]))}">${md(hm[2])}</h${n}>`; i++; continue; }
      if (/^\s*\|/.test(l)) {
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = r => r.replace(/\\\|/g, '\u0001').trim().replace(/^\||\|$/g, '').split('|').map(c => md(c.trim().replace(/\u0001/g, '|')));
        let tb = '<div class="md-table"><table>';
        rows.forEach((r, ri) => {
          if (/^[\s|:-]+$/.test(r)) return;
          const tag = ri === 0 ? 'th' : 'td';
          tb += '<tr>' + cells(r).map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
        });
        out += tb + '</table></div>'; continue;
      }
      if (isList(l)) {
        const ordered = /^\s*\d+\./.test(l), items = [];
        while (i < lines.length && isList(lines[i])) {
          items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s/, '')); i++;
          while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !isList(lines[i])) items[items.length - 1] += ' ' + lines[i++].trim();
        }
        const tg = ordered ? 'ol' : 'ul';
        out += `<${tg}>` + items.map(x => `<li>${md(x)}</li>`).join('') + `</${tg}>`; continue;
      }
      if (/^>\s?/.test(l)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
        out += `<blockquote>${md(buf.join(' '))}</blockquote>`; continue;
      }
      if (/^---+\s*$/.test(l)) { out += '<hr>'; i++; continue; }
      if (!l.trim()) { i++; continue; }
      const buf = [];
      while (i < lines.length && lines[i].trim() && !isBlock(lines[i])) buf.push(lines[i++]);
      out += `<p>${md(buf.join(' '))}</p>`;
    }
    return out;
  }

  // Farben: Tonnamen → CSS-Variablen, Rohfarben nur in sicherer Form
  const TONES = { primary: 'primary', accent: 'accent', success: 'success', warning: 'warning', danger: 'danger', info: 'info', muted: 'muted',
    secondary: 'muted', green: 'success', red: 'danger', error: 'danger', orange: 'warning', yellow: 'warning', blue: 'info', purple: 'primary-2', violet: 'primary-2', cyan: 'accent', gray: 'muted', grey: 'muted' };
  function cssColor(c) {
    if (!c) return null;
    const v = String(c).trim();
    if (TONES[v.toLowerCase()]) return `var(--${TONES[v.toLowerCase()]})`;
    if (/^c[1-8]$/.test(v)) return `var(--${v})`;
    if (/^#[0-9a-f]{3,8}$/i.test(v) || /^(rgb|hsl)a?\([\d\s.,%/+-]+\)$/i.test(v)) return v;
    return null;
  }
  const toneStyle = (c, d) => ({ '--tone': cssColor(c) || cssColor(d || 'primary') });

  const STATUS_WORDS = {
    danger: ['неоплач', 'не оплач', 'error', 'fail', 'offline', 'cancel', 'overdue', 'blocked', 'reject', 'down', 'ошиб', 'отмен', 'просроч', 'блок', 'сбой', 'отклон', 'недоступ', 'fehler', 'storn', 'überfällig', 'abgelehnt', 'gesperrt', 'ausgefallen'],
    warning: ['pending', 'wait', 'process', 'progress', 'degrad', 'delay', 'hold', 'ожида', 'в пути', 'в работе', 'комплект', 'обработ', 'частич', 'задерж', 'провер', 'warn', 'in arbeit', 'unterwegs', 'wartet', 'verzög', 'prüfung', 'teilweise'],
    success: ['done', 'ok', 'active', 'online', 'paid', 'deliver', 'complet', 'success', 'won', 'approved', 'operational', 'готов', 'выполн', 'достав', 'оплач', 'актив', 'онлайн', 'заверш', 'успеш', 'одобр', 'работает', 'подключ', 'erledigt', 'aktiv', 'bezahlt', 'geliefert', 'abgeschlossen', 'gewonnen', 'in betrieb'],
    info: ['new', 'draft', 'нов', 'черновик', 'info', 'neu', 'entwurf', 'план', 'geplant', 'scheduled'],
  };
  function autoTone(v) {
    const x = String(v == null ? '' : v).toLowerCase();
    for (const k of ['danger', 'warning', 'success', 'info']) if (STATUS_WORDS[k].some(w => x.includes(w))) return k;
    return 'muted';
  }
  const badge = (text, tone, plain) => h('span', { class: 'badge' + (plain ? ' plain' : ''), style: toneStyle(tone || autoTone(text), 'muted') }, String(text == null ? '' : text));

  function fmtNum(v, o) {
    o = o || {};
    if (v == null || v === '') return '';
    const n = Number(v);
    if (!isFinite(n)) return String(v);
    const dec = o.decimals != null ? +o.decimals : (n % 1 ? (Math.abs(n) < 10 ? 2 : 1) : 0);
    let out;
    const cur = o.currency;
    if (cur && /^[A-Z]{3}$/.test(cur)) {
      try { out = new Intl.NumberFormat(S.locale, { style: 'currency', currency: cur, maximumFractionDigits: o.decimals != null ? +o.decimals : 0 }).format(n); }
      catch (e) { out = n.toLocaleString(S.locale) + ' ' + cur; }
    } else {
      out = new Intl.NumberFormat(S.locale, { maximumFractionDigits: dec, minimumFractionDigits: o.decimals != null ? dec : 0 }).format(n);
      if (cur) out += ' ' + cur;
    }
    return (o.prefix || '') + out + (o.suffix || '') + (o.unit ? ' ' + o.unit : '');
  }
  const compact = n => { try { return new Intl.NumberFormat(S.locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n); } catch (e) { return String(n); } };
  function fmtDate(v) {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(String(v))) {
      const d = new Date(v);
      if (!isNaN(d)) return String(v).length > 10 ? d.toLocaleString(S.locale, { dateStyle: 'short', timeStyle: 'short' }) : d.toLocaleDateString(S.locale);
    }
    return String(v);
  }

  const ICONS = { dashboard: '📊', home: '🏠', orders: '📦', order: '📦', box: '📦', users: '👥', team: '👥', user: '👤', settings: '⚙️', gear: '⚙️',
    chart: '📈', stats: '📈', truck: '🚚', delivery: '🚚', warehouse: '🏭', factory: '🏭', money: '💶', finance: '💶', euro: '💶', dollar: '💵',
    invoice: '🧾', bolt: '⚡', automation: '⚡', plug: '🔌', integration: '🔌', log: '📜', logs: '📜', lock: '🔐', access: '🔐', shield: '🛡️',
    chat: '💬', ai: '🤖', robot: '🤖', calendar: '📅', mail: '✉️', email: '✉️', bell: '🔔', task: '🗂️', tasks: '🗂️', kanban: '🗂️', cart: '🛒',
    shop: '🛒', report: '📑', star: '⭐', check: '✅', alert: '⚠️', warning: '⚠️', map: '🗺️', route: '🗺️', database: '🗄️', cloud: '☁️', file: '📄',
    doc: '📄', search: '🔍', link: '🔗', clock: '🕒', time: '🕒', fire: '🔥', rocket: '🚀', target: '🎯', marketing: '📣', megaphone: '📣',
    crm: '🤝', sales: '🤝', deal: '🤝', phone: '📞', support: '🎧', product: '🏷️', tag: '🏷️', globe: '🌍', api: '🧩', puzzle: '🧩', key: '🔑' };
  function ico(name, cls) {
    if (name == null || name === '') return null;
    const v = String(name);
    const txt = ICONS[v.toLowerCase()] || (/[^\x00-\x7f]/.test(v) || v.length <= 3 ? v : v[0].toUpperCase());
    return h('span', { class: cls || 'ico', text: txt });
  }
  const initials = n => String(n || '?').split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  const hashTone = str => { let x = 0; for (const c of String(str)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return `var(--c${x % 8 + 1})`; };

  function observeSize(el, fn) {
    let raf = 0, lastW = -1;
    const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const w = el.clientWidth; if (w && w !== lastW) { lastW = w; fn(w); } }); };
    if (window.ResizeObserver) new ResizeObserver(run).observe(el); else window.addEventListener('resize', run);
    return run;
  }
  function whenVisible(el, fn) {
    if (!window.IntersectionObserver) return fn();
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } });
    io.observe(el);
  }
  function countUp(el, target, o) {
    const dur = 1100, t0 = performance.now();
    const step = now => {
      const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNum(p < 1 ? target * e : target, Object.assign({}, o, { decimals: o.decimals != null ? o.decimals : (target % 1 ? 1 : 0) }));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function warn(msg) { if (!S.warnings.includes(msg)) S.warnings.push(msg); console.warn('[moqup]', msg); }

  /* =====================================================================
   * 3. Parameter lesen und dekodieren
   * ===================================================================== */
  function extractParams(str) {
    const res = {};
    if (!str) return res;
    const re = new RegExp('(?:^|&)(' + KEYS.join('|') + ')=', 'g');
    const marks = [];
    let m;
    while ((m = re.exec(str))) marks.push({ key: m[1], idx: m.index, start: m.index + m[0].length });
    marks.forEach((mk, i) => {
      const end = i + 1 < marks.length ? marks[i + 1].idx : str.length;
      res[mk.key] = safeDecode(str.slice(mk.start, end));
    });
    return res;
  }
  function safeDecode(v) {
    try { return decodeURIComponent(v); } catch (e) {
      return v.replace(/%[0-9a-f]{2}/gi, x => { try { return decodeURIComponent(x); } catch (_) { return x; } });
    }
  }
  function readRawParams() {
    const q = extractParams(location.search.replace(/^\?/, ''));
    const hs = extractParams(location.hash.replace(/^#/, ''));
    return Object.assign({}, q, hs); // Hash hat Vorrang vor Query
  }
  function b64ToBytes(str) {
    let b = String(str).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    const bin = atob(b), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bytesToB64url(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const bytesToText = b => new TextDecoder('utf-8', { fatal: true }).decode(b);
  async function inflate(bytes, fmt) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Der Browser unterstützt DecompressionStream nicht — verwenden Sie b64: oder normales JSON');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(fmt));
    return await new Response(stream).text();
  }
  async function deflate(text) {
    const bytes = new TextEncoder().encode(text);
    if (typeof CompressionStream === 'undefined') return 'b64:' + bytesToB64url(bytes);
    const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();
    return 'z:' + bytesToB64url(new Uint8Array(buf));
  }
  async function encodeParam(text, mode) {
    const min = JSON.stringify(JSON.parse(text));
    if (mode === 'json') return encodeURIComponent(min);
    if (mode === 'b64') return 'b64:' + bytesToB64url(new TextEncoder().encode(min));
    return deflate(min);
  }

  async function decodeParam(name, raw) {
    let text = String(raw).trim();
    const m = text.match(/^(z|pako|b64|base64|json):/i);
    try {
      if (m) {
        const kind = m[1].toLowerCase(), data = text.slice(m[0].length);
        if (kind === 'json') text = data;
        else if (kind === 'b64' || kind === 'base64') text = bytesToText(b64ToBytes(data));
        else text = await inflate(b64ToBytes(data), kind === 'z' ? 'deflate-raw' : 'deflate');
      } else if (!/^[\[{"]/.test(text) && /^[A-Za-z0-9+/_=-]{8,}$/.test(text)) {
        const bytes = b64ToBytes(text);
        if (bytes[0] === 0x78) text = await inflate(bytes, 'deflate');
        else {
          let tx = null;
          try { tx = bytesToText(bytes); } catch (e) { /* kein Text */ }
          text = tx && /^\s*[\[{]/.test(tx) ? tx : await inflate(bytes, 'deflate-raw');
        }
      }
    } catch (e) {
      throw { param: name, title: 'Parameter konnte nicht dekodiert werden', message: (e && e.message) || String(e),
        hints: ['Präfixe: `z:` — deflate-raw + base64url, `pako:` — zlib + base64url (wie bei mermaid.live), `b64:` — base64url, ohne Präfix — normales JSON.', 'Der Link wurde beim Kopieren evtl. abgeschnitten — im Link-Generator neu erzeugen.'] };
    }
    S.raw[name] = text;
    try { return JSON.parse(text); } catch (e) { throw jsonError(name, text, e); }
  }

  function jsonError(name, text, e) {
    const msg = (e && e.message) || String(e);
    let pos = null, m;
    if ((m = msg.match(/position (\d+)/))) pos = +m[1];
    else if ((m = msg.match(/line (\d+) column (\d+)/))) {
      const ls = text.split('\n');
      pos = ls.slice(0, +m[1] - 1).reduce((a, l) => a + l.length + 1, 0) + (+m[2] - 1);
    }
    let where = '', snippet = '';
    if (pos != null) {
      const before = text.slice(0, pos);
      const line = before.split('\n').length, col = pos - before.lastIndexOf('\n');
      where = ` — Zeile ${line}, Spalte ${col}`;
      const ls = text.split('\n');
      if (ls[line - 1] && ls[line - 1].length <= 160) {
        const from = Math.max(0, line - 3);
        snippet = ls.slice(from, line).map((l, i) => String(from + i + 1).padStart(4) + ' │ ' + l).join('\n') + '\n' + ' '.repeat(6 + col) + '▲';
      } else {
        const a = Math.max(0, pos - 70);
        snippet = (a ? '…' : '') + text.slice(a, pos + 50).replace(/\n/g, ' ') + '\n' + ' '.repeat(pos - a + (a ? 1 : 0)) + '▲';
      }
    }
    const hints = [];
    if (/,\s*[}\]]/.test(text)) hints.push('Überflüssiges Komma vor `}` oder `]` — in JSON nicht erlaubt.');
    if (/[{,]\s*'[^']*'\s*:/.test(text) || /:\s*'[^']*'/.test(text)) hints.push('Einfache Anführungszeichen: In JSON stehen Schlüssel und Strings nur in doppelten Anführungszeichen `"…"`.');
    if (/[{,]\s*[A-Za-z_$][\w$]*\s*:/.test(text)) hints.push('Schlüssel ohne Anführungszeichen: `{title: "…"}` → `{"title": "…"}`.');
    if (/(^|[^:"])\/\/|\/\*/.test(text)) hints.push('Kommentare `//` und `/* */` sind in JSON nicht erlaubt.');
    if (/[“”„«»]/.test(text)) hints.push('Typografische Anführungszeichen `“ ” „ « »` statt gerader `"`.');
    const opens = (text.match(/[{[]/g) || []).length, closes = (text.match(/[}\]]/g) || []).length;
    if (opens !== closes) hints.push(`Klammern nicht ausgeglichen: ${opens} öffnende, ${closes} schließende. Vermutlich wurde der Link abgeschnitten.`);
    if (/^%7B/i.test(text)) hints.push('JSON wurde doppelt URL-kodiert — einmal dekodieren.');
    return { param: name, title: `Ungültiges JSON im Parameter „${name}“`, message: msg + where, snippet, hints };
  }

  /* =====================================================================
   * 4. Konfiguration normalisieren
   * ===================================================================== */
  const CONTAINERS = { tabs: w => arr(w.tabs).flatMap(x => arr(x && x.widgets)), accordion: w => arr(w.items).flatMap(x => arr(x && x.widgets)), group: w => arr(w.widgets) };
  const ALIASES = { kpi: 'stat', box: 'stat', infobox: 'stat', pipeline: 'process', steps: 'process', map: 'routes', permissions: 'matrix', access: 'matrix',
    health: 'status', services: 'status', activity: 'timeline', log: 'logs', terminal: 'logs', rules: 'automations', workflow: 'flow', graph: 'flow',
    markdown: 'text', html: 'text', alert: 'callout', title: 'heading', section: 'heading', row: 'group', grid: 'group', board: 'kanban', button: 'buttons', actions: 'buttons', todo: 'list' };
  const typeOf = w => { const x = String((w && w.type) || '').toLowerCase(); return ALIASES[x] || x; };
  const nested = w => (CONTAINERS[typeOf(w)] ? CONTAINERS[typeOf(w)](w) : []);

  function normalize(cfg) {
    if (!isObj(cfg)) throw { param: 'map', title: 'Ungültige Konfigurationsstruktur', message: 'Die Wurzel muss ein Objekt sein: { "app": {…}, "menu": […] }. Aktuell: ' + (Array.isArray(cfg) ? 'Array' : typeof cfg) + '.' };
    const known = ['app', 'menu', 'pages', 'chat', 'layout', 'colors', 'demo', 'logo', '$schema', 'version', 'meta'];
    Object.keys(cfg).forEach(k => { if (!known.includes(k)) warn(`Unbekannter Schlüssel der obersten Ebene „${k}“ — ignoriert.`); });
    cfg.app = Object.assign({ title: 'Moqup', search: true }, isObj(cfg.app) ? cfg.app : {});
    const dict = isObj(cfg.pages) ? cfg.pages : {};
    let menu = Array.isArray(cfg.menu) ? cfg.menu : [];
    if (!menu.length && Object.keys(dict).length) menu = Object.keys(dict).map(k => ({ page: k }));
    if (!menu.length) throw { param: 'map', title: 'Die Konfiguration enthält keine Bereiche', message: 'Füllen Sie "menu" aus — ein Array von Menüpunkten. Jeder Punkt ohne "children" ist eine Seite mit "widgets".', hints: ['Minimum: `{"menu":[{"title":"Übersicht","widgets":[{"type":"stat","label":"Aufträge","value":120}]}]}`'] };

    const used = new Set(), refPages = new Set();
    const uniq = id => { let x = id || 'page', k = 2; if (used.has(x)) { warn(`Doppelte Bereichs-ID „${x}“.`); while (used.has(x + '-' + k)) k++; x = x + '-' + k; } used.add(x); return x; };
    const register = node => { node.isPage = true; node.widgets = Array.isArray(node.widgets) ? node.widgets : []; S.pages[node.id] = node; S.pageList.push(node); };
    const walk = (items, parent) => items.map((it, i) => {
      if (typeof it === 'string') it = { title: it };
      if (!isObj(it)) { warn('Ein Menüpunkt muss ein Objekt sein.'); return null; }
      if (it.section && !it.title && !it.page) return { section: String(it.section) };
      let node = Object.assign({}, it);
      if (typeof node.page === 'string') {
        refPages.add(node.page);
        if (isObj(dict[node.page])) node = Object.assign({}, dict[node.page], node, { id: node.id || node.page });
        else warn(`Menüpunkt verweist auf nicht vorhandene Seite „${node.page}“ (pages.${node.page}).`);
      } else if (isObj(node.page)) node = Object.assign({}, node.page, node);
      node.title = String(node.title || node.label || node.id || `Bereich ${i + 1}`);
      node.id = uniq(String(node.id || slug(node.title)));
      node.parent = parent || null;
      node.children = Array.isArray(node.children) && node.children.length ? walk(node.children, node).filter(Boolean) : null;
      if (!node.children || Array.isArray(node.widgets)) register(node);
      return node;
    }).filter(Boolean);
    cfg.menu = walk(menu, null);
    Object.keys(dict).forEach(k => { if (!refPages.has(k) && !S.pages[k] && isObj(dict[k])) { const n = Object.assign({ title: k }, dict[k], { id: uniq(k), hidden: true, parent: null }); register(n); } });
    if (!S.pageList.length) throw { param: 'map', title: 'Keine einzige Seite vorhanden', message: 'Alle Menüpunkte haben "children", aber es gibt keine Endpunkte mit "widgets".' };

    const wids = new Set();
    let n = 0;
    const walkW = list => arr(list).forEach(w => {
      if (!isObj(w)) return;
      if (!w.type) warn(`Widget ohne "type"${w.title ? ' („' + w.title + '“)' : ''} — wird als Text angezeigt.`);
      w.id = String(w.id || 'w' + (++n));
      if (wids.has(w.id)) { warn(`Doppelte Widget-ID „${w.id}“.`); w.id += '-' + (++n); }
      wids.add(w.id);
      walkW(nested(w));
    });
    S.pageList.forEach(p => walkW(p.widgets));
    if (cfg.chat && !isObj(cfg.chat)) cfg.chat = cfg.chat === true ? {} : null;
    return cfg;
  }

  /* =====================================================================
   * 5. Farben, Layout, Logo
   * ===================================================================== */
  const COLOR_KEYS = { primary: '--primary', primary2: '--primary-2', secondary: '--primary-2', accent: '--accent', bg: '--bg', background: '--bg',
    bg2: '--bg-2', surface: '--surface', card: '--surface', surface2: '--surface-2', text: '--text', muted: '--muted', border: '--border',
    success: '--success', warning: '--warning', danger: '--danger', info: '--info', sidebar: '--sidebar', sidebarText: '--sidebar-text',
    sidebarActive: '--sidebar-active', topbar: '--topbar', primaryContrast: '--primary-contrast', logoBg: '--logo-bg' };
  const validColor = v => typeof v === 'string' && /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/+-]+\)|[a-z]{3,20}|transparent)$/i.test(v.trim());
  function applyColors() {
    const root = document.documentElement;
    [...root.style].filter(p => p.startsWith('--')).forEach(p => root.style.removeProperty(p));
    const src = Object.assign({}, isObj(S.cfg.colors) ? S.cfg.colors : {}, isObj(S.colorsParam) ? S.colorsParam : {});
    const apply = obj => {
      for (const k in obj) {
        const v = obj[k];
        if (k === 'light' || k === 'dark' || k === 'mode') continue;
        if (k === 'chart') { arr(v).slice(0, 8).forEach((c, i) => validColor(c) && root.style.setProperty('--c' + (i + 1), c)); continue; }
        if (k === 'radius') { if (isFinite(v)) root.style.setProperty('--radius', v + 'px'); continue; }
        if (k === 'font') { if (/^[\w\s,"'-]+$/.test(v)) root.style.setProperty('--font', v); continue; }
        if (!COLOR_KEYS[k]) { warn(`colors: unbekannter Schlüssel „${k}“.`); continue; }
        if (!validColor(v)) { warn(`colors.${k}: ungültige Farbe „${v}“.`); continue; }
        root.style.setProperty(COLOR_KEYS[k], v);
      }
    };
    apply(src);
    if (isObj(src[S.mode])) apply(src[S.mode]);
    applyLayout();
  }
  function applyLayout() {
    const L = isObj(S.cfg.layout) ? S.cfg.layout : {}, root = document.documentElement;
    if (L.sidebarWidth) root.style.setProperty('--sidebar-w', px(L.sidebarWidth));
    if (L.gap != null) root.style.setProperty('--gap', px(L.gap));
    if (L.maxWidth) root.style.setProperty('--content-max', px(L.maxWidth));
    if (L.radius != null) root.style.setProperty('--radius', px(L.radius));
    document.body.classList.toggle('compact', L.density === 'compact');
    document.body.classList.toggle('no-glow', L.background === 'plain');
  }
  function logoNode(big) {
    let L = S.logo != null ? S.logo : S.cfg.app.logo;
    const wrap = h('div', { class: 'brand-logo' + (big ? ' big' : '') });
    if (L) {
      let v = String(L).trim();
      if (/^"/.test(v)) { try { v = JSON.parse(v); } catch (e) { /* unverändert */ } }
      if (/^b64:/i.test(v)) { try { v = bytesToText(b64ToBytes(v.slice(4))); } catch (e) { warn('logo: b64 konnte nicht dekodiert werden.'); } }
      let src = null;
      if (/^<svg[\s>]/i.test(v)) src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(v);
      else if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(v)) src = v;
      else if (/^https?:\/\//i.test(v) || /^[\w./-]+\.(svg|png|jpe?g|webp|gif)$/i.test(v)) src = v;
      if (src) { wrap.classList.add('img'); wrap.appendChild(h('img', { src, alt: 'logo' })); return wrap; } // <img> führt keine Skripte im SVG aus
      wrap.textContent = v.slice(0, 3);
      return wrap;
    }
    wrap.textContent = initials(S.cfg.app.title).slice(0, 2) || 'M';
    return wrap;
  }

  /* =====================================================================
   * 6. Dokumentations- / Fehlerseite
   * ===================================================================== */
  const EMBED_DOCS = `# Moqup — Kurzreferenz
Die vollständige Dokumentation ist die Datei **DOCS.md** neben dashboard.html (über http geöffnet, wird sie hier komplett angezeigt).

## Link-Parameter
| Parameter | Pflicht | Inhalt |
|---|---|---|
| \`map\` | ja | JSON-Konfiguration: Menü, Seiten, Widgets, Chat |
| \`colors\` | nein | JSON-Palette: \`{"primary":"#6c7cff","bg":"#0b1020"}\` |
| \`demo\` | nein | JSON-Demo-Ablauf: \`{"steps":[…]}\` |
| \`logo\` | nein | SVG-Markup, data:image…, Bild-URL oder 1–3 Zeichen |
| \`page\` | nein | ID des Bereichs, der zuerst geöffnet wird |

JSON-Wert: normal (URL-kodiert), \`b64:\` + base64url, \`z:\` + deflate-raw/base64url, \`pako:\` + zlib/base64url. Lange Konfigurationen besser nach \`#\` übergeben: \`dashboard.html#map=z:…\`.

## Minimales map
\`\`\`json
{
  "app": {"title": "LogiFlow", "lang": "de"},
  "menu": [
    {"id": "home", "title": "Übersicht", "icon": "📊", "widgets": [
      {"type": "stat", "label": "Aufträge", "value": 1284, "trend": "+12%", "w": 3},
      {"type": "chart", "kind": "area", "title": "Versand", "labels": ["Mo","Di","Mi"], "series": [{"name": "2025", "data": [5,8,6]}], "w": 9}
    ]},
    {"title": "Lager", "icon": "🏭", "children": [
      {"id": "stock", "title": "Bestände", "widgets": [{"type": "table", "crud": true, "columns": ["SKU","Artikel"], "rows": [["A-1","Palette"]]}]}
    ]}
  ],
  "chat": {"title": "KI-Assistent", "messages": [{"from": "bot", "text": "Hallo!"}]}
}
\`\`\`

## Widget-Typen
stat, chart (line/area/bar/pie/donut), table (CRUD), form, list, timeline, logs, process, flow, routes, kanban, matrix (Berechtigungen), status, integrations, automations, progress, gauge, funnel, heatmap, buttons, text, callout, heading, tabs, accordion, group, image.

Größen: \`w\` (von 12 Spalten, Desktop), \`md\` (Tablet), \`sm\` (Smartphone), \`h\` (Höhe).`;

  async function showDocs(errors, missing) {
    document.body.className = 'docs-mode';
    document.title = errors.length ? 'Moqup — Konfigurationsfehler' : 'Moqup — Dokumentation';
    S.lang = 'de';
    const app = document.getElementById('app') || document.body;
    app.innerHTML = '';
    const page = h('div', { class: 'docs' });
    app.appendChild(h('div', { class: 'docs-wrap' }, page));
    page.appendChild(h('div', { class: 'docs-hero' },
      h('div', { class: 'docs-mark', text: 'M' }),
      h('h1', { text: 'Moqup Dashboard' }),
      h('p', { text: 'JSON → klickbarer Admin-Prototyp in einer Minute. Konfiguration per KI erzeugen, in den Link einfügen — und präsentieren.' })));
    if (missing && !errors.length) {
      page.appendChild(h('div', { class: 'notice' },
        h('div', { class: 'notice-title', text: '⚠ Parameter map fehlt' }),
        h('div', { html: md('Öffnen Sie die Seite mit einem Link wie `dashboard.html#map=…` oder `dashboard.html?map=…`, wobei `map` die JSON-Konfiguration des Dashboards ist. Unten finden Sie Dokumentation, Link-Generator und fertige Beispiele.') })));
    }
    errors.forEach(er => {
      page.appendChild(h('div', { class: 'err' },
        h('div', { class: 'err-title', text: '✖ ' + (er.title || 'Fehler') + (er.param && !String(er.title || '').includes(er.param) ? ` (Parameter „${er.param}“)` : '') }),
        h('div', { class: 'err-msg', text: er.message || '' }),
        er.snippet ? h('pre', { class: 'err-snippet', text: er.snippet }) : null,
        er.hints && er.hints.length ? h('ul', { class: 'err-hints' }, er.hints.map(x => h('li', { html: md(x) }))) : null));
    });
    const tabs = [['docs', '📘 Dokumentation'], ['build', '🔗 Link-Generator'], ['ex', '✨ Beispiele']];
    const nav = h('div', { class: 'docs-tabs' }), panes = {};
    const show = id => { nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.id === id)); Object.keys(panes).forEach(k => panes[k].classList.toggle('hidden', k !== id)); };
    tabs.forEach(([id, label]) => nav.appendChild(h('button', { 'data-id': id, text: label, onclick: () => show(id) })));
    page.appendChild(nav);
    panes.docs = h('div', { class: 'md' });
    panes.build = builderPane(errors);
    panes.ex = examplesPane(id => { show('build'); });
    Object.values(panes).forEach(p => page.appendChild(p));
    show(errors.length ? 'build' : 'docs');
    panes.docs.innerHTML = renderMarkdown(EMBED_DOCS);
    try {
      const r = await fetch('DOCS.md', { cache: 'no-cache' });
      if (r.ok) panes.docs.innerHTML = renderMarkdown(await r.text());
    } catch (e) { /* file:// — eingebaute Kurzreferenz bleibt */ }
  }

  function builderPane(errors) {
    const pane = h('div', { class: 'builder' });
    const mk = (name, label, rows, ph) => {
      const ta = h('textarea', { class: 'input mono', rows, placeholder: ph, spellcheck: 'false' });
      if (S.raw[name]) ta.value = S.raw[name];
      return { name, ta, wrap: h('label', { class: 'b-field' }, h('span', { class: 'lbl', text: label }), ta) };
    };
    const fMap = mk('map', 'map — Konfiguration (JSON, Pflicht)', 14, '{ "app": {"title": "…"}, "menu": [ … ] }');
    const fColors = mk('colors', 'colors — Farbpalette (JSON, optional)', 4, '{ "primary": "#6c7cff", "accent": "#22d3ee" }');
    const fDemo = mk('demo', 'demo — Demo-Ablauf (JSON, optional)', 5, '{ "steps": [ {"do":"navigate","to":"orders","say":"…"} ] }');
    const logo = h('input', { class: 'input mono', placeholder: '<svg …>…</svg>  oder  https://…/logo.png  oder  NC' });
    if (S.raw.logo) logo.value = S.raw.logo;
    const status = h('div', { class: 'b-status' });
    const out = h('textarea', { class: 'input mono', rows: 3, readonly: true, placeholder: 'Hier erscheint der Link' });
    const fields = [fMap, fColors, fDemo];
    const check = () => {
      status.innerHTML = '';
      let ok = true;
      fields.forEach(f => {
        const v = f.ta.value.trim();
        if (!v) { if (f.name === 'map') { ok = false; status.appendChild(h('div', { class: 'bad', text: '✖ map ist leer' })); } return; }
        try { JSON.parse(v); status.appendChild(h('div', { class: 'good', text: `✔ ${f.name}: JSON ist gültig` })); }
        catch (e) { ok = false; const er = jsonError(f.name, v, e); status.appendChild(h('div', { class: 'bad' }, h('div', { text: '✖ ' + er.message }), er.snippet ? h('pre', { text: er.snippet }) : null, er.hints.length ? h('div', { html: md(er.hints.join(' ')) }) : null)); }
      });
      return ok;
    };
    const build = async mode => {
      if (!check()) return;
      const parts = [];
      for (const f of fields) { const v = f.ta.value.trim(); if (v) parts.push(f.name + '=' + await encodeParam(v, mode)); }
      if (logo.value.trim()) parts.push('logo=' + encodeURIComponent(logo.value.trim()));
      out.value = location.href.split('#')[0].split('?')[0] + '#' + parts.join('&');
      status.appendChild(h('div', { class: 'good', text: `Linklänge: ${out.value.length.toLocaleString('de-DE')} Zeichen` + (out.value.length > 30000 ? ' — sehr lang, verwenden Sie die Komprimierung z:' : '') }));
    };
    const pretty = () => fields.forEach(f => { try { if (f.ta.value.trim()) f.ta.value = JSON.stringify(JSON.parse(f.ta.value), null, 2); } catch (e) { /* belassen */ } });
    add(pane, [
      h('p', { class: 'muted', html: md('JSON einfügen (z. B. von einer KI mit dem Prompt aus DOCS.md erzeugt), prüfen und Link erhalten. Der **komprimierte Link** ist 3–6× kürzer — ideal zum Versenden an Kunden.') }),
      fMap.wrap,
      h('details', { class: 'b-more', open: !!(S.raw.colors || S.raw.demo || S.raw.logo) }, h('summary', { text: 'Optionale Parameter: colors, demo, logo' }),
        fColors.wrap, fDemo.wrap, h('label', { class: 'b-field' }, h('span', { class: 'lbl', text: 'logo — SVG / URL / data:image / Text' }), logo)),
      h('div', { class: 'b-actions' },
        h('button', { class: 'btn', text: 'JSON prüfen', onclick: check }),
        h('button', { class: 'btn', text: 'Formatieren', onclick: pretty }),
        h('button', { class: 'btn primary', text: 'Link (komprimiert z:)', onclick: () => build('z') }),
        h('button', { class: 'btn', text: 'Link (b64:)', onclick: () => build('b64') }),
        h('button', { class: 'btn', text: 'Link (JSON)', onclick: () => build('json') })),
      status, out,
      h('div', { class: 'b-actions' },
        h('button', { class: 'btn', text: '📋 Kopieren', onclick: () => { if (!out.value) return; out.select(); (navigator.clipboard ? navigator.clipboard.writeText(out.value) : Promise.reject()).catch(() => document.execCommand('copy')); } }),
        h('button', { class: 'btn success', text: '▶ Prototyp öffnen', onclick: () => { if (out.value) location.href = out.value; } })),
    ]);
    pane._fill = ex => {
      fMap.ta.value = JSON.stringify(ex.map, null, 2);
      fColors.ta.value = ex.colors ? JSON.stringify(ex.colors, null, 2) : '';
      fDemo.ta.value = ex.demo ? JSON.stringify(ex.demo, null, 2) : '';
      logo.value = ex.logo || '';
      pane.querySelector('details').open = !!(ex.colors || ex.demo || ex.logo);
      check();
    };
    builderPane.last = pane;
    return pane;
  }

  function examplesPane(goBuild) {
    const pane = h('div', { class: 'examples' });
    const ex = window.MOQUP_EXAMPLES || {};
    const keys = Object.keys(ex);
    if (!keys.length) { pane.appendChild(h('p', { class: 'muted', html: md('Die Datei `examples.js` ist nicht eingebunden — keine Beispiele verfügbar. Ein Minimalbeispiel steht im Tab „Dokumentation“.') })); return pane; }
    keys.forEach(k => {
      const e = ex[k];
      pane.appendChild(h('div', { class: 'ex-card' },
        h('div', { class: 'ex-ico', text: e.icon || '✨' }),
        h('div', { class: 'ex-main' }, h('div', { class: 'ex-title', text: e.title || k }), h('div', { class: 'muted', text: e.description || '' })),
        h('div', { class: 'ex-actions' },
          h('button', { class: 'btn primary', text: '▶ Öffnen', onclick: async () => {
            const parts = ['map=' + await encodeParam(JSON.stringify(e.map), 'z')];
            if (e.colors) parts.push('colors=' + await encodeParam(JSON.stringify(e.colors), 'z'));
            if (e.demo) parts.push('demo=' + await encodeParam(JSON.stringify(e.demo), 'z'));
            if (e.logo) parts.push('logo=' + encodeURIComponent(e.logo));
            location.href = location.href.split('#')[0].split('?')[0] + '#' + parts.join('&');
          } }),
          h('button', { class: 'btn', text: 'In den Generator', onclick: () => { builderPane.last._fill(e); goBuild(); } }))));
    });
    return pane;
  }

  /* =====================================================================
   * 7. Ladebildschirm (Aufbaufortschritt)
   * ===================================================================== */
  function countAll() {
    let n = 1;
    const walkM = items => arr(items).forEach(it => { if (!it.section) n++; if (it.children) walkM(it.children); });
    walkM(S.cfg.menu);
    const walkW = list => arr(list).forEach(w => { if (isObj(w)) { n++; walkW(nested(w)); } });
    S.pageList.forEach(p => walkW(p.widgets));
    if (S.cfg.chat) n++;
    return n;
  }
  function showLoader(total) {
    const bar = h('i'), cnt = h('div', { class: 'loader-count' }), lbl = h('div', { class: 'loader-log' });
    const el = h('div', { class: 'loader' }, h('div', { class: 'loader-box' },
      h('div', { class: 'loader-ring' }, logoNode(true)),
      h('div', { class: 'loader-title', text: S.cfg.app.title }),
      h('div', { class: 'loader-bar' }, bar), cnt, lbl));
    document.body.appendChild(el);
    const per = clamp(1500 / total, 4, 45);
    let done = 0, lastPaint = 0;
    S.loading = {
      async tick(label) {
        done++;
        bar.style.width = (done / total * 100).toFixed(1) + '%';
        cnt.textContent = `${t('built')}: ${Math.min(done, total)} / ${total}`;
        if (label) lbl.textContent = label;
        if (performance.now() - lastPaint > 14) { lastPaint = performance.now(); await sleep(per); }
      },
      tickSync(label) { done++; if (label) lbl.textContent = label; },
      finish() { bar.style.width = '100%'; cnt.textContent = `${t('built')}: ${total} / ${total}`; lbl.textContent = '✓'; setTimeout(() => el.classList.add('out'), 250); setTimeout(() => el.remove(), 900); },
    };
  }

  /* =====================================================================
   * 8. Grundgerüst: Sidebar, Topbar, Seiten
   * ===================================================================== */
  const isMobile = () => window.innerWidth < 992;
  function buildShell() {
    const app = S.cfg.app;
    const root = h('div', { class: 'shell' + (app.sidebarCollapsed ? ' collapsed' : ''), id: 'shell' });
    // Sidebar
    const nav = h('nav', { class: 'side-nav' });
    S.cfg.menu.forEach(n => { if (!n.hidden) nav.appendChild(menuNode(n)); });
    const user = isObj(app.user) ? app.user : null;
    const sidebar = h('aside', { class: 'sidebar' },
      h('div', { class: 'brand' }, logoNode(), h('div', { class: 'brand-text' }, h('div', { class: 'brand-title', text: app.title }), app.subtitle ? h('div', { class: 'brand-sub', text: app.subtitle }) : null)),
      nav,
      user ? h('div', { class: 'side-foot' }, h('div', { class: 'user-chip' }, h('div', { class: 'avatar', text: user.avatar || initials(user.name) }),
        h('div', { class: 'brand-text' }, h('div', { class: 'uc-name', text: user.name || '' }), h('div', { class: 'uc-role', text: user.role || '' })))) : null);
    // Topbar
    const crumbs = h('div', { class: 'top-crumbs' });
    const bellDot = h('span', { class: 'dot hidden' });
    const bell = h('button', { class: 'icon-btn', ref: 'notifications', title: t('notifs'), onclick: e => { e.stopPropagation(); toggleNotifs(bell); } }, '🔔', bellDot);
    S.bellDot = bellDot;
    const topbar = h('header', { class: 'topbar' },
      h('button', { class: 'icon-btn', ref: 'menu-toggle', title: t('menu'), onclick: toggleSidebar }, '☰'),
      crumbs,
      app.search !== false ? h('button', { class: 'search', ref: 'search', onclick: openPalette }, '🔍', h('span', { text: t('search') }), h('kbd', { text: navigator.platform && /Mac/.test(navigator.platform) ? '⌘K' : 'Ctrl K' })) : h('div', { class: 'spacer' }),
      h('div', { class: 'spacer' }),
      S.warnings.length ? h('button', { class: 'icon-btn warn-btn', title: t('warnings'), onclick: showWarnings }, '⚠', h('span', { class: 'dot', text: S.warnings.length })) : null,
      S.demo && arr(S.demo.steps).length ? h('button', { class: 'btn primary sm demo-btn', ref: 'demo', onclick: () => startDemo() }, '▶', h('span', { class: 'hide-sm', text: ' ' + t('demo') })) : null,
      h('button', { class: 'icon-btn', ref: 'theme', title: t('theme'), onclick: toggleMode }, '🌓'),
      h('button', { class: 'icon-btn hide-sm', title: t('fullscreen'), onclick: () => { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); } }, '⛶'),
      bell,
      user ? h('div', { class: 'avatar hide-sm', title: user.name || '', text: user.avatar || initials(user.name) }) : null);
    S.crumbs = crumbs;
    const content = h('main', { class: 'content' });
    S.content = content;
    const main = h('div', { class: 'main' }, topbar, content, app.footer ? h('footer', { class: 'footer', html: md(app.footer) }) : null);
    add(root, [sidebar, h('div', { class: 'scrim', onclick: toggleSidebar }), main]);
    document.body.appendChild(root);
    document.body.appendChild(h('div', { class: 'toasts', id: 'toasts' }));
    S.shell = root;
    arr(app.notifications).forEach(n => S.notifs.push(Object.assign({ unread: true }, typeof n === 'string' ? { text: n } : n)));
    updateBell();
  }
  function menuNode(node) {
    if (node.section) return h('div', { class: 'side-section', text: node.section });
    const inner = [ico(node.icon || '•', 'side-ico'), h('span', { class: 'side-label', text: node.title }), node.badge != null ? h('span', { class: 'side-badge', style: toneStyle(node.badgeTone || 'primary'), text: node.badge }) : null];
    if (node.children) {
      const grp = h('div', { class: 'side-group' + (node.open ? ' open' : '') });
      const head = h('button', { class: 'side-link', ref: 'menu:' + node.id, title: node.title, onclick: () => {
        if (S.shell.classList.contains('collapsed') && !isMobile()) { S.shell.classList.remove('collapsed'); grp.classList.add('open'); return; }
        grp.classList.toggle('open');
        if (node.isPage) navigate(node.id);
      } }, inner, h('span', { class: 'side-caret', text: '›' }));
      return add(grp, [head, h('div', { class: 'side-children' }, node.children.filter(c => !c.hidden).map(menuNode))]);
    }
    return h('button', { class: 'side-link', ref: 'menu:' + node.id, 'data-page': node.id, title: node.title, onclick: () => navigate(node.id) }, inner);
  }
  function toggleSidebar() {
    if (isMobile()) S.shell.classList.toggle('side-open');
    else S.shell.classList.toggle('collapsed');
  }

  async function buildPage(p) {
    const sec = h('section', { class: 'page', ref: 'page:' + p.id, 'data-page': p.id });
    const chain = []; let x = p.parent; while (x) { chain.unshift(x.title); x = x.parent; }
    const head = h('div', { class: 'page-head' },
      h('div', { class: 'ph-main' },
        h('div', { class: 'crumbs', text: [S.cfg.app.title].concat(chain).join(' / ') }),
        h('h1', { class: 'page-title' }, p.icon ? ico(p.icon, 'pt-ico') : null, p.title),
        p.subtitle ? mdEl('div', p.subtitle, 'page-sub') : null),
      arr(p.actions).length ? h('div', { class: 'page-actions' }, arr(p.actions).map(b => button(b))) : null);
    if (p.header !== false) sec.appendChild(head);
    const g = h('div', { class: 'grid' });
    sec.appendChild(g);
    S.content.appendChild(sec);
    p.el = sec;
    await S.loading.tick(p.title);
    for (let i = 0; i < p.widgets.length; i++) {
      g.appendChild(cellFor(p.widgets[i], i));
      await S.loading.tick((p.title + ' › ' + (p.widgets[i].title || p.widgets[i].label || p.widgets[i].type || '')).slice(0, 80));
    }
    if (!p.widgets.length) g.appendChild(h('div', { class: 'cell', style: { '--w': 12 } }, h('div', { class: 'empty', text: '—' })));
  }

  function navigate(id, opts) {
    const p = S.pages[id];
    if (!p) { toast(t('unknownPage') + ': ' + id, 'warning'); return false; }
    if (S.current === p) { if (isMobile()) S.shell.classList.remove('side-open'); return true; }
    if (S.current && S.current.el) S.current.el.classList.remove('active');
    S.current = p;
    p.el.classList.add('active');
    document.querySelectorAll('.side-link.active').forEach(e => e.classList.remove('active'));
    const link = document.querySelector(`.side-link[data-ref="menu:${cssEsc(id)}"]`);
    if (link) {
      link.classList.add('active');
      let g = link.parentElement && link.parentElement.closest('.side-group');
      while (g) { g.classList.add('open'); g = g.parentElement && g.parentElement.closest('.side-group'); }
    }
    S.crumbs.textContent = p.title;
    document.title = p.title + ' · ' + S.cfg.app.title;
    if (isMobile()) S.shell.classList.remove('side-open');
    if (!(opts && opts.keepScroll)) window.scrollTo({ top: 0 });
    emit('navigate', p);
    return true;
  }

  /* =====================================================================
   * 9. Raster, Karten, Buttons, Aktionen
   * ===================================================================== */
  const DEFAULT_W = { stat: 3, gauge: 3, chart: 6, table: 12, form: 6, list: 4, timeline: 6, logs: 6, process: 12, flow: 12, routes: 8, kanban: 12,
    matrix: 6, status: 4, integrations: 12, automations: 12, buttons: 12, text: 6, callout: 12, heading: 12, tabs: 12, accordion: 6, group: 12,
    heatmap: 6, funnel: 6, progress: 4, image: 4 };
  const HALF_ON_PHONE = new Set(['stat', 'gauge']);
  const span = (v, d) => clamp(Math.round(num(v, d)), 1, 12);
  function cellFor(w, i) {
    if (!isObj(w)) w = { type: 'text', text: String(w) };
    const type = typeOf(w);
    let wv = span(w.w != null ? w.w : w.width, DEFAULT_W[type] || 12);
    if (type === 'chart' && w.w == null && /pie|donut/.test(String(w.kind || w.chart))) wv = 4;
    const md_ = span(w.md, wv <= 6 ? 6 : 12);
    const sm = span(w.sm, HALF_ON_PHONE.has(type) ? 6 : 12);
    const cell = h('div', { class: 'cell', style: { '--w': wv, '--md': md_, '--sm': sm, '--i': i || 0 } });
    cell.appendChild(buildWidget(w));
    return cell;
  }
  function grid(widgets) {
    const g = h('div', { class: 'grid' });
    arr(widgets).forEach((w, i) => g.appendChild(cellFor(w, i)));
    return g;
  }
  function buildWidget(w) {
    const type = typeOf(w);
    const fn = WIDGETS[type || 'text'];
    if (S.loading && S.building) S.loading.tickSync(w.title || type);
    S.stats.widgets++;
    let el;
    if (!fn) {
      warn(`Unbekannter Widget-Typ „${w.type}“ (id: ${w.id}).`);
      el = card(Object.assign({}, w, { title: w.title || 'Unbekanntes Widget' }), h('div', { class: 'muted', html: md(`Typ \`${esc(w.type)}\` wird nicht unterstützt. Siehe DOCS.md → „Widgets“.`) }));
    } else {
      try { el = fn(w); } catch (e) {
        console.error(e);
        warn(`Fehler beim Aufbau des Widgets „${w.id}“: ${e.message}`);
        el = card(Object.assign({}, w, { title: w.title || type }), h('div', { class: 'muted', text: '⚠ ' + e.message }));
      }
    }
    if (el && w.id && !el.getAttribute('data-ref')) el.setAttribute('data-ref', 'w:' + w.id);
    if (el && w.id) { S.widgets[w.id] = S.widgets[w.id] || {}; S.widgets[w.id].el = el; }
    if (w.title || w.label) S.search.push({ kind: 'w', title: w.title || w.label, id: w.id, page: S.buildingPage });
    return el;
  }
  const apiOf = (w, api) => { S.widgets[w.id] = Object.assign(S.widgets[w.id] || {}, { api }); return api; };

  function card(w, body, opts) {
    opts = opts || {};
    const c = h('div', { class: 'card' + (w.tone ? ' toned' : '') + (opts.cls ? ' ' + opts.cls : ''), style: w.tone ? toneStyle(w.tone) : null, ref: 'w:' + w.id });
    const tools = h('div', { class: 'card-tools' });
    arr(w.tools).forEach(b => tools.appendChild(button(Object.assign({ size: 'sm', style: 'ghost' }, typeof b === 'string' ? { label: b } : b))));
    arr(opts.tools).forEach(x => x && tools.appendChild(x));
    if (w.collapsible !== false && (w.title || opts.tools)) {
      tools.appendChild(h('button', { class: 'tool', title: t('collapse'), text: '–', onclick: () => c.classList.toggle('collapsed') }));
      if (opts.max !== false) tools.appendChild(h('button', { class: 'tool', title: t('maximize'), text: '⤢', onclick: () => maximize(c) }));
    }
    if (w.title || tools.children.length) {
      c.appendChild(h('div', { class: 'card-head' },
        w.icon ? ico(w.icon, 'card-ico') : null,
        h('div', { class: 'card-title' }, w.title || '', w.subtitle ? h('div', { class: 'card-sub', text: w.subtitle }) : null),
        tools));
    }
    const b = h('div', { class: 'card-body' + (opts.flush ? ' flush' : '') });
    if (!opts.noHeight) { if (w.h) b.style.height = px(w.h); if (w.minH) b.style.minHeight = px(w.minH); }
    add(b, [body]);
    c.appendChild(b);
    if (w.footer) {
      const f = typeof w.footer === 'string' ? h('div', { class: 'card-foot', html: md(w.footer) })
        : h('div', { class: 'card-foot' }, h('a', { href: '#', text: w.footer.label || t('details') + ' →', onclick: e => { e.preventDefault(); runAction(w.footer.action); } }));
      c.appendChild(f);
    }
    return c;
  }
  function maximize(c) {
    if (c.classList.contains('max')) { c.classList.remove('max'); document.querySelector('.max-back') && document.querySelector('.max-back').remove(); return; }
    const back = h('div', { class: 'max-back', onclick: () => maximize(c) });
    document.body.appendChild(back);
    c.classList.add('max');
  }
  function button(b) {
    if (typeof b === 'string') b = { label: b };
    const cls = ['btn', b.style || b.variant || 'secondary', b.size || ''].join(' ');
    const el = h('button', { class: cls, ref: b.id ? 'btn:' + b.id : null, title: b.tooltip || null, type: 'button' }, b.icon ? ico(b.icon, 'b-ico') : null, b.label ? h('span', { text: b.label }) : null);
    el.addEventListener('click', async e => {
      e.stopPropagation();
      if (b.busy || b.loading) {
        el.classList.add('busy'); const old = el.innerHTML; el.innerHTML = '<span class="spin"></span>' + esc(b.busyLabel || b.label || '');
        await sleep(num(b.busy || b.loading, 900) === 1 ? 900 : num(b.busy || b.loading, 900));
        el.innerHTML = old; el.classList.remove('busy');
      }
      runAction(b.action, el);
    });
    return el;
  }

  function parseAction(a) {
    if (typeof a !== 'string') return a;
    const i = a.indexOf(':');
    return i > 0 ? { type: a.slice(0, i).trim(), value: a.slice(i + 1).trim() } : { type: a.trim() };
  }
  function runAction(a, srcEl) {
    if (!a) return;
    if (Array.isArray(a)) { a.forEach(x => runAction(x, srcEl)); return; }
    a = parseAction(a);
    const val = a.value != null ? a.value : (a.to || a.text || a.href || a.target);
    switch (String(a.type || '').toLowerCase()) {
      case 'navigate': case 'page': case 'go': navigate(a.to || val); break;
      case 'toast': toast(a.text || val, a.tone || 'success'); break;
      case 'modal': case 'open': openModal(Object.assign({}, a, { text: a.text || (a.widgets || a.fields ? null : val) })); break;
      case 'url': case 'link': { const u = safeUrl(a.href || val); if (u) window.open(u, '_blank', 'noopener'); break; }
      case 'chat': openChat(true); if (a.text || val) chatSend(a.text || val); break;
      case 'confetti': confetti(); break;
      case 'finale': finale(a); break;
      case 'demo': startDemo(); break;
      case 'theme': toggleMode(); break;
      case 'log': emitLog(a.level || 'info', a.text || val, a.source); break;
      case 'notify': addNotif(a.text || val, a.tone); break;
      case 'highlight': spotlight(resolveTarget(a.target || val), 1800); break;
      case 'add': { const api = S.widgets[a.target || val] && S.widgets[a.target || val].api; if (api && api.openAdd) api.openAdd(); break; }
      case 'run': { const api = S.widgets[a.target || val] && S.widgets[a.target || val].api; if (api && api.run) api.run(); break; }
      case 'none': case '': break;
      default: warn(`Unbekannte Aktion „${a.type}“.`);
    }
    if (a.type !== 'toast' && a.toast) toast(a.toast, a.tone || 'success');
    if (a.type !== 'log' && a.log) emitLog(a.level || 'info', a.log, a.source);
    if (a.notify && a.type !== 'notify') addNotif(a.notify, a.tone);
    if (a.then) setTimeout(() => runAction(a.then, srcEl), num(a.delay, 400));
  }

  /* =====================================================================
   * 10. Toasts, Modals, Benachrichtigungen, Befehlspalette
   * ===================================================================== */
  const TONE_ICON = { success: '✓', info: 'ℹ', warning: '!', danger: '✕', primary: '•' };
  function toast(text, tone) {
    tone = tone || 'success';
    const box = document.getElementById('toasts');
    if (!box || !text) return;
    const el = h('div', { class: 'toast', style: toneStyle(tone) }, h('span', { class: 'toast-ico', text: TONE_ICON[tone] || '•' }), h('div', { html: md(text) }));
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3200);
  }
  function emitLog(level, text, source, notify) {
    emit('log', { level, text, source, time: nowTime() });
    if (notify) addNotif(text, level === 'error' ? 'danger' : level === 'warn' ? 'warning' : level);
  }
  function addNotif(text, tone) {
    if (!text) return;
    S.notifs.unshift({ text, tone: tone || 'info', time: t('justNow'), unread: true });
    S.notifs = S.notifs.slice(0, 30);
    updateBell();
  }
  function updateBell() {
    if (!S.bellDot) return;
    const n = S.notifs.filter(x => x.unread).length;
    S.bellDot.textContent = n > 9 ? '9+' : n;
    S.bellDot.classList.toggle('hidden', !n);
    if (n) { S.bellDot.classList.remove('bump'); void S.bellDot.offsetWidth; S.bellDot.classList.add('bump'); }
  }
  function closeDropdowns() { document.querySelectorAll('.dropdown').forEach(d => d.remove()); }
  function toggleNotifs(anchor) {
    if (anchor.querySelector('.dropdown')) { closeDropdowns(); return; }
    closeDropdowns();
    const list = h('div', { class: 'dd-list' });
    if (!S.notifs.length) list.appendChild(h('div', { class: 'dd-empty', text: t('noNotifs') }));
    S.notifs.forEach(n => list.appendChild(h('div', { class: 'dd-item' + (n.unread ? ' unread' : ''), style: toneStyle(n.tone || 'info'), onclick: () => { if (n.action) runAction(n.action); closeDropdowns(); } },
      h('span', { class: 'dd-dot' }), h('div', {}, h('div', { html: md(n.text) }), n.time ? h('div', { class: 'dd-time', text: n.time }) : null))));
    const dd = h('div', { class: 'dropdown', onclick: e => e.stopPropagation() },
      h('div', { class: 'dd-head' }, h('b', { text: t('notifs') }), h('button', { class: 'link-btn', text: t('markRead'), onclick: () => { S.notifs.forEach(n => (n.unread = false)); updateBell(); closeDropdowns(); } })), list);
    anchor.appendChild(dd);
  }
  function openModal(o) {
    o = o || {};
    closeModal(true);
    const sizes = { sm: '420px', md: '560px', lg: '820px', xl: '1100px' };
    const body = h('div', { class: 'modal-body' });
    if (o.text) body.appendChild(h('div', { class: 'modal-text', html: md(o.text) }));
    if (o.node) body.appendChild(o.node);
    let form = null;
    if (o.fields) { form = buildForm(o.fields, o.values || {}); body.appendChild(form.el); }
    if (o.widgets) body.appendChild(grid(o.widgets));
    const foot = h('div', { class: 'modal-foot' });
    const close = () => closeModal();
    const btns = o.buttons || (o.onSave || o.fields ? [{ label: t('cancel'), style: 'ghost', close: true, id: 'cancel' }, { label: o.saveLabel || t('save'), style: o.danger ? 'danger' : 'primary', save: true, id: 'save' }] : [{ label: t('close'), style: 'secondary', close: true, id: 'close' }]);
    btns.forEach(b => {
      const el = h('button', { class: 'btn ' + (b.style || 'secondary'), ref: 'modal:' + (b.id || slug(b.label)), type: 'button', text: b.label });
      el.onclick = () => {
        if (b.save) {
          if (form && !form.validate()) { toast(t('required'), 'warning'); return; }
          if (o.onSave && o.onSave(form ? form.get() : null) === false) return;
          if (o.saveToast) toast(o.saveToast);
          close(); return;
        }
        if (b.action) runAction(b.action);
        if (b.close !== false) close();
      };
      foot.appendChild(el);
    });
    const dlg = h('div', { class: 'modal', ref: 'modal', style: { '--mw': sizes[o.size] || px(o.size) || sizes.md } },
      h('div', { class: 'modal-head' }, o.icon ? ico(o.icon, 'card-ico') : null, h('div', { class: 'modal-title', text: o.title || '' }), h('button', { class: 'tool', ref: 'modal:x', text: '✕', onclick: close })),
      body, foot);
    const back = h('div', { class: 'modal-back', onmousedown: e => { if (e.target === back) close(); } }, dlg);
    document.body.appendChild(back);
    S.modal = back;
    setTimeout(() => { const f = dlg.querySelector('input:not([type=checkbox]):not([type=radio]),select,textarea'); if (f && !S.demoRunning) f.focus(); }, 60);
    return { close, el: dlg, form };
  }
  function closeModal(immediate) {
    if (!S.modal) return;
    const m = S.modal; S.modal = null;
    if (immediate) { m.remove(); return; }
    m.classList.add('out'); setTimeout(() => m.remove(), 180);
  }
  function showWarnings() {
    openModal({ title: '⚠ ' + t('warnings'), size: 'lg', node: h('ul', { class: 'warn-list' }, S.warnings.map(w => h('li', { text: w }))) });
  }
  function openPalette() {
    if (document.querySelector('.palette-back')) return;
    const input = h('input', { class: 'input palette-input', ref: 'palette:input', placeholder: t('searchPh') });
    const list = h('div', { class: 'palette-list' });
    const back = h('div', { class: 'palette-back', onmousedown: e => { if (e.target === back) back.remove(); } }, h('div', { class: 'palette' }, input, list));
    const entries = S.pageList.map(p => ({ kind: 'p', title: p.title, icon: p.icon, id: p.id, sub: p.parent ? p.parent.title : '' }))
      .concat(S.search.filter(x => x.page).map(x => ({ kind: 'w', title: x.title, id: x.id, page: x.page, sub: S.pages[x.page] ? S.pages[x.page].title : '' })));
    let sel = 0, shown = [];
    const go = e => { back.remove(); if (e.kind === 'p') navigate(e.id); else { navigate(e.page); setTimeout(() => { const el = document.querySelector(`[data-ref="w:${cssEsc(e.id)}"]`); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); flashEl(el); } }, 120); } };
    const render = () => {
      const q = input.value.toLowerCase().trim();
      shown = entries.filter(e => !q || (e.title + ' ' + e.sub).toLowerCase().includes(q)).slice(0, 12);
      sel = clamp(sel, 0, Math.max(0, shown.length - 1));
      list.innerHTML = '';
      if (!shown.length) list.appendChild(h('div', { class: 'dd-empty', text: t('nothing') }));
      shown.forEach((e, i) => list.appendChild(h('div', { class: 'palette-item' + (i === sel ? ' on' : ''), onclick: () => go(e), onmousemove: () => { if (sel !== i) { sel = i; render(); } } },
        h('span', { class: 'pi-ico', text: e.kind === 'p' ? (ICONS[String(e.icon || '').toLowerCase()] || e.icon || '📄') : '▦' }), h('span', { class: 'pi-title', text: e.title }), h('span', { class: 'pi-sub', text: e.sub }))));
    };
    input.addEventListener('input', () => { sel = 0; render(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel++; render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel--; render(); e.preventDefault(); }
      else if (e.key === 'Enter' && shown[sel]) go(shown[sel]);
      else if (e.key === 'Escape') back.remove();
    });
    document.body.appendChild(back);
    render();
    input.focus();
  }
  function flashEl(el) { el.classList.remove('flash-ring'); void el.offsetWidth; el.classList.add('flash-ring'); setTimeout(() => el.classList.remove('flash-ring'), 1600); }
  function toggleMode() {
    S.mode = S.mode === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', S.mode);
    try { localStorage.setItem('moqup-mode', S.mode); } catch (e) { /* privater Modus */ }
    applyColors();
  }

  /* =====================================================================
   * 11. Formulare
   * ===================================================================== */
  function buildForm(fields, values) {
    const el = h('div', { class: 'form-grid' });
    const ctrls = {};
    arr(fields).forEach((f, i) => {
      if (typeof f === 'string') f = { name: f, label: f };
      const name = f.name || f.key || 'f' + i;
      const type = (f.type || 'text').toLowerCase();
      const v = values[name] != null ? values[name] : f.value != null ? f.value : '';
      const opts = arr(f.options).map(o => (isObj(o) ? o : { value: o, label: o }));
      let input, wrapCtrl;
      if (type === 'select') {
        input = h('select', { class: 'input', ref: 'field:' + name }, f.placeholder ? h('option', { value: '', text: f.placeholder }) : null, opts.map(o => h('option', { value: o.value, text: o.label != null ? o.label : o.value })));
        input.value = v === '' && !f.placeholder && opts[0] ? opts[0].value : v;
      } else if (type === 'textarea') {
        input = h('textarea', { class: 'input', ref: 'field:' + name, rows: f.rows || 3, placeholder: f.placeholder || '' }); input.value = v;
      } else if (type === 'checkbox' || type === 'toggle' || type === 'switch' || type === 'bool') {
        input = h('input', { type: 'checkbox' }); input.checked = v === true || v === 'true' || v === 1;
        wrapCtrl = h('label', { class: type === 'checkbox' ? 'check' : 'switch', ref: 'field:' + name }, input, type === 'checkbox' ? null : h('span', { class: 'track' }), h('span', { text: f.text || f.label || '' }));
      } else if (type === 'radio') {
        const g = h('div', { class: 'radio-row', ref: 'field:' + name });
        opts.forEach((o, k) => g.appendChild(h('label', { class: 'check', ref: 'opt:' + o.value }, h('input', { type: 'radio', name: name + uid(), value: o.value, checked: (v === '' ? k === 0 : String(v) === String(o.value)) || null }), h('span', { text: o.label != null ? o.label : o.value }))));
        input = { get value() { const c = g.querySelector('input:checked'); return c ? c.value : ''; }, set value(x) { g.querySelectorAll('input').forEach(r => (r.checked = r.value === String(x))); } };
        wrapCtrl = g;
      } else if (type === 'range') {
        const out = h('span', { class: 'range-val' });
        input = h('input', { type: 'range', class: 'range', ref: 'field:' + name, min: f.min != null ? f.min : 0, max: f.max != null ? f.max : 100, step: f.step || 1 });
        input.value = v === '' ? (f.min || 0) : v; out.textContent = input.value + (f.unit ? ' ' + f.unit : '');
        input.addEventListener('input', () => (out.textContent = input.value + (f.unit ? ' ' + f.unit : '')));
        wrapCtrl = h('div', { class: 'range-row' }, input, out);
      } else if (type === 'file') {
        input = h('input', { type: 'file', class: 'input file', ref: 'field:' + name });
      } else {
        const map = { number: 'number', email: 'email', tel: 'tel', phone: 'tel', password: 'password', date: 'date', time: 'time', datetime: 'datetime-local', color: 'color', url: 'url', money: 'number' };
        input = h('input', { class: 'input', ref: 'field:' + name, type: map[type] || 'text', placeholder: f.placeholder || '', min: f.min, max: f.max, step: f.step });
        input.value = v;
      }
      ctrls[name] = { input, f, type };
      const showLabel = !(type === 'checkbox' || type === 'toggle' || type === 'switch' || type === 'bool');
      el.appendChild(h('div', { class: 'field', style: { '--fw': span(f.w, 12) } },
        showLabel && f.label !== false ? h('label', { class: 'lbl' }, f.label || name, f.required ? h('span', { class: 'req', text: ' *' }) : null) : null,
        wrapCtrl || input,
        f.help ? h('div', { class: 'help', text: f.help }) : null));
    });
    return {
      el,
      get() { const o = {}; for (const k in ctrls) { const c = ctrls[k]; o[k] = c.input.type === 'checkbox' ? c.input.checked : (c.type === 'number' || c.type === 'money') && c.input.value !== '' ? Number(c.input.value) : c.input.value; } return o; },
      validate() {
        let ok = true;
        for (const k in ctrls) {
          const c = ctrls[k], fld = el.children[Object.keys(ctrls).indexOf(k)];
          const bad = c.f.required && c.input.type !== 'checkbox' && !String(c.input.value || '').trim();
          if (fld) fld.classList.toggle('invalid', !!bad);
          if (bad) ok = false;
        }
        return ok;
      },
      reset() { for (const k in ctrls) { const c = ctrls[k]; if (c.input.type === 'checkbox') c.input.checked = !!c.f.value; else if (c.type !== 'radio' && c.type !== 'select') c.input.value = c.f.value || ''; } },
    };
  }

  /* =====================================================================
   * 12. Diagramme (SVG ohne Bibliotheken)
   * ===================================================================== */
  function niceScale(min, max, count) {
    if (max === min) { max = min + 1; }
    const step0 = (max - min) / count, mag = Math.pow(10, Math.floor(Math.log10(step0))), nrm = step0 / mag;
    const step = (nrm <= 1 ? 1 : nrm <= 2 ? 2 : nrm <= 2.5 ? 2.5 : nrm <= 5 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
    return { min: lo, max: hi, ticks };
  }
  function smoothPath(p, smooth) {
    if (!p.length) return '';
    if (p.length < 3 || !smooth) return 'M' + p.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L');
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2, k = 0.18;
      d += ` C${(p1[0] + (p2[0] - p0[0]) * k).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) * k).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) * k).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) * k).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }
  function seriesOf(w) {
    let series = arr(w.series).map((sr, i) => ({ name: sr.name || `#${i + 1}`, data: arr(sr.data).map(Number), color: cssColor(sr.color) || `var(--c${i % 8 + 1})`, type: sr.type }));
    if (!series.length && Array.isArray(w.data) && !isObj(w.data[0])) series = [{ name: w.title || '', data: w.data.map(Number), color: cssColor(w.color) || 'var(--c1)' }];
    return series;
  }
  function xyChart(w, W, H, anim, tip, kind) {
    const labels = arr(w.labels), series = seriesOf(w);
    const n = Math.max(labels.length, ...series.map(x => x.data.length), 1);
    const stacked = !!w.stacked && kind === 'bar';
    const all = series.flatMap(x => x.data.filter(isFinite));
    const max = stacked ? Math.max(0, ...Array.from({ length: n }, (_, i) => series.reduce((a, x) => a + (x.data[i] || 0), 0))) : Math.max(0, ...all);
    const min = Math.min(0, ...all);
    const sc = niceScale(min, max, H < 200 ? 3 : 4);
    const pad = { l: 44, r: 12, t: 12, b: 26 }, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const y = v => pad.t + ih - (v - sc.min) / (sc.max - sc.min) * ih;
    const isBar = kind === 'bar', band = iw / n;
    const x = i => isBar ? pad.l + band * i + band / 2 : pad.l + (n <= 1 ? iw / 2 : i * iw / (n - 1));
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    const defs = s('defs');
    svg.appendChild(defs);
    sc.ticks.forEach(tk => { svg.appendChild(s('line', { x1: pad.l, x2: W - pad.r, y1: y(tk), y2: y(tk), class: 'gridline' })); svg.appendChild(s('text', { x: pad.l - 8, y: y(tk) + 4, 'text-anchor': 'end' }, compact(tk))); });
    const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(iw / 58))));
    labels.forEach((l, i) => { if (i % every === 0) svg.appendChild(s('text', { x: x(i), y: H - 6, 'text-anchor': 'middle' }, String(l))); });
    if (isBar) {
      const gs = series.length || 1;
      const bw = stacked ? Math.min(38, band * 0.62) : Math.min(30, band * 0.78 / gs);
      for (let i = 0; i < n; i++) {
        let acc = 0;
        series.forEach((sr, si) => {
          const v = sr.data[i] || 0;
          let bx, by, bh;
          if (stacked) { by = y(acc + v); bh = y(acc) - y(acc + v); bx = x(i) - bw / 2; acc += v; }
          else { bx = x(i) - bw * gs / 2 + si * bw + 1; by = y(Math.max(v, 0)); bh = Math.abs(y(v) - y(0)); }
          svg.appendChild(s('rect', { x: bx, y: by, width: Math.max(1, bw - (stacked ? 0 : 2)), height: Math.max(0, bh), rx: Math.min(5, bw / 3), fill: sr.color, class: anim ? 'grow' : null, style: anim ? `animation-delay:${i * 35 + si * 60}ms` : null }));
        });
      }
    } else {
      series.forEach(sr => {
        const pts = sr.data.map((v, i) => [x(i), y(v || 0)]);
        const d = smoothPath(pts, w.smooth !== false);
        if (kind === 'area' || sr.type === 'area') {
          const gid = uid('g');
          defs.appendChild(s('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, s('stop', { offset: '0%', 'stop-color': sr.color, 'stop-opacity': 0.38 }), s('stop', { offset: '100%', 'stop-color': sr.color, 'stop-opacity': 0 })));
          const base = y(Math.max(0, sc.min));
          if (pts.length) svg.appendChild(s('path', { d: `${d} L${pts[pts.length - 1][0]},${base} L${pts[0][0]},${base} Z`, fill: `url(#${gid})`, class: anim ? 'fade' : null }));
        }
        const p = s('path', { d, class: 'line', stroke: sr.color });
        svg.appendChild(p);
        if (anim) requestAnimationFrame(() => { try { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.classList.add('draw'); } catch (e) { /* ok */ } });
        if (n <= 20) pts.forEach(pt => svg.appendChild(s('circle', { cx: pt[0], cy: pt[1], r: 3, fill: 'var(--surface)', stroke: sr.color, 'stroke-width': 2, class: anim ? 'fade' : null })));
      });
    }
    const hl = s('line', { y1: pad.t, y2: pad.t + ih, stroke: 'var(--muted)', 'stroke-dasharray': '3 3', opacity: 0 });
    svg.appendChild(hl);
    const ov = s('rect', { x: pad.l, y: pad.t, width: Math.max(0, iw), height: Math.max(0, ih), fill: 'transparent' });
    svg.appendChild(ov);
    const fo = { currency: w.currency, unit: w.unit, suffix: w.suffix, prefix: w.prefix };
    ov.addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect(), mx = e.clientX - r.left;
      const i = clamp(isBar ? Math.floor((mx - pad.l) / band) : Math.round((mx - pad.l) / (iw / Math.max(1, n - 1))), 0, n - 1);
      hl.setAttribute('x1', x(i)); hl.setAttribute('x2', x(i)); hl.setAttribute('opacity', isBar ? 0 : 1);
      tip.innerHTML = `<b>${esc(labels[i] != null ? labels[i] : '')}</b>` + series.map(sr => `<div><i style="background:${sr.color}"></i>${esc(sr.name)}: <b>${esc(fmtNum(sr.data[i], fo))}</b></div>`).join('');
      tip.style.left = clamp(x(i), 70, W - 70) + 'px';
      tip.style.top = Math.max(10, Math.min(...series.map(sr => y(sr.data[i] || 0)))) + 'px';
      tip.style.opacity = 1;
    });
    ov.addEventListener('pointerleave', () => { tip.style.opacity = 0; hl.setAttribute('opacity', 0); });
    return svg;
  }
  function pieData(w) {
    if (Array.isArray(w.data) && isObj(w.data[0])) return w.data.map((d, i) => ({ label: d.label || d.name || '', value: Number(d.value) || 0, color: cssColor(d.color) || `var(--c${i % 8 + 1})` }));
    const vals = Array.isArray(w.values) ? w.values : (w.series && w.series[0] ? w.series[0].data : w.data) || [];
    return arr(w.labels).map((l, i) => ({ label: l, value: Number(vals[i]) || 0, color: `var(--c${i % 8 + 1})` }));
  }
  function pieChart(w, W, H, anim, tip, kind) {
    const data = pieData(w), total = data.reduce((a, d) => a + d.value, 0) || 1;
    const size = Math.min(W, H), cx = W / 2, cy = size / 2, r = size / 2 - 6;
    const donut = kind === 'donut';
    const sw = donut ? r * 0.34 : r, R = donut ? r - sw / 2 : r / 2, C = 2 * Math.PI * R;
    const svg = s('svg', { width: W, height: size, viewBox: `0 0 ${W} ${size}` });
    let acc = 0;
    data.forEach((d, i) => {
      const len = d.value / total * C;
      const c = s('circle', { cx, cy, r: R, fill: 'none', 'stroke-width': sw, stroke: d.color, 'stroke-dasharray': anim ? `0 ${C}` : `${len} ${C - len}`, 'stroke-dashoffset': -acc, transform: `rotate(-90 ${cx} ${cy})`, class: 'seg' });
      c.style.transition = `stroke-dasharray .9s cubic-bezier(.2,.8,.2,1) ${i * 90}ms`;
      if (anim) requestAnimationFrame(() => requestAnimationFrame(() => c.setAttribute('stroke-dasharray', `${len} ${C - len}`)));
      c.addEventListener('pointermove', e => {
        const rb = svg.getBoundingClientRect();
        tip.innerHTML = `<div><i style="background:${d.color}"></i>${esc(d.label)}: <b>${esc(fmtNum(d.value, { currency: w.currency, unit: w.unit }))}</b> (${(d.value / total * 100).toFixed(1)}%)</div>`;
        tip.style.left = (e.clientX - rb.left) + 'px'; tip.style.top = (e.clientY - rb.top - 8) + 'px'; tip.style.opacity = 1;
      });
      c.addEventListener('pointerleave', () => (tip.style.opacity = 0));
      svg.appendChild(c);
      acc += len;
    });
    if (donut) {
      svg.appendChild(s('text', { x: cx, y: cy + 2, 'text-anchor': 'middle', class: 'pie-total' }, w.center != null ? String(w.center) : compact(data.reduce((a, d) => a + d.value, 0))));
      svg.appendChild(s('text', { x: cx, y: cy + 20, 'text-anchor': 'middle', class: 'pie-label' }, w.centerLabel || ''));
    }
    return svg;
  }

  /* =====================================================================
   * 13. Widgets
   * ===================================================================== */
  const WIDGETS = {};

  WIDGETS.stat = w => {
    const tone = w.color || w.tone || 'primary';
    const clickable = !!w.action;
    const valEl = h('div', { class: 's-value' });
    const fo = { prefix: w.prefix, suffix: w.suffix, unit: w.unit, currency: w.currency, decimals: w.decimals };
    if (typeof w.value === 'number') { valEl.textContent = fmtNum(0, fo); whenVisible(valEl, () => countUp(valEl, w.value, fo)); }
    else valEl.textContent = w.value != null ? String(w.value) : '—';
    let trend = null;
    if (w.trend != null) {
      const tr = isObj(w.trend) ? w.trend : { value: w.trend };
      const sv = String(tr.value);
      let tt = tr.tone || (/^\s*[-−]/.test(sv) ? 'danger' : /^\s*\+/.test(sv) ? 'success' : 'muted');
      if (w.inverse && !tr.tone) tt = tt === 'danger' ? 'success' : tt === 'success' ? 'danger' : tt;
      trend = h('div', { class: 's-trend', style: toneStyle(tt) }, h('span', { class: 's-arrow', text: tt === 'success' ? (w.inverse ? '▼' : '▲') : tt === 'danger' ? (w.inverse ? '▲' : '▼') : '•' }), ' ' + sv, tr.text || w.trendText ? h('span', { class: 'muted', text: ' ' + (tr.text || w.trendText) }) : null);
    }
    let spark = null;
    if (Array.isArray(w.spark) && w.spark.length > 1) {
      const d = w.spark.map(Number), mn = Math.min(...d), mx = Math.max(...d), rg = mx - mn || 1;
      const pts = d.map((v, i) => [i / (d.length - 1) * 100, 36 - (v - mn) / rg * 32]);
      const line = smoothPath(pts, true), gid = uid('sp');
      spark = s('svg', { class: 's-spark', viewBox: '0 0 100 40', preserveAspectRatio: 'none' },
        s('defs', {}, s('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, s('stop', { offset: '0%', 'stop-color': 'var(--tone)', 'stop-opacity': 0.35 }), s('stop', { offset: '100%', 'stop-color': 'var(--tone)', 'stop-opacity': 0 }))),
        s('path', { d: line + ' L100,40 L0,40 Z', fill: `url(#${gid})` }),
        s('path', { d: line, fill: 'none', stroke: 'var(--tone)', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }));
    }
    let prog = null;
    if (w.progress != null) {
      const bar = h('i', { style: { width: '0%' } });
      prog = h('div', {}, h('div', { class: 's-bar' }, bar), w.progressText ? h('div', { class: 's-foot', text: w.progressText }) : null);
      whenVisible(bar, () => setTimeout(() => (bar.style.width = clamp(num(w.progress, 0), 0, 100) + '%'), 60));
    }
    const el = h('div', { class: `stat ${w.variant || ''}${clickable ? ' clickable' : ''}`, style: toneStyle(tone), ref: 'w:' + w.id, onclick: clickable ? () => runAction(w.action) : null },
      h('div', { class: 's-top' }, h('div', { class: 's-main' }, h('div', { class: 's-label', text: w.label || w.title || '' }), valEl), w.icon ? ico(w.icon, 's-icon') : null),
      trend, prog, spark,
      w.footer ? h('div', { class: 's-foot', text: typeof w.footer === 'string' ? w.footer : (w.footer.label || '') }) : null,
      clickable ? h('div', { class: 's-more', text: '→' }) : null);
    return el;
  };

  WIDGETS.chart = w => {
    const kind = String(w.kind || w.chart || 'line').toLowerCase();
    const round = kind === 'pie' || kind === 'donut';
    const box = h('div', { class: 'chart' });
    const tip = h('div', { class: 'chart-tip' });
    const legend = h('div', { class: 'legend' });
    const H = num(w.h, round ? 220 : 260);
    let first = true;
    box.appendChild(tip);
    observeSize(box, W => {
      const old = box.querySelector('svg'); if (old) old.remove();
      const svg = round ? pieChart(w, W, H, first, tip, kind) : xyChart(w, W, H, first, tip, kind);
      box.insertBefore(svg, tip);
      first = false;
    });
    if (w.legend !== false) {
      if (round) {
        const data = pieData(w), tot = data.reduce((a, d) => a + d.value, 0) || 1;
        data.forEach(d => legend.appendChild(h('span', {}, h('i', { style: { background: d.color } }), d.label + ' ', h('b', { text: Math.round(d.value / tot * 100) + '%' }))));
      } else if (seriesOf(w).length > 1 || w.legend === true) seriesOf(w).forEach(sr => legend.appendChild(h('span', {}, h('i', { style: { background: sr.color } }), sr.name)));
    }
    S.stats.charts++;
    return card(w, h('div', {}, box, legend.children.length ? legend : null), { noHeight: true });
  };

  WIDGETS.gauge = w => {
    const mn = num(w.min, 0), mx = num(w.max, 100), v = clamp(num(w.value, 0), mn, mx), pct = (v - mn) / (mx - mn || 1);
    let tone = w.tone || w.color;
    if (!tone && Array.isArray(w.thresholds)) w.thresholds.slice().sort((a, b) => a.value - b.value).forEach(th => { if (v >= th.value) tone = th.tone; });
    const L = Math.PI * 80;
    const fg = s('path', { d: 'M20,100 A80,80 0 0 1 180,100', fill: 'none', stroke: cssColor(tone || 'primary'), 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L, class: 'gauge-fg' });
    const valT = s('text', { x: 100, y: 92, 'text-anchor': 'middle', class: 'gauge-val' }, fmtNum(v, { unit: w.unit, suffix: w.suffix }));
    const svg = s('svg', { viewBox: '0 0 200 118', class: 'gauge' },
      s('path', { d: 'M20,100 A80,80 0 0 1 180,100', fill: 'none', stroke: 'var(--surface-2)', 'stroke-width': 16, 'stroke-linecap': 'round' }), fg, valT,
      s('text', { x: 20, y: 116, 'text-anchor': 'middle', class: 'gauge-mm' }, String(mn)), s('text', { x: 180, y: 116, 'text-anchor': 'middle', class: 'gauge-mm' }, String(mx)));
    whenVisible(svg, () => setTimeout(() => fg.setAttribute('stroke-dashoffset', L * (1 - pct)), 80));
    return card(w, h('div', { class: 'gauge-wrap' }, svg, w.label ? h('div', { class: 'gauge-label', text: w.label }) : null));
  };

  WIDGETS.progress = w => {
    const box = h('div', { class: 'progress-list' });
    arr(w.items).forEach(it => {
      const max = num(it.max, 100), val = num(it.value, 0), pct = clamp(val / (max || 1) * 100, 0, 100);
      const bar = h('i', { style: { width: '0%' } });
      box.appendChild(h('div', { class: 'pg', style: toneStyle(it.tone || it.color || (pct > 90 ? 'danger' : pct > 75 ? 'warning' : 'primary')) },
        h('div', { class: 'pg-top' }, h('span', { text: it.label || '' }), h('span', { class: 'muted', text: it.meta || (max === 100 ? Math.round(pct) + '%' : `${fmtNum(val)} / ${fmtNum(max)}${it.unit ? ' ' + it.unit : ''}`) })),
        h('div', { class: 'mini-bar' }, bar)));
      whenVisible(bar, () => setTimeout(() => (bar.style.width = pct + '%'), 60));
    });
    return card(w, box);
  };

  WIDGETS.funnel = w => {
    const st = arr(w.stages || w.items), max = Math.max(1, ...st.map(x => num(x.value, 0)));
    const box = h('div', { class: 'funnel' });
    st.forEach((x, i) => {
      const v = num(x.value, 0), prev = i ? num(st[i - 1].value, 0) : null;
      box.appendChild(h('div', { class: 'fn-row' },
        h('div', { class: 'fn-label', text: x.label || '' }),
        h('div', { class: 'fn-track' }, h('div', { class: 'fn-bar', style: Object.assign({ width: Math.max(6, v / max * 100) + '%', '--i': i }, toneStyle(x.tone || x.color || `c${i % 8 + 1}`)) }, h('span', { text: fmtNum(v, { currency: w.currency, unit: w.unit }) }))),
        h('div', { class: 'fn-conv muted', text: prev ? Math.round(v / prev * 100) + '%' : '' })));
    });
    return card(w, box);
  };

  WIDGETS.heatmap = w => {
    const rows = arr(w.rows), cols = arr(w.cols || w.columns), data = arr(w.data);
    const all = data.flat().map(Number).filter(isFinite), mn = Math.min(...all, 0), mx = Math.max(...all, 1);
    const g = h('div', { class: 'heat', style: { gridTemplateColumns: `auto repeat(${cols.length || (data[0] || []).length}, minmax(0,1fr))`, '--tone': cssColor(w.tone || w.color || 'primary') } });
    g.appendChild(h('span'));
    cols.forEach(c => g.appendChild(h('span', { class: 'heat-h', text: c })));
    data.forEach((r, ri) => {
      g.appendChild(h('span', { class: 'heat-r', text: rows[ri] != null ? rows[ri] : '' }));
      arr(r).forEach((v, ci) => {
        const p = Math.round(((Number(v) - mn) / (mx - mn || 1)) * 85 + 8);
        g.appendChild(h('i', { title: `${rows[ri] || ''} · ${cols[ci] || ''}: ${fmtNum(v, { unit: w.unit })}`, style: { background: `color-mix(in srgb, var(--tone) ${p}%, var(--surface-2))`, '--i': ri * 3 + ci } }, w.showValues ? h('em', { text: fmtNum(v) }) : null));
      });
    });
    return card(w, h('div', { style: { '--tone': cssColor(w.tone || w.color || 'primary') } }, g, h('div', { class: 'heat-legend muted' }, fmtNum(mn), h('span', { class: 'heat-scale' }), fmtNum(mx) + (w.unit ? ' ' + w.unit : ''))));
  };

  WIDGETS.table = w => {
    const cols = arr(w.columns).map(c => (typeof c === 'string' ? { key: c, label: c } : Object.assign({}, c))).map(c => Object.assign(c, { key: c.key != null ? c.key : c.label, label: c.label != null ? c.label : c.key }));
    if (!cols.length && arr(w.rows).length && isObj(w.rows[0])) Object.keys(w.rows[0]).forEach(k => cols.push({ key: k, label: k }));
    let rows = arr(w.rows).map(r => (Array.isArray(r) ? Object.fromEntries(cols.map((c, j) => [c.key, r[j]])) : Object.assign({}, r))).map(r => Object.assign(r, { __id: uid('r') }));
    const crud = w.crud === true ? { create: true, edit: true, delete: true } : isObj(w.crud) ? w.crud : {};
    const st = { q: '', sort: null, dir: 1, page: 0, filters: {}, sel: new Set() };
    const pageSize = num(w.pageSize, 8);
    const selectable = !!w.selectable || !!crud.delete;
    const cur = w.currency;
    const label = w.title || t('records');
    S.stats.tables += crud.create || crud.edit || crud.delete ? 1 : 0;

    const cellView = (c, v, r) => {
      const type = (c.type || 'text').toLowerCase();
      if (v == null || v === '') return h('span', { class: 'muted', text: '—' });
      switch (type) {
        case 'badge': case 'status': return badge(v, (c.tones && c.tones[v]) || autoTone(v));
        case 'money': return h('span', { class: 'num', text: fmtNum(v, { currency: c.currency || cur, decimals: c.decimals }) });
        case 'number': return h('span', { class: 'num', text: fmtNum(v, { unit: c.unit, decimals: c.decimals }) });
        case 'percent': return h('span', { class: 'num', text: fmtNum(v, { suffix: '%' }) });
        case 'progress': { const p = clamp(num(v, 0), 0, 100); return h('div', { class: 'cell-prog', style: toneStyle(p > 90 ? 'danger' : p > 75 ? 'warning' : 'primary') }, h('div', { class: 'mini-bar' }, h('i', { style: { width: p + '%' } })), h('span', { class: 'muted', text: Math.round(p) + '%' })); }
        case 'avatar': return h('div', { class: 'cell-avatar' }, h('span', { class: 'avatar sm', style: { background: hashTone(v) }, text: initials(v) }), h('div', {}, h('div', { text: v }), c.sub && r[c.sub] ? h('div', { class: 'muted small', text: r[c.sub] }) : null));
        case 'bool': return h('span', { class: 'bool ' + (v === true || v === 'true' || v === 1 ? 'yes' : 'no'), text: v === true || v === 'true' || v === 1 ? '✓' : '✕' });
        case 'tags': return h('span', {}, (Array.isArray(v) ? v : String(v).split(',')).map(x => h('span', { class: 'tag', text: String(x).trim() })));
        case 'date': return h('span', { text: fmtDate(v) });
        case 'rating': return h('span', { class: 'rating', text: '★'.repeat(clamp(Math.round(num(v, 0)), 0, 5)) + '☆'.repeat(5 - clamp(Math.round(num(v, 0)), 0, 5)) });
        case 'code': return h('code', { text: v });
        case 'link': return h('a', { href: '#', text: v, onclick: e => { e.preventDefault(); e.stopPropagation(); runAction(c.action ? (typeof c.action === 'string' ? c.action.replace(/\{(\w+)\}/g, (m, k) => r[k] != null ? r[k] : '') : c.action) : null); } });
        default: return h('span', { text: v });
      }
    };
    const fieldsFromCols = () => cols.filter(c => c.editable !== false && !c.computed).map(c => {
      const type = (c.type || 'text').toLowerCase();
      const opts = c.options || ((type === 'badge' || type === 'status') ? [...new Set(rows.map(r => r[c.key]).filter(x => x != null && x !== ''))] : null);
      return { name: c.key, label: c.label, required: !!c.required, placeholder: c.placeholder,
        type: opts && opts.length ? 'select' : ({ money: 'number', number: 'number', percent: 'number', progress: 'number', rating: 'number', date: 'date', bool: 'toggle' }[type] || 'text'), options: opts, value: c.default };
    });
    const logIt = (txt, lvl) => emitLog(lvl || 'success', `${label}: ${txt}`, w.logSource || 'CRUD', true);
    const firstVal = r => { const c = cols.find(c => typeof r[c.key] === 'string' || typeof r[c.key] === 'number'); return c ? r[c.key] : ''; };

    const tbody = h('tbody');
    const headRow = h('tr');
    const info = h('span');
    const pager = h('div', { class: 'pager' });
    const bulk = h('button', { class: 'btn danger sm hidden', ref: 'bulk-delete', onclick: () => confirmDelete([...st.sel]) });
    const table = h('table', { class: 'tbl' + (w.stack === false ? '' : ' stack') }, h('thead', {}, headRow), tbody);

    const filtered = () => {
      let r = rows;
      const q = st.q.toLowerCase();
      if (q) r = r.filter(x => cols.some(c => String(x[c.key] == null ? '' : x[c.key]).toLowerCase().includes(q)));
      for (const k in st.filters) if (st.filters[k]) r = r.filter(x => String(x[k]) === st.filters[k]);
      if (st.sort) {
        const k = st.sort;
        r = r.slice().sort((a, b) => { const A = a[k], B = b[k]; return (typeof A === 'number' && typeof B === 'number' ? A - B : String(A == null ? '' : A).localeCompare(String(B == null ? '' : B), S.locale, { numeric: true })) * st.dir; });
      }
      return r;
    };
    const renderHead = () => {
      headRow.innerHTML = '';
      if (selectable) {
        const cb = h('input', { type: 'checkbox', onchange: () => { const vis = filtered().slice(st.page * pageSize, st.page * pageSize + pageSize); vis.forEach(r => (cb.checked ? st.sel.add(r.__id) : st.sel.delete(r.__id))); render(); } });
        headRow.appendChild(h('th', { class: 'chk' }, cb));
      }
      cols.forEach(c => {
        const sortable = c.sortable !== false;
        const th = h('th', { class: (sortable ? 'sortable ' : '') + (/money|number|percent/.test(c.type || '') ? 'num' : ''), style: c.width ? { width: px(c.width) } : null, onclick: sortable ? () => { if (st.sort === c.key) st.dir *= -1; else { st.sort = c.key; st.dir = 1; } renderHead(); render(); } : null },
          c.label, st.sort === c.key ? h('span', { class: 'sort-ind', text: st.dir > 0 ? ' ▲' : ' ▼' }) : null);
        headRow.appendChild(th);
      });
      if (crud.edit || crud.delete || arr(w.rowActions).length) headRow.appendChild(h('th', { class: 'num', text: '' }));
    };
    const render = (flashId) => {
      const all = filtered();
      const pages = Math.max(1, Math.ceil(all.length / pageSize));
      st.page = clamp(st.page, 0, pages - 1);
      const vis = all.slice(st.page * pageSize, st.page * pageSize + pageSize);
      tbody.innerHTML = '';
      if (!vis.length) tbody.appendChild(h('tr', {}, h('td', { colspan: cols.length + 2, class: 'empty-row', text: w.emptyText || t('nothing') })));
      vis.forEach((r, i) => {
        const tr = h('tr', { ref: 'row:' + i, class: (r.__id === flashId ? 'flash ' : '') + (w.rowAction !== false ? 'clickable' : ''), onclick: () => rowClick(r) });
        if (selectable) tr.appendChild(h('td', { class: 'chk', onclick: e => e.stopPropagation() }, h('input', { type: 'checkbox', checked: st.sel.has(r.__id) || null, onchange: e => { e.target.checked ? st.sel.add(r.__id) : st.sel.delete(r.__id); updBulk(); } })));
        cols.forEach(c => tr.appendChild(h('td', { 'data-label': c.label, class: /money|number|percent/.test(c.type || '') ? 'num' : null }, cellView(c, r[c.key], r))));
        if (crud.edit || crud.delete || arr(w.rowActions).length) {
          const ra = h('div', { class: 'row-actions' });
          arr(w.rowActions).forEach(b => { const bb = button(Object.assign({ size: 'sm', style: 'ghost' }, typeof b === 'string' ? { label: b } : b)); ra.appendChild(bb); });
          if (crud.edit) ra.appendChild(h('button', { class: 'tool', ref: 'edit', title: t('edit'), text: '✎', onclick: e => { e.stopPropagation(); openEdit(r); } }));
          if (crud.delete) ra.appendChild(h('button', { class: 'tool danger', ref: 'delete', title: t('del'), text: '🗑', onclick: e => { e.stopPropagation(); confirmDelete([r.__id]); } }));
          tr.appendChild(h('td', { class: 'num actions-td', 'data-label': '' }, ra));
        }
        tbody.appendChild(tr);
      });
      info.textContent = `${all.length ? st.page * pageSize + 1 : 0}–${st.page * pageSize + vis.length} ${t('of')} ${all.length}`;
      pager.innerHTML = '';
      if (pages > 1) {
        pager.appendChild(h('button', { class: 'btn sm ghost', text: '‹', disabled: st.page === 0 || null, onclick: () => { st.page--; render(); } }));
        for (let p = 0; p < pages; p++) if (pages <= 7 || Math.abs(p - st.page) < 2 || p === 0 || p === pages - 1) pager.appendChild(h('button', { class: 'btn sm ' + (p === st.page ? 'primary' : 'ghost'), text: p + 1, onclick: () => { st.page = p; render(); } }));
        pager.appendChild(h('button', { class: 'btn sm ghost', text: '›', disabled: st.page >= pages - 1 || null, onclick: () => { st.page++; render(); } }));
      }
      updBulk();
    };
    const updBulk = () => { bulk.classList.toggle('hidden', !st.sel.size); bulk.textContent = `🗑 ${t('del')} (${st.sel.size})`; };
    const rowClick = r => {
      if (w.rowAction === false) return;
      if (w.rowAction && w.rowAction !== 'details' && w.rowAction !== 'edit') {
        const a = typeof w.rowAction === 'string' ? w.rowAction.replace(/\{(\w+)\}/g, (m, k) => r[k] != null ? r[k] : '') : w.rowAction;
        return runAction(a);
      }
      if (w.rowAction === 'edit' && crud.edit) return openEdit(r);
      const dl = h('div', { class: 'kv' });
      cols.forEach(c => dl.appendChild(h('div', { class: 'kv-row' }, h('div', { class: 'kv-k', text: c.label }), h('div', { class: 'kv-v' }, cellView(c, r[c.key], r)))));
      openModal({ title: String(firstVal(r)), node: dl, buttons: [].concat(crud.edit ? [{ label: '✎ ' + t('edit'), style: 'primary', id: 'edit', action: () => {} }] : [], [{ label: t('close'), id: 'close' }]) });
      if (crud.edit) { const eb = document.querySelector('[data-ref="modal:edit"]'); if (eb) eb.onclick = () => { closeModal(true); openEdit(r); }; }
    };
    const openEdit = r => openModal({ title: t('edit') + ': ' + firstVal(r), fields: fieldsFromCols(), values: r, icon: '✎',
      onSave: v => { Object.assign(r, v); render(r.__id); toast(t('saved')); logIt(`${t('edit').toLowerCase()} «${firstVal(r)}»`, 'info'); } });
    const openAdd = () => openModal({ title: w.addTitle || t('newItem'), fields: fieldsFromCols(), values: {}, icon: '＋',
      onSave: v => { api.addRow(v); } });
    const confirmDelete = ids => openModal({ title: ids.length > 1 ? t('confirmDelN', { n: ids.length }) : t('confirmDel'), icon: '🗑', danger: true, saveLabel: t('confirm'),
      text: ids.length === 1 ? '**' + esc(firstVal(rows.find(r => r.__id === ids[0]) || {})) + '**' : '', onSave: () => {
        const trs = [...tbody.querySelectorAll('tr')];
        const vis = filtered().slice(st.page * pageSize, st.page * pageSize + pageSize);
        vis.forEach((r, i) => { if (ids.includes(r.__id) && trs[i]) trs[i].classList.add('removing'); });
        setTimeout(() => { rows = rows.filter(r => !ids.includes(r.__id)); ids.forEach(id => st.sel.delete(id)); render(); }, 320);
        toast(t('deleted'), 'info'); logIt(`${t('del').toLowerCase()} (${ids.length})`, 'warn');
      } });
    const api = apiOf(w, {
      addRow(v, silent) {
        const r = Object.assign({}, v, { __id: uid('r') });
        cols.forEach(c => { if (r[c.key] == null && c.default != null) r[c.key] = c.default; if (c.auto === 'id') r[c.key] = (c.prefix || '#') + (1000 + rows.length + Math.floor(Math.random() * 900)); });
        rows.unshift(r); st.page = 0; st.q = ''; if (search) search.value = ''; render(r.__id);
        if (!silent) { toast(t('added') + ': **' + esc(firstVal(r)) + '**'); logIt(`${t('created')} «${firstVal(r)}»`); }
        return r;
      }, openAdd, rows: () => rows,
    });

    let search = null;
    const tools = h('div', { class: 'tbl-tools' });
    if (w.search !== false) { search = h('input', { class: 'input', ref: 'search', placeholder: '🔍 ' + t('search'), oninput: e => { st.q = e.target.value; st.page = 0; render(); } }); tools.appendChild(search); }
    cols.filter(c => c.filter).forEach(c => {
      const vals = [...new Set(rows.map(r => r[c.key]).filter(x => x != null && x !== ''))];
      tools.appendChild(h('select', { class: 'input', ref: 'filter:' + c.key, onchange: e => { st.filters[c.key] = e.target.value; st.page = 0; render(); } }, h('option', { value: '', text: c.label + ': ' + t('all') }), vals.map(v => h('option', { value: v, text: v }))));
    });
    tools.appendChild(h('div', { class: 'spacer' }));
    tools.appendChild(bulk);
    if (w.export) tools.appendChild(h('button', { class: 'btn sm ghost', ref: 'export', text: '⇩ ' + t('export'), onclick: () => {
      const csv = [cols.map(c => c.label)].concat(filtered().map(r => cols.map(c => r[c.key] == null ? '' : r[c.key]))).map(l => l.map(x => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\n');
      const a = h('a', { href: URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })), download: slug(label || 'export') + '.csv' }); a.click();
    } }));
    if (crud.create) tools.appendChild(h('button', { class: 'btn primary sm', ref: 'add', onclick: openAdd }, '＋ ' + (w.addLabel || t('add'))));
    renderHead(); render();
    const wrap = h('div', { class: 'tbl-wrap', style: w.h ? { maxHeight: px(w.h) } : null }, table);
    const body = h('div', {}, w.search === false && !crud.create && !cols.some(c => c.filter) && !w.export ? null : tools, wrap, h('div', { class: 'tbl-foot' }, info, pager));
    return card(w, body, { flush: true, noHeight: true });
  };

  WIDGETS.form = w => {
    const form = buildForm(w.fields, w.values || {});
    const sub = isObj(w.submit) ? w.submit : { label: typeof w.submit === 'string' ? w.submit : null };
    const btn = h('button', { class: 'btn primary', type: 'submit', ref: 'submit' }, sub.icon ? ico(sub.icon, 'b-ico') : null, sub.label || t('save'));
    const el = h('form', { class: 'form', onsubmit: async e => {
      e.preventDefault();
      if (!form.validate()) { toast(t('required'), 'warning'); return; }
      btn.classList.add('busy'); const old = btn.innerHTML; btn.innerHTML = '<span class="spin"></span>' + esc(sub.busyLabel || sub.label || t('save'));
      await sleep(num(sub.delay, 700));
      btn.innerHTML = old; btn.classList.remove('busy');
      const v = form.get();
      const target = sub.addTo && S.widgets[sub.addTo] && S.widgets[sub.addTo].api;
      if (target && target.addRow) target.addRow(v, !!sub.toast);
      else if (sub.addTo) warn(`form.submit.addTo: Widget „${sub.addTo}“ nicht gefunden oder keine Tabelle.`);
      if (sub.toast !== false && (sub.toast || !target)) toast(sub.toast || t('saved'));
      if (sub.log) emitLog('success', String(sub.log).replace(/\{(\w+)\}/g, (m, k) => v[k] != null ? v[k] : ''), w.title, true);
      if (sub.action) runAction(sub.action);
      if (sub.reset !== false) form.reset();
    } }, form.el, h('div', { class: 'form-actions' }, w.reset ? h('button', { class: 'btn ghost', type: 'button', text: typeof w.reset === 'string' ? w.reset : t('clear'), onclick: () => form.reset() }) : null, btn));
    return card(w, el);
  };

  WIDGETS.list = w => {
    const box = h('div', { class: 'list' });
    const check = w.checklist || w.type === 'todo';
    arr(w.items).forEach((it, i) => {
      if (typeof it === 'string') it = { title: it };
      const clickable = !!it.action;
      const cb = check ? h('input', { type: 'checkbox', checked: it.done || null, onclick: e => e.stopPropagation(), onchange: e => { row.classList.toggle('done', e.target.checked); if (e.target.checked) emitLog('success', `${w.title || 'Checkliste'}: ✓ ${it.title}`, w.title); } }) : null;
      const row = h('div', { class: 'li' + (clickable ? ' clickable' : '') + (it.done ? ' done' : ''), ref: 'item:' + i, style: toneStyle(it.tone || it.color || 'primary'), onclick: clickable ? () => runAction(it.action) : null },
        cb ? h('label', { class: 'check' }, cb) : null,
        it.avatar ? h('span', { class: 'avatar', style: { background: hashTone(it.avatar) }, text: initials(it.avatar) }) : it.icon ? ico(it.icon, 'li-ico') : null,
        h('div', { class: 'li-main' }, h('div', { class: 'li-title', text: it.title || '' }), it.subtitle || it.text ? h('div', { class: 'li-sub', html: md(it.subtitle || it.text) }) : null),
        it.badge != null ? badge(it.badge, it.badgeTone) : null,
        it.meta ? h('div', { class: 'li-meta', text: it.meta }) : null);
      box.appendChild(row);
    });
    return card(w, box);
  };

  WIDGETS.timeline = w => {
    const box = h('div', { class: 'tl' });
    arr(w.items).forEach(it => {
      if (typeof it === 'string') it = { title: it };
      box.appendChild(h('div', { class: 'tl-item', style: toneStyle(it.tone || it.color || autoTone(it.title) || 'primary') },
        h('span', { class: 'tl-dot', text: it.icon || '' }),
        h('div', { class: 'tl-time', text: [it.time, it.user].filter(Boolean).join(' · ') }),
        h('div', { class: 'tl-title', text: it.title || '' }),
        it.text ? h('div', { class: 'tl-text', html: md(it.text) }) : null));
    });
    if (w.capture) on('log', e => {
      const el = h('div', { class: 'tl-item new', style: toneStyle(e.level === 'error' ? 'danger' : e.level === 'warn' ? 'warning' : e.level === 'success' ? 'success' : 'info') }, h('span', { class: 'tl-dot' }), h('div', { class: 'tl-time', text: e.time }), h('div', { class: 'tl-title', text: e.text }));
      box.insertBefore(el, box.firstChild);
      while (box.children.length > 30) box.lastChild.remove();
    });
    return card(w, box);
  };

  const LVL = { warning: 'warn', err: 'error', fatal: 'error', ok: 'success', done: 'success', trace: 'debug' };
  const DEFAULT_POOL = [
    { level: 'info', source: 'api', text: 'GET /v1/orders 200 · 84 ms' }, { level: 'success', source: 'sync', text: 'Synchronisierung abgeschlossen: 128 Datensätze' },
    { level: 'info', source: 'queue', text: 'Auftrag #{n} in Warteschlange' }, { level: 'warn', source: 'api', text: 'Langsame Antwort der externen API: 1.840 ms' },
    { level: 'success', source: 'automation', text: 'Workflow in 2,3 s ausgeführt' }, { level: 'debug', source: 'worker', text: 'heartbeat ok' },
    { level: 'error', source: 'webhook', text: 'Erneuter Zustellversuch (2/5): Timeout' }, { level: 'info', source: 'auth', text: 'Benutzeranmeldung, 2FA bestätigt' },
  ];
  WIDGETS.logs = w => {
    const levels = ['info', 'success', 'warn', 'error', 'debug'], onLv = new Set(levels);
    const box = h('div', { class: 'logs', style: { height: px(w.h, 300) } });
    let paused = false;
    const addLine = l => {
      if (typeof l === 'string') l = { text: l };
      const lvl = LVL[String(l.level || 'info').toLowerCase()] || String(l.level || 'info').toLowerCase();
      const line = h('div', { class: 'log-line', 'data-lvl': lvl },
        h('span', { class: 'log-time', text: l.time || nowTime() }),
        h('span', { class: 'log-lvl lvl-' + lvl, text: lvl.toUpperCase() }),
        l.source ? h('span', { class: 'log-src', text: '[' + l.source + ']' }) : null,
        h('span', { class: 'log-text', text: String(l.text || '').replace('{n}', Math.floor(Math.random() * 90000 + 10000)) }));
      if (!onLv.has(lvl)) line.hidden = true;
      box.appendChild(line);
      while (box.children.length > num(w.maxLines, 250)) box.firstChild.remove();
      if (!paused) box.scrollTop = box.scrollHeight;
    };
    arr(w.lines || w.items).forEach(addLine);
    if (w.live) {
      const live = isObj(w.live) ? w.live : {};
      const pool = arr(live.pool || w.pool).length ? arr(live.pool || w.pool) : DEFAULT_POOL;
      setInterval(() => { if (!paused && document.visibilityState === 'visible' && box.offsetParent) addLine(Object.assign({}, pick(pool), { time: null })); }, clamp(num(live.interval, 2200), 400, 60000));
    }
    if (w.capture !== false) on('log', addLine);
    const chips = levels.map(lv => h('button', { class: 'chip on lvl-chip-' + lv, text: lv, onclick: e => {
      onLv.has(lv) ? onLv.delete(lv) : onLv.add(lv); e.target.classList.toggle('on');
      box.querySelectorAll('.log-line').forEach(ln => (ln.hidden = !onLv.has(ln.dataset.lvl)));
    } }));
    const pauseBtn = h('button', { class: 'chip', ref: 'pause', text: '⏸', title: t('pause'), onclick: () => { paused = !paused; pauseBtn.textContent = paused ? '▶' : '⏸'; } });
    const bar = h('div', { class: 'log-bar' }, w.live ? h('span', { class: 'live-dot', text: t('live') }) : null, h('div', { class: 'log-filters' }, chips), h('div', { class: 'spacer' }), pauseBtn, h('button', { class: 'chip', text: t('clear'), onclick: () => (box.innerHTML = '') }));
    return card(w, h('div', {}, bar, box), { flush: true, noHeight: true });
  };

  WIDGETS.process = w => {
    const steps = arr(w.steps).map(x => (typeof x === 'string' ? { title: x } : Object.assign({}, x)));
    const wrap = h('div', { class: 'proc' + (w.vertical ? ' vertical' : '') });
    const render = () => {
      wrap.innerHTML = '';
      steps.forEach((st, i) => {
        const status = st.status || 'pending', next = steps[i + 1];
        const flow = w.animate !== false && next && (status === 'active' || (status === 'done' && next.status === 'active'));
        wrap.appendChild(h('div', { class: `proc-step ${status}${flow ? ' flow' : ''}${st.action ? ' clickable' : ''}`, ref: 'step:' + i, onclick: st.action ? () => runAction(st.action) : null },
          h('div', { class: 'proc-node', text: status === 'done' ? '✓' : status === 'error' ? '!' : (st.icon || String(i + 1)) }),
          h('div', { class: 'proc-text' }, h('div', { class: 'proc-title', text: st.title || '' }), st.desc ? h('div', { class: 'proc-desc', text: st.desc }) : null,
            st.meta ? h('div', { class: 'proc-meta' }, badge(st.meta, status === 'done' ? 'success' : status === 'active' ? 'primary' : status === 'error' ? 'danger' : 'muted', true)) : null)));
      });
    };
    render();
    let running = false;
    const run = async () => {
      if (running) return; running = true;
      steps.forEach(x => (x.status = 'pending')); render();
      for (let i = 0; i < steps.length; i++) {
        steps[i].status = 'active'; render();
        await sleep(num(w.stepDelay, 900));
        if (steps[i].fail) { steps[i].status = 'error'; render(); emitLog('error', `${w.title || 'Prozess'}: ${steps[i].title} — Fehler`, w.title, true); running = false; return; }
        steps[i].status = 'done'; render();
        emitLog('success', `${w.title || 'Prozess'}: ${steps[i].title} ✓`, w.logSource || 'process');
      }
      toast((w.title ? '**' + esc(w.title) + '** — ' : '') + t('done'));
      running = false;
    };
    apiOf(w, { run });
    return card(w, wrap, { tools: w.runnable ? [h('button', { class: 'btn sm primary', ref: 'run', text: '▶ ' + (w.runLabel || t('run')), onclick: run })] : null });
  };

  WIDGETS.flow = w => {
    const nodes = arr(w.nodes).map((n, i) => Object.assign({}, typeof n === 'string' ? { label: n } : n, { id: String((n && n.id) || i) }));
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    let edges = arr(w.edges).map(e => (Array.isArray(e) ? { from: String(e[0]), to: String(e[1]) } : Object.assign({}, e, { from: String(e.from), to: String(e.to) }))).filter(e => byId[e.from] && byId[e.to]);
    if (!w.edges && nodes.length > 1) edges = nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id }));
    // automatisches Layout nach Ebenen
    if (nodes.some(n => n.col == null)) {
      const lvl = {}; nodes.forEach(n => (lvl[n.id] = 0));
      for (let k = 0; k < nodes.length; k++) edges.forEach(e => { if (lvl[e.to] < lvl[e.from] + 1 && lvl[e.from] + 1 < nodes.length) lvl[e.to] = lvl[e.from] + 1; });
      const rowsIn = {};
      nodes.forEach(n => { if (n.col == null) n.col = lvl[n.id]; if (n.row == null) { rowsIn[n.col] = (rowsIn[n.col] || 0); n.row = rowsIn[n.col]++; } });
    }
    nodes.forEach(n => { n.col = num(n.col, 0); n.row = num(n.row, 0); });
    const cols = Math.max(...nodes.map(n => n.col)) + 1, rows = Math.max(...nodes.map(n => n.row)) + 1;
    const outer = h('div', { class: 'flow' }), inner = h('div', { class: 'flow-inner' });
    outer.appendChild(inner);
    const svg = s('svg', { class: 'flow-svg' });
    inner.appendChild(svg);
    const els = {};
    nodes.forEach(n => {
      els[n.id] = h('div', { class: 'flow-node', ref: 'node:' + n.id, style: toneStyle(n.tone || n.color || 'primary'), onclick: () => { if (n.action) runAction(n.action); else if (n.desc) toast('**' + esc(n.label || n.id) + '** — ' + esc(n.desc), 'info'); } },
        n.icon ? ico(n.icon, 'fn-ico') : null, h('div', { class: 'fn-text' }, h('div', { class: 'fn-label', text: n.label || n.title || n.id }), n.sub ? h('div', { class: 'fn-sub', text: n.sub }) : null));
      inner.appendChild(els[n.id]);
    });
    const colCount = {}; nodes.forEach(n => (colCount[n.col] = Math.max(colCount[n.col] || 0, n.row + 1)));
    observeSize(outer, W => {
      const nw = clamp(W / cols * 0.68, 124, 190), width = Math.max(W, cols * (nw + 56)), rowH = num(w.rowHeight, 92);
      const height = Math.max(rows * rowH + 16, num(w.h, 0));
      inner.style.width = width + 'px'; inner.style.height = height + 'px'; inner.style.setProperty('--nw', nw + 'px');
      const colW = width / cols;
      const pos = n => ({ x: colW * (n.col + 0.5), y: (height - colCount[n.col] * rowH) / 2 + rowH * (n.row + 0.5) });
      nodes.forEach(n => { const p = pos(n); els[n.id].style.left = p.x + 'px'; els[n.id].style.top = p.y + 'px'; });
      svg.setAttribute('width', width); svg.setAttribute('height', height); svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.innerHTML = '';
      const mid = uid('m');
      svg.appendChild(s('defs', {}, s('marker', { id: mid, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--muted)' }))));
      edges.forEach(e => {
        const a = pos(byId[e.from]), b = pos(byId[e.to]);
        let d;
        if (b.x > a.x + 1) { const sx = a.x + nw / 2, ex = b.x - nw / 2 - 4, c = (sx + ex) / 2; d = `M${sx},${a.y} C${c},${a.y} ${c},${b.y} ${ex},${b.y}`; }
        else if (Math.abs(b.x - a.x) <= 1) { const dir = b.y > a.y ? 1 : -1; d = `M${a.x},${a.y + dir * 28} L${b.x},${b.y - dir * 32}`; }
        else { const sx = a.x, ex = b.x, top = Math.min(a.y, b.y) - rowH * 0.62; d = `M${sx},${a.y - 28} C${sx},${top} ${ex},${top} ${ex},${b.y - 32}`; }
        const tone = cssColor(e.tone || e.color);
        svg.appendChild(s('path', { d, class: 'flow-edge' + (e.animated !== false && w.animate !== false ? ' anim' : ''), 'marker-end': `url(#${mid})`, stroke: tone || null }));
        if (e.animated !== false && w.animate !== false) svg.appendChild(s('circle', { r: 3.5, fill: tone || 'var(--primary)', class: 'flow-dot' }, s('animateMotion', { dur: (2 + Math.random()).toFixed(1) + 's', repeatCount: 'indefinite', path: d })));
        if (e.label) { const lx = (a.x + b.x) / 2, ly = (a.y + b.y) / 2 - 8; svg.appendChild(s('text', { x: lx, y: ly, 'text-anchor': 'middle', class: 'edge-label' }, e.label)); }
      });
    });
    let running = false;
    const run = async () => {
      if (running) return; running = true;
      Object.values(els).forEach(e => e.classList.remove('lit', 'done'));
      const order = nodes.slice().sort((a, b) => a.col - b.col || a.row - b.row);
      for (const n of order) {
        els[n.id].classList.add('lit');
        emitLog(n.level || 'success', `${w.title || 'Flow'} › ${n.label || n.id}${n.log ? ': ' + n.log : ' ✓'}`, w.logSource || 'workflow');
        await sleep(num(w.stepDelay, 650));
        els[n.id].classList.remove('lit'); els[n.id].classList.add('done');
      }
      toast((w.title ? '**' + esc(w.title) + '** — ' : '') + t('done'));
      setTimeout(() => Object.values(els).forEach(e => e.classList.remove('done')), 2500);
      running = false;
    };
    apiOf(w, { run });
    S.stats.automations++;
    return card(w, outer, { tools: w.runnable !== false ? [h('button', { class: 'btn sm primary', ref: 'run', text: '▶ ' + (w.runLabel || t('sim')), onclick: run })] : null, noHeight: true });
  };

  WIDGETS.routes = w => {
    const VW = 1000, VH = num(w.ratio, 0.56) * 1000;
    const pts = arr(w.points).map((p, i) => Object.assign({}, p, { id: String(p.id != null ? p.id : i), X: clamp(num(p.x, 50), 0, 100) * VW / 100, Y: clamp(num(p.y, 50), 0, 100) * VH / 100 }));
    const byId = Object.fromEntries(pts.map(p => [p.id, p]));
    const svg = s('svg', { viewBox: `0 0 ${VW} ${VH}`, preserveAspectRatio: 'xMidYMid meet', class: 'routes-svg' });
    const pid = uid('dots');
    svg.appendChild(s('defs', {}, s('pattern', { id: pid, width: 28, height: 28, patternUnits: 'userSpaceOnUse' }, s('circle', { cx: 2, cy: 2, r: 1.6, fill: 'var(--border)' }))));
    svg.appendChild(s('rect', { width: VW, height: VH, fill: `url(#${pid})` }));
    // dekorative „Regionen“
    arr(w.regions).forEach(r => svg.appendChild(s('ellipse', { cx: num(r.x, 50) * 10, cy: num(r.y, 50) * VH / 100, rx: num(r.rx, 15) * 10, ry: num(r.ry, 10) * VH / 100, fill: cssColor(r.color) || 'var(--primary)', opacity: 0.07 })));
    arr(w.regions).forEach(r => r.label && svg.appendChild(s('text', { x: num(r.x, 50) * 10, y: num(r.y, 50) * VH / 100, 'text-anchor': 'middle', class: 'region-label' }, r.label)));
    const vehicles = s('g');
    arr(w.routes).forEach((r, i) => {
      const a = byId[String(r.from)], b = byId[String(r.to)];
      if (!a || !b) { warn(`routes: Route ${i + 1} verweist auf einen unbekannten Punkt.`); return; }
      const mx = (a.X + b.X) / 2, my = (a.Y + b.Y) / 2, dx = b.X - a.X, dy = b.Y - a.Y, k = num(r.curve, 0.18) * (i % 2 ? -1 : 1);
      const d = `M${a.X},${a.Y} Q${mx - dy * k},${my + dx * k} ${b.X},${b.Y}`;
      const tone = cssColor(r.tone || r.color || autoTone(r.status) !== 'muted' && autoTone(r.status)) || 'var(--primary)';
      svg.appendChild(s('path', { d, fill: 'none', stroke: tone, 'stroke-width': 10, opacity: 0.12, 'stroke-linecap': 'round' }));
      svg.appendChild(s('path', { d, fill: 'none', stroke: tone, 'stroke-width': 3, 'stroke-dasharray': r.dashed ? '10 10' : null, class: r.dashed ? 'route-dash' : 'route-line', 'stroke-linecap': 'round' }));
      const nV = num(r.vehicles, 1), dur = num(r.speed, 8);
      for (let v = 0; v < nV; v++) {
        const g = s('g', { class: 'vehicle', onclick: () => r.action ? runAction(r.action) : toast('**' + esc(r.label || `${a.label} → ${b.label}`) + '**' + (r.info ? ' — ' + esc(r.info) : ''), 'info') },
          s('circle', { r: 15, fill: tone, opacity: 0.25 }), s('circle', { r: 11, fill: 'var(--surface)', stroke: tone, 'stroke-width': 2.5 }),
          s('text', { 'text-anchor': 'middle', y: 5, class: 'veh-ico' }, r.icon || w.vehicleIcon || '🚚'),
          s('animateMotion', { dur: dur + 's', repeatCount: 'indefinite', path: d, begin: `-${(dur / nV * v).toFixed(2)}s`, keyPoints: r.loop === 'forward' ? null : '0;1;0', keyTimes: r.loop === 'forward' ? null : '0;0.5;1', calcMode: 'linear' }));
        vehicles.appendChild(g);
      }
      if (r.label && w.routeLabels !== false) svg.appendChild(s('text', { x: mx - dy * k * 0.5, y: my + dx * k * 0.5 - 8, 'text-anchor': 'middle', class: 'route-label' }, r.label));
    });
    svg.appendChild(vehicles);
    const box = h('div', { class: 'routes' });
    const pop = h('div', { class: 'route-pop hidden' });
    pts.forEach(p => {
      const tone = cssColor(p.tone || p.color) || (p.type === 'hub' || p.type === 'warehouse' ? 'var(--accent)' : 'var(--primary)');
      const big = p.type === 'hub' || p.type === 'warehouse';
      const g = s('g', { class: 'route-pt', transform: `translate(${p.X},${p.Y})`, onclick: e => {
        e.stopPropagation();
        pop.innerHTML = '';
        add(pop, [h('div', { class: 'rp-title', text: (p.icon ? p.icon + ' ' : '') + (p.label || p.id) }), arr(p.info).map(x => h('div', { class: 'rp-line', html: md(x) })), p.action ? h('button', { class: 'btn sm primary', text: p.actionLabel || t('details'), onclick: () => runAction(p.action) }) : null]);
        pop.style.left = (p.X / VW * 100) + '%'; pop.style.top = (p.Y / VH * 100) + '%';
        pop.classList.remove('hidden');
      } },
        s('circle', { r: big ? 16 : 10, fill: tone, opacity: 0.25, class: 'pt-pulse' }),
        s('circle', { r: big ? 10 : 6, fill: tone, stroke: 'var(--surface)', 'stroke-width': 3 }),
        s('text', { y: big ? 36 : 28, 'text-anchor': 'middle', class: 'pt-label' }, p.label || ''));
      svg.appendChild(g);
    });
    box.addEventListener('click', () => pop.classList.add('hidden'));
    add(box, [svg, pop]);
    if (w.h) box.style.height = px(w.h);
    const legend = arr(w.legend).length ? h('div', { class: 'legend' }, arr(w.legend).map(l => h('span', {}, h('i', { style: { background: cssColor(l.tone || l.color) || 'var(--primary)' } }), l.label))) : null;
    return card(w, h('div', {}, box, legend), { noHeight: true });
  };

  WIDGETS.kanban = w => {
    const colsData = arr(w.columns).map((c, i) => Object.assign({ id: c.id || 'c' + i, cards: [] }, c, { cards: arr(c.cards).map(x => (typeof x === 'string' ? { title: x } : Object.assign({}, x))) }));
    const board = h('div', { class: 'kanban' });
    let drag = null;
    const cardEl = (cd, col) => {
      const el = h('div', { class: 'kb-card', draggable: 'true', style: toneStyle(cd.tone || cd.color || 'primary'), ondragstart: e => { drag = { cd, from: col, el }; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', cd.title || ''); } catch (x) { /* ok */ } }, ondragend: () => el.classList.remove('dragging'), onclick: () => openCard(cd, col) },
        h('div', { class: 'kb-title', text: cd.title || '' }),
        cd.text ? h('div', { class: 'kb-text', text: cd.text }) : null,
        h('div', { class: 'kb-meta' }, arr(cd.tags).map(tg => h('span', { class: 'tag', text: tg })), h('div', { class: 'spacer' }), cd.due ? h('span', { class: 'muted small', text: '🕒 ' + fmtDate(cd.due) }) : null, cd.user ? h('span', { class: 'avatar xs', style: { background: hashTone(cd.user) }, title: cd.user, text: initials(cd.user) }) : null));
      return el;
    };
    const move = (cd, from, to) => {
      if (from === to) return;
      from.cards.splice(from.cards.indexOf(cd), 1); to.cards.push(cd);
      render();
      emitLog('info', `«${cd.title}» ${t('moved')} «${to.title}»`, w.title || 'kanban', true);
      if (to.done || /done|готов|erledigt|abgeschlossen|выполн/i.test(to.title || '')) toast('🎉 **' + esc(cd.title) + '** — ' + esc(to.title));
    };
    const openCard = (cd, col) => openModal({ title: cd.title, icon: '🗂', text: [cd.text, cd.user ? '👤 ' + cd.user : '', cd.due ? '🕒 ' + fmtDate(cd.due) : ''].filter(Boolean).join('\n'),
      buttons: colsData.filter(c => c !== col).map(c => ({ label: '→ ' + c.title, id: 'move-' + slug(c.title), style: 'secondary', action: () => move(cd, col, c) })).concat([{ label: t('close'), id: 'close', style: 'ghost' }]) });
    const render = () => {
      board.innerHTML = '';
      colsData.forEach(col => {
        const list = h('div', { class: 'kb-list' }, col.cards.map(cd => cardEl(cd, col)));
        const inp = h('input', { class: 'input kb-input hidden', placeholder: t('newItem'), onkeydown: e => { if (e.key === 'Enter' && inp.value.trim()) { col.cards.push({ title: inp.value.trim() }); emitLog('success', `${w.title || 'Kanban'}: + «${inp.value.trim()}»`, w.title); render(); } if (e.key === 'Escape') inp.classList.add('hidden'); } });
        const c = h('div', { class: 'kb-col', ref: 'col:' + slug(col.title), style: toneStyle(col.tone || col.color || 'primary'),
          ondragover: e => { e.preventDefault(); c.classList.add('over'); }, ondragleave: () => c.classList.remove('over'),
          ondrop: e => { e.preventDefault(); c.classList.remove('over'); if (drag) move(drag.cd, drag.from, col); drag = null; } },
          h('div', { class: 'kb-head' }, h('span', { text: col.title || '' }), h('span', { class: 'kb-count', text: col.cards.length })),
          list, inp, w.add !== false ? h('button', { class: 'kb-add', text: t('addCard'), onclick: () => { inp.classList.remove('hidden'); inp.focus(); } }) : null);
        board.appendChild(c);
      });
    };
    render();
    return card(w, board);
  };

  WIDGETS.matrix = w => {
    const roles = arr(w.roles).map(r => (isObj(r) ? r.label || r.name : r));
    const perms = arr(w.permissions || w.rows).map(p => (typeof p === 'string' ? { label: p, values: [] } : p));
    const thead = h('tr', {}, h('th', { text: w.corner || '' }), roles.map(r => h('th', { class: 'center', text: r })));
    const tbody = h('tbody');
    let timer = null;
    perms.forEach((p, pi) => {
      if (p.group) { tbody.appendChild(h('tr', { class: 'mx-group' }, h('td', { colspan: roles.length + 1, text: p.group }))); if (!p.label) return; }
      const tr = h('tr', {}, h('td', {}, h('div', { text: p.label }), p.desc ? h('div', { class: 'muted small', text: p.desc }) : null));
      roles.forEach((r, ri) => {
        const v = arr(p.values)[ri];
        const inp = h('input', { type: 'checkbox', checked: v === true || v === 1 || v === 'rw' || v === 'r' ? true : null, disabled: p.locked ? true : null, onchange: e => {
          emitLog('info', `${t('role')} «${r}»: ${p.label} — ${e.target.checked ? t('allowed') : t('denied')}`, w.title || 'RBAC');
          clearTimeout(timer); timer = setTimeout(() => toast(t('permUpd')), 500);
        } });
        tr.appendChild(h('td', { class: 'center' }, h('label', { class: 'switch sm', ref: `perm:${pi}:${ri}` }, inp, h('span', { class: 'track' }))));
      });
      tbody.appendChild(tr);
    });
    return card(w, h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl matrix' }, h('thead', {}, thead), tbody)), { flush: true });
  };

  WIDGETS.status = w => {
    const box = h('div', { class: 'svc-list' });
    const TONE = { online: 'success', ok: 'success', operational: 'success', degraded: 'warning', warning: 'warning', offline: 'danger', down: 'danger', error: 'danger', maintenance: 'info' };
    const LBL = { online: 'online2', ok: 'online2', operational: 'online2', degraded: 'degraded', warning: 'degraded', offline: 'offline', down: 'offline', error: 'offline', maintenance: 'maintenance' };
    arr(w.items).forEach((it, i) => {
      const stt = String(it.status || 'online').toLowerCase(), tone = TONE[stt] || autoTone(stt);
      const lat = h('span', { class: 'svc-lat', text: it.latency != null ? it.latency + ' ms' : '' });
      const bars = h('div', { class: 'uptime' });
      if (w.history !== false) for (let k = 0; k < 30; k++) { const r = Math.random(); bars.appendChild(h('i', { style: toneStyle(k === 29 ? tone : r > 0.96 ? 'danger' : r > 0.9 ? 'warning' : 'success') })); }
      box.appendChild(h('div', { class: 'svc', ref: 'svc:' + i, style: toneStyle(tone), onclick: it.action ? () => runAction(it.action) : null },
        h('div', { class: 'svc-top' }, h('span', { class: 'pulse-dot' }), it.icon ? ico(it.icon, 'svc-ico') : null,
          h('div', { class: 'svc-main' }, h('div', { class: 'svc-name', text: it.name || '' }), h('div', { class: 'muted small', text: it.desc || t(LBL[stt] || 'online2') })),
          h('div', { class: 'svc-right' }, lat, it.uptime != null ? h('div', { class: 'muted small', text: it.uptime + '%' }) : null)),
        w.history !== false ? bars : null));
      if (it.latency != null && w.live !== false) setInterval(() => { if (box.offsetParent) lat.textContent = Math.max(1, Math.round(it.latency * (0.8 + Math.random() * 0.45))) + ' ms'; }, 2500 + i * 300);
    });
    return card(w, box);
  };

  WIDGETS.integrations = w => {
    const items = arr(w.items).map(x => (typeof x === 'string' ? { name: x } : Object.assign({}, x)));
    S.stats.integrations += items.length;
    const cats = [...new Set(items.map(x => x.category).filter(Boolean))];
    const gridEl = h('div', { class: 'integ-grid' });
    let filter = '';
    const render = () => {
      gridEl.innerHTML = '';
      items.forEach((it, i) => {
        if (filter && it.category !== filter) return;
        const stBadge = h('span');
        const setBadge = () => { stBadge.innerHTML = ''; stBadge.appendChild(badge(it.connected ? t('connected') : t('disconnected'), it.connected ? 'success' : 'muted')); };
        setBadge();
        const syncTxt = h('span', { class: 'muted small', text: it.lastSync ? '⟳ ' + it.lastSync : '' });
        const tg = h('input', { type: 'checkbox', checked: it.connected || null, onchange: e => {
          it.connected = e.target.checked; setBadge(); el.classList.toggle('off', !it.connected);
          emitLog(it.connected ? 'success' : 'warn', `${it.name}: ${it.connected ? t('connected') : t('disconnected')}`, 'integrations', true);
          toast(`**${esc(it.name)}** — ${it.connected ? t('connected') : t('disconnected')}`, it.connected ? 'success' : 'info');
        } });
        const syncBtn = h('button', { class: 'btn sm ghost', ref: 'sync:' + i, title: t('sync'), text: '⟳', onclick: async () => {
          if (!it.connected) { toast(`**${esc(it.name)}** — ${t('disconnected')}`, 'warning'); return; }
          syncBtn.innerHTML = '<span class="spin"></span>'; syncBtn.classList.add('busy');
          await sleep(1100 + Math.random() * 600);
          syncBtn.textContent = '⟳'; syncBtn.classList.remove('busy');
          it.lastSync = t('justNow'); syncTxt.textContent = '⟳ ' + it.lastSync;
          const n = Math.floor(Math.random() * 400 + 20);
          emitLog('success', `${it.name}: ${t('synced').toLowerCase()} (${n})`, 'sync', true);
          toast(`**${esc(it.name)}** — ${t('synced')} (${n})`);
        } });
        const el = h('div', { class: 'integ' + (it.connected ? '' : ' off'), ref: 'integ:' + i },
          h('div', { class: 'integ-top' }, h('div', { class: 'integ-logo', style: { background: cssColor(it.color) || hashTone(it.name) }, text: it.icon || initials(it.name) }),
            h('div', { class: 'integ-main' }, h('div', { class: 'integ-name', text: it.name || '' }), it.category ? h('div', { class: 'muted small', text: it.category }) : null), stBadge),
          it.desc ? h('div', { class: 'integ-desc muted', text: it.desc }) : null,
          it.metric ? h('div', { class: 'integ-metric', text: it.metric }) : null,
          h('div', { class: 'integ-foot' }, h('label', { class: 'switch', ref: 'toggle:' + i }, tg, h('span', { class: 'track' })), syncTxt, h('div', { class: 'spacer' }), syncBtn));
        gridEl.appendChild(el);
      });
    };
    render();
    const chips = cats.length > 1 ? h('div', { class: 'chip-row' }, [h('button', { class: 'chip on', text: t('all'), 'data-c': '' })].concat(cats.map(c => h('button', { class: 'chip', text: c, 'data-c': c })))) : null;
    if (chips) chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; filter = b.dataset.c; chips.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); render(); });
    return card(w, h('div', {}, chips, gridEl));
  };

  WIDGETS.automations = w => {
    const items = arr(w.items).map(x => Object.assign({ enabled: true, runs: 0 }, x));
    S.stats.automations += items.length;
    const list = h('div', { class: 'auto-list' });
    const render = () => {
      list.innerHTML = '';
      items.forEach((it, i) => {
        const chain = h('div', { class: 'auto-chain' });
        const chips = [h('span', { class: 'auto-chip trigger', text: '⚡ ' + (it.trigger || t('trigger')) })];
        arr(it.conditions).forEach(c => chips.push(h('span', { class: 'auto-chip cond', text: '◇ ' + c })));
        arr(it.actions).forEach(a => chips.push(h('span', { class: 'auto-chip', text: '⚙ ' + a })));
        chips.forEach((c, k) => { if (k) chain.appendChild(h('span', { class: 'auto-arrow', text: '→' })); chain.appendChild(c); });
        const meta = h('div', { class: 'auto-meta muted small', text: `${fmtNum(it.runs)} ${t('runs')}${it.lastRun ? ' · ' + t('last') + ': ' + it.lastRun : ''}${it.success != null ? ' · ✓ ' + it.success + '%' : ''}` });
        const tg = h('input', { type: 'checkbox', checked: it.enabled || null, onchange: e => { it.enabled = e.target.checked; row.classList.toggle('off', !it.enabled); emitLog(it.enabled ? 'success' : 'warn', `«${it.name}» ${it.enabled ? t('enabled') : t('disabled')}`, 'automation', true); } });
        const runBtn = h('button', { class: 'btn sm primary', ref: 'run:' + i, text: '▶', title: t('run'), onclick: async () => {
          if (runBtn.classList.contains('busy')) return;
          runBtn.classList.add('busy'); runBtn.innerHTML = '<span class="spin"></span>';
          for (const c of chips) { c.classList.add('lit'); await sleep(num(w.stepDelay, 420)); c.classList.remove('lit'); c.classList.add('ok'); }
          it.runs++; it.lastRun = t('justNow');
          emitLog('success', `«${it.name}» ${t('executed')}`, 'automation', true);
          toast(`⚡ **${esc(it.name)}** — ${t('executed')}`);
          setTimeout(render, 900);
        } });
        const row = h('div', { class: 'auto' + (it.enabled ? '' : ' off'), ref: 'auto:' + i },
          h('div', { class: 'auto-head' }, h('label', { class: 'switch', ref: 'toggle:' + i }, tg, h('span', { class: 'track' })),
            h('div', { class: 'auto-main' }, h('div', { class: 'auto-name' }, it.icon ? it.icon + ' ' : '', it.name || ''), it.desc ? h('div', { class: 'muted small', text: it.desc }) : meta), runBtn),
          chain, it.desc ? meta : null);
        list.appendChild(row);
      });
    };
    render();
    const openAdd = () => openModal({ title: t('newAuto'), icon: '⚡', fields: [
      { name: 'name', label: t('name'), required: true },
      arr(w.triggers).length ? { name: 'trigger', label: t('trigger'), type: 'select', options: w.triggers } : { name: 'trigger', label: t('trigger'), required: true },
      { name: 'actions', label: t('actionsLines'), type: 'textarea', required: true }],
    onSave: v => { items.unshift({ name: v.name, trigger: v.trigger, actions: String(v.actions).split('\n').map(x => x.trim()).filter(Boolean), enabled: true, runs: 0 }); render(); toast('⚡ **' + esc(v.name) + '** — ' + t('created')); emitLog('success', `${t('newAuto')}: «${v.name}»`, 'automation', true); } });
    apiOf(w, { openAdd });
    return card(w, list, { flush: true, tools: w.add !== false ? [h('button', { class: 'btn sm primary', ref: 'add', text: '＋ ' + (w.addLabel || t('add')), onclick: openAdd })] : null });
  };

  WIDGETS.buttons = w => {
    const row = h('div', { class: 'btn-row', style: { justifyContent: { center: 'center', right: 'flex-end', between: 'space-between' }[w.align] || 'flex-start' } }, arr(w.buttons || w.items).map(b => button(b)));
    return w.title ? card(w, row) : h('div', { class: 'bare', ref: 'w:' + w.id }, row);
  };
  WIDGETS.text = w => {
    const body = h('div', { class: 'prose', html: md(w.text || w.content || '') });
    return w.bare || (!w.title && w.card === false) ? h('div', { class: 'bare prose', ref: 'w:' + w.id, html: md(w.text || '') }) : card(w, body);
  };
  WIDGETS.callout = w => {
    const tone = w.tone || w.color || 'info';
    const el = h('div', { class: 'callout', style: toneStyle(tone), ref: 'w:' + w.id }, h('div', { class: 'callout-ico', text: w.icon || TONE_ICON[tone] || 'ℹ' }),
      h('div', { class: 'callout-main' }, w.title ? h('div', { class: 'callout-title', text: w.title }) : null, w.text ? h('div', { html: md(w.text) }) : null,
        arr(w.buttons).length ? h('div', { class: 'btn-row' }, arr(w.buttons).map(b => button(Object.assign({ size: 'sm' }, typeof b === 'string' ? { label: b } : b)))) : null),
      w.dismissible ? h('button', { class: 'tool', text: '✕', onclick: () => el.remove() }) : null);
    return el;
  };
  WIDGETS.heading = w => h('div', { class: 'heading', ref: 'w:' + w.id }, h('div', { class: 'heading-title' }, w.icon ? ico(w.icon, 'pt-ico') : null, w.text || w.title || ''), w.subtitle || w.sub ? h('div', { class: 'muted', html: md(w.subtitle || w.sub) }) : null);
  WIDGETS.image = w => {
    const src = String(w.src || '');
    const ok = /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]|\.{0,2}\/|[\w-]+\.(png|jpe?g|gif|webp|svg))/i.test(src);
    return card(w, ok ? h('img', { class: 'w-img', src, alt: w.alt || '', style: { height: px(w.h, 'auto'), objectFit: w.fit || 'cover' } }) : h('div', { class: 'muted', text: 'image: ungültiger src' }), { noHeight: true });
  };
  WIDGETS.tabs = w => {
    const nav = h('div', { class: 'tabs-nav' }), panes = h('div', {});
    const tabs = arr(w.tabs);
    tabs.forEach((tb, i) => {
      const btn = h('button', { class: 'tab-btn' + (i === 0 ? ' on' : ''), ref: 'tab:' + (tb.id || slug(tb.title) || i), onclick: () => { nav.querySelectorAll('.tab-btn').forEach((b, k) => b.classList.toggle('on', k === i)); panes.querySelectorAll(':scope > .tab-pane').forEach((p, k) => p.classList.toggle('on', k === i)); } },
        tb.icon ? ico(tb.icon, 'b-ico') : null, tb.title || `Tab ${i + 1}`, tb.badge != null ? h('span', { class: 'side-badge', text: tb.badge }) : null);
      nav.appendChild(btn);
      const pane = h('div', { class: 'tab-pane' + (i === 0 ? ' on' : '') });
      if (tb.text) pane.appendChild(h('div', { class: 'prose', html: md(tb.text) }));
      if (tb.widgets) pane.appendChild(grid(tb.widgets));
      panes.appendChild(pane);
    });
    return card(w, h('div', {}, nav, panes), { flush: true, cls: 'tabs-card' });
  };
  WIDGETS.accordion = w => {
    const box = h('div', { class: 'acc' });
    arr(w.items).forEach((it, i) => {
      const item = h('div', { class: 'acc-item' + (it.open ? ' open' : '') },
        h('button', { class: 'acc-head', ref: 'acc:' + i, onclick: () => { if (w.single) box.querySelectorAll('.acc-item').forEach(x => x !== item && x.classList.remove('open')); item.classList.toggle('open'); } }, h('span', {}, it.icon ? it.icon + ' ' : '', it.title || ''), h('span', { class: 'acc-caret', text: '›' })),
        h('div', { class: 'acc-body' }, it.text ? h('div', { class: 'prose', html: md(it.text) }) : null, it.widgets ? grid(it.widgets) : null));
      box.appendChild(item);
    });
    return card(w, box, { flush: true });
  };
  WIDGETS.group = w => {
    const g = grid(w.widgets);
    return w.title ? card(w, g) : h('div', { class: 'bare', ref: 'w:' + w.id }, g);
  };

  /* =====================================================================
   * 14. KI-Chat (Prototyp)
   * ===================================================================== */
  function buildChat() {
    const c = S.cfg.chat;
    if (!c || c.enabled === false) return;
    const left = c.position === 'left';
    const msgs = h('div', { class: 'chat-msgs' });
    const input = h('input', { class: 'input', ref: 'chat:input', placeholder: c.placeholder || t('chatPh'), onkeydown: e => { if (e.key === 'Enter') send(); } });
    const unread = h('span', { class: 'dot hidden' });
    const fab = h('button', { class: 'chat-fab' + (left ? ' left' : ''), ref: 'chat:toggle', title: c.title || 'AI', onclick: () => openChat(!S.chat.open) }, h('span', { class: 'fab-ico', text: c.icon || '✦' }), unread);
    const sugg = h('div', { class: 'chat-sugg' }, arr(c.suggestions).map((x, i) => h('button', { class: 'chip', ref: 'chat:sugg:' + i, text: x, onclick: () => chatSend(x) })));
    const panel = h('div', { class: 'chat-panel closed' + (left ? ' left' : ''), ref: 'chat' },
      h('div', { class: 'chat-head' }, h('div', { class: 'avatar ai', text: c.avatar || '✦' }),
        h('div', { class: 'chat-who' }, h('div', { class: 'chat-title', text: c.title || 'KI-Assistent' }), h('div', { class: 'chat-sub' }, h('span', { class: 'online-dot' }), c.subtitle || t('online'))),
        h('button', { class: 'tool', ref: 'chat:close', text: '✕', onclick: () => openChat(false) })),
      msgs, sugg.children.length ? sugg : null,
      h('div', { class: 'chat-input' }, input, h('button', { class: 'btn primary', ref: 'chat:send', text: '➤', onclick: () => send() })));
    document.body.appendChild(panel);
    document.body.appendChild(fab);
    S.chat = { open: false, panel, msgs, input, fab, unread, busy: Promise.resolve(), cfg: c };
    function send() { const v = input.value.trim(); if (!v) return; input.value = ''; chatSend(v); }
    arr(c.messages).forEach(m => addMsg(m, false));
    const botCount = arr(c.messages).filter(m => (m.from || m.role) !== 'user').length;
    if (botCount) { unread.textContent = botCount; unread.classList.remove('hidden'); }
    if (c.open) setTimeout(() => openChat(true), 600);
  }
  function addMsg(m, stream) {
    if (typeof m === 'string') m = { text: m };
    const who = (m.from || m.role) === 'user' ? 'user' : 'bot';
    const txt = h('div', { class: 'msg-text' });
    const el = h('div', { class: 'msg ' + who }, txt);
    S.chat.msgs.appendChild(el);
    const finish = () => {
      txt.innerHTML = md(m.text || '');
      if (m.widget && isObj(m.widget)) { const ww = Object.assign({ id: uid('cw') }, m.widget); const wel = buildWidget(ww); wel.classList.add('in-chat'); el.appendChild(wel); }
      if (arr(m.buttons).length) el.appendChild(h('div', { class: 'msg-btns' }, arr(m.buttons).map(b => button(Object.assign({ size: 'sm', style: 'outline' }, typeof b === 'string' ? { label: b, action: 'chat:' + b } : b)))));
      el.appendChild(h('div', { class: 'msg-time', text: m.time || new Date().toLocaleTimeString(S.locale, { hour: '2-digit', minute: '2-digit' }) }));
      S.chat.msgs.scrollTop = S.chat.msgs.scrollHeight;
    };
    if (!stream) { finish(); return Promise.resolve(); }
    return new Promise(res => {
      const full = String(m.text || ''); let i = 0;
      const speed = num(S.chat.cfg.typingSpeed, 14);
      const tick = () => {
        i = Math.min(full.length, i + Math.max(1, Math.round(full.length / 120)));
        txt.textContent = full.slice(0, i);
        S.chat.msgs.scrollTop = S.chat.msgs.scrollHeight;
        if (i < full.length) setTimeout(tick, speed); else { finish(); res(); }
      };
      tick();
    });
  }
  function openChat(v) {
    if (!S.chat) return;
    S.chat.open = v;
    S.chat.panel.classList.toggle('closed', !v);
    S.chat.fab.classList.toggle('active', v);
    if (v) { S.chat.unread.classList.add('hidden'); setTimeout(() => { if (!S.demoRunning) S.chat.input.focus(); }, 200); }
  }
  function chatSend(text) {
    if (!S.chat) return Promise.resolve();
    const c = S.chat.cfg;
    openChat(true);
    S.chat.busy = S.chat.busy.then(async () => {
      await addMsg({ from: 'user', text }, false);
      const norm = x => String(x).toLowerCase().replace(/ё/g, 'е');
      const reply = arr(c.replies).find(r => arr(r.match || r.keywords).some(k => norm(text).includes(norm(k)))) || { text: c.fallback || t('chatFallback') };
      const typing = h('div', { class: 'msg bot typing' }, h('span'), h('span'), h('span'));
      S.chat.msgs.appendChild(typing); S.chat.msgs.scrollTop = S.chat.msgs.scrollHeight;
      await sleep(num(reply.delay, 900));
      typing.remove();
      await addMsg(Object.assign({}, reply, { from: 'bot' }), true);
      if (reply.action) setTimeout(() => runAction(reply.action), 400);
    });
    return S.chat.busy;
  }

  /* =====================================================================
   * 15. Demo-Modus: interaktiver Cursor
   * ===================================================================== */
  const D = { running: false, paused: false, stop: false, skip: false, cursor: null, caption: null, x: 0, y: 0 };
  function tokenizeTarget(tg) {
    const str = String(tg).trim();
    const m = str.match(/(^|\s)(text:|css:)/);
    if (!m) return str.split(/\s+/);
    const idx = m.index + m[1].length;
    return str.slice(0, idx).trim().split(/\s+/).filter(Boolean).concat([str.slice(idx)]);
  }
  const visible = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function resolveTarget(target) {
    if (!target) return null;
    if (target instanceof Element) return target;
    let scope = document;
    for (const tk of tokenizeTarget(target)) {
      let list;
      if (tk.startsWith('css:')) { try { list = scope.querySelectorAll(tk.slice(4)); } catch (e) { return null; } }
      else if (tk.startsWith('text:')) {
        const q = tk.slice(5).toLowerCase().trim();
        list = [...scope.querySelectorAll('button, a, label, [data-ref], .side-link, .tab-btn, .chip, .li, .kb-card, td, th, .proc-step, .flow-node, .integ, .auto, h1, h2, h3, .card-title')]
          .filter(e => visible(e) && e.textContent.toLowerCase().includes(q)).sort((a, b) => a.textContent.length - b.textContent.length);
      } else list = scope.querySelectorAll(`[data-ref="${cssEsc(tk)}"]`);
      const arrL = [...list];
      const found = arrL.find(visible) || arrL[0];
      if (!found) return null;
      scope = found;
    }
    return scope === document ? null : scope;
  }
  function ensureDemoUI() {
    if (!D.cursor) {
      D.cursor = h('div', { class: 'demo-cursor', html: '<svg viewBox="0 0 28 28" width="28" height="28"><path d="M5 3l17 9.5-7.4 1.6 4.3 8.2-3.4 1.8-4.3-8.2L5 21z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>' });
      document.body.appendChild(D.cursor);
      D.x = window.innerWidth / 2; D.y = window.innerHeight / 2;
      D.cursor.style.transform = `translate(${D.x}px,${D.y}px)`;
    }
    if (!D.caption) {
      D.capText = h('div', { class: 'dc-text' });
      D.capStep = h('div', { class: 'dc-step' });
      D.pauseBtn = h('button', { class: 'dc-btn', text: '⏸', title: t('pause'), onclick: () => { D.paused = !D.paused; D.pauseBtn.textContent = D.paused ? '▶' : '⏸'; } });
      D.caption = h('div', { class: 'demo-caption' }, D.capStep, D.capText, h('div', { class: 'dc-ctrl' }, D.pauseBtn,
        h('button', { class: 'dc-btn', text: '⏭', title: t('next'), onclick: () => (D.skip = true) }),
        h('button', { class: 'dc-btn', text: '✕', title: t('stop'), onclick: () => (D.stop = true) })));
      document.body.appendChild(D.caption);
    }
    D.cursor.classList.remove('hidden'); D.caption.classList.remove('hidden');
  }
  function say(text) {
    if (!D.caption) return;
    if (!text) { D.capText.classList.add('dim'); return; }
    D.capText.classList.remove('dim');
    D.capText.innerHTML = md(text);
    D.caption.classList.remove('pop'); void D.caption.offsetWidth; D.caption.classList.add('pop');
  }
  async function dwait(ms) {
    const end = performance.now() + ms / (S.demo.speed || 1);
    while (performance.now() < end || D.paused) { if (D.stop || D.skip) return; await sleep(40); }
  }
  async function moveTo(el) {
    if (!el) return;
    const r0 = el.getBoundingClientRect();
    if (r0.top < 70 || r0.bottom > window.innerHeight - 90) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await sleep(450); }
    const r = el.getBoundingClientRect();
    const x = r.left + Math.min(r.width / 2, 40 + r.width / 4), y = r.top + r.height / 2;
    const dist = Math.hypot(x - D.x, y - D.y);
    const dur = clamp(dist * 0.9, 260, 950) / (S.demo.speed || 1);
    D.cursor.style.transitionDuration = dur + 'ms';
    D.cursor.style.transform = `translate(${x}px,${y}px)`;
    D.x = x; D.y = y;
    await sleep(dur + 60);
  }
  function ripple() {
    const r = h('div', { class: 'demo-ripple', style: { left: D.x + 'px', top: D.y + 'px' } });
    document.body.appendChild(r);
    D.cursor.classList.add('press'); setTimeout(() => D.cursor.classList.remove('press'), 160);
    setTimeout(() => r.remove(), 650);
  }
  function spotlight(el, ms) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sp = h('div', { class: 'demo-spot', style: { left: r.left - 8 + 'px', top: r.top - 8 + 'px', width: r.width + 16 + 'px', height: r.height + 16 + 'px' } });
    document.body.appendChild(sp);
    setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 400); }, ms || 1600);
  }
  async function find(target) {
    for (let i = 0; i < 20; i++) { const el = resolveTarget(target); if (el && visible(el)) return el; await sleep(100); }
    return resolveTarget(target);
  }
  async function clickEl(el) {
    await moveTo(el); ripple(); await sleep(120);
    if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) el.click();
    else if (el.matches('input, textarea')) el.focus();
    else el.click();
  }
  async function ensureMenuVisible(link) {
    if (!link) return;
    if (isMobile() && !S.shell.classList.contains('side-open')) { await clickEl(resolveTarget('menu-toggle')); await sleep(350); }
    const grp = link.parentElement && link.parentElement.closest('.side-group');
    if (grp && !grp.classList.contains('open')) { await clickEl(grp.querySelector('.side-link')); await sleep(320); }
  }
  async function doStep(st) {
    const kind = String(st.do || st.action || st.step || (st.say ? 'say' : '')).toLowerCase();
    if (st.say) say(st.say); else if (kind !== 'say') say('');
    const missing = tg => { say('⚠ ' + t('missing') + ': `' + tg + '`'); console.warn('[moqup demo] target not found:', tg); return dwait(1200); };
    switch (kind) {
      case 'say': case 'caption': await dwait(num(st.ms, Math.max(1600, String(st.say || st.text || '').length * 45))); return;
      case 'wait': await dwait(num(st.ms, 1000)); return;
      case 'navigate': case 'page': case 'go': {
        const link = resolveTarget('menu:' + (st.to || st.target));
        if (link) { await ensureMenuVisible(link); await clickEl(await find('menu:' + (st.to || st.target))); }
        else if (!navigate(st.to || st.target)) return missing('menu:' + (st.to || st.target));
        await dwait(num(st.ms, 900)); return;
      }
      case 'click': case 'tap': case 'check': case 'tab': {
        const el = await find(st.target);
        if (!el) return missing(st.target);
        await clickEl(el); await dwait(num(st.ms, 700)); return;
      }
      case 'hover': case 'move': case 'point': {
        const el = await find(st.target);
        if (!el) return missing(st.target);
        await moveTo(el); await dwait(num(st.ms, 600)); return;
      }
      case 'type': case 'fill': {
        const el = await find(st.target);
        if (!el) return missing(st.target);
        await clickEl(el);
        const inp = el.matches('input, textarea') ? el : el.querySelector('input, textarea');
        if (!inp) return missing(st.target + ' (input)');
        inp.focus();
        if (st.clear !== false) inp.value = '';
        for (const ch of String(st.text != null ? st.text : st.value || '')) {
          if (D.stop) return;
          inp.value += ch; inp.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(num(st.speed, 42) / (S.demo.speed || 1) * (0.6 + Math.random() * 0.8));
        }
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        if (st.enter) inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await dwait(num(st.ms, 400)); return;
      }
      case 'select': {
        const el = await find(st.target);
        if (!el) return missing(st.target);
        await clickEl(el);
        const sel = el.tagName === 'SELECT' ? el : el.querySelector('select');
        if (!sel) return missing(st.target + ' (select)');
        const want = String(st.value != null ? st.value : st.text);
        const opt = [...sel.options].find(o => o.value === want) || [...sel.options].find(o => o.textContent.toLowerCase().includes(want.toLowerCase()));
        if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
        await dwait(num(st.ms, 600)); return;
      }
      case 'highlight': case 'spotlight': {
        const el = await find(st.target);
        if (!el) return missing(st.target);
        await moveTo(el); spotlight(el, num(st.ms, 2000)); await dwait(num(st.ms, 2000) + 200); return;
      }
      case 'scroll': {
        const el = await find(st.target);
        if (el) { el.scrollIntoView({ block: st.block || 'center', behavior: 'smooth' }); await moveTo(el); }
        else window.scrollBy({ top: num(st.y, 400), behavior: 'smooth' });
        await dwait(num(st.ms, 700)); return;
      }
      case 'chat': {
        if (!S.chat) return missing('chat');
        if (!S.chat.open) await clickEl(resolveTarget('chat:toggle'));
        await sleep(300);
        if (st.text) {
          await doStep({ do: 'type', target: 'chat:input', text: st.text, say: st.say });
          await clickEl(resolveTarget('chat:send'));
          await sleep(100);
          await S.chat.busy;
        }
        await dwait(num(st.ms, 1500));
        if (st.close) await clickEl(resolveTarget('chat:close'));
        return;
      }
      case 'modal-close': case 'close': { const el = resolveTarget('modal:x'); if (el) await clickEl(el); await dwait(400); return; }
      case 'toast': toast(st.text, st.tone); await dwait(num(st.ms, 900)); return;
      case 'notify': addNotif(st.text, st.tone); await dwait(num(st.ms, 600)); return;
      case 'log': emitLog(st.level || 'info', st.text, st.source, st.notify); await dwait(num(st.ms, 300)); return;
      case 'run': runAction(st.run || st.value); await dwait(num(st.ms, 900)); return;
      case 'theme': toggleMode(); await dwait(num(st.ms, 900)); return;
      case 'finale': D.hadFinale = true; finale(Object.assign({}, S.demo.finale || {}, st)); await dwait(400); return;
      default: warn(`demo: unbekannter Schritt „${kind}“.`); await dwait(300);
    }
  }
  async function startDemo() {
    if (D.running || !S.demo) return;
    const steps = arr(S.demo.steps);
    if (!steps.length) return;
    D.running = true; S.demoRunning = true; D.stop = false; D.paused = false; D.hadFinale = false;
    document.body.classList.add('demo-on');
    closeModal(true); closeDropdowns();
    ensureDemoUI();
    for (let i = 0; i < steps.length && !D.stop; i++) {
      D.skip = false;
      D.capStep.textContent = `${i + 1}/${steps.length}`;
      const st = typeof steps[i] === 'string' ? { say: steps[i] } : steps[i];
      try { await doStep(st); } catch (e) { console.error(e); }
      while (D.paused && !D.stop) await sleep(60);
      await dwait(num(st.pause, num(S.demo.pause, 350)));
    }
    const stopped = D.stop;
    D.running = false; S.demoRunning = false;
    document.body.classList.remove('demo-on');
    D.cursor.classList.add('hidden'); D.caption.classList.add('hidden');
    if (!stopped && !D.hadFinale && S.demo.finale !== false) finale(S.demo.finale || {});
    if (S.demo.loop && !stopped) setTimeout(startDemo, 4000);
  }

  /* =====================================================================
   * 16. „Wow“-Finale: Konfetti + Zusammenfassung
   * ===================================================================== */
  function confetti(host, ms) {
    const cv = h('canvas', { class: 'confetti' });
    (host || document.body).appendChild(cv);
    const ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1;
    const resize = () => { cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; };
    resize();
    const cs = getComputedStyle(document.documentElement);
    const colors = ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6', '--primary', '--accent'].map(v => cs.getPropertyValue(v).trim() || '#fff');
    const W = cv.width, H = cv.height;
    const P = Array.from({ length: 220 }, (_, i) => ({ x: i % 2 ? W * 0.15 : W * 0.85, y: H * 0.75, vx: (i % 2 ? 1 : -1) * (Math.random() * 9 + 3) * dpr, vy: -(Math.random() * 16 + 9) * dpr, s: (Math.random() * 7 + 4) * dpr, r: Math.random() * 6, vr: Math.random() * 0.3 - 0.15, c: colors[i % colors.length], shape: i % 3 }));
    const t0 = performance.now(), dur = ms || 4200;
    const loop = now => {
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => {
        p.vy += 0.38 * dpr; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - (now - t0) / dur);
        if (p.shape === 0) ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.s / 3, 0, 7); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(0, -p.s / 2); ctx.lineTo(p.s / 2, p.s / 2); ctx.lineTo(-p.s / 2, p.s / 2); ctx.fill(); }
        ctx.restore();
      });
      if (now - t0 < dur) requestAnimationFrame(loop); else cv.remove();
    };
    requestAnimationFrame(loop);
  }
  function finale(o) {
    o = o || {};
    document.querySelectorAll('.finale').forEach(x => x.remove());
    const stats = arr(o.stats).length ? arr(o.stats) : [
      { value: S.pageList.filter(p => !p.hidden).length, label: t('pages') },
      { value: S.stats.widgets, label: t('widgets') },
      S.stats.automations ? { value: S.stats.automations, label: t('autos') } : null,
      S.stats.integrations ? { value: S.stats.integrations, label: t('integs') } : null,
      S.stats.tables ? { value: S.stats.tables, label: t('tables') } : null,
    ].filter(Boolean);
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 450); };
    const el = h('div', { class: 'finale', ref: 'finale' },
      h('div', { class: 'finale-orb a' }), h('div', { class: 'finale-orb b' }),
      h('div', { class: 'finale-box' },
        h('div', { class: 'finale-logo' }, logoNode(true)),
        h('h1', { text: o.title || t('finTitle') }),
        h('p', { class: 'finale-text', html: md(o.text || t('finText')) }),
        h('div', { class: 'finale-stats' }, stats.map((st, i) => { const b = h('b', { text: '0' }); setTimeout(() => (typeof st.value === 'number' ? countUp(b, st.value, {}) : (b.textContent = st.value)), 400 + i * 120); return h('div', { class: 'finale-stat', style: { animationDelay: 300 + i * 120 + 'ms' } }, b, h('span', { text: st.label })); })),
        h('div', { class: 'btn-row center' },
          o.cta ? button(Object.assign({ style: 'primary', size: 'lg' }, isObj(o.cta) ? o.cta : { label: String(o.cta) })) : null,
          h('button', { class: 'btn lg ghost-light', ref: 'finale:close', text: t('cont'), onclick: close }),
          S.demo && arr(S.demo.steps).length ? h('button', { class: 'btn lg ghost-light', text: '↻ ' + t('again'), onclick: () => { close(); setTimeout(startDemo, 500); } }) : null)));
    document.body.appendChild(el);
    setTimeout(() => confetti(el), 250);
    setTimeout(() => confetti(el, 3500), 1600);
  }

  /* =====================================================================
   * 17. Start
   * ===================================================================== */
  async function boot() {
    const raw = readRawParams();
    const errors = [];
    if (!raw.map || !raw.map.trim()) {
      for (const k of ['colors', 'demo']) if (raw[k]) { try { await decodeParam(k, raw[k]); } catch (e) { errors.push(e); } }
      if (raw.logo) S.raw.logo = raw.logo;
      return showDocs(errors, true);
    }
    let cfg = null;
    try { cfg = await decodeParam('map', raw.map); } catch (e) { errors.push(e); }
    for (const k of ['colors', 'demo']) {
      if (!raw[k]) continue;
      try { const v = await decodeParam(k, raw[k]); if (k === 'colors') S.colorsParam = v; else S.demo = v; } catch (e) { errors.push(e); }
    }
    if (raw.logo) { S.logo = raw.logo; S.raw.logo = raw.logo; }
    if (!errors.length) { try { S.cfg = normalize(cfg); } catch (e) { errors.push(e.param ? e : { param: 'map', title: 'Konfigurationsfehler', message: e.message || String(e) }); } }
    if (errors.length) return showDocs(errors, false);
    await render(raw.page);
  }
  async function render(startPage) {
    const app = S.cfg.app;
    S.lang = I18N[app.lang] ? app.lang : (app.lang && /^ru/.test(app.lang) ? 'ru' : app.lang && /^en/.test(app.lang) ? 'en' : 'de');
    S.locale = app.locale || { ru: 'ru-RU', en: 'en-US', de: 'de-DE' }[S.lang];
    document.documentElement.lang = S.lang;
    if (S.demo == null && S.cfg.demo) S.demo = S.cfg.demo;
    if (Array.isArray(S.demo)) S.demo = { steps: S.demo };
    if (S.demo && !isObj(S.demo)) { warn('demo muss ein Objekt { "steps": [...] } sein.'); S.demo = null; }
    if (S.logo == null && S.cfg.logo) S.logo = S.cfg.logo;
    let saved = null; try { saved = localStorage.getItem('moqup-mode'); } catch (e) { /* ok */ }
    const pal = Object.assign({}, S.cfg.colors || {}, S.colorsParam || {});
    S.mode = saved || pal.mode || app.mode || app.theme || 'dark';
    if (S.mode !== 'light') S.mode = 'dark';
    document.documentElement.setAttribute('data-mode', S.mode);
    document.body.className = 'app-mode';
    applyColors();
    document.title = app.title;
    const total = countAll();
    showLoader(total);
    await sleep(120);
    S.building = true;
    buildShell();
    await S.loading.tick(t('preparing'));
    // Menüpunkte
    const walkM = async items => { for (const it of arr(items)) { if (it.section) continue; await S.loading.tick('☰ ' + it.title); if (it.children) await walkM(it.children); } };
    await walkM(S.cfg.menu);
    for (const p of S.pageList) { S.buildingPage = p.id; await buildPage(p); }
    S.buildingPage = null;
    if (S.cfg.chat) { buildChat(); await S.loading.tick('✦ ' + ((S.cfg.chat && S.cfg.chat.title) || 'AI')); }
    S.building = false;
    S.stats.pages = S.pageList.length;
    const first = (startPage && S.pages[startPage]) ? startPage : (app.home && S.pages[app.home] ? app.home : (S.pageList.find(p => !p.hidden) || S.pageList[0]).id);
    navigate(first);
    S.loading.finish();
    if (S.warnings.length) setTimeout(() => toast(`⚠ ${t('warnings')}: ${S.warnings.length}`, 'warning'), 1200);
    if (S.demo && S.demo.autoplay) setTimeout(startDemo, num(S.demo.delay, 1400));
  }

  // globale Tasten und Ereignisse
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && S.shell) { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape') {
      if (D.running) { D.stop = true; return; }
      if (document.querySelector('.palette-back')) document.querySelector('.palette-back').remove();
      else if (S.modal) closeModal();
      else if (document.querySelector('.card.max')) maximize(document.querySelector('.card.max'));
      else if (document.querySelector('.finale')) document.querySelector('.finale').remove();
      closeDropdowns();
    }
  });
  document.addEventListener('click', () => closeDropdowns());
  window.addEventListener('hashchange', () => location.reload());

  window.Moqup = { version: VERSION, encode: encodeParam, decode: decodeParam, navigate, runAction, startDemo, toast, finale, renderMarkdown };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
