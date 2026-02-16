# Lab Monster SF6

Public runtime repository for the Lab Monster SF6 tool.

## Access

- Online (GitHub Pages): `https://blackinferno.github.io/LabMonsterSF6/`
- Offline package: download the latest ZIP from **Releases**

## What this tool does

- View SF6 frame data (JP/EN)
- Switch between frame-data versions and compare changes
- Build and manage combo lists per character/mode
- Import/export combo data (JSON / XLSX / HTML)

## Run locally

Open `sf6_viewer_unified/index.html` directly in your browser.

No Python/server setup is required for normal offline usage.

## Data and save behavior

- User combo data is saved in browser `localStorage`.
- Saves are scoped by browser origin, so online and offline saves are separate.
- Export your data regularly if you want backups.

## Repository scope

- This repo is runtime-only.
- Development scripts and internal data-pipeline assets are intentionally excluded.

## Deployment

- Workflow: `.github/workflows/deploy-pages.yml`
- Deploy target: `sf6_viewer_unified/`
