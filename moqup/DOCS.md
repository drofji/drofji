# Moqup — документация JSON-конфигурации

Moqup превращает JSON в **кликабельный прототип админки/дашборда**: меню, разделы, KPI, графики, CRUD-таблицы, формы, автоматизации, интеграции, логи, доступы, карту маршрутов, канбан, AI-чат и демо-режим с интерактивным курсором и финальным «вау»-экраном.

Схема работы: описываете клиента (отрасль, отделы, интеграции, процессы) → ИИ генерирует JSON по этой документации → вставляете в ссылку → показываете прототип на встрече.

---

## 1. Параметры ссылки

| Параметр | Обязательный | Формат | Назначение |
|---|---|---|---|
| `map` | **да** | JSON | Вся структура: `app`, `menu`, `pages`, `chat`, `layout` |
| `colors` | нет | JSON | Палитра. Чего нет — берётся по умолчанию |
| `demo` | нет | JSON | Сценарий демо: шаги курсора, подписи, финал |
| `logo` | нет | строка | SVG-разметка, `data:image/…`, URL картинки или 1–3 символа |
| `page` | нет | строка | id раздела, который открыть первым |

Параметры можно передать после `?` или после `#` (рекомендуется `#` — длинная ссылка не уходит на сервер и не упирается в его лимиты):

```
dashboard.html#map=z:3Vbbb...&colors={"primary":"#10b981"}&demo=z:...&logo=NC
```

### Кодирование значения JSON

| Префикс | Что это | Когда использовать |
|---|---|---|
| *(нет)* | обычный JSON, URL-encoded | короткие конфигурации, ручное редактирование |
| `json:` | то же самое, явно | — |
| `b64:` | base64url от UTF-8 JSON | если мешают спецсимволы |
| `z:` | deflate-raw + base64url | **по умолчанию**: в 3–6 раз короче |
| `pako:` | zlib (как `pako.deflate`) + base64url — формат mermaid.live | если генерируете ссылку внешним инструментом |

Готовую ссылку проще всего получить во вкладке **«Конструктор ссылки»** (открывается, если открыть `dashboard.html` без параметров). Из командной строки:

```bash
# z: (deflate-raw) — Python
python3 -c "import zlib,base64,json,sys;d=json.dumps(json.load(open(sys.argv[1])),ensure_ascii=False,separators=(',',':')).encode();c=zlib.compressobj(9,zlib.DEFLATED,-15);print('z:'+base64.urlsafe_b64encode(c.compress(d)+c.flush()).decode().rstrip('='))" map.json

# pako: (zlib) — Node.js
node -e "const z=require('zlib');const s=JSON.stringify(require('./map.json'));console.log('pako:'+z.deflateSync(s,{level:9}).toString('base64url'))"
```

В консоли браузера на странице: `await Moqup.encode(JSON.stringify(cfg))` → `"z:…"`.

### Ошибки

* Нет `map` → по центру страницы сообщение «Отсутствует параметр map» + эта документация, конструктор и примеры.
* JSON сломан → сначала ошибка с **номером строки/столбца**, фрагментом и подсказками (лишняя запятая, одинарные кавычки, ключи без кавычек, комментарии, обрезанная ссылка), затем документация; конструктор заполняется вашим JSON, чтобы сразу исправить.
* Мелкие проблемы (неизвестный тип виджета, дубли id, неизвестный ключ, неверный цвет) не ломают страницу: в топбаре появляется значок **⚠ N** со списком предупреждений.

---

## 2. Корень `map`

```json
{
  "app":    { "title": "NordCargo", "subtitle": "Logistics OS", "lang": "ru" },
  "layout": { "sidebarWidth": 260, "gap": 16, "density": "comfortable" },
  "menu":   [ ... ],
  "pages":  { ... },
  "chat":   { ... },
  "colors": { ... },
  "demo":   { ... },
  "logo":   "..."
}
```

