<p align="center"><img src="public/social-card.svg" alt="SuperCLI — Your next favorite command-line tool" width="800"></p>
<h1 align="center">SuperCLI</h1>

<p align="center"><strong>Find your next favorite command-line tool. Manually curated, openly maintained.</strong></p>

<p align="center">
  <a href="https://supercli.site"><img src="https://img.shields.io/badge/site-live-002fa7?style=flat-square" alt="Website"></a>
  <a href="https://github.com/webkubor/supercli/releases"><img src="https://img.shields.io/github/v/release/webkubor/supercli?style=flat-square&color=coral" alt="Release"></a>
  <a href="https://github.com/webkubor/supercli/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/webkubor/supercli/deploy.yml?style=flat-square&color=4c9a6b" alt="Deploy"></a>
  <a href="https://github.com/webkubor/supercli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-002fa7?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <a href="#why-supercli">Why</a> ·
  <a href="#what-it-solves">What it solves</a> ·
  <a href="#how-to-contribute">Contribute</a> ·
  <a href="#run-locally">Run locally</a> ·
  <a href="#project-layout">Layout</a> ·
  <a href="#transparency-and-limits">Boundaries</a> ·
  <a href="README.md">中文</a>
</p>

<img src="docs/home-hero.png" alt="SuperCLI homepage: brand statement and discovery entry on the left, live tool preview with a copyable install command on the right" width="100%">

**[Browse the directory →](https://supercli.site)**

---

## Why SuperCLI

The command-line ecosystem does not lack tools. It lacks an entry point you can trust. Search results mix ads, paid placements, and stale tutorials. Leaderboards give you a stars number without telling you what it means, when it was taken, or whether the install command still works.

SuperCLI is **manually curated with public evidence**:

- **Every tool has a source** — official repository, official documentation, and the maintainer's original entry are all traceable
- **The ranking basis is stated** — sorted by GitHub repository stars, with the snapshot time shown on the page; monorepo metrics cover the whole repository
- **Review scope is public** — records what was actually checked, with no fake pass/fail verdict
- **Vendor and community tools follow one standard** — labels show who maintains the tool, not a quality ranking

> The initial directory was curated by maintainers. **Stars measure repository attention, not CLI executions, installs, or users.**

## What it solves

| Your situation | What SuperCLI does |
| --- | --- |
| You know which tools exist but not which to pick | 7 purpose categories (development 28 · AI & agents 16 · cloud 13 · terminal productivity 12 · security 10 · data & network 9 · media 3) |
| You saw a tool name but not whether to trust it | Vendor-maintained / community-project labels plus expandable inclusion and review records |
| You found it but cannot install it | One-click copy of the official install command, with source and usage limits alongside |
| You want to keep a filtered set | Filter state lives in the URL, so refresh and sharing both restore it |
| You do not know what to install | Three scenario guides: choosing an AI coding CLI, choosing a cloud deployment CLI, and combining terminal productivity tools |

**91 tools listed right now**: 40 vendor-maintained, 51 community projects.

## How to contribute

**No code required** — fill in a form:

- [Recommend a CLI](https://github.com/webkubor/supercli/issues/new?template=cli.yml) · [Report a correction](https://github.com/webkubor/supercli/issues/new?template=correction.yml)

**Comfortable with Git** — open a pull request:

1. Fork and edit `data/catalog.json` (the source of truth)
2. Put the icon under `public/icons/` and record its origin in `docs/ICONS.md`
3. Add the inclusion record in `data/community.json` and the review record in `data/reviews.json`
4. Run `pnpm build`, then open a PR explaining the source, purpose, and why it is worth listing

Details are in [CONTRIBUTING.md](CONTRIBUTING.md) and the [public inclusion standards](https://supercli.site/standards).

**How review works**: an Issue enters the pending queue → a maintainer verifies the source, install method, and icon locally → human review → manual merge → automatic publish. **There is no automated review, auto-approval, or scheduled job.** Recommender credit requires explicit consent and can be withdrawn on the original Issue.

## Run locally

Requires Node 24+ and pnpm 12.4.

```sh
git clone https://github.com/webkubor/supercli.git
cd supercli
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm build      # typecheck + data validation + behaviour tests + build
pnpm test       # behaviour and security regression
pnpm typecheck  # strict typecheck
```

Refresh data snapshots (requires `gh` authenticated locally):

```sh
node scripts/sync.mjs --gh --icons   # GitHub metrics and official org icons
pnpm sync:usage                       # npm downloads over the last 30 days
```

## Project layout

```
data/          source of truth: catalog (directory) · metrics (GitHub snapshot) · community (inclusion records) · reviews (review records)
public/icons/  tool icons, with origins recorded in docs/ICONS.md
src/           page behaviour: search and filters, detail dialog, copy commands, bilingual and sharing
scripts/       build scripts: sync, validation, static page generation
docs/          inclusion standards, configuration, FAQ, review records, design system
```

The site is a **fully static** Vite + TypeScript build deployed on Cloudflare Pages. Chinese and English each have static landing pages that stay crawlable without JavaScript.

## Transparency and limits

- **Data sources**：[docs/SOURCES.md](docs/SOURCES.md) · [docs/RESEARCH.md](docs/RESEARCH.md)
- **Inclusion and review standards**：[supercli.site/standards](https://supercli.site/standards)
- **Manual review process**：[docs/REVIEW.md](docs/REVIEW.md)
- **Brand and design system**：[supercli.site/brand](https://supercli.site/brand) · [DESIGN.md](DESIGN.md) · [EXPERIENCE.md](EXPERIENCE.md)
- **Icon origins and portrait fallback**：[docs/ICONS.md](docs/ICONS.md)
- **Configuration and troubleshooting**：[docs/CONFIGURATION.md](docs/CONFIGURATION.md) · [docs/FAQ.md](docs/FAQ.md) · [SECURITY.md](SECURITY.md)
- **Changelog**：[CHANGELOG.md](CHANGELOG.md) · [Releases](https://github.com/webkubor/supercli/releases)

All third-party names and trademarks belong to their owners. This is an independent community directory and does not imply vendor endorsement. The MIT license covers original code only.

---

<p align="center">
  <a href="https://supercli.site"><strong>supercli.site</strong></a> ·
  <a href="https://github.com/webkubor/supercli/issues/new?template=cli.yml"><strong>Recommend a tool</strong></a>
</p>
