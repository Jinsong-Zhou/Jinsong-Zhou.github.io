# jinsong-zhou.github.io

Personal homepage of Jinsong Zhou, built with Jekyll and hosted on GitHub Pages.

The design follows Apple's visual language: system typography (SF Pro on Apple
devices), generous whitespace, a frosted sticky navigation bar, rounded card
surfaces, and automatic light / dark themes.

## Editing content

All page content lives in one file: [`_data/profile.yml`](_data/profile.yml).
Edit the hero, about, experiences, publications, open source, education,
honors, and skills sections there. Inline Markdown (links, `**bold**`) is
supported in text fields. The navigation links are in
[`_data/navigation.yml`](_data/navigation.yml).

## Structure

| Path | Purpose |
| --- | --- |
| `_data/profile.yml` | All homepage content (plus per-paper overrides) |
| `_data/scholar.json` | Publications and citation stats, auto-synced from Google Scholar |
| `_pages/publications.md` + `_layouts/publications.html` | Standalone publications page |
| `_includes/publication.html` | One publication card (shared by homepage and publications page) |
| `_layouts/home.html` | Renders the content into sections |
| `_layouts/default.html` | HTML shell (head, nav, footer) |
| `_includes/` | `head`, `nav`, `footer`, `icons`, `seo`, `visitor_map` partials |
| `assets/css/site.css` | Design system and all styles |
| `assets/js/site.js` | Mobile menu, scroll spy, reveal animation |
| `images/` | Avatar and favicons |

## Running locally

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>.

## Visitor map

The homepage ends with a "Visitors" section: a world map from
[ClustrMaps](https://clustrmaps.com/) that shows where readers come from,
with today's visitors highlighted. GitHub Pages is static and cannot count
visitors itself, so the map is a third-party widget and needs an account:

1. Sign up at <https://clustrmaps.com/> and register `https://jinsong-zhou.github.io`.
2. In the embed code ClustrMaps gives you, copy the id after `map_v2.js?d=`.
3. Put it in `_config.yml` as `clustrmaps_id`. The section text lives under
   `visitors` in `_data/profile.yml`.

Leave `clustrmaps_id` empty and the section is not rendered at all. The
markup and colors are in `_includes/visitor_map.html`.

## Publications synced from Google Scholar

The publications page (`/publications/`) and the homepage teaser are rendered
from `_data/scholar.json`. The GitHub Action in
`.github/workflows/google_scholar_crawler.yaml` runs
`google_scholar_crawler/main.py` every day (and on demand via
"Run workflow"), fetches the Google Scholar profile
`9GlGW1MAAAAJ`, and commits the file back to `main` when anything changed.
GitHub Pages then rebuilds the site, so new papers and citation counts show
up automatically.

- To point at another profile, set a repository variable `GOOGLE_SCHOLAR_ID`
  (Settings → Secrets and variables → Actions → Variables).
- To fix a venue name, link, or add a note for a paper, add an entry under
  `publications.overrides` in `_data/profile.yml`; it is matched by title.
- To sync locally: `pip install -r google_scholar_crawler/requirements.txt`
  then `python google_scholar_crawler/main.py`.