`colors`, `demo`, `logo` можно положить прямо в `map` — параметры ссылки с теми же именами имеют приоритет.

### `app`

| Ключ | Тип | По умолчанию | Описание |
|---|---|---|---|
| `title` | строка | `Moqup` | Название системы (сайдбар, загрузка, вкладка) |
| `subtitle` | строка | — | Подпись под названием |
| `lang` | `ru` \| `en` \| `de` | `ru` | Язык служебных надписей (кнопки, CRUD, чат) |
| `locale` | строка | по `lang` | Формат чисел/дат, напр. `de-DE` |
| `mode` | `dark` \| `light` | `dark` | Тема по умолчанию (переключатель 🌓 в топбаре) |
| `user` | `{name, role, avatar}` | — | Профиль в сайдбаре и топбаре |
| `notifications` | массив | — | `{text, tone, time, action}` — колокольчик 🔔 |
| `home` | строка | первый раздел | id стартового раздела |
| `search` | bool | `true` | Поиск/палитра команд (Ctrl/⌘ + K) |
| `sidebarCollapsed` | bool | `false` | Свернуть меню до иконок |
| `footer` | строка | — | Подвал (мини-markdown) |
| `logo` | строка | — | Логотип (как параметр `logo`) |

### `layout`

| Ключ | Описание |
|---|---|
| `sidebarWidth` | ширина меню, px (по умолчанию 260) |
| `gap` | расстояние между блоками, px (16) |
| `maxWidth` | максимальная ширина контента, px (1680) |
| `radius` | скругление карточек, px (14) |
| `density` | `comfortable` \| `compact` |
| `background` | `glow` (градиентное свечение) \| `plain` |

---

## 3. Меню и разделы

`menu` — массив пунктов. Пункт **без** `children` — это страница; пункт **с** `children` — раскрывающаяся группа (вложенность любая).

```json
"menu": [
  { "section": "Операции" },
  { "id": "dashboard", "title": "Обзор", "icon": "📊", "subtitle": "KPI в реальном времени",
    "actions": [ { "label": "Новый заказ", "style": "primary", "action": "navigate:orders" } ],
    "widgets": [ ... ] },
  { "id": "wms", "title": "Склад (WMS)", "icon": "🏭", "open": true, "children": [
    { "id": "stock", "title": "Остатки", "widgets": [ ... ] },
    { "id": "zones", "title": "Зоны", "page": "zones" }
  ] }
]
```

| Ключ пункта | Описание |
|---|---|
| `id` | уникальный id (для `navigate:id`, демо, `?page=`). Если нет — из названия |
| `title` | название |
| `icon` | эмодзи (рекомендуется) или имя: `dashboard, orders, users, truck, warehouse, money, invoice, bolt, plug, log, lock, chat, ai, calendar, mail, tasks, cart, report, map, database, crm, marketing, settings…` |
| `badge`, `badgeTone` | бейдж справа (`12`, `new`) и его цвет |
| `section` | только `{ "section": "Заголовок" }` — разделитель группы |
| `children` | вложенные пункты |
| `open` | группа раскрыта при загрузке |
| `subtitle` | подзаголовок страницы (мини-markdown) |
| `actions` | кнопки в шапке страницы (см. «Кнопки») |
| `widgets` | содержимое страницы |
| `page` | ссылка на объект в `map.pages` (вместо `widgets` прямо в меню) |
| `header` | `false` — скрыть шапку страницы |

`pages` — словарь `{ "id": { "title", "subtitle", "actions", "widgets" } }`. Страницы, на которые не ссылается меню, становятся **скрытыми** — на них можно попасть только действием `navigate:id` (удобно для карточки клиента, детализации заказа и т. п.).

---

## 4. Виджеты: общие свойства и размеры

Каждый элемент `widgets` — объект с `type`. Сетка — **12 колонок**.

