
# 📦 Opensource Packages

<p align="left">
  <a href="https://github.com/drofji/django-snapadmin" target="_blank">
    <img src="https://img.shields.io/badge/Django_SnapAdmin-00BCD4?style=for-the-badge&logo=django&logoColor=white" />
  </a>
</p>

---

# 🧩 Moqup — klickbarer Admin-Prototyp aus JSON

Ordner [`moqup/`](moqup/): `moqup/dashboard.html` öffnen, im Link eine JSON-Konfiguration übergeben — und ein lebendiges Dashboard entsteht: Menü, KPIs, Diagramme, CRUD-Tabellen, Formulare, Automatisierungen, Integrationen, Logs, Berechtigungen, Routenkarte, Kanban, KI-Chat und ein Demo-Modus mit Cursor und „Wow“-Finale. Funktioniert auf Desktop und Smartphone, ohne Build und Abhängigkeiten.

Live: https://drofji.github.io/drofji/moqup/dashboard.html

```
moqup/dashboard.html#map=<JSON>&colors=<JSON>&demo=<JSON>&logo=<SVG|URL|Text>
```

| Parameter | Pflicht | Inhalt |
|---|---|---|
| `map` | ja | Menü, Bereiche, Widgets, Chat (`app`, `menu`, `pages`, `chat`, `layout`) |
| `colors` | nein | Farbpalette (`primary`, `accent`, `bg`, `surface`, `chart` …) |
| `demo` | nein | Schritte der interaktiven Demo (`navigate`, `click`, `type`, `select`, `chat`, `finale` …) |
| `logo` | nein | SVG, `data:image/…`, URL oder 1–3 Zeichen |

JSON kann direkt, als `b64:` oder komprimiert als `z:` / `pako:` (wie bei mermaid.live) übergeben werden. Ohne Parameter `map` zeigt die Seite Dokumentation, Link-Generator und fertige Beispiele (Logistik/WMS, CRM/Vertrieb). Ist das JSON fehlerhaft, erscheint zuerst der Fehler mit Zeilennummer und Hinweisen, danach die Dokumentation.

* `moqup/dashboard.html` — Seite und Styles (Theme auf CSS-Variablen);
* `moqup/helper.js` — Engine (Parameter, Prüfung, Widgets, Chat, Demo);
* `moqup/examples.js` — Referenzbeispiele für Konfigurationen;
* `moqup/DOCS.md` — **vollständige JSON-Dokumentation** und fertiger KI-Prompt.
