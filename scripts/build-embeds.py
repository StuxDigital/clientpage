#!/usr/bin/env python3
"""Write each page's Discord component embed into its <head> (everything except 404.html).

Run from anywhere: python scripts/build-embeds.py
The title and description come from each page's own <title> and meta description, so after editing
either, run this again. sitemap/index.html is left to scripts/build-sitemap.py, which builds it.
The helpers and this site's colour, icon and home-page text live in scripts/discord_embed.py.

Copyright (c) 2026 Stux.Group. All rights reserved. Stux.Digital is operated by Stux Group Ltd.
"""
import html
import re

import discord_embed as de

ROOT = de.ROOT
SKIP = {"404.html"}


def route(rel):
    if rel == "index.html":
        return "/"
    return "/" + rel[:-len(".html")]


def meta(text):
    title = html.unescape(re.search(r"<title>([^<]*)</title>", text).group(1))
    desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', text).group(1))
    return re.split(r" (?:—|\||·|-) ", title)[0], desc


def main():
    count = 0
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT).as_posix()
        if rel in SKIP or rel.startswith(("sitemap/", ".git")) or "node_modules" in rel:
            continue
        text = path.read_text(encoding="utf-8")
        if rel == "index.html":
            embed = de.home_tag()
        else:
            title, desc = meta(text)
            embed = de.page_tag(title, desc, route(rel))
        path.write_text(de.inject(text, embed), encoding="utf-8", newline="\n")
        count += 1
    print(f"Wrote the Discord embed into {count} pages")


if __name__ == "__main__":
    main()
