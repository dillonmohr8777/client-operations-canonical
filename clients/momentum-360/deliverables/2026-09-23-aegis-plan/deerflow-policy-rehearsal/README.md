# Aegis DeerFlow policy rehearsal

`authorization.yaml` is an `AuthorizationConfig` fragment for a disposable, synthetic role. `check_policy.py` validates the schema and uses DeerFlow's shipped RBAC filter and `GuardrailMiddleware` to check visibility and call-time denial. It does not change a running service.

## Enablement gaps

- Current shared Gateway has authorization disabled. The fragment is not deployed or bound to an Aegis principal. Built-in RBAC keys on role and tool name; it cannot scope one owner, project, thread, site, URL, tool argument, or output path. Its default role is not a binding mechanism when runtime `user_role` is present.
- The allowed file tools still need a disposable, restricted sandbox and reviewed input/output mounts. `present_files` presents existing artifacts but creates none. With write tools denied, this policy supports read and presentation rehearsal only, not local draft production.
- `wp_update_post` is a synthetic mutation name proving the default deny for unknown tools. There is no WordPress adapter or production/staging target enforcement to test. Tool-level denial is not evidence that production mutations are impossible through a future broad tool.
- Before any live Aegis run: implement and verify owner/thread binding, path and destination restrictions, exact tool inventory, subagent inheritance, and receipt/cancellation behavior. Keep CMS credentials and mutation tools absent until staging-only transport and durable action approval exist.
