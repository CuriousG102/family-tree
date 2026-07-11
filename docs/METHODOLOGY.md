# Methodology & Conventions

How this family tree is researched, recorded, and kept honest.

## Research principles

1. **Source-first.** A fact enters the tree only when a public source supports
   it. Every fact gets a `SOUR` citation. No source, no fact.
2. **Confidence is explicit.** Each source is tagged Primary / Secondary /
   Tentative / Provided (see the README). A guess is never silently promoted to
   a fact — if a link is inferred, it's marked **Tentative** and the reasoning
   goes in a `NOTE`.
3. **Gaps stay visible.** Unknown ancestors are simply absent (they render as
   "not yet documented"). We do not invent names to fill a slot.
4. **Living people, light touch.** For anyone still living, we record only what
   they shared directly or what they've already made public professionally.
5. **Corroborate before promoting.** A single unsourced online tree is a lead,
   not proof. We look for an independent record (census, vital index, grave,
   obituary) before raising confidence.

## Where public records come from

Rich, citable records generally exist for **deceased** ancestors:

- **FamilySearch** (free) — census, vital records, church records, indexes.
- **Find A Grave / BillionGraves** — headstones, burial dates, family links.
- **US Census** (1790–1950; released 72 years after) — households by year.
- **Newspapers.com / GenealogyBank / Chronicling America** — obituaries, notices.
- **State vital-record indexes** — birth, marriage, death (varies by state/era).
- **WikiTree / Geni** — collaborative trees (treat as leads; verify sources).

The hard part of any living person's tree is the **bridge**: connecting the
living subject to the documented deceased generations. That link usually comes
from the family itself (parents'/grandparents' names and places) or from a
relative's obituary that names survivors.

## GEDCOM conventions used in `data/family-tree.ged`

Standard GEDCOM 5.5.1, plus a few widely-used custom (`_`-prefixed) tags for
provenance that the build script understands:

```
0 @I2@ INDI
1 NAME John Robert /Hutson/
1 SEX M
1 BIRT
2 DATE 3 MAR 1948
2 PLAC Travis, Texas, USA
2 SOUR @S5@              ← citation: which source establishes this
3 PAGE 1950 census, ED 227-14, sheet 4B   ← where in the source
3 _CONF Primary         ← confidence for THIS use of the source
1 DEAT
2 DATE 2010
2 SOUR @S6@
3 _CONF Secondary
1 FAMC @F1@              ← child in family F1 (his parents)
1 FAMS @F2@             ← spouse/parent in family F2

0 @F2@ FAM
1 HUSB @I2@
1 WIFE @I3@
1 CHIL @I1@
1 MARR
2 DATE 1971
2 SOUR @S7@
3 _CONF Secondary

0 @S5@ SOUR
1 TITL 1950 U.S. Federal Census — Travis County, Texas
1 AUTH U.S. Census Bureau
1 PUBL FamilySearch / NARA
1 _URL https://www.familysearch.org/...
1 _CONF Primary
1 _ACC 2026-07-11
1 NOTE Household of ... ; enumerated ...
```

### Custom tags

| Tag | On | Meaning |
|-----|----|---------|
| `_URL` | `SOUR` record | Web address of the source |
| `_CONF` | `SOUR` record and/or a fact's `SOUR` citation | Confidence level |
| `_ACC` | `SOUR` record | Date the source was accessed (`YYYY-MM-DD`) |

Confidence can be set on the source record (its default) and/or overridden on a
specific citation, because one source can establish one fact firmly and another
only weakly.

## Workflow to add a generation

1. Start from a documented person and find their parents via a primary record
   (census listing them as a child, a birth record, or an obituary naming them).
2. Create `INDI` records for the parents and a `FAM` record linking them, with
   the documented person as `CHIL`.
3. Cite the record on every fact; create `SOUR` records for any new source.
4. Log the search (what you looked for, what you found/didn't) in
   `docs/RESEARCH-LOG.md`.
5. `python3 scripts/build.py` and review `ui/index.html`.
