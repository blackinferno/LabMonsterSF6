#!/usr/bin/env python3
"""Build release ZIP for Lab Monster SF6.

This script creates:
  - .dist_build/LabMonsterSF6_vX.Y.Z/
  - dist/LabMonsterSF6_vX.Y.Z_web_YYYYMMDD.zip

It always includes:
  - runtime files from sf6_viewer_unified/
  - README.txt (generated)
  - templates/ (from release/templates/)
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import shutil
import sys
import zipfile
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build Lab Monster SF6 distribution package.")
    parser.add_argument("--version", default="", help="Release version (defaults to index.html data-version).")
    parser.add_argument("--date", default="", help="Date tag YYYYMMDD (defaults to today).")
    parser.add_argument("--source", default="sf6_viewer_unified", help="Runtime source directory.")
    parser.add_argument("--templates", default="release/templates", help="Template source directory.")
    parser.add_argument("--build-dir", default=".dist_build", help="Staging build directory.")
    parser.add_argument("--dist-dir", default="dist", help="Output ZIP directory.")
    return parser.parse_args()


def read_version_from_index(index_path: Path) -> str:
    if not index_path.exists():
        raise FileNotFoundError(f"Missing index file: {index_path}")
    text = index_path.read_text(encoding="utf-8")
    match = re.search(r'data-version="([^"]+)"', text, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip()
    raise RuntimeError("Could not detect app version from index.html data-version.")


def make_readme(version: str, iso_date: str) -> str:
    return (
        f"Lab Monster SF6 v{version} ({iso_date}) - Distribution Package\n\n"
        "How to run\n"
        "1. Open index.html in your browser.\n\n"
        "Included templates\n"
        "- templates/combo_template_all_characters.json\n"
        "- templates/combo_template_all_characters_full.xlsx\n"
        "- templates/combo_template_all_characters_simple.xlsx\n\n"
        "Template notes\n"
        "- JSON template includes all characters and full combo schema keys.\n"
        "- JSON includes example objects for both Classic and Modern control modes.\n"
        "- FULL XLSX template mirrors grouped headers/subheaders and starter rows.\n"
        "- SIMPLE XLSX template supports quick column-mapping import.\n"
    )


def copy_runtime(source_dir: Path, stage_dir: Path) -> None:
    if not source_dir.exists():
        raise FileNotFoundError(f"Missing runtime source directory: {source_dir}")
    for item in source_dir.iterdir():
        target = stage_dir / item.name
        if item.is_dir():
            shutil.copytree(item, target)
        else:
            shutil.copy2(item, target)


def copy_templates(templates_dir: Path, stage_templates: Path) -> None:
    if not templates_dir.exists():
        raise FileNotFoundError(
            f"Missing templates directory: {templates_dir}\n"
            "Expected: combo_template_all_characters.{json,xlsx} files."
        )
    template_files = sorted(p for p in templates_dir.iterdir() if p.is_file())
    if not template_files:
        raise RuntimeError(f"No template files found in: {templates_dir}")
    stage_templates.mkdir(parents=True, exist_ok=True)
    for file_path in template_files:
        shutil.copy2(file_path, stage_templates / file_path.name)


def create_zip(stage_root: Path, package_name: str, zip_path: Path) -> None:
    if zip_path.exists():
        zip_path.unlink()
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for file_path in stage_root.rglob("*"):
            if not file_path.is_file():
                continue
            rel = file_path.relative_to(stage_root)
            arcname = (Path(package_name) / rel).as_posix()
            zf.write(file_path, arcname)


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent

    source_dir = (repo_root / args.source).resolve()
    templates_dir = (repo_root / args.templates).resolve()
    build_dir = (repo_root / args.build_dir).resolve()
    dist_dir = (repo_root / args.dist_dir).resolve()

    version = (args.version or "").strip()
    if not version:
        version = read_version_from_index(source_dir / "index.html")
    date_tag = (args.date or dt.date.today().strftime("%Y%m%d")).strip()
    if not re.fullmatch(r"\d{8}", date_tag):
        raise ValueError(f"Invalid --date '{date_tag}'. Use YYYYMMDD.")
    iso_date = f"{date_tag[:4]}-{date_tag[4:6]}-{date_tag[6:8]}"

    package_name = f"LabMonsterSF6_v{version}"
    stage_dir = build_dir / package_name
    zip_path = dist_dir / f"{package_name}_web_{date_tag}.zip"

    if stage_dir.exists():
        shutil.rmtree(stage_dir)
    stage_dir.mkdir(parents=True, exist_ok=True)

    copy_runtime(source_dir, stage_dir)
    copy_templates(templates_dir, stage_dir / "templates")

    readme_path = stage_dir / "README.txt"
    readme_path.write_text(make_readme(version, iso_date), encoding="utf-8", newline="\n")

    create_zip(stage_dir, package_name, zip_path)

    print(f"Built package: {zip_path}")
    print(f"Stage folder:  {stage_dir}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
