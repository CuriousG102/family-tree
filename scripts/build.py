#!/usr/bin/env python3
"""Parse the canonical GEDCOM file and emit UI data.

This keeps a single source of truth (data/family-tree.ged) and generates
ui/tree-data.js, an embedded JSON blob so the UI works offline (open
ui/index.html directly, no web server / no CORS issues).

Usage:  python3 scripts/build.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GED_PATH = os.path.join(ROOT, "data", "family-tree.ged")
OUT_PATH = os.path.join(ROOT, "ui", "tree-data.js")

LINE_RE = re.compile(r"^(\d+)\s+(?:(@[^@]+@)\s+)?(\S+)(?:\s(.*))?$")


class Node:
    __slots__ = ("level", "tag", "xref", "value", "children")

    def __init__(self, level, tag, xref, value):
        self.level = level
        self.tag = tag
        self.xref = xref
        self.value = value or ""
        self.children = []

    def find(self, tag):
        return [c for c in self.children if c.tag == tag]

    def first(self, tag):
        for c in self.children:
            if c.tag == tag:
                return c
        return None

    def val(self, tag):
        c = self.first(tag)
        return c.text() if c else ""

    def text(self):
        """Value plus any CONT/CONC continuation lines."""
        out = self.value
        for c in self.children:
            if c.tag == "CONT":
                out += "\n" + c.value
            elif c.tag == "CONC":
                out += c.value
        return out


def parse(path):
    """Parse GEDCOM into a list of level-0 Node records."""
    records = []
    stack = []
    with open(path, encoding="utf-8-sig") as fh:
        for raw in fh:
            line = raw.rstrip("\n").rstrip("\r")
            if not line.strip():
                continue
            m = LINE_RE.match(line)
            if not m:
                continue
            level = int(m.group(1))
            # In GEDCOM, an xref id before a tag is a record id (@I1@ INDI);
            # a pointer value after the tag is stored as the value.
            xref, tag, value = m.group(2), m.group(3), m.group(4)
            node = Node(level, tag, xref, value)
            if level == 0:
                records.append(node)
                stack = [node]
            else:
                while stack and stack[-1].level >= level:
                    stack.pop()
                if stack:
                    stack[-1].children.append(node)
                stack.append(node)
    return records


def parse_citation(node):
    """A SOUR pointer node under a fact -> citation dict."""
    return {
        "source": (node.value or "").strip("@") or None,
        "page": node.val("PAGE") or None,
        "conf": node.val("_CONF") or None,
        "note": node.val("NOTE") or None,
    }


def collect_citations(fact_node):
    return [parse_citation(s) for s in fact_node.find("SOUR")]


def fact_from(node, want_place=False):
    """Turn an event node (BIRT/DEAT/etc.) into a dict."""
    f = {
        "date": node.val("DATE") or None,
        "place": node.val("PLAC") or None,
        "value": node.value.strip() or None,
        "citations": collect_citations(node),
    }
    return f


NAME_RE = re.compile(r"^(.*?)/(.*?)/(.*)$")


def format_name(raw):
    m = NAME_RE.match(raw)
    if m:
        given = m.group(1).strip()
        surname = m.group(2).strip()
        suffix = m.group(3).strip()
        full = " ".join(p for p in [given, surname, suffix] if p)
        return {"full": full, "given": given, "surname": surname}
    return {"full": raw.strip(), "given": raw.strip(), "surname": ""}


EVENT_TAGS = ["BIRT", "DEAT", "BURI", "CHR", "BAPM", "MARR", "DIV", "RESI",
              "EDUC", "OCCU", "IMMI", "EMIG", "CENS", "EVEN", "GRAD", "RETI"]
EVENT_LABELS = {
    "BIRT": "Birth", "DEAT": "Death", "BURI": "Burial", "CHR": "Christening",
    "BAPM": "Baptism", "MARR": "Marriage", "DIV": "Divorce", "RESI": "Residence",
    "EDUC": "Education", "OCCU": "Occupation", "IMMI": "Immigration",
    "EMIG": "Emigration", "CENS": "Census", "EVEN": "Event", "GRAD": "Graduation",
    "RETI": "Retirement",
}


def build_name(node):
    name = format_name(node.text())
    prefix = node.val("NPFX")
    if prefix:
        name["prefix"] = prefix
        name["full"] = prefix + " " + name["full"]
    for tag, key in (("NICK", "nickname"), ("_MARNM", "married")):
        if node.val(tag):
            name[key] = node.val(tag)
    return name


def event_label(node):
    if node.tag == "EVEN" and node.val("TYPE"):
        return node.val("TYPE")
    return EVENT_LABELS.get(node.tag, node.tag.title())


def build_individual(rec):
    ind = {
        "id": rec.xref.strip("@"),
        "names": [build_name(n) for n in rec.find("NAME")],
        "sex": rec.val("SEX") or None,
        "events": [],
        "notes": [n.text() for n in rec.find("NOTE")],
        "note_citations": [collect_citations(n) for n in rec.find("NOTE")],
        "famc": [c.value.strip("@") for c in rec.find("FAMC")],
        "fams": [c.value.strip("@") for c in rec.find("FAMS")],
    }
    ind["name"] = ind["names"][0]["full"] if ind["names"] else "(unknown)"
    for child in rec.children:
        if child.tag in EVENT_TAGS:
            ev = fact_from(child)
            ev["type"] = child.tag
            ev["label"] = event_label(child)
            ind["events"].append(ev)
    return ind


def build_family(rec):
    return {
        "id": rec.xref.strip("@"),
        "husband": (rec.val("HUSB") or "").strip("@") or None,
        "wife": (rec.val("WIFE") or "").strip("@") or None,
        "children": [c.value.strip("@") for c in rec.find("CHIL")],
        "events": [
            {**fact_from(child), "type": child.tag, "label": event_label(child)}
            for child in rec.children if child.tag in EVENT_TAGS
        ],
        "notes": [n.text() for n in rec.find("NOTE")],
        "note_citations": [collect_citations(n) for n in rec.find("NOTE")],
    }


def build_source(rec):
    return {
        "id": rec.xref.strip("@"),
        "title": rec.val("TITL") or "(untitled source)",
        "author": rec.val("AUTH") or None,
        "publication": rec.val("PUBL") or None,
        "url": rec.val("_URL") or None,
        "confidence": rec.val("_CONF") or None,
        "accessed": rec.val("_ACC") or None,
        "note": rec.val("NOTE") or None,
    }


def main():
    if not os.path.exists(GED_PATH):
        sys.exit("GEDCOM file not found: " + GED_PATH)
    records = parse(GED_PATH)
    individuals, families, sources = {}, {}, {}
    header = {}
    for rec in records:
        if rec.tag == "INDI":
            ind = build_individual(rec)
            individuals[ind["id"]] = ind
        elif rec.tag == "FAM":
            fam = build_family(rec)
            families[fam["id"]] = fam
        elif rec.tag == "SOUR" and rec.xref:
            src = build_source(rec)
            sources[src["id"]] = src
        elif rec.tag == "HEAD":
            header = {"date": rec.val("DATE"), "note": rec.val("NOTE")}

    data = {
        "meta": {
            "generated_from": "data/family-tree.ged",
            "header": header,
            "counts": {
                "individuals": len(individuals),
                "families": len(families),
                "sources": len(sources),
            },
        },
        "individuals": individuals,
        "families": families,
        "sources": sources,
    }
    payload = "// AUTO-GENERATED by scripts/build.py from data/family-tree.ged\n"
    payload += "// Do not edit by hand. Edit the .ged file and re-run the build.\n"
    payload += "window.TREE = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        fh.write(payload)
    print("Wrote %s" % OUT_PATH)
    print("  individuals: %d, families: %d, sources: %d"
          % (len(individuals), len(families), len(sources)))


if __name__ == "__main__":
    main()
