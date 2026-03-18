# Lab Monster SF6

Public runtime repository for the Lab Monster SF6 tool.

## Current Status

- Latest public version: `v1.0.4`
- Last release refresh: `2026-03-18` (published `v1.0.4` package)
- GitHub Pages and release ZIP are synchronized.

## Access

- Online (GitHub Pages): `https://blackinferno.github.io/LabMonsterSF6/`
- Offline package: download the latest ZIP from **Releases**

## What this tool does

- View SF6 frame data (JP/EN)
- Switch between frame-data versions and compare changes
- Build and manage combo lists per character/mode
- Import/export combo data (JSON / XLSX / HTML)

## Run locally

- Open `sf6_viewer_unified/index.html` directly in your browser.
- For packaged builds, launch `Start_LabMonster.exe` when available.

No Python/server setup is required for normal offline usage.

## Data and save behavior

- User combo data is saved in browser `localStorage`.
- Saves are scoped by browser origin; online and offline saves are separate.
- Export your data regularly if you need migration/backups.

## Repository scope

- This repo is runtime-focused.
- Development/automation assets are local-only unless intentionally tracked.
