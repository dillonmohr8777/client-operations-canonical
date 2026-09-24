"""Economics for the reconsidered offers, run through the pack's own engine.

Imports `scenario()` from 2026-09-04-ai-division-plan/economics.py so there is
one method, not two. Asserts the hand-computed rows written into offers.json,
so a typo in the prose cannot survive a build.

    python economics_v2.py
"""
from __future__ import annotations

import importlib.util
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
PACK = HERE.parent / "2026-09-04-ai-division-plan" / "economics.py"

spec = importlib.util.spec_from_file_location("pack_economics", PACK)
assert spec and spec.loader, f"cannot load {PACK}"
pack = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pack)

# Recurring flagships only. Spec build is a one-time project and is modelled
# separately below so it cannot be mistaken for MRR.
OFFERS = {
    "ai_search_readiness": dict(setup=1500, monthly=750, setup_hours=10, monthly_hours=4, setup_tools=75, monthly_tools=75),
    "motion_content": dict(setup=1500, monthly=1250, setup_hours=8, monthly_hours=6, setup_tools=50, monthly_tools=100),
    "lead_ops_agent": dict(setup=3500, monthly=1500, setup_hours=24, monthly_hours=6, setup_tools=150, monthly_tools=150),
}
SPEC_BUILD = dict(price=3500, hours=24, tools=100)


def main() -> int:
    setattr(pack, "OFFERS", OFFERS)  # the engine reads its module-global table
    one = {k: 1 for k in OFFERS}
    two = {k: 2 for k in OFFERS}
    rows = [
        pack.scenario("one client on each recurring flagship", one),
        pack.scenario("same, double hours", one, hours_multiplier=2),
        pack.scenario("two clients on each recurring flagship", two),
        pack.scenario("one of each, labor $125/hr", one, hourly=125),
    ]
    spec_contribution = (SPEC_BUILD["price"] - SPEC_BUILD["hours"] * 75
                         - SPEC_BUILD["tools"] - SPEC_BUILD["price"] * 0.10)

    # Known answers. The first hand-computed draft of offers.json said 1,225 /
    # 25 / 3,300; the engine said 1,125 / -75 / 2,750. The prose was wrong by
    # exactly the kind of slip this assert exists to catch. Rows now render
    # from economics-v2.json, never from typed prose.
    r0, r1, r2 = rows[0], rows[1], rows[2]
    assert r0["monthly_revenue"] == 3500, r0["monthly_revenue"]
    assert r0["monthly_delivery_hours"] == 16, r0["monthly_delivery_hours"]
    assert r0["monthly_contribution"] == 1125, r0["monthly_contribution"]   # 3500-1200-325-350-500
    assert r1["monthly_contribution"] == -75, r1["monthly_contribution"]    # double hours: negative
    assert r2["monthly_contribution"] == 2750, r2["monthly_contribution"]
    assert spec_contribution == 1250, spec_contribution  # 3500 - 1800 - 100 - 350

    out = {
        "state": "ASSUMPTIONS_ONLY_NOT_FORECAST",
        "engine": str(PACK.relative_to(HERE.parent.parent.parent.parent)),
        "offers": OFFERS,
        "spec_build_one_time": {**SPEC_BUILD, "contribution_before_fixed_cost": spec_contribution},
        "assumptions": dict(hourly_labor=75, sales_rate=0.10, fixed_monthly=500, full_collection=True),
        "scenarios": rows,
    }
    (HERE / "economics-v2.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    for r in rows:
        print(f"{r['scenario']:44} rev {r['monthly_revenue']:>6}  hrs {r['monthly_delivery_hours']:>3}  "
              f"contribution {r['monthly_contribution']:>7}")
    print(f"{'spec build, one time':44} rev   3500  hrs  24  contribution {spec_contribution:>7}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
