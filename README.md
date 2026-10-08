<p align="center">
  <img src="https://global.media.stux.digital/logo.png" height="100" alt="Stux.Digital Logo">
</p>

# clientpage

### *From idea to online.*

The Stux.Digital placeholder for a client site that isn't live yet, live at [clientpage.stux.digital](https://clientpage.stux.digital). It's what visitors see on
a Stux.Digital client's address while their new site is designed and built.

It's one of the Stux.Group placeholder pages, in Stux.Digital's two-tone sky blue (`#38bdf8` on
dark, `#0369a1` on light, straight from the logo), with Stux.Digital's own twist: the page sits inside a browser window whose address bar shows the domain it's served on, with Idea → Design → Build → Online progress steps (Design in progress),
and the logo's winding path runs behind the page to a lightbulb.

- One static `index.html` plus its legal, changelog, sitemap and 404 pages: no framework, no build step
- Dark and light themes: follows the system, with a toggle that remembers the choice (`stuxdigital-theme`)
- Fonts are self-hosted; the only outside requests are the Stux.Digital logo and icons from `global.media.stux.digital`
- No cookies, no analytics, no tracking
- Deployed to GitHub Pages by `.github/workflows/pages.yml`

## Pages

| Path | What it is |
|---|---|
| `/` | The placeholder for a client site that isn't live yet |
| `/changelog` | `CHANGELOG.md`, rendered (sections in Added, Changed, Fixed, Removed, Security, Deprecated order) |
| `/legal` | Boring Legal Stuff, linking to Privacy Policy, Terms and Ethics, Cookies Policy, Imprint, Disclaimer and Opt-Out Preferences |
| `/sitemap/` | Every page (generated with `sitemap.xml` and `robots.txt` by `scripts/build-sitemap.py`) |
| `/404` | The not-found page, in the same browser window |

## Local development

```bash
./dev-server.sh               # http://127.0.0.1:8000, DEV_MODE on (dev banner)
./dev-server.sh 8080 --no-dev-mode
```

On Windows, use `dev-server.bat`. PHP is only the local web server (7.4, like the other Stux
projects); see [CONTRIBUTING.md](CONTRIBUTING.md).

## Releasing

1. Update `CHANGELOG.md`
2. Bump `VERSION.md`
3. Update this README if relevant
4. Run `./commit.sh` (or `commit.bat`): it reads `VERSION.md`, commits, and tags `vX.Y.Z`
5. `git push origin main --tags`

## License

&copy; 2026 Stux.Group. All rights reserved. This repository is not licensed for reuse or
redistribution. Lato and Poppins (`assets/fonts/`) are under the SIL Open Font License.

---

Made by [Stux.Digital](https://github.com/StuxDigital)

*Stux.Digital is part of the [Stux.Group](https://github.com/StuxGroup) Brand of Companies.*

Stux.Digital is operated by Stux Group Ltd, a company registered in England and Wales (company no. 13160574), registered office 82a James Carter Road, Mildenhall, England, IP28 7DE.