| Ключ | Описание |
|---|---|
| `type` | тип виджета (см. ниже) |
| `id` | уникальный id (нужен для `addTo`, демо, `run:`, поиска) |
| `title`, `subtitle`, `icon` | заголовок карточки |
| `w` | ширина на десктопе ≥1200 px, 1–12 |
| `md` | ширина на планшете 768–1199 px (по умолчанию: `w≤6 → 6`, иначе 12) |
| `sm` | ширина на телефоне <768 px (по умолчанию 12; у `stat`/`gauge` — 6, два в ряд) |
| `h` | высота тела (число = px, или `"300px"`, `"40vh"`) |
| `minH` | минимальная высота |
| `tone` | цветная полоска сверху карточки |
| `tools` | доп. кнопки в шапке карточки |
| `footer` | строка (markdown) или `{label, action}` — ссылка внизу |
| `collapsible` | `false` — убрать кнопки «свернуть/развернуть» |

Ширина по умолчанию: `stat/gauge` 3, `list/status/progress/image/chart pie|donut` 4, `chart/form/timeline/logs/matrix/heatmap/funnel/text/accordion` 6, `routes` 8, остальные 12.

**Цвета (`tone`, `color`)**: `primary, accent, success, warning, danger, info, muted` (+ синонимы `green, red, orange, blue, purple, cyan, gray`), `c1…c8` (палитра графиков) или `#hex` / `rgb()` / `hsl()`.

**Мини-markdown** в текстах: `**жирный**`, `*курсив*`, `` `код` ``, `~~зачёркнутый~~`, `[ссылка](https://…)`, перевод строки `\n`.

---

## 5. Каталог виджетов

### `stat` — KPI-плитка (синонимы: `kpi`, `box`, `infobox`)
```json
{ "type": "stat", "label": "Заказы сегодня", "value": 1284, "icon": "📦", "tone": "primary",
  "trend": "+12%", "trendText": "к вчера", "spark": [8,10,9,13,12,15], "action": "navigate:orders" }
```
`value` — число (анимированный счётчик) или строка. `prefix`, `suffix`, `unit`, `currency` (`EUR`, `USD`… или символ), `decimals`. `trend` — строка (`+` зелёный, `-` красный) или `{value, tone, text}`; `inverse: true` — рост это плохо (расходы). `progress` (0–100) + `progressText`. `variant`: `soft` (по умолчанию) \| `solid` \| `outline`. `action` делает плитку кликабельной.

### `chart` — графики
```json
{ "type": "chart", "kind": "area", "title": "Отгрузки", "labels": ["Пн","Вт","Ср"],
  "series": [ {"name": "2026", "data": [5,8,6]}, {"name": "2025", "data": [4,6,7], "color": "warning"} ] }
```
`kind`: `line` \| `area` \| `bar` \| `pie` \| `donut`. Для баров `stacked: true`. Для `pie/donut`: `data: [{label, value, color}]` или `labels` + `values`; `center`, `centerLabel` — текст в центре donut. Общие: `h` (высота, 260), `currency`, `unit`, `smooth: false`, `legend: false`. Подсказки при наведении, анимация появления.

