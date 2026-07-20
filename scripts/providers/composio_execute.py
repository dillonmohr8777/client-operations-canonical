import argparse
import json
import os
import sys
import urllib.error
import urllib.request

ENDPOINT = "https://connect.composio.dev/mcp"


def post(payload, api_key, session_id=None):
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "X-CONSUMER-API-KEY": api_key,
        },
    )
    if session_id:
        request.add_header("Mcp-Session-Id", session_id)
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            body = response.read().decode("utf-8")
            next_session = response.headers.get("Mcp-Session-Id") or session_id
    except urllib.error.HTTPError as exc:
        exc.read()
        raise RuntimeError(f"Composio HTTP {exc.code}") from exc
    for line in body.splitlines():
        if line.strip().startswith("data:"):
            return json.loads(line.strip()[5:].strip()), next_session
    return (json.loads(body) if body.strip() else {}), next_session


def collect_failures(value, path="result"):
    failures = []
    if isinstance(value, dict):
        if value.get("isError") is True or value.get("successful") is False:
            failures.append(path)
        status = str(value.get("status", "")).lower()
        if status in {"failed", "failure", "error", "partial_failure", "partial-failure"}:
            failures.append(path)
        if value.get("error") not in (None, "", False, [], {}):
            failures.append(path)
        for key, child in value.items():
            failures.extend(collect_failures(child, f"{path}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            failures.extend(collect_failures(child, f"{path}[{index}]"))
    elif isinstance(value, str) and value[:1] in {"{", "["}:
        try:
            failures.extend(collect_failures(json.loads(value), path))
        except json.JSONDecodeError:
            pass
    return sorted(set(failures))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--packet", required=True)
    parser.add_argument("--phase", required=True, choices=["validate", "createPaused", "enable", "readback"])
    args = parser.parse_args()
    api_key = os.getenv("COMPOSIO_KEY")
    if not api_key:
        raise RuntimeError("COMPOSIO_KEY is not available in the process environment")
    with open(args.packet, "r", encoding="utf-8") as handle:
        packet = json.load(handle)
    operations = packet["operations"][args.phase]
    if not operations:
        raise RuntimeError(f"Provider packet contains no {args.phase} operations")
    initialized, session_id = post({
        "jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "marketing-chief-terminal", "version": "1"}},
    }, api_key)
    if "error" in initialized:
        raise RuntimeError(f"Composio initialize failed: {initialized['error']}")
    post({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}}, api_key, session_id)
    tools = []
    for operation in operations:
        item = {"tool_slug": operation["toolSlug"], "arguments": operation["arguments"]}
        if operation.get("account"):
            item["account"] = operation["account"]
        tools.append(item)
    result, _ = post({
        "jsonrpc": "2.0", "id": 2, "method": "tools/call",
        "params": {"name": "COMPOSIO_MULTI_EXECUTE_TOOL", "arguments": {
            "tools": tools,
            "sync_response_to_workbench": False,
            "current_step": f"AD_LAUNCH_{args.phase.upper()}",
            "current_step_metric": f"0/{len(tools)} operations",
            "thought": "Execute the prevalidated client-specific ad launch packet."
        }},
    }, api_key, session_id)
    failures = collect_failures(result)
    wrapper = {
        "successful": not failures,
        "phase": args.phase,
        "operationCount": len(tools),
        "failureCount": len(failures),
        "failurePaths": failures,
        "providerResult": result,
    }
    print(json.dumps(wrapper, separators=(",", ":")))
    if failures:
        return 2
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(json.dumps({"status": "failed", "error": str(exc)}), file=sys.stderr)
        sys.exit(1)
