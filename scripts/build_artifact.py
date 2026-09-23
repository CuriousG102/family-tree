#!/usr/bin/env python3
"""Bundle the viewer into one self-contained HTML page for sharing.

Inlines ui/style.css, ui/tree-data.js and ui/app.js into the markup from
ui/index.html. The output has no <html>/<head>/<body> wrapper because the
artifact host supplies that skeleton.

Usage:  python3 scripts/build.py && python3 scripts/build_artifact.py [OUT]
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI = os.path.join(ROOT, "ui")
DEFAULT_OUT = os.path.join(ROOT, "dist", "hutson-family-tree.html")


def read(name):
    with open(os.path.join(UI, name), encoding="utf-8") as fh:
        return fh.read()


def inline_script(code):
    # A literal "</" inside JSON or strings would end the <script> element early.
    return "<script>\n" + code.replace("</", "<\\/") + "\n</script>\n"


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
    html = read("index.html")
    title = re.search(r"<title>.*?</title>", html, re.S).group(0)
    body = re.search(r"<body>(.*?)<script", html, re.S).group(1).strip()
    page = (title + "\n<style>\n" + read("style.css") + "\n</style>\n"
            + body + "\n"
            + inline_script(read("tree-data.js"))
            + inline_script(read("app.js")))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(page)
    print("Wrote %s (%.0f KB)" % (out, len(page.encode("utf-8")) / 1024))


if __name__ == "__main__":
    main()
