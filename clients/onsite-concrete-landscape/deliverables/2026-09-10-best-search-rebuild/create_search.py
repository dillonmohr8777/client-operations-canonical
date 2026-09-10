"""Create the paused Vacaville concrete Search campaign. Validate-only unless --apply."""
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
YAML_PATH = Path.home() / "AppData/Local/Dillon/GoogleAdsProbe/google-ads.yaml"
OUT_PATH = Path(__file__).with_name("create-search-result.json")
BASE = f"https://googleads.googleapis.com/v23/customers/{CID}"
CALL_ASSET = f"customers/{CID}/assets/201657064075"
BUDGET_TEMP = f"customers/{CID}/campaignBudgets/-1"
CAMPAIGN_TEMP = f"customers/{CID}/campaigns/-2"
ADGROUP_TEMP = f"customers/{CID}/adGroups/-3"
LANDING = (
    "https://onsite-gads-landing-page.netlify.app/"
    "?utm_source=google&utm_medium=cpc"
    "&utm_campaign=onsite_google_concrete_vacaville_search"
    "&utm_content=concrete_rsa_1"
)
HEADLINES = [
    "Vacaville Concrete Team",
    "Concrete Contractor Near You",
    "Driveways Patios & More",
    "Stamped Concrete Contractor",
    "Licensed & Insured",
    "Request A Free Consultation",
    "Serving Vacaville",
    "Concrete Built To Last",
    "Local Concrete Since 2004",
    "One Team No Subcontractors",
    "Start Your Concrete Project",
    "Driveway Concrete Contractor",
    "Patio & Walkway Concrete",
    "Quality Concrete Craft",
    "Call Onsite Today",
]
DESCRIPTIONS = [
    "Request a free consultation for concrete driveways, patios, walkways and flatwork.",
    "Serving Vacaville since 2004 with licensed and insured concrete craftsmanship.",
    "One local team handles the site from a clear scope through finished concrete work.",
    "Call Onsite to discuss your concrete project and request an estimate.",
]
KEYWORD_TEXTS = [
    "concrete contractor vacaville",
    "concrete contractor near me",
    "concrete driveway contractor",
    "concrete patio contractor",
    "stamped concrete contractor",
    "concrete company near me",
]
CAMPAIGN_NEGATIVES = [
    "jobs",
    "careers",
    "salary",
    "hiring",
    "training",
    "classes",
    "DIY",
    "how to",
    "concrete bags",
    "concrete mix",
    "ready mix delivery",
    "concrete supplier",
    "concrete materials",
    "equipment rental",
    "concrete pump",
    "concrete pumping",
    "wholesale",
    "calculator",
    "PDF",
    "tutorial",
]
ADGROUP_NEGATIVES = [
    "landscaping",
    "lawn care",
    "tree service",
    "pool service",
    "asphalt",
    "demolition only",
]


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


