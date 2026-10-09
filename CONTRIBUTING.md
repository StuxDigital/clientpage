<p align="center">
  <picture><source media="(prefers-color-scheme: dark)" srcset="https://global.media.stux.digital/logo-light.png"><source media="(prefers-color-scheme: light)" srcset="https://global.media.stux.digital/logo-dark.png"><img src="https://global.media.stux.digital/logo-dark.png" height="80" alt="Stux.Digital Logo"></picture>
</p>

# Contributing to clientpage

`clientpage` is the Stux.Digital placeholder for a client site that isn't live yet at [clientpage.stux.digital](https://clientpage.stux.digital), part of the
Stux.Group Brand of Companies. The repository isn't open to public pull requests, and it isn't
licensed for reuse (see [LICENSE](LICENSE)). This document is for anyone with write access.

Questions: [hello@stux.digital](mailto:hello@stux.digital).

## Local setup

```bash
git clone https://github.com/StuxDigital/clientpage.git
cd clientpage
./dev-server.sh
```

No install step and nothing to build. `dev-server.sh` / `dev-server.bat` serve the folder the way
GitHub Pages does (`/legal` → `legal.html`, the 404 page for missing paths) through
`.github/dev-router.php`, with PHP as the local web server (7.4: `$PHP_BIN`, else `php74`/`php7.4`,
else `%LOCALAPPDATA%\Programs\PHP\7.4\php.exe`, else `php`). DEV_MODE is on by default: the router
answers `/assets/dev-mode.js` with `window.SITE_DEV_MODE = true`, so every page shows the dev
banner, and `?banner=soon,maintenance,site` previews the other banners. Pass `--no-dev-mode` to see
the page exactly as production does.

## Project conventions

- **Plain HTML/CSS/JS, no framework, no build step.** Every page is a real `.html` file.
- **One shared look** in `assets/css/site.css`: the theme tokens (dark `--bg #0b1218`,
  `--accent #38bdf8`; light `--bg #f3f8fc`, `--accent #0369a1`), the browser window
  (`.browser`), the background path and lightbulb (`.bg`), and the progress steps (`.steps`, each
  `step--done`, `step--current` or `step--next`). Shared behaviour is in `assets/js/site.js`.
- **The Stux.Digital pages share this kit**: `clientpage`, `soonpage` and `maintenancepage` use
  the same stylesheet and scripts with their own copy and steps. Keep a change to the kit in step
  across all three.
- The address bar shows the real host and path (`data-current-host`, `data-current-path`), since
  a placeholder page is often served on someone else's domain.
- Theme: the `<head>` script sets `<html data-theme>` before paint from `localStorage`
  (`stuxdigital-theme`) or the system preference; the toggle switches and saves it.
- The sitemap (`sitemap.xml`, `sitemap/index.html`, `robots.txt`) is generated: after adding or
  removing a page, edit `PAGES` in `scripts/build-sitemap.py`, run `python scripts/build-sitemap.py`,
  and add any new root file to the copy step in `.github/workflows/pages.yml`.
- `assets/dev-mode.js` is committed as `false`; never commit it switched on.
- If the page ever loads something new from another domain, update the Privacy Policy and Opt-Out pages.

## Legal pages

All six live under `legal/` (`privacy`, `terms`, `cookies`, `imprint`, `disclaimer`, `opt-out`),
linked from the **Boring Legal Stuff** hub at `legal.html`. Keep them in sync with what the page
actually does.

## Versioning and changelog

- The version lives in `VERSION.md` (a bare version string); bump it on every release, following
  [Semantic Versioning](https://semver.org/)
- Every release gets a `CHANGELOG.md` entry using `###` subsections in this order: Added,
  Changed, Fixed, Removed, Security, Deprecated
- `commit.sh` (bash) and `commit.bat` (Windows) read `VERSION.md` to commit and tag a release; no
  need to edit them per release

## Before committing

- Open the changed pages through `./dev-server.sh`, in both themes and at phone width
- CI checks the key files exist, that `VERSION.md` has a `CHANGELOG.md` release, validates the
  HTML (`html-validate`) and lints the Markdown (`markdownlint`)
