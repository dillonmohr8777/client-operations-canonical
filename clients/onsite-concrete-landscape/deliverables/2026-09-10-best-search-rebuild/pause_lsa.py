"""Pause Onsite LSA and disarm the $80/day budget. Validate-only unless --apply."""
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
CID = "1033715894"
LSA_CAMPAIGN = "23068725075"
LSA_BUDGET = "14982151864"
YAML_PATH = Path.home() / "AppData/Local/Dillon/GoogleAdsProbe/google-ads.yaml"
BASE = f"https://googleads.googleapis.com/v23/customers/{CID}"


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


def post(s: requests.Session, path: str, payload: dict) -> requests.Response:
    resp = s.post(f"{BASE}/{path}", json=payload, timeout=120)
    print(f"POST {path} HTTP {resp.status_code} validateOnly={payload.get('validateOnly')}")
    try:
        body = resp.json()
    except ValueError:
        print(resp.text[:2000])
        return resp
    if resp.status_code != 200:
        print(json.dumps(body, indent=2)[:4000])
    else:
        print(json.dumps({"results": body.get("results"), "partialFailureError": body.get("partialFailureError")}, indent=2)[:2000])
    return resp


def main() -> int:
    s = session()
    pause_payload = {
        "operations": [
            {
                "update": {
                    "resourceName": f"customers/{CID}/campaigns/{LSA_CAMPAIGN}",
                    "status": "PAUSED",
                },
                "updateMask": "status",
            }
        ],
        "validateOnly": not APPLY,
        "partialFailure": False,
    }
    budget_payload = {
        "operations": [
            {
                "update": {
                    "resourceName": f"customers/{CID}/campaignBudgets/{LSA_BUDGET}",
                    "amountMicros": "1000000",
                },
                "updateMask": "amountMicros",
            }
        ],
        "validateOnly": not APPLY,
        "partialFailure": False,
    }
    print(f"mode={'APPLY' if APPLY else 'VALIDATE-ONLY'} customer={CID} lsa={LSA_CAMPAIGN}")
    pause = post(s, "campaigns:mutate", pause_payload)
    budget = post(s, "campaignBudgets:mutate", budget_payload)
    ok = pause.status_code == 200 and budget.status_code == 200
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