### `table` — таблица / CRUD
```json
{ "type": "table", "id": "orders-table", "title": "Заказы", "crud": true, "export": true, "pageSize": 8,
  "columns": [
    {"key": "id", "label": "№", "auto": "id", "prefix": "#", "editable": false},
    {"key": "client", "label": "Клиент", "type": "avatar", "required": true},
    {"key": "status", "label": "Статус", "type": "status", "filter": true, "options": ["Новый","В пути","Доставлен"]},
    {"key": "amount", "label": "Сумма", "type": "money", "currency": "EUR"}
  ],
  "rows": [ ["#1001", "Bäckerei Schmidt", "В пути", 1450] ] }
```
* `rows` — массивы (по порядку колонок) или объекты `{key: value}`.
* `crud: true` = добавление + редактирование + удаление (или `{create, edit, delete}`). Удаление с подтверждением, массовое удаление через чекбоксы.
* Типы колонок: `text`, `number` (`unit`), `money` (`currency`), `percent`, `progress` (0–100), `status`/`badge` (цвет по смыслу слова или `tones: {"Оплачен": "success"}`), `avatar` (+ `sub`: ключ подписи), `bool`, `tags`, `date` (`YYYY-MM-DD`), `rating` (0–5), `code`, `link` (+ `action`, можно `{key}`-подстановки: `"navigate:client-{id}"`).
* Колонка: `filter: true` — выпадающий фильтр; `options` — варианты в форме; `default`; `required`; `editable: false`; `auto: "id"` — автономер; `sortable: false`; `width`.
* Таблица: `search` (true), `export` (CSV), `selectable`, `addLabel`, `addTitle`, `emptyText`, `h` (макс. высота со скроллом), `rowAction`: `"details"` (по умолчанию — карточка записи), `"edit"`, `false` или любое действие, `rowActions` — кнопки в строке.
* На телефоне строки превращаются в карточки «поле — значение».

### `form` — форма
```json
{ "type": "form", "id": "quick-order", "title": "Быстрый заказ",
  "fields": [
    {"name": "client", "label": "Клиент", "required": true},
    {"name": "route", "label": "Маршрут", "type": "select", "options": ["HH → B", "K → F"]},
    {"name": "weight", "label": "Вес", "type": "number", "w": 6},
    {"name": "eta", "label": "Дата", "type": "date", "w": 6},
    {"name": "express", "label": "Экспресс", "type": "toggle"}
  ],
  "submit": { "label": "Создать", "addTo": "orders-table", "toast": "Заказ создан", "log": "Создан заказ для {client}" } }
```
Типы полей: `text, email, tel, number, money, password, date, time, datetime, color, url, select, radio, textarea, checkbox, toggle, range (min,max,step,unit), file`. У поля: `label`, `placeholder`, `value`, `required`, `help`, `w` (ширина из 12), `options` (строки или `{value,label}`).
`submit`: `label`, `icon`, `addTo` (id таблицы — запись добавится в неё; имена полей = `key` колонок), `toast`, `log`, `action`, `reset` (true), `delay` (мс «отправки»). `reset: "Очистить"` у формы — кнопка сброса.

### `list` — список (`todo` / `checklist: true` — чек-лист)
`items: [{title, subtitle, icon | avatar, tone, badge, badgeTone, meta, action, done}]`

### `timeline` — лента событий (`activity`)
`items: [{time, user, title, text, icon, tone}]`. `capture: true` — в начало ленты автоматически попадают события системы (CRUD, автоматизации, синхронизации).

### `logs` — журнал (`terminal`)
```json
{ "type": "logs", "title": "Live-журнал", "h": 360, "live": {"interval": 1500, "pool": [{"level": "info", "source": "api", "text": "GET /orders 200"}]},
  "lines": [{"time": "10:42", "level": "success", "source": "sap", "text": "Синхронизация завершена"}] }
```
Уровни: `info, success, warn, error, debug`. Фильтры по уровням, пауза, очистка. `live` — новые строки по таймеру (`true` = встроенный набор). `capture` (по умолчанию `true`) — сюда пишутся все действия в прототипе. `{n}` в тексте → случайное число.

### `process` — линия процесса (`pipeline`, `steps`)
`steps: [{title, desc, icon, status: done|active|pending|error, meta, action, fail}]`. `runnable: true` + `runLabel` — кнопка «▶ Запустить» прогоняет этапы с анимацией и логами (`fail: true` — остановка с ошибкой на шаге). `vertical: true`. `stepDelay` (мс). На телефоне — вертикально.

