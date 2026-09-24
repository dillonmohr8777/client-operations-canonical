"""Read-only Nexla conversion and budget snapshot. No secrets printed."""
from __future__ import annotations

import io
import json
from pathlib import Path

import requests
import yaml
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

CID = "7917802207"
YAML_PATH = Path.home() / "AppData/Local/Dillon/GoogleAdsProbe/google-ads.yaml"
BASE = f"https://googleads.googleapis.com/v23/customers/{CID}"
OUT = Path(__file__).with_name("inspect.json")


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


def gaql(s: requests.Session, query: str) -> list[dict]:
    resp = s.post(f"{BASE}/googleAds:searchStream", json={"query": query}, timeout=90)
    resp.raise_for_status()
    rows = []
    for batch in resp.json():
        rows.extend(batch.get("results", []))
    return rows


def main() -> None:
    s = session()
    conv = gaql(
        s,
        "SELECT conversion_action.id, conversion_action.name, conversion_action.status, "
        "conversion_action.category, conversion_action.type, conversion_action.primary_for_goal, "
        "conversion_action.counting_type FROM conversion_action "
        "WHERE conversion_action.status != 'REMOVED'",
    )
    custom = gaql(
        s,
        "SELECT custom_conversion_goal.id, custom_conversion_goal.name, "
        "custom_conversion_goal.status, custom_conversion_goal.conversion_actions "
        "FROM custom_conversion_goal",
    )
    camp_goals = gaql(
        s,
        "SELECT campaign.id, campaign.name, campaign.status, "
        "campaign_conversion_goal.category, campaign_conversion_goal.biddable "
        "FROM campaign_conversion_goal WHERE campaign.id IN (22038365681, 23705317332, 24177650112)",
    )
    budgets = gaql(
        s,
        "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, "
        "campaign_budget.id, campaign_budget.amount_micros FROM campaign "
        "WHERE campaign.status != 'REMOVED'",
    )
    payload = {
        "conversions": [
            {
                "id": r["conversionAction"]["id"],
                "name": r["conversionAction"]["name"],
                "status": r["conversionAction"]["status"],
                "category": r["conversionAction"].get("category"),
                "type": r["conversionAction"].get("type"),
                "primary": r["conversionAction"].get("primaryForGoal"),
            }
            for r in conv
        ],
        "customGoals": custom,
        "campaignGoals": camp_goals,
        "campaigns": [
            {
                "id": r["campaign"]["id"],
                "name": r["campaign"]["name"],
                "status": r["campaign"]["status"],
                "type": r["campaign"].get("advertisingChannelType"),
                "budgetId": r.get("campaignBudget", {}).get("id"),
                "budget": int(r.get("campaignBudget", {}).get("amountMicros") or 0) / 1e6,
            }
            for r in budgets
        ],
    }
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print("ENABLED conversions:")
    for c in payload["conversions"]:
        if c["status"] == "ENABLED":
            print(f"  primary={c['primary']!s:<5} {c['id']}  {c['name']}")
    print(f"\ncustom goals: {len(custom)}")
    print("live/pmax campaign conversion goals:")
    for g in camp_goals:
        print(
            f"  {g['campaign']['name']} {g['campaign']['status']} "
            f"{g.get('campaignConversionGoal', {})}"
        )
    paused = [c for c in payload["campaigns"] if c["status"] == "PAUSED" and c["budget"] > 1]
    print(f"\npaused budgets > $1: {len(paused)} totaling ${sum(c['budget'] for c in paused):,.2f}/day")
    for c in sorted(paused, key=lambda x: -x["budget"]):
        print(f"  ${c['budget']:>7.2f}  {c['name']}")


if __name__ == "__main__":
    main()
