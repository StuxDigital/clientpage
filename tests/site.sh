#!/usr/bin/env bash
# Checks the head of every page: each Discord component embed is valid JSON under 3,000 bytes
# with no stray "$1" and nothing after a "</"; the 404 page has none; the favicon files exist
# with the right sizes; and every <head> carries the same favicon tag set.
# Needs Python 3 (standard library only). Run with: bash tests/site.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY="$(command -v python3 || command -v python)"
[ -n "$PY" ] || { echo "FAIL - Python 3 is needed"; exit 1; }
exec "$PY" -I - "$ROOT" <<'PYEOF'
import json
import re
import struct
import sys
from pathlib import Path

root = Path(sys.argv[1])
passed = failed = 0


def check(name, ok):
    global passed, failed
    if ok:
        passed += 1
        print("ok   - " + name)
    else:
        failed += 1
        print("FAIL - " + name)


def png_size(path):
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", data[16:24])


def png_opaque_corners(path):
    """True when the PNG has no alpha channel (colour type 2), so no transparent background."""
    data = path.read_bytes()
    return data[:8] == b"\x89PNG\r\n\x1a\n" and data[25] == 2


def ico_sizes(path):
    data = path.read_bytes()
    reserved, kind, count = struct.unpack("<HHH", data[:6])
    if (reserved, kind) != (0, 1):
        return None
    sizes = []
    for i in range(count):
        w, h, _c, _r, _p, _b, length, offset = struct.unpack("<BBBBHHII", data[6 + 16 * i:22 + 16 * i])
        sizes.append((w or 256, h or 256))
        if data[offset:offset + 8] != b"\x89PNG\r\n\x1a\n":
            return None  # PNG-in-ICO only
    return sorted(sizes)


pages = sorted(p for p in root.rglob("*.html")
               if not {".git", "node_modules"} & set(p.relative_to(root).parts))
rels = {p: p.relative_to(root).as_posix() for p in pages}
check("there are pages to check", len(pages) > 0)

# Discord component embeds
EMBED = re.compile(r'<script id="discord:component-embed" type="application/json">(.*?)</script>', re.S)
for p in pages:
    rel = rels[p]
    text = p.read_text(encoding="utf-8")
    head = text[:text.index("</head>")]
    found = EMBED.findall(head)
    if rel == "404.html" or "404" in p.stem:
        check(rel + " has no Discord embed", "discord:component-embed" not in text)
        continue
    omitted = "discord:component-embed left out" in head
    if not found:
        check(rel + " has a Discord embed (or the over-limit comment)", omitted)
        continue
    raw = found[0]
    check(rel + " has exactly one Discord embed", len(found) == 1)
    check(rel + " embed is under 3,000 bytes (%d)" % len(raw.encode("utf-8")), len(raw.encode("utf-8")) <= 3000)
    check(rel + " embed has no literal \"$1\"", "$1" not in raw)
    check(rel + " embed has no raw \"</\"", "</" not in raw)
    try:
        data = json.loads(raw)
        comp = data["component"]
        ok = comp["type"] == 17 and isinstance(comp["accent_color"], int) and len(comp["components"]) > 0
    except (ValueError, KeyError, TypeError):
        ok = False
    check(rel + " embed is valid JSON in the component shape", ok)

# Favicon files
ico = root / "favicon.ico"
check("favicon.ico is PNG-in-ICO with 16, 32 and 48", ico.is_file() and ico_sizes(ico) == [(16, 16), (32, 32), (48, 48)])
apple = root / "apple-touch-icon.png"
check("apple-touch-icon.png is 180x180 and opaque", apple.is_file() and png_size(apple) == (180, 180) and png_opaque_corners(apple))
manifest_path = root / "site.webmanifest"
check("site.webmanifest exists", manifest_path.is_file())
try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
except (OSError, ValueError):
    manifest = {}
for key in ("name", "short_name", "theme_color", "background_color"):
    check("site.webmanifest has " + key, bool(manifest.get(key)))
check('site.webmanifest start_url is "/" and display is "browser"',
      manifest.get("start_url") == "/" and manifest.get("display") == "browser")
icons = manifest.get("icons", [])


def icon_file(entry):
    return root / entry["src"].lstrip("/")


def has(size, purpose=None):
    for e in icons:
        f = icon_file(e)
        if e.get("sizes") == "%dx%d" % (size, size) and e.get("purpose") == purpose and f.is_file() \
                and png_size(f) == (size, size):
            return True
    return False


check("manifest has a 192x192 icon that exists", has(192))
check("manifest has a 512x512 icon that exists", has(512))
check("manifest has a 512x512 maskable icon that exists, opaque",
      has(512, "maskable") and all(png_opaque_corners(icon_file(e)) for e in icons if e.get("purpose") == "maskable"))

# The identical tag set in every <head>
TAGS = ['<link rel="icon" href="/favicon.ico" sizes="48x48">',
        '<link rel="icon" type="image/png" sizes="512x512" href="/assets/img/icon-512.png">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '<link rel="manifest" href="/site.webmanifest">']
for p in pages:
    text = p.read_text(encoding="utf-8")
    head = text[:text.index("</head>")]
    check(rels[p] + " <head> has the favicon tag set", all(head.count(t) == 1 for t in TAGS))
    check(rels[p] + " <head> has no other rel=icon links", len(re.findall(r'rel="icon"', head)) == 2)

print("%d passed, %d failed" % (passed, failed))
sys.exit(1 if failed else 0)
PYEOF
