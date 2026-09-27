# Hutson family tree: notes for Claude

A sourced genealogy of Miles Hutson's family. Read `README.md` and
`docs/METHODOLOGY.md` for conventions; `docs/RESEARCH-LOG.md` for what has been
searched; `docs/ANCESTRY-PLAN.md` for the current research queue.

## Rules

- `data/family-tree.ged` is the source of truth. Every fact needs a `SOUR`
  citation with `PAGE` (what the record says, quoted where possible) and
  `_CONF` (Primary / Secondary / Tentative / Provided).
- Inferred links go in a `NOTE` containing the word TENTATIVE (the viewer draws
  those people with dashed borders). Don't put "TENTATIVE" in the note of a
  person whose own identity is certain.
- Living people (notes starting `LIVING`): names and relationships only.
- Next free IDs: check with
  `grep -oE '^0 @[ISF][0-9]+@' data/family-tree.ged | sort -V | tail`.
- Photos: crop into `data/media/`, add `1 OBJE / 2 FILE media/<name>.jpg /
  2 TITL / 2 SOUR` to the person. Verify a yearbook portrait against the
  caption order before using it.
- Stories for the Highlights tab live in `data/highlights.json`.

## Build and publish

```bash
python3 scripts/build.py                       # GEDCOM -> ui/tree-data.js
python3 scripts/build_artifact.py <out.html>   # one-file page for sharing
```

The shared page is the artifact https://claude.ai/artifact/1WLi6tPEmKQVyv5kRMSy1G
(republish to that URL). Work on branch `claude/family-tree-research-ui-0dtgcq`.

## Using Miles's Ancestry account

Miles has approved using his logged-in Ancestry session and accepts the terms-
of-service risk. When driving his browser:

- Work in a new tab and at a human pace; don't run bulk or parallel searches.
- If a login prompt, CAPTCHA or bot check appears, stop and ask Miles to handle
  it. Don't try to get around it.
- Don't change account settings, billing, or his online tree, and don't send
  messages to other users.
- Don't commit Ancestry record images to the repo. Record the collection name,
  the record URL and a transcription in the citation instead. Downloads can go
  in `research-inbox/`, which is git-ignored.
