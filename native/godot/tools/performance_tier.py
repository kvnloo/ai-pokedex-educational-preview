#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        raise SystemExit("usage: performance_tier.py CONFIG TIER")
    config = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    tier_name = sys.argv[2]
    if tier_name not in config["tiers"]:
        raise SystemExit(f"unknown performance tier: {tier_name}")
    tier = config["tiers"][tier_name]
    width, height = config["clientDimensions"]
    print("\t".join(map(str, (
        width,
        height,
        tier["p95BudgetMs"],
        tier["p99BudgetMs"],
        tier["shaderPrewarmFrames"],
        config["hardware"],
    ))))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
