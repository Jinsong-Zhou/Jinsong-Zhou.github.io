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

from scholarly import scholarly

SCHOLAR_ID = os.environ.get("GOOGLE_SCHOLAR_ID", "9GlGW1MAAAAJ")
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


def main() -> int:
    author = scholarly.search_author_id(SCHOLAR_ID)
    scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])

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
