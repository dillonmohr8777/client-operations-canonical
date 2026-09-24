"""Run with: Get-Content -Raw authorization.yaml | docker exec -i deer-flow-gateway /app/backend/.venv/bin/python -c (Get-Content -Raw check_policy.py)"""

import sys
from types import SimpleNamespace
from unittest.mock import MagicMock

import yaml
from langchain_core.tools import StructuredTool

from deerflow.authz.adapter import GuardrailAuthorizationAdapter
from deerflow.authz.enforcement import filter_tools_by_authorization
from deerflow.authz.provider import Principal
from deerflow.authz.runtime import resolve_authorization_provider
from deerflow.config.authorization_config import AuthorizationConfig
from deerflow.guardrails.middleware import GuardrailMiddleware


config = AuthorizationConfig.model_validate(yaml.safe_load(sys.stdin)["authorization"])
provider = resolve_authorization_provider(config)
principal = Principal(role="aegis_rehearsal")
allowed = {"ls", "glob", "grep", "read_file", "present_files"}
denied = {"bash", "update_agent", "write_file", "str_replace", "web_fetch", "wp_update_post"}
names = sorted(allowed | denied)
tools = [StructuredTool.from_function(lambda: None, name=name, description=name) for name in names]
visible = filter_tools_by_authorization(tools, provider=provider, principal=principal, fail_closed=config.fail_closed)
assert {tool.name for tool in visible} == allowed

middleware = GuardrailMiddleware(
    GuardrailAuthorizationAdapter(provider, default_role=config.default_role),
    fail_closed=config.fail_closed,
)
for name in names:
    request = MagicMock()
    request.tool_call = {"name": name, "args": {}, "id": f"call-{name}"}
    request.runtime = SimpleNamespace(context={"user_id": "synthetic-owner", "user_role": "aegis_rehearsal"})
    handler = MagicMock()
    result = middleware.wrap_tool_call(request, handler)
    if name in denied:
        assert result.status == "error" and "authz.denied" in result.content, name
        handler.assert_not_called()
    else:
        handler.assert_called_once_with(request)

print(f"PASS schema/provider; visible={sorted(allowed)}; invocation-denied={sorted(denied)}")
