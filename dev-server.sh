#!/bin/bash
# Stux.Digital Clientpage - Local dev server
# Usage: ./dev-server.sh [port] [--no-dev-mode] [--lan]
#   port            default: 8000
#   --no-dev-mode   render exactly as production does (no dev banner)
#   --lan           listen on all interfaces so phones/tablets on your network can
#                   connect (prints the addresses to open); default is 127.0.0.1 only
#
# Static site, nothing to build: this serves the folder the way GitHub Pages does
# (/changelog -> changelog.html, the 404 page for missing paths) through
# .github/dev-router.php. DEV_MODE is on by default, which makes the router answer
# /assets/dev-mode.js with `window.SITE_DEV_MODE = true`, so every page shows the dev banner;
# production serves the committed assets/dev-mode.js, which leaves it off.
#
# PHP is only the local web server here. Like the other Stux projects it runs on PHP 7.4:
# $PHP_BIN if set, else php74 / php7.4 on PATH, else %LOCALAPPDATA%\Programs\PHP\7.4\php.exe,
# else plain php (with a warning).
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8000
HOST=127.0.0.1
export DEV_MODE=1

for arg in "$@"; do
    case "$arg" in
        --no-dev-mode) export DEV_MODE=0 ;;
        --lan) HOST=0.0.0.0 ;;
        ''|*[!0-9]*) echo "Usage: $0 [port] [--no-dev-mode] [--lan]" >&2; exit 1 ;;
        *) PORT="$arg" ;;
    esac
done

PHP="${PHP_BIN:-}"
if [ -z "$PHP" ]; then
    for candidate in php74 php7.4 "${LOCALAPPDATA:-/nonexistent}/Programs/PHP/7.4/php.exe"; do
        if command -v "$candidate" >/dev/null 2>&1 || [ -x "$candidate" ]; then PHP="$candidate"; break; fi
    done
fi
PHP="${PHP:-php}"
PHP_VERSION="$("$PHP" -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;')"
if [ "$PHP_VERSION" != "7.4" ]; then
    echo "WARNING: serving with PHP $PHP_VERSION; the Stux projects use PHP 7.4. Install 7.4 or set PHP_BIN." >&2
fi

if [ "$DEV_MODE" = "1" ]; then
    echo "DEV_MODE on (dev banner) - pass --no-dev-mode to see it as production does."
else
    echo "DEV_MODE off - rendering exactly as production does."
fi
echo "Stux.Digital Clientpage running at http://127.0.0.1:$PORT (PHP $PHP_VERSION)"
if [ "$HOST" = "0.0.0.0" ]; then
    # This machine's IPv4 addresses (Windows, macOS or Linux), minus loopback
    case "$OSTYPE" in
        msys*|cygwin*|win32*) ADDRS="$(ipconfig | awk -F': *' '/IPv4/{print $2}' | tr -d '\r')" ;;
        darwin*) ADDRS="$(ifconfig | awk '/inet /{print $2}')" ;;
        *) ADDRS="$(hostname -I 2>/dev/null)" ;;
    esac
    echo "On your local network (--lan), open one of these on the other device:"
    for a in $ADDRS; do
        case "$a" in 127.*|'') ;; *) echo "    http://$a:$PORT" ;; esac
    done
    echo "  (usually the 192.168.x.x one; allow PHP through the firewall if asked)"
fi
exec "$PHP" -S "$HOST:$PORT" -t "$DIR" "$DIR/.github/dev-router.php"
