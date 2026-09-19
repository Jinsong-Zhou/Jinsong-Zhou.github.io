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
| `_data/profile.yml` | All homepage content |
| `_layouts/home.html` | Renders the content into sections |
| `_layouts/default.html` | HTML shell (head, nav, footer) |
| `_includes/` | `head`, `nav`, `footer`, `icons`, `seo` partials |
| `assets/css/site.css` | Design system and all styles |
| `assets/js/site.js` | Mobile menu, scroll spy, reveal animation |
| `images/` | Avatar and favicons |

## Running locally

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>.

## Google Scholar citations

`google_scholar_crawler/` and the GitHub Action in `.github/workflows/` still
fetch citation data into the `google-scholar-stats` branch on a schedule; the
homepage does not currently display it.
