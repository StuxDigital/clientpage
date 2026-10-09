# Changelog

All notable changes to clientpage are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2026-10-09

### Changed

- The favicon follows the browser's light or dark theme: the deep icon (`icon-dark.png`) on light and the bright one (`icon-light.png`) on dark, straight from the brand's media host, so a brand colour change is just a new file there
- The logos and icons in the Markdown docs (README and the like) follow GitHub's light or dark theme, using each brand's `logo-light`/`logo-dark` and `icon-light`/`icon-dark` files

## [1.0.5] - 2026-10-09

### Fixed

- The progress steps were missing Host: they're the full five steps every Stux.Digital site takes, Idea → Design → Build → Host → Online, with the path winding through all five. The steps row sizes itself to however many steps there are

## [1.0.4] - 2026-10-09

### Changed

- The logo's winding path now appears twice, as two separate copies instead of one path joining the background bulb to the steps (which showed two lightbulbs on one path). The background copy starts at its own glowing bulb in the top corner, cut cleanly at the bulb's edge, and winds down behind the card on every page (wider screens only). The steps' copy starts at the Idea step, which glows like a bulb, and winds through each step to the last, brighter as far as the current step

## [1.0.3] - 2026-10-09

### Added

- The footer has the muted Stux.Digital logo row the other brands' pages have, linking to Stux.Digital and every Stux.Digital client, in full colour on hover

### Changed

- The background path is back, reworked: it starts at a glowing lightbulb beside the card, sweeps into the progress steps and winds through every step to the last, brighter as far as the current step. It's cut away under the bulb and each step's dot, so it starts and ends exactly on them instead of overlapping. Pages without steps (legal, changelog, sitemap) keep it behind the card, running up to the bulb in the corner. On phones there's no room beside the card, so the path just winds through the steps

### Fixed

- The legal, changelog and sitemap footers no longer say Stux.Digital is operated by Stux Group Ltd: that belongs on the Imprint only, which still says it

## [1.0.2] - 2026-10-09

### Changed

- The progress steps sit on one winding dotted path, like the path in the logo: it starts at the first step (the glowing Idea lightbulb) and winds through each step to the last, brighter as far as the current step. It replaces the separate background path, which ran to a lightbulb floating in the corner and could overlap it, and the straight dashed line between the steps
- On phones the steps stay in one row (smaller dots, labels that may wrap), so the path stays a single wave instead of cutting across a 2×2 grid

## [1.0.1] - 2026-10-09

### Fixed

- The footer's copyright line names Stux.Digital instead of Stux.Group ("© 2026 Stux.Digital. All rights reserved."), matching the brand the site belongs to. The legal pages' statement that the names and logos belong to Stux.Group is unchanged

## [1.0.0] - 2026-10-08

### Added

- The Stux.Digital placeholder for a client site that isn't live yet at `clientpage.stux.digital`, in Stux.Digital's two-tone sky blue (`#38bdf8` on dark, `#0369a1` on light, straight from the logo)
- The Stux.Digital twist: the page sits inside a browser window whose address bar shows the domain it's served on, with Idea → Design → Build → Online progress steps (Design in progress), and the logo's winding path running behind the page to a lightbulb (still for reduced motion)
- Light and dark themes, following the system with a toggle that remembers the choice (`stuxdigital-theme`), and the logo and icons swapping to their bright variants on dark
- Boring Legal Stuff hub with Privacy Policy, Terms and Ethics, Cookies Policy, Imprint, Disclaimer and Opt-Out Preferences, a `/changelog` page rendering this file (sections always in Added, Changed, Fixed, Removed, Security, Deprecated order), a sitemap page, `sitemap.xml`, `robots.txt` and a 404 page
- `dev-server.sh` / `dev-server.bat` (DEV_MODE and its dev banner on by default, `--no-dev-mode` to see production), CI checks, the GitHub Pages deploy workflow, and `commit.sh` / `commit.bat` for tagged releases
