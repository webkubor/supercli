<h1 align="center">SuperCLI</h1>

<p align="center">
  <strong>Manually curated 94 CLIs. Public review scope. No fabricated metrics.</strong><br>
  40 vendor · 54 community · 7 categories · bilingual (zh / en)
</p>

<p align="center">
  <a href="https://supercli.site"><img src="https://img.shields.io/badge/site-supercli.site-002fa7?style=flat-square" alt="Website"></a>
  <a href="https://github.com/webkubor/supercli/releases"><img src="https://img.shields.io/github/v/release/webkubor/supercli?style=flat-square&color=coral" alt="Release"></a>
  <a href="https://github.com/webkubor/supercli/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/webkubor/supercli/deploy.yml?style=flat-square&label=deploy" alt="Deploy"></a>
  <a href="https://github.com/webkubor/supercli"><img src="https://img.shields.io/github/stars/webkubor/supercli?style=flat-square&color=ffcb47" alt="Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-002fa7?style=flat-square" alt="License"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/lang-中文-d4d4d4?style=flat-square" alt="Chinese"></a>
</p>

## Why SuperCLI

The command-line ecosystem does not lack tools. It lacks an entry point you can trust. Search results mix ads, paid placements, and stale tutorials. Leaderboards give you a stars number without telling you what it means, when it was taken, or whether the install command still works.

SuperCLI is **manually curated with public evidence**:

- **Every tool has a source** — official repository, documentation, and maintainer origin are all traceable
- **The ranking basis is stated** — sorted by GitHub repository stars, snapshot time shown on the page; monorepo metrics cover the whole repository
- **Review scope is public** — records what was actually checked, no fake pass/fail verdict
- **Vendor and community tools follow one standard** — labels show who maintains the tool, not a quality ranking

> Stars measure repository attention, not CLI executions, installs, or users.

## What it solves

| Your situation | What SuperCLI does |
| --- | --- |
| You know the tools but not which to pick | 7 purpose categories, search + vendor + sort filters |
| You saw a name but not whether to trust it | Vendor / community labels plus expandable review records |
| Found it but cannot install it | One-click copy of the official install command, with source and limits alongside |
| Want to keep a filtered set | Filter state lives in the URL — refresh and sharing both restore it |
| Do not know what to install | Three scenario guides: AI coding, cloud deployment, terminal productivity |

<img src="https://cdn.jsdelivr.net/gh/webkubor/free-imgbed@main/supercli/home-hero.png" alt="SuperCLI homepage: brand statement and discovery entry on the left, live tool preview with a copyable install command on the right" width="720" style="max-width:100%">

<details>
<summary>See the filters, a tool detail, and the full breakdown</summary>

**Directory filters** — category, vendor, and sort combine freely; filter state stays in the URL.

<img src="https://cdn.jsdelivr.net/gh/webkubor/free-imgbed@main/supercli/directory-filter.png" alt="CLI directory: inclusion standards notice, search box, vendor and sort dropdowns, category tabs, source filters, and tool cards" width="720" style="max-width:100%">

**Tool detail** — open any tool for its purpose, source, metric definitions, install command, and inclusion record.

<img src="https://cdn.jsdelivr.net/gh/webkubor/free-imgbed@main/supercli/tool-detail.webp" alt="Wrangler detail dialog: source label, stars and downloads, install command, official docs link, and inclusion and review record" width="720" style="max-width:100%">

**Directory at a glance** (94 tools)

| Category | Count | Examples |
| --- | --- | --- |
| Development | 29 | gh · git · pnpm · uv · facet |
| AI & Agents | 17 | claude · codex · gemini · ollama · claude-usage-statusline |
| Cloud | 13 | wrangler · vercel · supabase · firebase |
| Terminal | 12 | fzf · bat · fd · zoxide |
| Security | 10 | nmap · nuclei · sqlmap · frida |
| Data & Network | 9 | jq · httpie · rclone · wget |
| Media | 4 | ffmpeg · sox · whisper · reel-kit |

</details>

## How to contribute

**No code required** — fill in a form:

- [Recommend a CLI](https://github.com/webkubor/supercli/issues/new?template=cli.yml) · [Report a correction](https://github.com/webkubor/supercli/issues/new?template=correction.yml)

**Comfortable with Git** — open a pull request:

1. Fork and edit `data/catalog.json` (the source of truth)
2. Put the icon under `public/icons/` and record its origin in `docs/ICONS.md`
3. Add the inclusion record in `data/community.json` and the review record in `data/reviews.json`
4. Run `pnpm build`, then open a PR explaining the source, purpose, and why it is worth listing

Details are in [CONTRIBUTING.md](CONTRIBUTING.md) and the [public inclusion standards](https://supercli.site/standards).

**Review process**: an Issue enters the pending queue → a maintainer verifies the source, install method, and icon locally → human review → manual merge → automatic publish. No automated review, auto-approval, or scheduled jobs. Recommender credit requires explicit consent and can be withdrawn on the original Issue.

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

## Transparency and limits

- **Data sources**: [docs/SOURCES.md](docs/SOURCES.md) · [docs/RESEARCH.md](docs/RESEARCH.md)
- **Inclusion and review standards**: [supercli.site/standards](https://supercli.site/standards)
- **Manual review process**: [docs/REVIEW.md](docs/REVIEW.md)
- **Brand and design system**: [supercli.site/brand](https://supercli.site/brand) · [DESIGN.md](DESIGN.md) · [EXPERIENCE.md](EXPERIENCE.md)
- **Icon origins**: [docs/ICONS.md](docs/ICONS.md)
- **Configuration and FAQ**: [docs/CONFIGURATION.md](docs/CONFIGURATION.md) · [docs/FAQ.md](docs/FAQ.md) · [SECURITY.md](SECURITY.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) · [Releases](https://github.com/webkubor/supercli/releases)

All third-party names and trademarks belong to their owners. This is an independent community directory and does not imply vendor endorsement. The MIT license covers original code only.

---

<p align="center">
  <a href="https://supercli.site"><strong>supercli.site</strong></a> ·
  <a href="https://github.com/webkubor/supercli/issues/new?template=cli.yml"><strong>Recommend a tool</strong></a> ·
  <a href="https://github.com/webkubor/supercli"><strong>Star</strong></a>
</p>
