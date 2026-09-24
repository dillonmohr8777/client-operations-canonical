"""Configure Nexla Ads: one Primary demo action, disarm paused budgets.

Validate-only unless --apply. Does not change live Brand $25 or MCP $40.75 budgets.
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

import requests
import yaml
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

APPLY = "--apply" in sys.argv
CID = "7917802207"
YAML_PATH = Path.home() / "AppData/Local/Dillon/GoogleAdsProbe/google-ads.yaml"
BASE = f"https://googleads.googleapis.com/v23/customers/{CID}"
DEMO = "7534625037"
CUSTOM_GOAL = "6458843017"
# System Lead-form and YouTube actions reject mutates. Live Brand/MCP
# campaigns already use custom goal 6458843017, so swapping that goal's
# action is the bidding fix. Demote only mutable CRM uploads here.
DEMOTE = [
    "7724496703",  # CRM Lead
    "7724498875",  # CRM Opportunity
    "7724501725",  # CRM MQL
    "7724503645",  # CRM Customer
]
SYSTEM_LOCKED = [
    "899954048",  # Lead form - Submit
    "7672793025",  # YouTube follow-on views
    "7672822300",  # YouTube channel subscriptions
    "931722373",  # Hidden Content Download
]
LIVE_BUDGET_IDS = {"14181179446", "15467446061"}  # Brand $25, MCP $40.75
OUT = Path(__file__).with_name("configure-result.json")


def session() -> requests.Session:
    cfg = yaml.safe_load(io.open(YAML_PATH, encoding="utf-8"))
    creds = Credentials(
        token=None,
        refresh_token=cfg["refresh_token"],
        client_id=cfg["client_id"],
        client_secret=cfg["client_secret"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/adwords"],
    )
    creds.refresh(Request())
    s = requests.Session()
    s.headers["Authorization"] = "Bearer " + creds.token
    s.headers["Content-Type"] = "application/json"
    return s


def post(s: requests.Session, path: str, payload: dict) -> dict:
    resp = s.post(f"{BASE}/{path}", json=payload, timeout=180)
    print(f"POST {path} HTTP {resp.status_code} validateOnly={payload.get('validateOnly')}")
    try:
        body = resp.json()
    except ValueError:
        print(resp.text[:2000])
        raise SystemExit(1)
    if resp.status_code != 200:
        print(json.dumps(body, indent=2)[:5000])
        raise SystemExit(1)
    return body


def gaql(s: requests.Session, query: str) -> list[dict]:
    resp = s.post(f"{BASE}/googleAds:searchStream", json={"query": query}, timeout=90)
    resp.raise_for_status()
    rows = []
    for batch in resp.json():
        rows.extend(batch.get("results", []))
    return rows


def main() -> int:
    s = session()
    mode = "APPLY" if APPLY else "VALIDATE-ONLY"
    print(f"mode={mode} customer={CID}")

    conv_ops = [
        {
            "update": {
                "resourceName": f"customers/{CID}/conversionActions/{DEMO}",
                "primaryForGoal": True,
            },
            "updateMask": "primaryForGoal",
        }
    ]
    for cid in DEMOTE:
        conv_ops.append(
            {
                "update": {
                    "resourceName": f"customers/{CID}/conversionActions/{cid}",
                    "primaryForGoal": False,
                },
                "updateMask": "primaryForGoal",
            }
        )
    post(
        s,
        "conversionActions:mutate",
        {"operations": conv_ops, "validateOnly": not APPLY, "partialFailure": False},
    )
    print(f"  conversion primary ops={len(conv_ops)}")

    post(
        s,
        "customConversionGoals:mutate",
        {
            "operations": [
                {
                    "update": {
                        "resourceName": f"customers/{CID}/customConversionGoals/{CUSTOM_GOAL}",
                        "name": "HubSpot Demo Request",
                        "status": "ENABLED",
                        "conversionActions": [f"customers/{CID}/conversionActions/{DEMO}"],
                    },
                    "updateMask": "name,status,conversionActions",
                }
            ],
            "validateOnly": not APPLY,
        },
    )
    print("  custom goal now HubSpot-Demo Request only")

    rows = gaql(
        s,
        "SELECT campaign.id, campaign.name, campaign.status, campaign_budget.id, "
        "campaign_budget.amount_micros FROM campaign WHERE campaign.status = 'PAUSED'",
    )
    seen = set()
    budget_ops = []
    for row in rows:
        bid = row.get("campaignBudget", {}).get("id")
        amt = int(row.get("campaignBudget", {}).get("amountMicros") or 0)
        if not bid or bid in seen or bid in LIVE_BUDGET_IDS:
            continue
        if amt <= 1_000_000:
            continue
        seen.add(bid)
        budget_ops.append(
            {
                "update": {
                    "resourceName": f"customers/{CID}/campaignBudgets/{bid}",
                    "amountMicros": "1000000",
                },
                "updateMask": "amountMicros",
            }
        )
    if budget_ops:
        post(
            s,
            "campaignBudgets:mutate",
            {"operations": budget_ops, "validateOnly": not APPLY, "partialFailure": False},
        )
    print(f"  paused budgets disarmed to $1: {len(budget_ops)}")
    OUT.write_text(
        json.dumps(
            {
                "mode": mode,
                "demoAction": DEMO,
                "customGoal": CUSTOM_GOAL,
                "demoted": DEMOTE,
                "systemLocked": SYSTEM_LOCKED,
                "budgetsDisarmed": len(budget_ops),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
