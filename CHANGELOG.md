# Changelog

All notable changes to clientpage are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-08

### Added

- The Stux.Digital placeholder for a client site that isn't live yet at `clientpage.stux.digital`, in Stux.Digital's two-tone sky blue (`#38bdf8` on dark, `#0369a1` on light, straight from the logo)
- The Stux.Digital twist: the page sits inside a browser window whose address bar shows the domain it's served on, with Idea → Design → Build → Online progress steps (Design in progress), and the logo's winding path running behind the page to a lightbulb (still for reduced motion)
- Light and dark themes, following the system with a toggle that remembers the choice (`stuxdigital-theme`), and the logo and icons swapping to their bright variants on dark
- Boring Legal Stuff hub with Privacy Policy, Terms and Ethics, Cookies Policy, Imprint, Disclaimer and Opt-Out Preferences, a `/changelog` page rendering this file (sections always in Added, Changed, Fixed, Removed, Security, Deprecated order), a sitemap page, `sitemap.xml`, `robots.txt` and a 404 page
- `dev-server.sh` / `dev-server.bat` (DEV_MODE and its dev banner on by default, `--no-dev-mode` to see production), CI checks, the GitHub Pages deploy workflow, and `commit.sh` / `commit.bat` for tagged releases
