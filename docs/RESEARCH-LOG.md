# Research Log

A chronological, honest record of what was searched, what turned up, and what
did not. This is the audit trail behind the tree — including dead ends.

## 2026-07-11 — Session 1: foundation & identifying the subject

**Goal:** Establish the subject and build the recording/UI pipeline.

**Confirmed (subject):**
- Miles Hutson, b. **12 August 1993** — *provided directly by Miles* (Provided).
- Currently resides in **San Francisco, CA** — *provided directly* (Provided).
- B.S. Computer Science, UT Austin (2012–2016); M.S. CS, Stanford (2021–2024);
  Senior ML Software Engineer at Waymo, previously Google Health — corroborated
  across [mileshutson.com](https://www.mileshutson.com/), LinkedIn, and the
  [Texas Tribune staff page](https://www.texastribune.org/about/staff/miles-hutson/)
  (Secondary).
- GitHub `CuriousG102` → "Miles Hutson", listed location Austin, TX (Secondary).

**Searched, no usable link yet:**
- `obituary survived by grandson "Miles Hutson"` — no obituary naming the subject
  as a survivor surfaced.
- `"Miles Hutson" 1993 Austin parents` — returned unrelated people (a Dr. Miles
  Austin Hutson, family physician in Hondo, TX; a Texas Tribune journalist who is
  the subject himself). No parent/grandparent identification.
- Hutson surname studies (WikiTree, archives.com) — recorded as **general
  background only**; explicitly NOT evidence of the subject's specific lineage.

**Key obstacle (documented for honesty):** Public web search cannot reliably
bridge a *living* person to their documented ancestors without at least the
names/places of the parents or grandparents. Vital records for people born in
1993 and their living parents are privacy-restricted; the genealogically rich,
public records begin with deceased generations. **Next step: obtain anchor names
(parents, grandparents, places of origin) from Miles**, then trace the older
generations through census, obituaries, Find A Grave, and FamilySearch with full
citations.

**Built this session:**
- GEDCOM canonical file, Python build pipeline, and the sourced UI viewer.

## 2026-07-11 — Session 2: anchors received; both grandparent lines documented

**Anchors provided by Miles:** parents John & Hilary Hutson; sister Jenni;
paternal grandparents Neil & Joan Hutson (Joan Ashkenazi, early life in SF;
Neil ↔ Louisiana); maternal grandparents Richard & Euvonne Thompson.

### Paternal line (Hutson — New Orleans → Dallas)

- **Richard Neil Hutson** obituary found (North Dallas Funeral Home, 2017) —
  the anchor document. d. 20 Sep 2017, Dallas, age 89; b. New Orleans to
  **Miles and Adela Hutson**; three older sisters (Louise Finke, Charlene
  Wilke, Mary Jane Trapolin); Jesuit HS; Tulane M.S. E.E. at age 20; WWII
  shipboard radar; Chief Engineer, Chance Vought Electronics; founded Hutson
  Corporation (1964); "inventor of the world's smallest pistol scope." Names
  wife of 56 years **Joan Liebes Hutson**, son **John Charles Hutson (Hilary)**,
  and grandchildren including **Miles (24)** and **Jennifer (18)** —
  cross-checks perfectly against the subject's birthdate. ✔ Family confirmed.
- **Joan L. Hutson** death notice (same funeral home): b. 28 Aug 1931,
  d. 13 Jan 2026, Dallas.
- **Mary Jane Hutson Trapolin** obituary (Times-Picayune/Schoen FH, 2019):
  b. 27 Mar 1922 New Orleans **to Miles and Adela (Nelson) Hutson** — gives
  great-grandmother's maiden name **Nelson**; "second of four children";
  Newcomb College Phi Beta Kappa; m. Ivor Ambrose Trapolin 1949.
- **Liebes lead (tentative, NOT recorded as fact):** Liebes is a prominent SF
  German-Jewish family (H. Liebes & Co. furriers, Congregation Emanu-El) —
  consistent with Joan's Ashkenazi/SF anchors, but no record yet connects her
  parents. Searched: "Joan Liebes" SF 1931/1940s, wedding announcements
  1960-62, Geni/WikiTree — no hit in free sources.

### Maternal line (Thompson — Abilene → Plano)

- **D'Olivio v. Hutson** court records (Tex. App. 05-20-00969-CV; SCOTUS
  docket 23-350, cert. denied 2023) — primary source. Caption names
  **Hilary Thompson Hutson**; facts establish parents **Richard W. Thompson
  Jr.** and **Euvonne R. Thompson** (Collin Co. homestead purchased 1973;
  Euvonne d. 24 Dec 2007; estate of Richard Jr. probated PB 1-1381-2019).
- **Richard W. Thompson III** obituary (North Dallas FH, 2013): b. 14 Nov 1955
  **Abilene**, d. 2 Mar 2013 Plano; WSU Range Management; cattle rancher;
  survived by "nephew, Miles Hutson and niece, Jennifer Hutson" ✔; predeceased
  by sister **Elizabeth Jane**; father Richard Jr. then living.
- **Richard W. Thompson Sr.** inferred from Jr./III suffixes — recorded as
  Tentative.
- Richard Jr. occupation: oil & gas producer (Richard W. Thompson, Jr. Inc.,
  Plano — TX corporate/RRC producer records).

**Searched, no result in free sources:** Euvonne's obituary (2007, Collin Co.)
and maiden name; Richard Jr.'s obituary; Miles Sr./Adela Nelson records
(Find A Grave blocks fetches; census images require FamilySearch/Ancestry
login); Louise Finke and Charlene Wilke obituaries.

**Next steps:** 1930/1940 census for the Hutson household of New Orleans
(would give Miles Sr.'s & Adela's birth years/places and likely parents);
Louisiana Statewide Death Index for Miles/Adela; Texas marriage index for
Richard Jr. & Euvonne (Abilene/Taylor Co., early 1950s) to get Euvonne's
maiden name; SF 1940 census for 8-year-old Joan Liebes to identify her
parents; ask Miles for any names he knows on the Liebes side.