### `flow` — схема сценария / интеграций (`workflow`, `graph`)
```json
{ "type": "flow", "title": "Shopify → SAP → DATEV",
  "nodes": [ {"id": "shop", "label": "Shopify", "sub": "заказ", "icon": "🛒"}, {"id": "sap", "label": "SAP", "icon": "🗄"}, {"id": "datev", "label": "DATEV", "icon": "🧾", "tone": "warning"} ],
  "edges": [ {"from": "shop", "to": "sap", "label": "webhook"}, {"from": "sap", "to": "datev"} ] }
```
Узлы раскладываются по уровням автоматически; вручную — `col`, `row`. Без `edges` узлы соединяются по порядку. По рёбрам бегут точки данных (`animate: false` — выключить). Кнопка «▶ Симуляция» подсвечивает узлы по очереди и пишет в логи (`runnable: false` — убрать). Узел: `desc` (подсказка по клику), `action`, `log`. `rowHeight`.

### `routes` — карта маршрутов / путей (`map`)
```json
{ "type": "routes", "title": "Рейсы", "ratio": 0.5, "vehicleIcon": "🚚",
  "points": [ {"id": "hh", "label": "Hamburg", "x": 30, "y": 15, "type": "hub", "info": ["Загрузка 82%"], "action": "navigate:zones"},
              {"id": "m", "label": "München", "x": 70, "y": 88} ],
  "routes": [ {"from": "hh", "to": "m", "vehicles": 2, "speed": 9, "tone": "warning", "label": "A7", "dashed": false} ],
  "regions": [ {"x": 30, "y": 30, "rx": 20, "ry": 25, "label": "Nord"} ],
  "legend": [ {"label": "Задержка", "tone": "warning"} ] }
```
`x, y` — координаты в процентах (0–100). Точки: `type: hub|warehouse` (крупнее), `tone`, `info` (строки во всплывашке), `action` + `actionLabel`. Маршрут: `vehicles` (сколько машин едет), `speed` (сек на проход), `loop: "forward"` (по умолчанию туда-обратно), `icon`, `curve`, `status`, `info`, `action`. Подходит для логистики, цепочек поставок, customer journey.

### `kanban` — доска (`board`)
`columns: [{title, tone, done, cards: [{title, text, tags, user, due, tone}]}]`. Перетаскивание мышью, клик по карточке — детали и кнопки «→ Колонка» (работает и на телефоне), добавление карточек (`add: false` — выключить).

### `matrix` — матрица прав (`access`, `permissions`)
`roles: ["Админ","Менеджер"]`, `permissions: [{group: "Заказы"}, {label: "Удаление", values: [1,0], desc: "…", locked: true}]`. Переключатели логируются.

### `status` — состояние сервисов (`health`)
`items: [{name, status: online|degraded|offline|maintenance, latency, uptime, icon, desc, action}]`. Пульсирующие индикаторы, «живая» задержка, полоска аптайма (`history: false`, `live: false`).

### `integrations` — интеграции
`items: [{name, category, desc, connected, lastSync, color, icon, metric}]`. Переключатель подключения, кнопка синхронизации, фильтр по категориям.

### `automations` — правила «если → то» (`rules`)
```json
{ "type": "automations", "id": "rules", "triggers": ["Новый заказ", "Задержка рейса"],
  "items": [ {"name": "Счёт после доставки", "icon": "🧾", "trigger": "Статус = Доставлен", "conditions": ["сумма > 0"],
              "actions": ["Создать счёт", "Выгрузить в DATEV"], "enabled": true, "runs": 9310, "lastRun": "10:42", "success": 100} ] }
```
Вкл/выкл, запуск ▶ с подсветкой цепочки, счётчик запусков, «＋ Добавить» — форма новой автоматизации (`triggers` — варианты; `add: false` — скрыть).

### Остальные

