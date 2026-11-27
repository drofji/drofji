
# 📦 Opensource Packages

<p align="left">
  <a href="https://github.com/drofji/django-snapadmin" target="_blank">
    <img src="https://img.shields.io/badge/Django_SnapAdmin-00BCD4?style=for-the-badge&logo=django&logoColor=white" />
  </a>
</p>

---

# 🧩 Moqup — кликабельный прототип админки из JSON

Папка [`moqup/`](moqup/): откройте `moqup/dashboard.html`, передайте в ссылке JSON-конфигурацию — и получите живой дашборд: меню, KPI, графики, CRUD-таблицы, формы, автоматизации, интеграции, логи, доступы, карту маршрутов, канбан, AI-чат и демо-режим с курсором и финальным «вау»-экраном. Работает на компьютере и телефоне, без сборки и зависимостей.

```
moqup/dashboard.html#map=<JSON>&colors=<JSON>&demo=<JSON>&logo=<SVG|URL|текст>
```

| Параметр | Обязательный | Что внутри |
|---|---|---|
| `map` | да | меню, разделы, виджеты, чат (`app`, `menu`, `pages`, `chat`, `layout`) |
| `colors` | нет | палитра (`primary`, `accent`, `bg`, `surface`, `chart` …) |
| `demo` | нет | шаги интерактивного демо (`navigate`, `click`, `type`, `select`, `chat`, `finale` …) |
| `logo` | нет | SVG, `data:image/…`, URL или 1–3 символа |

JSON можно передать как есть, в `b64:` или сжатым `z:` / `pako:` (как в mermaid.live). Без параметра `map` страница показывает документацию, конструктор ссылки и готовые примеры (логистика/WMS, CRM на немецком). Если JSON сломан — сначала ошибка с номером строки и подсказками, затем документация.

* `moqup/dashboard.html` — страница и стили (тема на CSS-переменных);
* `moqup/helper.js` — движок (параметры, проверка, виджеты, чат, демо);
* `moqup/examples.js` — эталонные примеры конфигураций;
* `moqup/DOCS.md` — **полная документация по JSON** и готовый промпт для ИИ.
