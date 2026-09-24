#!/usr/bin/env python3
"""Validate a Cursor Grok 4.5 video-factory planning batch."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from jsonschema import Draft202012Validator


EXPECTED_CLIENTS = {
    "fagan-painting",
    "onsite-concrete-landscape",
    "pro-fence-deck",
    "hope-wellness-center",
}

SECRET_PATTERN = re.compile(
    r"(?i)(?:bw://item/|authorization.{0,8}bearer|password\s*[:=]|"
    r"api[_ -]?key\s*[:=]|access[_ -]?token\s*[:=])"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--batch-id", required=True)
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def relative(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    video_work_root = (root / "work" / "video-factory").resolve()
    batch_root = (video_work_root / args.batch_id).resolve()
    schema_path = root / "schemas" / "grok-video-batch.schema.json"
    request_path = batch_root / "batch-request.json"
    qa_dir = batch_root / "qa"
    qa_dir.mkdir(parents=True, exist_ok=True)

    if video_work_root not in batch_root.parents:
        raise SystemExit("Batch path escapes the governed video work root.")
    if not request_path.is_file():
        raise SystemExit(f"Batch request missing: {request_path}")

    request = load_json(request_path)
    schema = load_json(schema_path)
    validator = Draft202012Validator(schema)
    errors: list[str] = []
    warnings: list[str] = []
    client_results: list[dict] = []
    registry = load_json(root / "registry" / "clients.json")
    registry_by_id = {client["id"]: client for client in registry["clients"]}

    if request.get("workflowId") != "grok-video-value-add-factory":
        errors.append("Batch request workflow ID is incorrect.")
    if request.get("productionState") != "draft-local":
        errors.append("Batch request must remain draft-local.")
    if request.get("liveVideoGenerationEnabled") is not False:
        errors.append("Live video generation must remain disabled for this batch.")

    requested_ids = {client.get("clientId") for client in request.get("clients", [])}
    if requested_ids != EXPECTED_CLIENTS:
        errors.append(
            "Batch client set does not match the four-client breakthrough pilot."
        )

    other_clients = {
        client["id"]: client["displayName"]
        for client in registry["clients"]
        if client["id"] in EXPECTED_CLIENTS
    }

    for client_request in request.get("clients", []):
        client_id = client_request.get("clientId", "")
        client_errors: list[str] = []
        client_warnings: list[str] = []
        plan_path = root / client_request.get("planPath", "")
        evaluation_path = root / client_request.get("evaluationPath", "")
        profile_path = root / client_request.get("profilePath", "")

        if client_id not in registry_by_id:
            client_errors.append("Client is absent from the canonical registry.")
        elif registry_by_id[client_id].get("status") != "active":
            client_errors.append("Client is not active.")

        if not profile_path.is_file():
            client_errors.append("Client video profile is missing.")
            profile = {}
        else:
            profile = load_json(profile_path)
            if profile.get("clientId") != client_id:
                client_errors.append("Client profile route does not match.")

        if not plan_path.is_file():
            client_errors.append("Cursor plan.json is missing.")
            plan = {}
        else:
            plan = load_json(plan_path)
            for schema_error in sorted(
                validator.iter_errors(plan), key=lambda item: list(item.path)
            ):
                location = ".".join(str(part) for part in schema_error.path) or "$"
                client_errors.append(
                    f"Schema error at {location}: {schema_error.message}"
                )

        if plan:
            if plan.get("clientId") != client_id:
                client_errors.append("Plan client ID does not match its route.")
            if plan.get("clientDisplayName") != client_request.get(
                "clientDisplayName"
            ):
                client_errors.append("Plan display name does not match its route.")
            if plan.get("batchId") != args.batch_id:
                client_errors.append("Plan batch ID does not match.")
            target = int(client_request.get("targetVideos", 0))
            if len(plan.get("videos", [])) != target:
                client_errors.append(
                    f"Expected {target} videos, found {len(plan.get('videos', []))}."
                )

            plan_text = json.dumps(plan, ensure_ascii=False)
            if SECRET_PATTERN.search(plan_text):
                client_errors.append("Plan contains prohibited secret-shaped material.")

            for other_id, other_name in other_clients.items():
                if other_id == client_id:
                    continue
                if re.search(rf"\b{re.escape(other_id)}\b", plan_text, re.I) or re.search(
                    re.escape(other_name), plan_text, re.I
                ):
                    client_errors.append(
                        f"Plan contains cross-client reference: {other_name}."
                    )

            title_keys: set[str] = set()
            for video in plan.get("videos", []):
                title_key = re.sub(r"[^a-z0-9]+", "", video.get("title", "").casefold())
                if title_key in title_keys:
                    client_errors.append(
                        f"Duplicate concept title: {video.get('title', '')}"
                    )
                title_keys.add(title_key)

                shot_seconds = sum(
                    float(shot.get("seconds", 0)) for shot in video.get("shots", [])
                )
                duration = float(video.get("durationSeconds", 0))
                if shot_seconds < duration - 3 or shot_seconds > duration + 15:
                    client_warnings.append(
                        f"Shot timing differs materially from target for {video.get('videoId')}."
                    )

                if profile.get("cta", {}).get("status") == "placeholder-blocked":
                    cta = video.get("cta", {})
                    if cta.get("status") == "verified" or cta.get("text", "").strip():
                        client_errors.append(
                            f"Unverified CTA supplied for {video.get('videoId')}."
                        )

            lowered = plan_text.casefold()
            if client_id == "pro-fence-deck":
                disclosure = plan.get("sourceAudit", {}).get("truthBoundary", "").casefold()
                if "stock" not in disclosure:
                    client_errors.append(
                        "Pro Fence plan does not preserve the stock truth boundary."
                    )
                forbidden = [
                    "our project",
                    "our crew",
                    "our customer",
                    "before-and-after proof",
                    "completed by pro fence",
                ]
                for phrase in forbidden:
                    if phrase in lowered:
                        client_errors.append(
                            f"Pro Fence plan contains prohibited claim: {phrase}."
                        )

            if client_id == "hope-wellness-center":
                forbidden = [
                    "guaranteed outcome",
                    "guaranteed result",
                    "cure",
                    "real patient",
                    "our patient",
                    "patient testimonial",
                    "synthetic patient",
                    "diagnose yourself",
                ]
                for phrase in forbidden:
                    if phrase in lowered:
                        client_errors.append(
                            f"Hope Wellness plan contains prohibited language: {phrase}."
                        )

        if not evaluation_path.is_file():
            client_errors.append("Cursor evaluation.json is missing.")
            evaluation = {}
        else:
            evaluation = load_json(evaluation_path)
            required_evaluation = {
                "schemaVersion",
                "batchId",
                "clientId",
                "model",
                "score",
                "passed",
                "criteria",
                "issues",
                "revisionCount",
            }
            missing = required_evaluation - set(evaluation)
            if missing:
                client_errors.append(
                    f"Evaluation fields missing: {', '.join(sorted(missing))}."
                )
            if evaluation.get("clientId") != client_id:
                client_errors.append("Evaluation client ID does not match.")
            if evaluation.get("batchId") != args.batch_id:
                client_errors.append("Evaluation batch ID does not match.")
            if evaluation.get("model") != "cursor-grok-4.5-high":
                client_errors.append("Evaluation model is not Cursor Grok 4.5 High.")
            if evaluation.get("passed") is not True:
                client_errors.append("Cursor evaluation did not pass.")
            if float(evaluation.get("score", 0)) < 0.9:
                client_errors.append("Cursor evaluation score is below 0.90.")

        errors.extend(f"{client_id}: {item}" for item in client_errors)
        warnings.extend(f"{client_id}: {item}" for item in client_warnings)
        client_results.append(
            {
                "clientId": client_id,
                "status": "pass" if not client_errors else "fail",
                "targetVideos": client_request.get("targetVideos"),
                "plannedVideos": len(plan.get("videos", [])) if plan else 0,
                "planPath": relative(root, plan_path),
                "evaluationPath": relative(root, evaluation_path),
                "errors": client_errors,
                "warnings": client_warnings,
            }
        )

    report = {
        "schemaVersion": 1,
        "batchId": args.batch_id,
        "generatedAt": datetime.now().astimezone().isoformat(),
        "status": "pass" if not errors else "fail",
        "liveVideoGenerationEnabled": False,
        "clients": client_results,
        "counts": {
            "clients": len(client_results),
            "plannedVideos": sum(
                int(result["plannedVideos"]) for result in client_results
            ),
            "errors": len(errors),
            "warnings": len(warnings),
        },
        "errors": errors,
        "warnings": warnings,
    }
    report_path = qa_dir / "preflight.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    markdown = [
        f"# Grok Video Factory Preflight: {args.batch_id}",
        "",
        f"Status: **{report['status'].upper()}**",
        "",
        f"- Clients: {report['counts']['clients']}",
        f"- Planned videos: {report['counts']['plannedVideos']}",
        f"- Errors: {report['counts']['errors']}",
        f"- Warnings: {report['counts']['warnings']}",
        "- Live Grok Imagine generation: disabled",
        "",
        "## Client results",
        "",
    ]
    for result in client_results:
        markdown.append(
            f"- {result['clientId']}: {result['status'].upper()} "
            f"({result['plannedVideos']}/{result['targetVideos']} videos)"
        )
    markdown.extend(
        [
            "",
            "## Errors",
            "",
            *([f"- {item}" for item in errors] or ["- None"]),
            "",
            "## Warnings",
            "",
            *([f"- {item}" for item in warnings] or ["- None"]),
            "",
            "Nothing in this batch is approved to send, publish, schedule, or render through a paid API.",
        ]
    )
    (qa_dir / "preflight.md").write_text("\n".join(markdown) + "\n", encoding="utf-8")

    print(json.dumps(report, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
