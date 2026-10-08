#!/usr/bin/env python3
"""Regenerate sitemap.xml, sitemap/index.html and robots.txt for this static site.

Run from anywhere: python scripts/build-sitemap.py
The page list is PAGES below; each page's <lastmod> is the date of the last git commit that
touched its source file (left out if the file has no history yet). URLs always use the site's
production address, from CNAME. The HTML page reuses the Boring Legal Stuff hub as its layout.

Copyright (c) 2026 Stux.Group. All rights reserved. Stux.Digital is operated by Stux Group Ltd.
"""
import html
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOST = (ROOT / "CNAME").read_text(encoding="utf-8").strip()
BASE_URL = "https://" + HOST

# (path, source file, label, description, priority, changefreq)
PAGES = [
    ("/", "index.html", "Home", "{title}", "1.0", "monthly"),
    ("/changelog", "changelog.html", "Changelog", "What's changed on this page, release by release.", "0.4", "monthly"),
    ("/legal", "legal.html", "Boring Legal Stuff", "Privacy, terms, cookies, imprint, disclaimer and opt-out preferences, in one place.", "0.3", "yearly"),
    ("/legal/privacy", "legal/privacy.html", "Privacy Policy", "What's collected (almost nothing) and why.", "0.2", "yearly"),
    ("/legal/terms", "legal/terms.html", "Terms and Ethics", "The simple rules for using this page.", "0.2", "yearly"),
    ("/legal/cookies", "legal/cookies.html", "Cookies Policy", "One theme setting, and no cookies at all.", "0.2", "yearly"),
    ("/legal/imprint", "legal/imprint.html", "Imprint", "Who runs this page, and how to reach them.", "0.2", "yearly"),
    ("/legal/disclaimer", "legal/disclaimer.html", "Disclaimer", "Accuracy, accessibility, security and links.", "0.2", "yearly"),
    ("/legal/opt-out", "legal/opt-out.html", "Opt-Out Preferences", "Nothing is sold, so there's nothing to opt out of.", "0.2", "yearly"),
    ("/sitemap/", "sitemap/index.html", "Sitemap", "Every page on this site, with a link to the XML version.", "0.1", "monthly"),
]


def lastmod(rel):
    return subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel], cwd=ROOT,
                          capture_output=True, text=True).stdout.strip()


def page_title():
    text = (ROOT / "index.html").read_text(encoding="utf-8")
    start = text.index("<title>") + len("<title>")
    return html.unescape(text[start:text.index("</title>", start)])


def build_xml():
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, src, _label, _desc, priority, freq in PAGES:
        lines.append("  <url>")
        lines.append(f"    <loc>{html.escape(BASE_URL + loc)}</loc>")
        mod = lastmod(src)
        if mod:
            lines.append(f"    <lastmod>{mod}</lastmod>")
        lines.append(f"    <changefreq>{freq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def build_html(title):
    legal = (ROOT / "legal.html").read_text(encoding="utf-8")
    body_start = legal.index('<div class="browser-body prose">') + len('<div class="browser-body prose">')
    body_end = legal.index("</div>\n        </div>\n    </main>")
    head, foot = legal[:body_start], legal[body_end:]
    head = (head.replace("<title>Boring Legal Stuff — Stux.Digital</title>", "<title>Sitemap — Stux.Digital</title>")
                .replace(f'href="{BASE_URL}/legal"', f'href="{BASE_URL}/sitemap/"')
                .replace('<span class="brand-sub">Legal</span>', '<span class="brand-sub">Sitemap</span>')
                .replace(f"<span data-current-path>{HOST}/legal</span>", f"<span data-current-path>{HOST}/sitemap/</span>"))
    ds = head.index('<meta name="description" content="') + len('<meta name="description" content="')
    head = head[:ds] + "Every page on this Stux.Digital site, with a link to the XML sitemap." + head[head.index('">', ds):]
    cards = []
    for loc, _src, label, desc, _p, _f in PAGES:
        cards.append(f'                    <a class="card" href="{html.escape(loc)}"><span class="card-url">{html.escape(BASE_URL + loc)}</span>'
                     f'<span class="card-title">{html.escape(label)}</span><span class="card-desc">{html.escape(desc.format(title=title))}</span></a>')
    body = ("\n                <h1>Sitemap</h1>\n"
            "                <p class=\"subtitle\">Every page on this site. There's also an <a href=\"/sitemap.xml\">XML version</a> for search engines.</p>\n"
            "                <div class=\"cards\">\n" + "\n".join(cards) + "\n                </div>\n            ")
    return head + body + foot


def main():
    title = page_title()
    (ROOT / "sitemap.xml").write_text(build_xml(), encoding="utf-8", newline="\n")
    (ROOT / "sitemap").mkdir(exist_ok=True)
    (ROOT / "sitemap" / "index.html").write_text(build_html(title), encoding="utf-8", newline="\n")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {BASE_URL}/sitemap.xml\n", encoding="utf-8", newline="\n")
    print(f"Wrote sitemap.xml, sitemap/index.html and robots.txt for {BASE_URL} ({len(PAGES)} pages)")


if __name__ == "__main__":
    main()
