from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOMAIN = "immohrtalmarketing.com"


def lookup(name: str, record_type: str) -> str:
    completed = subprocess.run(
        ["nslookup", f"-type={record_type}", name, "8.8.8.8"],
        capture_output=True,
        text=True,
        check=False,
    )
    return (completed.stdout or "") + (completed.stderr or "")


def present(output: str, needle: str) -> bool:
    return needle.lower() in output.lower()


def main() -> int:
    mx = lookup(DOMAIN, "MX")
    txt = lookup(DOMAIN, "TXT")
    dmarc = lookup(f"_dmarc.{DOMAIN}", "TXT")
    dkim = lookup(f"google._domainkey.{DOMAIN}", "TXT")
    tlsrpt = lookup(f"_smtp._tls.{DOMAIN}", "TXT")

    report = {
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "domain": DOMAIN,
        "mxGoogle": present(mx, "smtp.google.com"),
        "spfGoogle": present(txt, "include:_spf.google.com"),
        "dkimGoogleSelector": present(dkim, "v=DKIM1"),
        "dmarcPresent": present(dmarc, "v=DMARC1"),
        "dmarcHasRua": present(dmarc, "rua="),
        "tlsrptPresent": present(tlsrpt, "v=TLSRPTv1"),
        "readyForWarmupDns": False,
    }
    report["readyForWarmupDns"] = all(
        [
            report["mxGoogle"],
            report["spfGoogle"],
            report["dkimGoogleSelector"],
            report["dmarcPresent"],
        ]
    )
    out = ROOT / "preflight-dns.json"
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["readyForWarmupDns"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
