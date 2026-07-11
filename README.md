# The Hutson Family Tree

A **sourced, version-controlled genealogy** for Miles Hutson's family, compiled
from public materials. The guiding principle: *nothing is recorded without a
citation, and every citation carries a confidence level.* Gaps are shown
honestly rather than guessed at.

## What's here

```
data/family-tree.ged     ← canonical source of truth (GEDCOM 5.5.1)
scripts/build.py         ← parses the GEDCOM → ui/tree-data.js
scripts/screenshot.js    ← dev helper: render the UI headlessly for QA
ui/                      ← the viewer (open ui/index.html in any browser)
docs/METHODOLOGY.md      ← how research is done and how to extend the tree
docs/RESEARCH-LOG.md     ← chronological log of what was searched and found
```

## Why GEDCOM?

GEDCOM is the universal genealogy interchange standard. Choosing it means:

- **Version-control friendly** — it's line-oriented plain text, so `git diff`
  shows exactly which facts changed.
- **Portable** — the same file imports into Ancestry, FamilySearch, MyHeritage,
  Gramps, and virtually every other genealogy program.
- **Native provenance** — GEDCOM has first-class `SOUR` (source) records and
  per-fact source citations, which is exactly what "retain all the metadata for
  where things came from" requires.

Each fact cites a source record, and each source record records its title,
author, publication/URL, a **confidence level**, and the date it was accessed.

### Confidence levels

| Level | Meaning |
|-------|---------|
| **Primary** | Original record or first-hand account (birth certificate, census image, gravestone) |
| **Secondary** | Published or derived source (obituary, compiled tree, biography) |
| **Tentative** | Plausible but not yet confirmed — a lead, not a conclusion |
| **Provided** | Supplied directly by a family member |

## Viewing the tree

Open `ui/index.html` in any browser — no server or build step required (the data
is embedded). The viewer has four tabs:

- **Pedigree** — ancestor chart rooted at Miles; undocumented ancestors show as
  dashed "not yet documented" cards.
- **All People** — everyone in the tree.
- **Sources** — the full bibliography with confidence levels and links.
- **About & Method** — how to read the tree.

Click any person for a detail panel where **every fact shows a clickable source
pill** that jumps to the exact source it came from.

## Extending the tree

1. Edit `data/family-tree.ged` — add `INDI` (people), `FAM` (families), and
   `SOUR` (sources) records. See `docs/METHODOLOGY.md` for the conventions.
2. Add a `SOUR` citation to **every** new fact. No source, no fact.
3. Run the build:
   ```bash
   python3 scripts/build.py
   ```
4. Open `ui/index.html` to review, then commit.

## A note on privacy

This is a private research document. Details of **living** individuals are kept
minimal and only ever drawn from information the person shared or already-public
professional profiles. The deep genealogical detail is reserved for ancestors
who have passed.
