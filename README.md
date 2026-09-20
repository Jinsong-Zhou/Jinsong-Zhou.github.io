# jinsong-zhou.github.io

Personal homepage of **Jinsong Zhou** — a scroll-driven 3D résumé hosted on GitHub Pages.

The experience follows [sen-3d-resume](https://github.com/dayinji/sen-3d-resume): a fixed React Three Fiber scene whose camera is scrubbed by the scrollbar, with HTML content (About → résumé → works) in front. Code from that project is MIT; its character model and personal assets are **not** used here (see [`NOTICE`](NOTICE)).

Live: <https://jinsong-zhou.github.io>

## Run locally

Requires Node.js 20+.

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

Other commands (all inside `web/`):

```bash
npm run build      # typecheck + Vite bundle → web/dist/
npm run preview    # preview the production build
npm run typecheck
npm run lint
```

There is no Jekyll step. `web/dist/` is a static site (`base: './'`).

## Edit content

| What | Where |
| --- | --- |
| About copy (EN/中文) | `web/src/App.tsx` (`COPY`) |
| Résumé timeline | `web/src/ui/Resume.tsx` |
| Camera stops (must match résumé entry count) | `web/src/data/focusPoints.ts` |
| Works gallery + paper list wiring | `web/src/data/works.ts`, `web/src/data/publications.ts` |
| Paper / project detail pages | `web/src/content/works/<slug>.md` |
| Scholar snapshot | `web/src/data/scholar.json` (written by the crawler) |
| Avatar / favicons | `web/public/images/` |
| Scene look (lights, DoF, Bloom, portrait) | `web/src/scene/Scene.tsx`, `web/src/scene/portrait.ts` |

The previous Jekyll `_data/profile.yml` is kept as an archive of the copy that was migrated. The Skills section from that file is **not** on the site.

## Publications from Google Scholar

`.github/workflows/google_scholar_crawler.yaml` still runs daily, fetches Scholar profile `9GlGW1MAAAAJ`, and commits `web/src/data/scholar.json` when it changes. Display titles, venues, and years can be corrected in `web/src/data/publications.ts` (matched by title substring).

Local sync:

```bash
pip install -r google_scholar_crawler/requirements.txt
python google_scholar_crawler/main.py
```

Needs `SCRAPERAPI_KEY` for a reliable fetch from GitHub Actions (Scholar blocks many datacenter IPs).

## Deploy (GitHub Pages)

This is a user site (`username.github.io`). The app is a Vite SPA; Pages must build it with Actions rather than Jekyll:

1. Merge this branch to `main`.
2. Repo **Settings → Pages → Source → GitHub Actions**.
3. `.github/workflows/deploy.yml` runs `npm ci && npm run build` in `web/` and publishes `web/dist/`.

Until that Pages source switch, pushing the Vite tree to `main` will not update the live Jekyll site.

Old `/publications/` URLs redirect to `/#works`.

## License

MIT for code. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE). Do not copy sen-3d-resume's character model or personal content if you fork further.
