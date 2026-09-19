"""Fetch the Google Scholar profile and write it to _data/scholar.json.

The Jekyll site renders the publications page from that file, so re-running
this script (the GitHub Action does it daily) keeps the homepage in sync with
Google Scholar. The script exits non-zero on failure so that a broken run
never overwrites good data.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone

from scholarly import ProxyGenerator, scholarly

SCHOLAR_ID = os.environ.get("GOOGLE_SCHOLAR_ID", "9GlGW1MAAAAJ")
# Google Scholar blocks most data-centre IPs (including GitHub Actions), so a
# proxy is usually required. Set SCRAPERAPI_KEY (free tier is enough) as a
# repository secret for a reliable sync; otherwise we fall back to free proxies.
SCRAPERAPI_KEY = os.environ.get("SCRAPERAPI_KEY", "").strip()
OUT_PATH = os.environ.get(
    "SCHOLAR_OUT", os.path.join(os.path.dirname(__file__), "..", "_data", "scholar.json")
)


def clean_authors(raw: str) -> list:
    """'A Foo and B Bar' -> ['A Foo', 'B Bar']."""
    if not raw:
        return []
    return [a.strip() for a in re.split(r"\s+and\s+", raw) if a.strip()]


def venue_of(bib: dict) -> str:
    for key in ("venue", "journal", "conference", "booktitle", "publisher"):
        v = bib.get(key)
        if v and v.lower() not in ("na", "n/a"):
            return v
    return ""


def year_of(bib: dict):
    y = bib.get("pub_year") or bib.get("year")
    try:
        return int(y)
    except (TypeError, ValueError):
        return None


def strategies():
    """Yield (name, setup) pairs; setup() configures scholarly and returns bool."""
    if SCRAPERAPI_KEY:
        def scraperapi():
            pg = ProxyGenerator()
            if not pg.ScraperAPI(SCRAPERAPI_KEY):
                return False
            scholarly.use_proxy(pg, pg)
            scholarly.set_retries(3)
            return True
        yield "ScraperAPI", scraperapi

    def direct():
        scholarly.use_proxy(None, None)
        scholarly.set_timeout(20)
        scholarly.set_retries(2)  # fail fast; the default retries take ~15 min
        return True
    yield "direct connection", direct

    def free_proxies():
        pg = ProxyGenerator()
        if not pg.FreeProxies(timeout=2, wait_time=180):
            return False
        scholarly.use_proxy(pg, pg)
        scholarly.set_timeout(20)
        scholarly.set_retries(4)
        return True
    yield "free proxies", free_proxies


def fetch_author() -> dict:
    last_error = None
    for name, setup in strategies():
        try:
            print(f"trying {name} ...", file=sys.stderr)
            if not setup():
                print(f"{name}: proxy setup failed, skipping", file=sys.stderr)
                continue
            author = scholarly.search_author_id(SCHOLAR_ID)
            scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])
            print(f"{name}: fetched profile", file=sys.stderr)
            return author
        except Exception as exc:
            last_error = exc
            print(f"{name}: failed ({exc})", file=sys.stderr)
    raise RuntimeError(f"all strategies failed; last error: {last_error}")


def main() -> int:
    try:
        author = fetch_author()
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    pubs = []
    for pub in author.get("publications", []):
        try:
            scholarly.fill(pub)
        except Exception as exc:  # keep going with the summary data
            print(f"warning: could not fill '{pub.get('bib', {}).get('title')}': {exc}", file=sys.stderr)
        bib = pub.get("bib", {})
        pubs.append(
            {
                "id": pub.get("author_pub_id", ""),
                "title": bib.get("title", "").strip(),
                "authors": clean_authors(bib.get("author", "")),
                "year": year_of(bib),
                "venue": venue_of(bib),
                "citations": int(pub.get("num_citations") or 0),
                "url": pub.get("pub_url") or "",
                "scholar_url": (
                    f"https://scholar.google.com/citations?view_op=view_citation&hl=en"
                    f"&user={SCHOLAR_ID}&citation_for_view={pub.get('author_pub_id', '')}"
                    if pub.get("author_pub_id")
                    else ""
                ),
                "abstract": (bib.get("abstract") or "").strip(),
            }
        )

    pubs.sort(key=lambda p: (p["year"] or 0, p["citations"]), reverse=True)

    data = {
        "scholar_id": SCHOLAR_ID,
        "profile_url": f"https://scholar.google.com/citations?user={SCHOLAR_ID}",
        "name": author.get("name", ""),
        "affiliation": author.get("affiliation", ""),
        "citedby": int(author.get("citedby") or 0),
        "citedby5y": int(author.get("citedby5y") or 0),
        "hindex": int(author.get("hindex") or 0),
        "i10index": int(author.get("i10index") or 0),
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "publications": pubs,
    }

    if not data["name"] or not pubs:
        print("error: empty profile returned; not writing output", file=sys.stderr)
        return 1

    os.makedirs(os.path.dirname(os.path.abspath(OUT_PATH)), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"wrote {len(pubs)} publications, {data['citedby']} citations -> {OUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
