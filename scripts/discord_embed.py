"""Discord component embed for this static site (the <script id="discord:component-embed"> in each <head>).

Spec: https://docs.discord.com/developers/link-previews/component-embeds
The Open Graph tags stay as the fallback. The JSON is pre-built into the HTML by
scripts/build-embeds.py (and scripts/build-sitemap.py for the sitemap page); the 404 page gets none.

Copyright (c) 2026 Stux.Group. All rights reserved. Stux.Digital is operated by Stux Group Ltd.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://" + (ROOT / "CNAME").read_text(encoding="utf-8").strip()

MAX_BYTES = 3000  # Discord's limit; over it, the page gets an HTML comment instead
NAME = "Stux.Digital"
SITE_URL = "https://stux.digital"
COLOUR = "#38BDF8"
ICON = "https://global.media.stux.digital/icon-light.png"

# The home page's own preview: title, description, a small subtext line and the link buttons.
HOME = {
    "title": "A client site on its way",
    "desc": "This address belongs to a Stux.Digital client, and their new site is on its way. "
            "Until it's ready, this page is holding the spot.",
    "note": "From idea to online. Now: design",
    "buttons": {"Stux.Digital": SITE_URL, "Our clients": "https://clients.stux.digital"},
}

TAG_RE = re.compile(r'[ \t]*<script id="discord:component-embed"[^>]*>.*?</script>\n?|'
                    r'[ \t]*<!-- discord:component-embed left out[^>]*-->\n?', re.S)


def md(s):
    """Escapes Discord markdown so data shows as plain text: one backslash each."""
    # Inline formatting, link brackets and backslashes anywhere; headings, quotes and lists only at a line start.
    s = re.sub(r'([\\*_~`|\[\]])', lambda m: '\\' + m.group(1), s)
    return re.sub(r'^([#>-])', lambda m: '\\' + m.group(1), s, flags=re.M)


def text(markdown):
    return {"type": 10, "content": markdown}


def buttons(links):
    return {"type": 1, "components": [{"type": 2, "style": 5, "label": label[:80], "url": url}
                                      for label, url in links.items()]}


def section(markdown):
    return {"type": 9, "components": [text(markdown)], "accessory": {"type": 11, "media": {"url": ICON}}}


def payload(components):
    data = {"component": {"type": 17, "accent_color": int(COLOUR.lstrip("#"), 16), "components": components}}
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def tag(components):
    """The <script> tag, or a comment when it would be over the limit (Discord then shows the Open Graph preview)."""
    js = payload(components)
    if len(js.encode("utf-8")) > MAX_BYTES:
        return f"<!-- discord:component-embed left out: over {MAX_BYTES} bytes -->"
    return f'<script id="discord:component-embed" type="application/json">{js}</script>'


def label():
    return f"-# [{md(NAME)}]({SITE_URL})\n"


def home_tag():
    url = BASE_URL + "/"
    return tag([section(label() + f"## [{md(HOME['title'])}]({url})\n{md(HOME['desc'])}\n-# {md(HOME['note'])}"),
                buttons(HOME["buttons"])])


def page_tag(title, desc, path):
    """Any other page: its name and description, with a way back to the page and the brand's site."""
    url = BASE_URL + path
    return tag([section(label() + f"## [{md(title)}]({url})\n{md(desc)}"),
                buttons({"Open page": url, NAME: SITE_URL})])


def inject(html_text, embed_tag):
    """Puts the embed just before </head>, replacing any earlier one."""
    html_text = TAG_RE.sub("", html_text)
    return html_text.replace("</head>", f"    {embed_tag}\n</head>", 1)