def mutate_operations() -> list[dict]:
    ops: list[dict] = [
        {
            "campaignBudgetOperation": {
                "create": {
                    "resourceName": BUDGET_TEMP,
                    "name": "Onsite | Search | Concrete | Vacaville | 2026-09-10",
                    "amountMicros": "15000000",
                    "explicitlyShared": False,
                    "deliveryMethod": "STANDARD",
                }
            }
        },
        {
            "campaignOperation": {
                "create": {
                    "resourceName": CAMPAIGN_TEMP,
                    "name": "Onsite | Search | Concrete | Vacaville | 2026-09-10",
                    "status": "PAUSED",
                    "advertisingChannelType": "SEARCH",
                    "campaignBudget": BUDGET_TEMP,
                    "containsEuPoliticalAdvertising": "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
                    "networkSettings": {
                        "targetGoogleSearch": True,
                        "targetSearchNetwork": False,
                        "targetContentNetwork": False,
                        "targetPartnerSearchNetwork": False,
                    },
                    "geoTargetTypeSetting": {
                        "positiveGeoTargetType": "PRESENCE",
                        "negativeGeoTargetType": "PRESENCE",
                    },
                    "targetSpend": {"cpcBidCeilingMicros": "8000000"},
                    "paymentMode": "CLICKS",
                }
            }
        },
        {
            "campaignCriterionOperation": {
                "create": {
                    "campaign": CAMPAIGN_TEMP,
                    "location": {"geoTargetConstant": "geoTargetConstants/1014361"},
                    "negative": False,
                }
            }
        },
        {
            "campaignCriterionOperation": {
                "create": {
                    "campaign": CAMPAIGN_TEMP,
                    "language": {"languageConstant": "languageConstants/1000"},
                    "negative": False,
                }
            }
        },
    ]
    for text in CAMPAIGN_NEGATIVES:
        ops.append(
            {
                "campaignCriterionOperation": {
                    "create": {
                        "campaign": CAMPAIGN_TEMP,
                        "keyword": {"text": text, "matchType": "PHRASE"},
                        "negative": True,
                    }
                }
            }
        )
    ops.append(
        {
            "adGroupOperation": {
                "create": {
                    "resourceName": ADGROUP_TEMP,
                    "name": "Concrete | Estimate | Vacaville",
                    "campaign": CAMPAIGN_TEMP,
                    "status": "ENABLED",
                    "type": "SEARCH_STANDARD",
                    "cpcBidMicros": "8000000",
                }
            }
        }
    )
    for text in KEYWORD_TEXTS:
        for match in ("PHRASE", "EXACT"):
            ops.append(
                {
                    "adGroupCriterionOperation": {
                        "create": {
                            "adGroup": ADGROUP_TEMP,
                            "status": "ENABLED",
                            "keyword": {"text": text, "matchType": match},
                            "negative": False,
                        }
                    }
                }
            )
    for text in ADGROUP_NEGATIVES:
        ops.append(
            {
                "adGroupCriterionOperation": {
                    "create": {
                        "adGroup": ADGROUP_TEMP,
                        "keyword": {"text": text, "matchType": "PHRASE"},
                        "negative": True,
                    }
                }
            }
        )
    ops.append(
        {
            "adGroupAdOperation": {
                "create": {
                    "adGroup": ADGROUP_TEMP,
                    "status": "ENABLED",
                    "ad": {
                        "finalUrls": [LANDING],
                        "responsiveSearchAd": {
                            "headlines": [{"text": h} for h in HEADLINES],
                            "descriptions": [{"text": d} for d in DESCRIPTIONS],
                            "path1": "concrete",
                            "path2": "estimate",
                        },
                    },
                }
            }
        }
    )
    ops.append(
        {
            "campaignAssetOperation": {
                "create": {
                    "campaign": CAMPAIGN_TEMP,
                    "asset": CALL_ASSET,
                    "fieldType": "CALL",
                }
            }
        }
    )
    return ops


def main() -> int:
    s = session()
    payload = {
        "mutateOperations": mutate_operations(),
        "validateOnly": not APPLY,
        "partialFailure": False,
    }
    print(
        f"mode={'APPLY' if APPLY else 'VALIDATE-ONLY'} "
        f"customer={CID} ops={len(payload['mutateOperations'])}"
    )
    resp = s.post(f"{BASE}/googleAds:mutate", json=payload, timeout=180)
    print(f"POST googleAds:mutate HTTP {resp.status_code}")
    try:
        body = resp.json()
    except ValueError:
        print(resp.text[:4000])
        return 1
    OUT_PATH.write_text(json.dumps(body, indent=2)[:20000], encoding="utf-8")
    if resp.status_code != 200:
        err = body.get("error") or body
        print(json.dumps(err, indent=2)[:6000])
        return 1
    results = body.get("mutateOperationResponses") or body.get("results") or []
    print(f"ok responses={len(results)}")
    for item in results[:8]:
        print(json.dumps(item)[:400])
    if len(results) > 8:
        print(f"... {len(results) - 8} more")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
