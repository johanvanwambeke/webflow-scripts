# Wambay Webflow Scripts

Centrale repo voor custom scripts per Webflow-client.  
Gehost via **jsDelivr CDN** — geen Slater nodig.

## Structuur

```
scripts/
├── _shared/          # Herbruikbare utilities (alle clients)
│   └── utils.js
├── paybix/
│   └── main.js
├── porto-maurizio/
│   └── main.js
└── fincreadible/
    └── main.js
```

## Gebruik in Webflow

Plak dit in je Webflow custom code (before `</body>`):

```html
<!-- Client-specifiek script -->
<script src="https://cdn.jsdelivr.net/gh/wambay/webflow-scripts@latest/scripts/CLIENT-NAAM/main.js"></script>

<!-- Shared utilities (optioneel) -->
<script src="https://cdn.jsdelivr.net/gh/wambay/webflow-scripts@latest/scripts/_shared/utils.js"></script>
```

> Vervang `CLIENT-NAAM` met de mapnaam van de client.

## Versiebeheer

- `@latest` → altijd nieuwste versie (handig tijdens development)
- `@v1.0.0` → gepinde versie (veiliger voor productie)

### Release maken

```bash
git tag v1.0.0
git push origin v1.0.0
```

Dan gebruik je in Webflow:
```
https://cdn.jsdelivr.net/gh/wambay/webflow-scripts@v1.0.0/scripts/paybix/main.js
```

## Cache

jsDelivr cachet bestanden. Na een push kan het ~12 uur duren.  
Purge handmatig via: `https://purge.jsdelivr.net/gh/wambay/webflow-scripts@latest/scripts/CLIENT-NAAM/main.js`

## Setup

```bash
git clone git@github.com:wambay/webflow-scripts.git
cd webflow-scripts
# maak/edit scripts
git add .
git commit -m "update: client-naam script"
git push
```
