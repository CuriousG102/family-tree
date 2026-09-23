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

## 2026-09-23 — Session 3: autonomous deep research (72 people, 13 generations)

**New free sources that worked:**
- **1950 U.S. Census (NARA, 1950census.archives.gov)**: name-searchable API plus
  IIIF page images. Found both key households on the original schedules:
  - *Hutson*, 321 Hillary St, New Orleans (ED 36-795, sheet 73): Miles B. (60,
    b. SC, electrical engineer), Adela L. (57, b. La., social worker),
    Richard N. (21, EE instructor at a private university).
  - *Liebes*, Highland Park, Dallas (ED 57-7, sheet 10): George J. (49, b. CA,
    "Fur Director", specialty shop), Edith M. (b. CA), **Joan (18, b. Oregon)**.
- **Internet Archive full-text search** (`archive.org/services/search/beta/…`,
  `service_backend=fts`) over digitized newspapers, directories, yearbooks
  and journals. Every quote in the GEDCOM was read in the item's `_djvu.txt`.

**Liebes line — proven:**
- 1923 *San Francisco News Letter*: wedding of "Miss Edith Wormser, daughter of
  Mrs. May Wormser, and Mr. George Julien Liebes, son of Mrs. Julien Liebes."
- 1916 *Richmond Terminal*, *LA Times*, *Argonaut*: Julien Liebes (45), VP of
  H. Liebes & Co., drowned at Long Beach on 2 July 1916 while carrying his
  13-year-old son George; widow Sophie became administratrix.
- Belden, *Fur Trade of America* (1917): Herman Liebes b. Rawicz, Prussia 1842;
  SF furrier from Oct 1864; d. London 28 Feb 1898.
- Neiman-Marcus career: *Dallas* magazine 1955 (elected VP), 1966 mink story,
  1968 AP sea-otter story. Stanford Alumni Directory: Joan Liebes, Class of '51.
- Joan's full *Dallas Morning News* obituary (read via search extracts, since the
  site has a bot check): born Portland, early childhood SF, moved to Dallas at 11.

**Hutson line — two published genealogies:**
- W. M. Hutson, "The Hutson Family of South Carolina," *SC Hist. & Gen. Mag.*
  9:3 (1908): Rev. William Hutson (b. England 1720) → Thomas (1750–89) →
  Richard Woodward (1788–1866) → William Ferguson (1815–81) → Charles Woodward
  (1840–1936).
- J. D. Scarborough, *Southern Kith and Kin* v.1 (1951): Miles Brewton Hutson
  b. 13 Dec 1889, m. 19 Jul 1919 Louise Adela Nelson; children Louise Adela
  (1920), Mary Jane (1922), Charleen Ethel (1924). Also covers the full Lockett
  descent from Thomas Lockett I (d. 1686, Henrico Co., VA).
- J. W. Barnwell, "Dr. Henry Woodward…" *SC Hist. & Gen. Mag.* 8 (1907).
- UNC finding aid for the Charles Woodward Hutson Papers.

**Marked Tentative (reasoned, not proven):** Julius Wormser as Edith's father
(only a 1921 probate petition by May Wormser); the Osborne generations above
Margaret Osborne Lockett (the 1951 compiler says they are uncertain); Hannah as
Herman Liebes's wife and Sidney's dates (Geni compiled profile).

**Blocked or dead ends (not circumvented):** Find A Grave, Geni, Legacy/
dallasnews (bot protection); Portal to Texas History (CAPTCHA). Euvonne
Thompson's maiden name: not found in the Texas 1950 census (too many fuzzy
matches without a surname) or in full-text search. Only Plano newspaper
mentions (1976–77) were found. Richard W. Thompson Sr.: no record found.
Adela Nelson's parents: not found (brother Laurence K. Nelson identified).

## 2026-09-23 — Session 4: colonial and Huguenot lines (139 people)

**Productive sources (all full text on Internet Archive):**
- *The Life and Letters of Benjamin Morgan Palmer* (1906), ch. 1: Palmer line
  to Rev. Thomas Palmer (1665–1743); Bunce line to Capt. Jared Bunce.
- Salley, "Capt. John Colcock and Some of His Descendants," *SCHGM* 3:4 (1902):
  Ferguson, Colcock, Maine–Gignilliat and Marion lines. **Hester Marion was an
  aunt of Gen. Francis Marion.**
- Salley, "Col. Miles Brewton and Some of His Descendants," *SCHGM* 2:2 (1901):
  proves Milicent Jones's mother was Mary Brewton, granddaughter of Col. Miles
  Brewton. This documents where the family name "Miles Brewton" came from.
- Eggleston, "The Huguenot Abraham Michaux and Descendants," *VMHB* 44:4
  (1936): Michaux, Rochet, Severin and de Serignon lines from the Huguenot
  registers of Sedan, back to people born about 1580–1615.
- Smith & Clay, *The Clay Family* (1899): Clay/Mitchell/Green/Marston lines;
  corrects "Mary Green" to Martha Green.
- Mary (Hutson) Nelson's memoir in the *Bulletin of the American Iris Society*:
  the Hutsons moved from Texas to New Orleans in 1908.
- *Oil & Gas Journal* (1951): a Richard W. Thompson Jr., petroleum engineer,
  moved from Wichita Falls to Winters, Tex. (Tentative identification.)

**Marked Tentative:** the first Mrs. Robert Brewton's surname Bulloch (family
tradition); John Townes as Judith Townes's father (inferred from where they
lived); Elizabeth Cary's Cary ancestry (two candidate Elizabeths, unresolved).

**Successive dead ends that ended this session:** Col. Thomas Ferguson's
parents; the Liebes family in Rawicz, Prussia (only unrelated Liebes records
from Posen); Julius/May Wormser's origins; Adela Nelson's parents (brother
Laurence K. Nelson known); William Maine's and Deborah Milner's parents.
Earlier dead ends that remain open: Euvonne Thompson's maiden name, Sophie
Liebes's maiden name (her sister was Mrs. Julia Martin, later Mrs. Moses J.
Lyon), and Hannah Liebes's maiden name.

**Best next steps (these need login-gated or offline records):** FamilySearch
1900–1940 census and Texas marriage index for Euvonne (Abilene/Wichita Falls,
around 1950–54); California death index and SF Jewish cemetery records (Home of
Peace, Salem) for the Liebes and Wormser families; Orleans Parish birth
indexes for Adela Nelson (born about 1892).