| Тип | Ключи |
|---|---|
| `progress` | `items: [{label, value, max, unit, tone, meta}]` |
| `gauge` | `value, min, max, unit, label, tone, thresholds: [{value, tone}]` |
| `funnel` | `stages: [{label, value, tone}]`, `currency`, `unit` — воронка с конверсией |
| `heatmap` | `rows, cols, data: [[…]]`, `unit`, `tone`, `showValues` |
| `buttons` | `buttons: [кнопки]`, `align: left|center|right|between` |
| `text` | `text` (markdown); `bare: true` — без карточки |
| `callout` (`alert`) | `tone, title, text, icon, buttons, dismissible` |
| `heading` | `text, subtitle, icon` — заголовок секции в сетке |
| `image` | `src` (https / data:image / относительный путь), `alt`, `h`, `fit` |
| `tabs` | `tabs: [{title, icon, badge, text, widgets: […]}]` — **вложенные** виджеты |
| `accordion` | `items: [{title, icon, open, text, widgets}]`, `single: true` |
| `group` (`row`) | `widgets: […]` — вложенная сетка; с `title` — в карточке |

---

## 6. Кнопки и действия

Кнопка: `{ "id": "add", "label": "Новый заказ", "icon": "＋", "style": "primary", "size": "sm", "busy": 900, "action": "…" }`.
`style`: `primary, secondary, success, danger, warning, info, ghost, outline`; `size`: `sm, lg`; `busy` — показать спиннер N мс перед действием.

Действие (`action`) — строка `"тип:значение"` или объект. Можно массив действий.

| Действие | Строкой | Объектом |
|---|---|---|
| Перейти в раздел | `navigate:orders` | `{"type":"navigate","to":"orders"}` |
| Уведомление | `toast:Сохранено` | `{"type":"toast","text":"…","tone":"warning"}` |
| Модальное окно | `modal:Текст` | `{"type":"modal","title":"…","text":"…","size":"lg","widgets":[…],"fields":[…]}` |
| Открыть ссылку | `url:https://…` | `{"type":"url","href":"…"}` |
| Написать в AI-чат | `chat:Отчёт за неделю` | `{"type":"chat","text":"…"}` |
| Запись в логи | `log:Текст` | `{"type":"log","level":"warn","text":"…"}` |
| Уведомление в 🔔 | `notify:Текст` | `{"type":"notify","text":"…"}` |
| Открыть форму добавления | `add:orders-table` | у `table` / `automations` |
| Запустить | `run:order-flow` | у `process` / `flow` |
| Подсветить | `highlight:w:orders-table` | — |
| Конфетти / финал / демо / тема | `confetti`, `finale`, `demo`, `theme` | `{"type":"finale","title":"…"}` |

Дополнительно у любого объекта действия: `toast`, `log`, `notify` (побочные эффекты), `then` + `delay` (следующее действие).

---

## 7. AI-чат (`map.chat`)

```json
"chat": {
  "title": "Nord AI", "subtitle": "знает ваши заказы и склад", "avatar": "✦", "position": "right", "open": false,
  "messages": [ {"from": "bot", "text": "Здравствуйте! Чем помочь?"}, {"from": "user", "text": "Покажи задержки"} ],
  "suggestions": ["Отчёт по задержкам", "Что с остатками?"],
  "replies": [
    {"match": ["задерж", "delay"], "text": "Сейчас **2 рейса** с задержкой…",
     "buttons": [{"label": "Открыть карту", "action": "navigate:fleet"}],
     "widget": {"type": "chart", "kind": "bar", "h": 140, "labels": ["Пн","Вт"], "series": [{"name": "Задержки", "data": [4,2]}]},
     "action": "navigate:fleet", "delay": 900}
  ],
  "fallback": "В рабочей версии я отвечу по данным компании."
}
```
Плавающая кнопка с бейджем непрочитанных, индикатор «печатает…», потоковый вывод текста. `replies` подбираются по вхождению любого слова из `match` (без учёта регистра). В ответ бота можно вставить **любой виджет** (`widget`), кнопки и действие. `enabled: false` — скрыть чат. `typingSpeed` — скорость печати.

---

## 8. Палитра (`colors`)

