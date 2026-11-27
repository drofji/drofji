/*!
 * Moqup — готовые примеры конфигураций. Показываются на экране документации (вкладка «Примеры»).
 * Каждый пример = { title, description, icon, map, colors?, demo?, logo? } — те же параметры, что и в ссылке.
 * Используйте их как образец для ИИ: структура map здесь «эталонная».
 */
window.MOQUP_EXAMPLES = {

  /* ======================= 1. Логистика + склад (WMS) ======================= */
  logistics: {
    title: 'NordCargo — логистика, склад (WMS), автоматизации',
    description: 'CRUD заказов, карта маршрутов с машинами, склад, сценарии автоматизации, интеграции, логи, доступы, AI-чат и демо с финалом.',
    icon: '🚚',
    logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#6c7cff"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><path d="M14 40V22h20v18M34 28h9l7 7v5H34" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><circle cx="22" cy="43" r="4.5" fill="#fff"/><circle cx="43" cy="43" r="4.5" fill="#fff"/></svg>',
    colors: { primary: '#6c7cff', accent: '#22d3ee' },
    map: {
      app: {
        title: 'NordCargo', subtitle: 'Logistics OS', lang: 'ru', currency: 'EUR',
        user: { name: 'Анна Keller', role: 'Head of Operations' },
        notifications: [
          { text: '**Задержка** рейса HH → MUC на 40 мин', tone: 'warning', time: '5 мин назад', action: 'navigate:fleet' },
          { text: 'DATEV: экспорт счетов за ноябрь готов', tone: 'success', time: '1 ч назад', action: 'navigate:finance' },
        ],
        footer: 'NordCargo Logistics OS · прототип · данные демонстрационные',
      },
      menu: [
        { section: 'Операции' },
        { id: 'dashboard', title: 'Обзор', icon: '📊', subtitle: 'Ключевые показатели в реальном времени',
          actions: [{ label: 'Отчёт', icon: '📑', style: 'secondary', action: 'toast:Отчёт сформирован и отправлен на почту', busy: 900 }, { label: 'Новый заказ', icon: '＋', style: 'primary', action: 'navigate:orders', id: 'new-order' }],
          widgets: [
            { type: 'stat', label: 'Заказы сегодня', value: 1284, icon: '📦', trend: '+12%', trendText: 'к вчера', spark: [8, 10, 9, 13, 12, 15, 14, 18], tone: 'primary', action: 'navigate:orders' },
            { type: 'stat', label: 'В пути', value: 342, icon: '🚚', trend: '+4%', spark: [5, 6, 6, 7, 9, 8, 9, 10], tone: 'accent', action: 'navigate:fleet' },
            { type: 'stat', label: 'Доставлено вовремя', value: 97.4, suffix: '%', icon: '⏱', progress: 97.4, progressText: 'цель 96%', tone: 'success' },
            { type: 'stat', label: 'Выручка (месяц)', value: 284500, currency: 'EUR', icon: '💶', trend: '+8.1%', variant: 'solid', tone: 'primary', action: 'navigate:finance' },
            { type: 'chart', kind: 'area', title: 'Отгрузки за 14 дней', subtitle: 'паллеты / день', w: 8, labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
              series: [{ name: 'Отгружено', data: [320, 340, 310, 390, 420, 380, 300, 450, 470, 440, 500, 520, 490, 560] }, { name: 'Возвраты', data: [12, 18, 10, 22, 15, 17, 9, 20, 14, 19, 16, 12, 18, 15], color: 'warning' }] },
            { type: 'chart', kind: 'donut', title: 'Каналы заказов', w: 4, centerLabel: 'заказов', data: [{ label: 'Shopify', value: 540 }, { label: 'EDI / SAP', value: 380 }, { label: 'API', value: 220 }, { label: 'Вручную', value: 144 }] },
            { type: 'routes', id: 'map-main', title: 'Маршруты сейчас', subtitle: 'кликните точку или машину', w: 8,
              regions: [{ x: 30, y: 30, rx: 22, ry: 26, label: 'Nord' }, { x: 70, y: 70, rx: 24, ry: 24, label: 'Süd' }],
              points: [
                { id: 'hh', label: 'Hamburg Hub', x: 34, y: 16, type: 'hub', info: ['Загрузка: **82%**', 'Рамп свободно: 3 / 12'], action: 'navigate:zones', actionLabel: 'Склад →' },
                { id: 'b', label: 'Berlin', x: 72, y: 30, info: ['12 машин в пути'] },
                { id: 'k', label: 'Köln', x: 14, y: 52, info: ['ETA: 14:20'] },
                { id: 'f', label: 'Frankfurt', x: 34, y: 64, type: 'warehouse', info: ['Склад FRA-2', 'Остаток: 4 210 паллет'] },
                { id: 'm', label: 'München', x: 66, y: 86, info: ['⚠ задержка 40 мин'], tone: 'warning' },
              ],
              routes: [
                { from: 'hh', to: 'b', vehicles: 2, speed: 9, label: 'A24' },
                { from: 'hh', to: 'k', vehicles: 1, speed: 11 },
                { from: 'k', to: 'f', vehicles: 1, speed: 7 },
                { from: 'f', to: 'm', vehicles: 2, speed: 10, status: 'задержка', tone: 'warning', info: 'пробка на A9' },
                { from: 'b', to: 'm', vehicles: 1, speed: 14, dashed: true, label: 'план' },
              ] },
            { type: 'status', title: 'Сервисы', w: 4, items: [
              { name: 'API Gateway', status: 'online', latency: 84, uptime: 99.98, icon: '🧩' },
              { name: 'SAP S/4HANA', status: 'online', latency: 210, uptime: 99.9, icon: '🗄' },
              { name: 'DHL Tracking', status: 'degraded', latency: 1240, uptime: 98.7, icon: '📡' },
              { name: 'Telematics', status: 'online', latency: 120, uptime: 99.95, icon: '🛰' }] },
            { type: 'process', id: 'order-flow', title: 'Жизненный цикл заказа', subtitle: 'нажмите «Запустить», чтобы прогнать заказ по этапам', runnable: true, runLabel: 'Прогнать заказ', w: 12, steps: [
              { title: 'Заказ получен', desc: 'Shopify / EDI', status: 'done', icon: '📥' },
              { title: 'Проверка', desc: 'адрес, вес, оплата', status: 'done', icon: '🔍' },
              { title: 'Комплектация', desc: 'склад FRA-2', status: 'active', icon: '📦', meta: '12 мин' },
              { title: 'Отгрузка', desc: 'рампа 4', icon: '🚚' },
              { title: 'В пути', desc: 'телематика', icon: '🛰' },
              { title: 'Доставлено', desc: 'e-подпись', icon: '✅' }] },
            { type: 'timeline', title: 'Последние события', w: 6, capture: true, items: [
              { time: '10:42', title: 'Заказ #48211 доставлен', text: 'Bäckerei Schmidt GmbH, подпись получена', tone: 'success', icon: '✓' },
              { time: '10:31', title: 'Задержка на A9', text: 'ETA München +40 мин, клиент уведомлён автоматически', tone: 'warning', icon: '!' },
              { time: '10:05', title: 'Синхронизация SAP', text: '1 284 позиции обновлены', tone: 'info', icon: '⟳' }] },
            { type: 'list', title: 'Требуют внимания', w: 6, items: [
              { title: 'Заказ #48177 — нет слота на рампе', subtitle: 'Hamburg Hub · 18:00', icon: '⚠', tone: 'warning', badge: 'высокий', badgeTone: 'danger', action: 'navigate:orders' },
              { title: 'Фура B-NC 2041 — ТО через 2 дня', subtitle: 'Пробег 148 200 км', icon: '🔧', tone: 'info', meta: '2 дня', action: 'navigate:fleet' },
              { title: 'DHL API отвечает медленно', subtitle: 'Средняя задержка 1.2 c', icon: '📡', tone: 'danger', badge: 'деградация', action: 'navigate:integrations' },
              { title: 'Остаток SKU-1182 ниже минимума', subtitle: 'Стрейч-плёнка 23 мкм', icon: '📉', tone: 'warning', meta: '42 шт', action: 'navigate:stock' }] },
          ] },
        { id: 'orders', title: 'Заказы', icon: '📦', badge: 12, subtitle: 'Создание, редактирование и удаление заказов (CRUD)',
          widgets: [
            { type: 'form', id: 'quick-order', title: 'Быстрый заказ', icon: '⚡', w: 4, md: 12,
              fields: [
                { name: 'client', label: 'Клиент', required: true, placeholder: 'Компания' },
                { name: 'route', label: 'Маршрут', type: 'select', options: ['Hamburg → Berlin', 'Köln → Frankfurt', 'Frankfurt → München', 'Hamburg → Köln'] },
                { name: 'weight', label: 'Вес, кг', type: 'number', w: 6, value: 800 },
                { name: 'eta', label: 'Дата доставки', type: 'date', w: 6, value: '2026-12-02' },
                { name: 'express', label: 'Экспресс-доставка', type: 'toggle' }],
              submit: { label: 'Создать заказ', icon: '＋', addTo: 'orders-table', delay: 800 } },
            { type: 'table', id: 'orders-table', title: 'Заказы', w: 8, md: 12, crud: true, export: true, pageSize: 7, currency: 'EUR', addLabel: 'Новый заказ',
              columns: [
                { key: 'id', label: '№', auto: 'id', prefix: '#4', editable: false, width: 80 },
                { key: 'client', label: 'Клиент', type: 'avatar', required: true },
                { key: 'route', label: 'Маршрут', filter: true, options: ['Hamburg → Berlin', 'Köln → Frankfurt', 'Frankfurt → München', 'Hamburg → Köln'] },
                { key: 'weight', label: 'Вес', type: 'number', unit: 'кг' },
                { key: 'status', label: 'Статус', type: 'status', filter: true, default: 'Новый', options: ['Новый', 'Комплектация', 'В пути', 'Доставлен', 'Задержка', 'Отменён'] },
                { key: 'eta', label: 'Доставка', type: 'date' },
                { key: 'amount', label: 'Сумма', type: 'money', default: 690 }],
              rows: [
                ['#48211', 'Bäckerei Schmidt GmbH', 'Hamburg → Berlin', 1200, 'Доставлен', '2026-11-27', 1450],
                ['#48207', 'Autohaus Weber', 'Köln → Frankfurt', 3400, 'В пути', '2026-11-28', 3890],
                ['#48199', 'Mode Lindner KG', 'Frankfurt → München', 640, 'Задержка', '2026-11-27', 720],
                ['#48190', 'BioMarkt Nord', 'Hamburg → Köln', 2100, 'Комплектация', '2026-11-29', 2310],
                ['#48185', 'TechParts AG', 'Hamburg → Berlin', 900, 'Новый', '2026-11-30', 980],
                ['#48177', 'Möbel Krause', 'Köln → Frankfurt', 5200, 'Комплектация', '2026-11-29', 5600],
                ['#48160', 'Pharma Süd', 'Frankfurt → München', 300, 'Доставлен', '2026-11-26', 1290],
                ['#48151', 'Getränke Huber', 'Hamburg → Köln', 4100, 'Отменён', '2026-11-25', 0]] },
          ] },
        { id: 'fleet', title: 'Маршруты и автопарк', icon: '🚚',
          widgets: [
            { type: 'routes', title: 'Карта рейсов', w: 12, ratio: 0.42, vehicleIcon: '🚛',
              points: [{ id: 'hh', label: 'Hamburg', x: 30, y: 15, type: 'hub' }, { id: 'b', label: 'Berlin', x: 75, y: 30 }, { id: 'k', label: 'Köln', x: 10, y: 55 }, { id: 'f', label: 'Frankfurt', x: 38, y: 70, type: 'warehouse' }, { id: 'm', label: 'München', x: 70, y: 88 }, { id: 'l', label: 'Leipzig', x: 62, y: 50 }],
              routes: [{ from: 'hh', to: 'b', vehicles: 3, speed: 12 }, { from: 'b', to: 'l', vehicles: 1, speed: 6 }, { from: 'l', to: 'm', vehicles: 2, speed: 9 }, { from: 'k', to: 'f', vehicles: 2, speed: 8 }, { from: 'f', to: 'm', vehicles: 1, speed: 9, tone: 'warning' }, { from: 'hh', to: 'k', vehicles: 2, speed: 13 }],
              legend: [{ label: 'По плану', tone: 'primary' }, { label: 'Задержка', tone: 'warning' }] },
            { type: 'table', title: 'Автопарк', w: 8, crud: true, columns: [
              { key: 'plate', label: 'Номер' }, { key: 'driver', label: 'Водитель', type: 'avatar' }, { key: 'type', label: 'Тип', filter: true },
              { key: 'load', label: 'Загрузка', type: 'progress' }, { key: 'status', label: 'Статус', type: 'status' }],
              rows: [['HH-NC 1021', 'Jonas Becker', 'Фура 40 т', 92, 'В пути'], ['B-NC 2041', 'Olga Petrova', 'Фура 40 т', 64, 'ТО скоро'], ['K-NC 3302', 'Mehmet Yilmaz', 'Фургон 3.5 т', 40, 'Активен'], ['F-NC 4410', 'Laura Fischer', 'Рефрижератор', 78, 'В пути'], ['M-NC 5120', 'Piotr Nowak', 'Фура 40 т', 0, 'Свободен']] },
            { type: 'gauge', title: 'Загрузка автопарка', w: 4, value: 78, unit: '%', label: '23 из 30 машин в работе', thresholds: [{ value: 0, tone: 'success' }, { value: 70, tone: 'warning' }, { value: 90, tone: 'danger' }] },
          ] },
        { id: 'wms', title: 'Склад (WMS)', icon: '🏭', open: true, children: [
          { id: 'stock', title: 'Остатки', icon: '📋', subtitle: 'Lagerverwaltung · онлайн-остатки по SKU',
            widgets: [
              { type: 'callout', tone: 'warning', title: '3 позиции ниже минимального остатка', text: 'Автоматизация «Дозаказ» создаст заявку поставщику, если остаток продержится ниже минимума 2 часа.', buttons: [{ label: 'Открыть автоматизацию', action: 'navigate:automations' }] },
              { type: 'table', title: 'Остатки', crud: true, export: true, columns: [
                { key: 'sku', label: 'SKU' }, { key: 'name', label: 'Товар' }, { key: 'zone', label: 'Зона', filter: true },
                { key: 'qty', label: 'Кол-во', type: 'number' }, { key: 'fill', label: 'Заполненность ячейки', type: 'progress' }, { key: 'state', label: 'Статус', type: 'badge', tones: { 'Норма': 'success', 'Мало': 'warning', 'Нет': 'danger' } }],
                rows: [['SKU-1001', 'Паллета EUR 1200×800', 'A', 820, 70, 'Норма'], ['SKU-1182', 'Стрейч-плёнка 23 мкм', 'B', 42, 15, 'Мало'], ['SKU-2040', 'Гофрокороб 600×400', 'B', 3100, 88, 'Норма'], ['SKU-3301', 'Термоэтикетка 100×150', 'C', 0, 0, 'Нет'], ['SKU-4120', 'Скотч 48 мм', 'C', 96, 22, 'Мало'], ['SKU-5005', 'Уголок защитный', 'A', 1400, 64, 'Норма']] },
            ] },
          { id: 'zones', title: 'Зоны и загрузка', icon: '🗺',
            widgets: [
              { type: 'heatmap', title: 'Загрузка зон по часам', w: 7, unit: '%', rows: ['Зона A', 'Зона B', 'Зона C', 'Рампы', 'Упаковка'], cols: ['6', '8', '10', '12', '14', '16', '18', '20'],
                data: [[20, 45, 80, 90, 75, 60, 40, 20], [30, 50, 70, 95, 85, 70, 50, 25], [10, 30, 50, 60, 55, 50, 35, 15], [40, 80, 95, 70, 60, 85, 90, 40], [15, 40, 65, 80, 90, 85, 60, 30]] },
              { type: 'progress', title: 'Ёмкость складов', w: 5, items: [{ label: 'Hamburg Hub', value: 82 }, { label: 'Frankfurt FRA-2', value: 64 }, { label: 'Leipzig', value: 93 }, { label: 'München (кросс-док)', value: 35 }] },
              { type: 'chart', kind: 'bar', title: 'Комплектация по часам', w: 12, stacked: true, labels: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'],
                series: [{ name: 'Смена A', data: [40, 80, 120, 140, 150, 130, 90, 0, 0, 0, 0, 0] }, { name: 'Смена B', data: [0, 0, 0, 0, 0, 40, 80, 130, 150, 160, 120, 70] }] },
            ] },
        ] },
        { section: 'Автоматизация' },
        { id: 'automations', title: 'Автоматизации', icon: '⚡', badge: 'new', badgeTone: 'success', subtitle: 'Правила «если → то» и сценарии без кода',
          widgets: [
            { type: 'automations', id: 'rules', title: 'Правила', triggers: ['Новый заказ', 'Статус изменён', 'Остаток ниже минимума', 'Задержка рейса', 'Каждый день 07:00'], items: [
              { name: 'Уведомление клиента о задержке', icon: '📣', trigger: 'Задержка рейса > 20 мин', actions: ['Пересчитать ETA', 'SMS + e-mail клиенту', 'Задача диспетчеру'], runs: 1284, lastRun: '10:31', success: 99.6 },
              { name: 'Дозаказ упаковки', icon: '📦', trigger: 'Остаток ниже минимума', conditions: ['2 часа подряд'], actions: ['Заявка поставщику', 'Согласование в Slack'], runs: 86, lastRun: 'вчера' },
              { name: 'Счёт после доставки', icon: '🧾', trigger: 'Статус = Доставлен', actions: ['Создать счёт', 'Выгрузка в DATEV', 'Письмо клиенту'], runs: 9310, lastRun: '10:42', success: 100 },
              { name: 'Утренний отчёт руководителю', icon: '📊', trigger: 'Каждый день 07:00', actions: ['Собрать KPI', 'AI-резюме', 'Отправить в Telegram'], runs: 312, lastRun: 'сегодня 07:00', enabled: false }] },
            { type: 'flow', id: 'shopify-flow', title: 'Сценарий: заказ из Shopify → доставка → счёт', runLabel: 'Симуляция', nodes: [
              { id: 'shop', label: 'Shopify', sub: 'новый заказ', icon: '🛒', tone: 'success' },
              { id: 'check', label: 'Проверка', sub: 'адрес · оплата', icon: '🔍' },
              { id: 'sap', label: 'SAP', sub: 'создать поставку', icon: '🗄', col: 2, row: 0 },
              { id: 'wms', label: 'WMS', sub: 'резерв на складе', icon: '🏭', col: 2, row: 1 },
              { id: 'tms', label: 'TMS', sub: 'маршрут и рейс', icon: '🚚', tone: 'accent' },
              { id: 'notify', label: 'Клиент', sub: 'трек-номер', icon: '📣', col: 4, row: 0 },
              { id: 'invoice', label: 'DATEV', sub: 'счёт', icon: '🧾', col: 4, row: 1, tone: 'warning' }],
              edges: [{ from: 'shop', to: 'check' }, { from: 'check', to: 'sap' }, { from: 'check', to: 'wms' }, { from: 'sap', to: 'tms' }, { from: 'wms', to: 'tms' }, { from: 'tms', to: 'notify', label: 'SMS' }, { from: 'tms', to: 'invoice' }] },
          ] },
        { id: 'integrations', title: 'Интеграции', icon: '🔌',
          widgets: [
            { type: 'integrations', id: 'integ', title: 'Подключённые системы', items: [
              { name: 'SAP S/4HANA', category: 'ERP', desc: 'Заказы, поставки, материалы', connected: true, lastSync: '2 мин назад', color: '#0a6ed1', metric: '12 840 записей / день' },
              { name: 'DATEV', category: 'Бухгалтерия', desc: 'Экспорт счетов и проводок', connected: true, lastSync: '1 ч назад', color: '#2b8a3e' },
              { name: 'Shopify', category: 'E-commerce', desc: 'Заказы интернет-магазинов', connected: true, lastSync: 'только что', color: '#5e8e3e', icon: '🛒' },
              { name: 'DHL / DPD API', category: 'Перевозчики', desc: 'Трекинг и этикетки', connected: true, lastSync: '5 мин назад', color: '#d40511' },
              { name: 'Slack', category: 'Коммуникации', desc: 'Согласования и алерты', connected: true, color: '#611f69' },
              { name: 'Telegram', category: 'Коммуникации', desc: 'Отчёты руководству', connected: false, color: '#229ed9', icon: '✈' },
              { name: 'Google Sheets', category: 'Отчёты', desc: 'Выгрузки для партнёров', connected: false, color: '#188038' },
              { name: 'OpenAI / Claude', category: 'AI', desc: 'Резюме, классификация писем, чат-ассистент', connected: true, color: '#7c3aed', icon: '✦' }] },
            { type: 'status', title: 'Здоровье интеграций', w: 5, items: [{ name: 'SAP RFC', status: 'online', latency: 180, uptime: 99.9 }, { name: 'DHL API', status: 'degraded', latency: 1240, uptime: 98.7 }, { name: 'Shopify Webhooks', status: 'online', latency: 60, uptime: 100 }, { name: 'DATEV Connect', status: 'maintenance', uptime: 99.5 }] },
            { type: 'logs', title: 'Журнал синхронизаций', w: 7, h: 300, live: { interval: 2600 }, lines: [
              { level: 'success', source: 'sap', text: 'Поставки: 128 новых, 12 обновлено' }, { level: 'warn', source: 'dhl', text: 'Ответ 1 240 ms (порог 800 ms)' }, { level: 'info', source: 'shopify', text: 'Webhook orders/create ×14' }] },
          ] },
        { id: 'logs', title: 'Логи и события', icon: '📜',
          widgets: [
            { type: 'logs', title: 'Живой журнал', w: 8, h: 460, live: { interval: 1500, pool: [
              { level: 'info', source: 'api', text: 'POST /v1/orders 201 · 96 ms' }, { level: 'success', source: 'tms', text: 'Рейс HH-NC 1021: точка 3/7 пройдена' },
              { level: 'warn', source: 'telematics', text: 'Превышение времени стоянки: K-NC 3302' }, { level: 'info', source: 'wms', text: 'Ячейка B-12-04: приёмка 24 паллет' },
              { level: 'error', source: 'dhl', text: 'Label API timeout — повтор через 30 c' }, { level: 'success', source: 'automation', text: '«Счёт после доставки» выполнена' },
              { level: 'debug', source: 'worker', text: 'queue=orders depth=3' }] } },
            { type: 'timeline', title: 'Аудит действий', w: 4, capture: true, items: [
              { time: '10:12', user: 'Анна K.', title: 'Изменила права роли «Диспетчер»', tone: 'info' },
              { time: '09:48', user: 'Система', title: 'Резервная копия завершена', tone: 'success' },
              { time: '09:30', user: 'Jonas B.', title: 'Вход с нового устройства', tone: 'warning' }] },
          ] },
        { section: 'Управление' },
        { id: 'tasks', title: 'Задачи', icon: '🗂', subtitle: 'Перетаскивайте карточки между колонками',
          widgets: [
            { type: 'kanban', title: 'Доска диспетчеров', columns: [
              { title: 'Входящие', tone: 'info', cards: [{ title: 'Согласовать слот на рампе #4', tags: ['HH'], user: 'Jonas Becker', due: '2026-11-28' }, { title: 'Проверить претензию Möbel Krause', tags: ['претензия'], user: 'Olga Petrova' }] },
              { title: 'В работе', tone: 'warning', cards: [{ title: 'Перепланировать рейс на A9', tags: ['срочно'], user: 'Анна Keller', tone: 'danger' }, { title: 'Онбординг перевозчика TransLog', user: 'Laura Fischer' }] },
              { title: 'Проверка', tone: 'primary', cards: [{ title: 'Тариф Q1 для BioMarkt', tags: ['продажи'] }] },
              { title: 'Готово', tone: 'success', done: true, cards: [{ title: 'Интеграция Shopify', tags: ['IT'], user: 'Mehmet Yilmaz' }] }] },
          ] },
        { id: 'finance', title: 'Финансы', icon: '💶',
          widgets: [
            { type: 'stat', label: 'Выручка', value: 284500, currency: 'EUR', trend: '+8.1%', icon: '💶', w: 4 },
            { type: 'stat', label: 'Расходы', value: 191200, currency: 'EUR', trend: '+2.4%', inverse: true, icon: '📉', tone: 'warning', w: 4 },
            { type: 'stat', label: 'Маржа', value: 32.8, suffix: '%', trend: '+1.9 п.п.', icon: '📈', tone: 'success', w: 4 },
            { type: 'chart', kind: 'bar', title: 'Выручка и расходы', w: 8, currency: 'EUR', labels: ['Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя'], series: [{ name: 'Выручка', data: [210000, 228000, 236000, 251000, 263000, 284500] }, { name: 'Расходы', data: [160000, 170000, 168000, 178000, 185000, 191200], color: 'warning' }] },
            { type: 'chart', kind: 'pie', title: 'Структура расходов', w: 4, data: [{ label: 'Топливо', value: 38 }, { label: 'Персонал', value: 34 }, { label: 'Аренда', value: 14 }, { label: 'IT', value: 6 }, { label: 'Прочее', value: 8 }] },
            { type: 'tabs', title: 'Счета', tabs: [
              { title: 'Открытые', badge: 3, widgets: [{ type: 'table', search: false, currency: 'EUR', columns: [{ key: 'n', label: 'Счёт' }, { key: 'c', label: 'Клиент' }, { key: 's', label: 'Сумма', type: 'money' }, { key: 'st', label: 'Статус', type: 'status' }], rows: [['RE-2026-1182', 'Autohaus Weber', 3890, 'Ожидает оплаты'], ['RE-2026-1179', 'Mode Lindner KG', 720, 'Просрочен'], ['RE-2026-1175', 'TechParts AG', 980, 'Ожидает оплаты']] }] },
              { title: 'Оплаченные', widgets: [{ type: 'table', search: false, currency: 'EUR', columns: [{ key: 'n', label: 'Счёт' }, { key: 'c', label: 'Клиент' }, { key: 's', label: 'Сумма', type: 'money' }, { key: 'st', label: 'Статус', type: 'status' }], rows: [['RE-2026-1170', 'Bäckerei Schmidt GmbH', 1450, 'Оплачен'], ['RE-2026-1168', 'Pharma Süd', 1290, 'Оплачен']] }] },
              { title: 'Выгрузка DATEV', text: 'Экспорт за **ноябрь** готов: 412 проводок. Следующая автоматическая выгрузка — 01.12 в 06:00.' }] },
          ] },
        { id: 'access', title: 'Доступы', icon: '🔐', subtitle: 'Роли, права и пользователи',
          widgets: [
            { type: 'matrix', title: 'Матрица прав', w: 7, roles: ['Админ', 'Диспетчер', 'Склад', 'Бухгалтер', 'Клиент'], permissions: [
              { group: 'Заказы' }, { label: 'Просмотр заказов', values: [1, 1, 1, 1, 1] }, { label: 'Создание / изменение', values: [1, 1, 0, 0, 0] }, { label: 'Удаление', values: [1, 0, 0, 0, 0], desc: 'с записью в аудит' },
              { group: 'Склад' }, { label: 'Остатки и приёмка', values: [1, 0, 1, 0, 0] },
              { group: 'Финансы' }, { label: 'Счета и выгрузки', values: [1, 0, 0, 1, 0] }, { label: 'Настройки системы', values: [1, 0, 0, 0, 0], locked: true }] },
            { type: 'table', title: 'Пользователи', w: 5, crud: true, search: false, pageSize: 6, columns: [{ key: 'name', label: 'Имя', type: 'avatar', sub: 'mail' }, { key: 'role', label: 'Роль', options: ['Админ', 'Диспетчер', 'Склад', 'Бухгалтер', 'Клиент'] }, { key: 'mfa', label: '2FA', type: 'bool' }, { key: 'mail', label: 'E-mail', editable: true }],
              rows: [{ name: 'Анна Keller', role: 'Админ', mfa: true, mail: 'a.keller@nordcargo.example' }, { name: 'Jonas Becker', role: 'Диспетчер', mfa: true, mail: 'j.becker@nordcargo.example' }, { name: 'Olga Petrova', role: 'Склад', mfa: false, mail: 'o.petrova@nordcargo.example' }, { name: 'Laura Fischer', role: 'Бухгалтер', mfa: true, mail: 'l.fischer@nordcargo.example' }] },
          ] },
      ],
      chat: {
        title: 'Nord AI', subtitle: 'знает ваши заказы, склад и рейсы', avatar: '✦',
        messages: [{ from: 'bot', text: 'Здравствуйте, Анна! Сегодня **1 284** заказа, 2 рейса с задержкой. Чем помочь?' }],
        suggestions: ['Отчёт по задержкам', 'Где заказ #48207?', 'Что с остатками?', 'Создай автоматизацию'],
        replies: [
          { match: ['задерж', 'опозд'], text: 'Сейчас **2 рейса** с задержкой:\n• F-NC 4410 Frankfurt → München: +40 мин (пробка на A9)\n• K-NC 3302 Köln: +15 мин\nКлиенты уже уведомлены автоматически.', widget: { type: 'chart', kind: 'bar', h: 140, labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'], series: [{ name: 'Задержки', data: [4, 2, 5, 3, 2], color: 'warning' }] }, buttons: [{ label: 'Открыть карту', action: 'navigate:fleet' }] },
          { match: ['48207', 'где заказ', 'заказ #'], text: 'Заказ **#48207** (Autohaus Weber) — *в пути*, фура HH-NC 1021, ETA завтра 11:30. Отправить клиенту трек-ссылку?', buttons: [{ label: 'Да, отправить', action: 'toast:Трек-ссылка отправлена клиенту' }, { label: 'К заказам', action: 'navigate:orders' }] },
          { match: ['остат', 'склад', 'stock'], text: 'Ниже минимума 3 позиции: **SKU-1182** стрейч-плёнка (42 шт), **SKU-3301** термоэтикетка (0), **SKU-4120** скотч (96). Создать заявку поставщику?', buttons: [{ label: 'Создать заявку', action: { type: 'toast', text: 'Заявка поставщику создана', log: 'AI: создана заявка поставщику на 3 позиции' } }, { label: 'Остатки', action: 'navigate:stock' }] },
          { match: ['автоматиз', 'правило', 'сценар'], text: 'Предлагаю правило: **«Если клиент не забрал груз 24 ч → напоминание + задача менеджеру»**. Открываю конструктор автоматизаций.', action: { type: 'navigate', to: 'automations', then: { type: 'add', target: 'rules' }, delay: 700 } },
          { match: ['отчёт', 'отчет', 'report', 'kpi'], text: 'Готово. KPI за неделю: доставка вовремя **97.4%** (+0.6), выручка **+8.1%**, средний чек **1 120 €**. PDF отправлен на почту.' },
        ],
        fallback: 'Принято! В рабочей версии я отвечу на основе данных SAP, WMS и TMS. В прототипе попробуйте: «отчёт по задержкам», «где заказ #48207», «что с остатками».',
      },
    },
    demo: {
      speed: 1,
      steps: [
        { do: 'say', say: '👋 Это прототип **NordCargo Logistics OS** — собран из одного JSON за пару минут.', ms: 2600 },
        { do: 'highlight', target: 'w:map-main', say: 'Живая карта: рейсы, машины и склады в реальном времени.', ms: 2400 },
        { do: 'click', target: 'w:order-flow run', say: 'Процессы можно «прогнать» — видно каждый этап заказа.', ms: 4200 },
        { do: 'navigate', to: 'orders', say: 'Раздел заказов — полноценный CRUD.' },
        { do: 'type', target: 'w:quick-order field:client', text: 'Bäckerei Müller GmbH', say: 'Создаём заказ через быструю форму…' },
        { do: 'select', target: 'w:quick-order field:route', value: 'Frankfurt → München' },
        { do: 'type', target: 'w:quick-order field:weight', text: '1450' },
        { do: 'click', target: 'w:quick-order field:express' },
        { do: 'click', target: 'w:quick-order submit', say: '…и он сразу появляется в таблице, в логах и уведомлениях.', ms: 1800 },
        { do: 'highlight', target: 'w:orders-table', ms: 1800 },
        { do: 'navigate', to: 'automations', say: 'Автоматизации без кода: триггер → условия → действия.' },
        { do: 'click', target: 'w:rules run:0', say: 'Запускаем правило «Уведомление клиента о задержке».', ms: 2600 },
        { do: 'click', target: 'w:shopify-flow run', say: 'А это сквозной сценарий Shopify → SAP → WMS → TMS → DATEV.', ms: 5200 },
        { do: 'navigate', to: 'integrations', say: 'Интеграции с ERP, бухгалтерией, перевозчиками и AI.' },
        { do: 'click', target: 'w:integ sync:0', say: 'Синхронизация SAP одним кликом.', ms: 2200 },
        { do: 'navigate', to: 'access', say: 'Роли и права доступа — всё прозрачно и с аудитом.' },
        { do: 'click', target: 'perm:2:1', ms: 900 },
        { do: 'chat', text: 'Отчёт по задержкам', say: 'И главное — AI-ассистент, который знает данные компании.', ms: 2600 },
        { do: 'finale', title: 'NordCargo Logistics OS', text: 'Заказы, склад, рейсы, автоматизации и AI — **в одной системе**. Срок запуска MVP: **6–8 недель**.' },
      ],
      finale: { cta: { label: 'Обсудить проект', style: 'primary', action: 'toast:Спасибо! Свяжемся с вами сегодня.' } },
    },
  },

  /* ======================= 2. Vertrieb / CRM (Deutsch) ======================= */
  crm: {
    title: 'VertriebsCockpit — CRM, Marketing, Buchhaltung (Deutsch)',
    description: 'Deutsche Oberfläche: Pipeline-Kanban, Kontakte (CRUD), Marketing-Funnel, Rechnungen, KI-Chat und Demo.',
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
