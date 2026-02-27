DG Knitting site/ (proposed)
├── index.html
├── about.html            # optional
├── blog.html
├── contact.html
├── export.html
├── industries.html
├── process.html
├── quality.html
├── strength.html
├── 404.html              # optional
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── images/
│   │   ├── product/
│   │   ├── team/
│   │   ├── logos/
│   │   ├── bg/
│   │   └── icons/
│   ├── video/
│   └── fonts/
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── style.css         # site-wide entry
│   ├── vendor/
│   │   └── bootstrap.min.css
│   └── pages/
│       ├── blog.css
│       ├── contact.css
│       ├── export.css
│       ├── industries.css
│       ├── process.css
│       ├── quality.css
│       └── strength.css
├── js/
│   ├── lib/
│   ├── components/
│   │   └── navbar.js
│   ├── pages/
│   │   ├── blog.js
│   │   └── contact.js
│   └── vendor/
│       ├── bootstrap.bundle.min.js
│       └── bootstrap.min.js
├── components/
│   ├── navbar.html
│   ├── footer.html
│   ├── tags.html
│   └── product-card.html
├── data/
│   ├── products.json
│   └── blog-posts.json
├── src/                  # optional build sources (Sass/TS/templates)
│   ├── scss/
│   ├── ts/
│   └── templates/
├── build/ or dist/       # generated site output
├── docs/ or README.md
└── .github/ (CI workflows)

Current files mapping (from your workspace)
- Root pages:
  - `index.html` -> root `index.html`
  - `blog.html` -> root `blog.html`
  - `contact.html` -> root `contact.html`
  - `export.html` -> root `export.html`
  - `industries.html` -> root `industries.html`
  - `process.html` -> root `process.html`
  - `quality.html` -> root `quality.html`
  - `strength.html` -> root `strength.html`
- Assets:
  - `assets/images/product/` -> `assets/images/product/` (keep)
  - `assets/video/` -> `assets/video/`
- Components:
  - `component/navbar.html` -> `components/navbar.html`
  - `component/tags.html` -> `components/tags.html`
- CSS:
  - `css/bootstrap.min.css` -> `css/vendor/bootstrap.min.css`
  - `css/style.css`, `css/blog.css`, etc. -> `css/` and `css/pages/`
- JS:
  - `js/bootstrap*.js` -> `js/vendor/`
  - `js/navbar.js`, `js/script.js`, `js/component.js` -> `js/components/` or `js/pages/`

Notes / Next steps
- I created `SITE_TREE.md` in the workspace root with this tree and mapping.
- Next I can move files into this structure and update HTML references, or generate a script to do it automatically—which would you prefer?