```json
{ "primary": "#6c7cff", "primary2": "#a26bff", "accent": "#22d3ee",
  "success": "#22c55e", "warning": "#f59e0b", "danger": "#ef4444", "info": "#38bdf8",
  "bg": "#0a0f1f", "bg2": "#0e1428", "surface": "#121a33", "surface2": "#1a2445", "text": "#e8ecff", "muted": "#8c97c2", "border": "rgba(148,163,255,.12)",
  "sidebar": "#0b1124", "sidebarText": "#a9b3dc", "sidebarActive": "rgba(108,124,255,.16)", "topbar": "rgba(10,15,31,.72)", "primaryContrast": "#fff", "logoBg": "#111",
  "chart": ["#6c7cff", "#22d3ee", "#a26bff", "#22c55e", "#f59e0b", "#f472b6", "#38bdf8", "#ef4444"],
  "radius": 14, "font": "Inter, sans-serif", "mode": "dark",
  "light": { "bg": "#f7f8fc" }, "dark": { "bg": "#05070f" } }
```
Любой ключ необязателен. `light` / `dark` — переопределения для конкретной темы. Цвета: `#hex`, `rgb()/rgba()`, `hsl()`, названия CSS.

---

## 9. Логотип (`logo`)

* SVG-разметка: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">…</svg>` (выводится как `<img>` — скрипты внутри не выполняются);
* `data:image/png;base64,…`, `https://…/logo.svg`, относительный путь `logo.png`;
* `b64:` + base64 от SVG;
* любой короткий текст / эмодзи (`NC`, `🚚`) — плашка с градиентом.

Без логотипа — инициалы `app.title`.

---

## 10. Демо-режим (`demo`)

В топбаре появляется кнопка **▶ Демо**. Курсор сам ведёт по системе, кликает, печатает в поля, выбирает значения, подсвечивает блоки, пишет в чат; снизу — подписи для презентации (пауза ⏸, пропуск ⏭, стоп ✕ / Esc). В конце — экран-финал с конфетти и счётчиками (разделы, виджеты, автоматизации, интеграции).

```json
{
  "autoplay": false, "speed": 1, "loop": false, "pause": 350,
  "steps": [
    {"do": "say", "say": "Это прототип NordCargo", "ms": 2500},
    {"do": "navigate", "to": "orders", "say": "Раздел заказов"},
    {"do": "type", "target": "w:quick-order field:client", "text": "Bäckerei Müller"},
    {"do": "select", "target": "w:quick-order field:route", "value": "Frankfurt → München"},
    {"do": "click", "target": "w:quick-order submit", "say": "Заказ сразу в таблице"},
    {"do": "highlight", "target": "w:orders-table", "ms": 1800},
    {"do": "click", "target": "w:rules run:0"},
    {"do": "chat", "text": "Отчёт по задержкам"},
    {"do": "finale", "title": "NordCargo OS", "text": "Запуск MVP за 6–8 недель"}
  ],
  "finale": { "title": "…", "text": "…", "stats": [{"value": 12, "label": "отделов"}], "cta": {"label": "Обсудить проект", "action": "toast:Спасибо!"} }
}
```

Шаги (`do`): `say` (только подпись, `ms`), `wait` (`ms`), `navigate` (`to`), `click`, `type` (`text`, `clear`, `enter`, `speed`), `select` (`value` — значение или часть текста), `check`, `hover`, `highlight` (`ms`), `scroll`, `chat` (`text`, `close`), `close` (закрыть модалку), `toast`, `notify`, `log`, `run` (любое действие в `run`), `theme`, `finale`. У каждого шага: `say` — подпись, `ms` — пауза после, `pause`. Строка вместо объекта = подпись. `demo` можно передать массивом шагов. `finale: false` — без финала.

### Цели (`target`)

Цель — цепочка ссылок через пробел, каждая ищется внутри предыдущей:

