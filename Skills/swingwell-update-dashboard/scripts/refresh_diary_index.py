#!/usr/bin/env python3
"""Refresh SWINGWELL diary index and practice/round ratio from canonical entries."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DIARY_ROOT = ROOT / "Diary Entries"
DASH_DATA = ROOT / "Dashboard" / "data"


def parse_frontmatter(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    data: dict[str, object] = {}
    current_list_key: str | None = None
    for raw in parts[1].splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith("  - ") and current_list_key:
            data.setdefault(current_list_key, [])
            assert isinstance(data[current_list_key], list)
            data[current_list_key].append(line[4:].strip().strip('"'))
            continue
        current_list_key = None
        if ":" not in line or line.startswith(" "):
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value == "[]":
            data[key] = []
        elif value == "":
            data[key] = ""
            current_list_key = key
        else:
            data[key] = value.strip('"')
    return data


def session_counts(entries: list[dict[str, str]]) -> tuple[int, int, int]:
    practice = 0
    rounds = 0
    excluded = 0
    for entry in entries:
        session_type = (entry.get("session_type") or "").lower()
        title = entry.get("title") or ""
        if "duplicate" in title.lower() or "draft" in session_type:
            excluded += 1
            continue
        if "round" in session_type:
            rounds += 1
        if any(token in session_type for token in ("practice", "lesson")):
            practice += 1
    return practice, rounds, excluded


def main() -> int:
    entries: list[dict[str, str]] = []
    for path in sorted(DIARY_ROOT.glob("**/*.md")):
        fm = parse_frontmatter(path)
        date = str(fm.get("date") or "")
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            match = re.search(r"(\d{4})(\d{2})(\d{2})", path.name)
            date = f"{match.group(1)}-{match.group(2)}-{match.group(3)}" if match else ""
        entries.append(
            {
                "date": date,
                "title": str(fm.get("title") or path.stem),
                "path": str(path.relative_to(ROOT)),
                "source": str(fm.get("source_file") or ""),
                "session_type": str(fm.get("session_type") or ""),
                "location": str(fm.get("location") or ""),
                "mental_state": str(fm.get("mental_state") or ""),
            }
        )

    entries.sort(key=lambda item: (item["date"], item["title"]))
    DASH_DATA.mkdir(parents=True, exist_ok=True)
    (DASH_DATA / "diary-index.json").write_text(json.dumps(entries, indent=2) + "\n", encoding="utf-8")

    practice, rounds, excluded = session_counts(entries)
    ratio = practice / rounds if rounds else 0
    metrics = {
        "practice_count": practice,
        "round_count": rounds,
        "excluded_count": excluded,
        "ratio": ratio,
        "target_ratio": 3.0,
        "label": f"{practice}:{rounds}",
        "status": "on_target" if ratio >= 3.0 else "under_target",
    }
    (DASH_DATA / "practice-round-metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} diary entries; practice:round ratio {ratio:.1f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
