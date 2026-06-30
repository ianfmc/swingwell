#!/usr/bin/env python3
"""Best-effort plaintext extraction from an Apple Note by title.

Apple Notes automation is fragile across macOS releases. This helper tries the
direct form that works in many environments and gives a clear fallback when
Notes refuses to expose the note body.
"""

from __future__ import annotations

import argparse
import subprocess
import sys


def applescript_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract plaintext from an Apple Note.")
    parser.add_argument("title", help="Exact Apple Note title")
    args = parser.parse_args()

    script = f'tell application "Notes" to get plaintext of note {applescript_quote(args.title)}'
    try:
        output = subprocess.check_output(["osascript", "-e", script], text=True)
    except subprocess.CalledProcessError as exc:
        sys.stderr.write(
            f"Could not extract Apple Note {args.title!r} through Notes automation.\n"
            "Fallback: open the note in Apple Notes, copy its plaintext, and use the "
            "skill workflow to create the canonical diary entry from that text.\n"
            f"Underlying command failed: {exc}\n"
        )
        return exc.returncode or 1

    sys.stdout.write(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