| Ссылка | Что находит |
|---|---|
| `menu:ID` | пункт меню |
| `w:ID` | виджет по `id` |
| `field:NAME` | поле формы (в форме-виджете и в модалке) |
| `submit` | кнопка отправки формы |
| `add`, `search`, `export`, `bulk-delete`, `filter:KEY` | инструменты таблицы |
| `row:N`, `edit`, `delete` | строка таблицы (с 0 на текущей странице) и её кнопки: `w:orders row:0 edit` |
| `run`, `run:N`, `toggle:N`, `sync:N`, `auto:N`, `integ:N` | процессы/flow, автоматизации, интеграции |
| `step:N`, `node:ID`, `item:N`, `svc:N`, `col:SLUG`, `perm:R:C`, `tab:SLUG`, `acc:N` | шаги, узлы flow, пункты списка, сервисы, колонки kanban, ячейки матрицы, вкладки, аккордеон |
| `btn:ID` | кнопка с `id` |
| `modal`, `modal:save`, `modal:cancel`, `modal:close`, `modal:x`, `modal:edit` | модальное окно и его кнопки |
| `chat:toggle`, `chat:input`, `chat:send`, `chat:close`, `chat:sugg:N` | чат |
| `demo`, `theme`, `notifications`, `search`, `menu-toggle` | топбар |
| `text:Сохранить` | видимый элемент, содержащий текст (самый короткий) |
| `css:.selector` | произвольный CSS-селектор |

Если цель не найдена, демо покажет «⚠ Цель не найдена» и продолжит.

---

## 11. Промпт для ИИ (скопируйте и дополните контекстом)

```
Ты — генератор прототипов админ-панелей для Moqup. Верни ТОЛЬКО валидный JSON (без комментариев,
без markdown) — объект с ключами "map", "colors", "demo", "logo" по документации DOCS.md Moqup.

Контекст клиента:
- Компания и отрасль: <…>
- Отделы и роли: <…>
- Текущие системы/интеграции: <SAP, DATEV, Shopify, …>
- Процессы и боли: <…>
- Что хотим автоматизировать: <…>
- Язык интерфейса: ru | de | en

Требования:
1. 6–10 разделов в "menu" с группами ("section", "children"), у каждого раздела 3–8 виджетов.
2. Обязательно покажи: KPI (stat + chart), CRUD-таблицу с формой (form.submit.addTo = id таблицы),
   автоматизации (automations + flow), интеграции (integrations + status), логи (logs live + timeline capture),
   доступы (matrix + таблица пользователей), процесс (process runnable), для логистики — routes, для задач — kanban.
3. Данные реалистичные для отрасли и страны клиента (имена, суммы в EUR, даты YYYY-MM-DD).
4. Все id уникальные, латиницей; ширины w в сумме по 12 в ряду; sm/md — по необходимости.
5. "chat": 4–6 replies по ключевым сценариям клиента, suggestions, по возможности widget в ответе.
6. "demo": 12–20 шагов, которые показывают CRUD, автоматизацию, интеграцию, доступы и чат; в конце finale
   с ценностью для клиента. Цели: menu:ID, w:ID field:NAME, w:ID submit, w:ID run:0, w:ID sync:0, perm:R:C, chat.
7. "colors" — под бренд клиента; "logo" — простой SVG 64×64 или 2–3 буквы.
```

Полученный JSON вставьте в «Конструктор ссылки» (поля `map`, `colors`, `demo`, `logo`) → «Ссылка (сжатая z:)».

---

## 12. Файлы

| Файл | Назначение |
|---|---|
| `dashboard.html` | страница + все стили (CSS-переменные — для смены дизайна правьте `:root`) |
| `helper.js` | движок: чтение/декодирование параметров, проверка, рендер, виджеты, чат, демо |
| `examples.js` | готовые примеры (логистика/WMS на русском, CRM на немецком) — эталон структуры |
| `DOCS.md` | эта документация (показывается на странице без `map`, если открыта через http) |

Зависимостей и сборки нет: можно открыть локально (`file://`) или положить на любой статический хостинг (GitHub Pages и т. п.). Выбор темы (🌓) запоминается в браузере. Все данные — демонстрационные и живут только в памяти вкладки.
