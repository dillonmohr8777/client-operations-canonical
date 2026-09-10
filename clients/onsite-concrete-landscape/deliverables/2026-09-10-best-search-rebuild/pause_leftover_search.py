"""Pause the leftover mixed Solano Search campaign. Validate-only unless --apply."""
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
CAMPAIGN = "24183437726"
YAML_PATH = Path.home() / "AppData/Local/Dillon/GoogleAdsProbe/google-ads.yaml"
BASE = f"https://googleads.googleapis.com/v23/customers/{CID}"


def main() -> int:
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
    payload = {
        "operations": [
            {
                "update": {
                    "resourceName": f"customers/{CID}/campaigns/{CAMPAIGN}",
                    "status": "PAUSED",
                },
                "updateMask": "status",
            }
        ],
        "validateOnly": not APPLY,
        "partialFailure": False,
    }
    print(f"mode={'APPLY' if APPLY else 'VALIDATE-ONLY'} campaign={CAMPAIGN}")
    resp = s.post(
        f"{BASE}/campaigns:mutate",
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=120,
    )
    print(f"HTTP {resp.status_code}")
    try:
        print(json.dumps(resp.json(), indent=2)[:2000])
    except ValueError:
        print(resp.text[:2000])
    return 0 if resp.status_code == 200 else 1


if __name__ == "__main__":
    raise SystemExit(main())
