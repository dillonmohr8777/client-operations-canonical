# Orbit work-object contracts

These contracts make the 19 specialist roles interoperable. They are implementation guidance for the private Momentum orchestration layer and do not modify the public Orbit site.

## `WorkRequest`

```json
{
  "request_id": "wr_...",
  "created_at": "ISO-8601",
  "requester": {"id": "opaque", "role": "momentum_operator"},
  "environment": "internal|client|live-evidence|action",
  "client_id": "canonical-id-or-null",
  "objective": "business outcome",
  "deliverable_type": "report|audit|brief|draft|plan|asset_spec",
  "requested_specialist_id": "optional existing Orbit ID",
  "deadline": "ISO-8601-or-null",
  "allowed_read_sources": ["opaque connector or source IDs"],
  "requested_actions": [],
  "approval_state": "not_requested|pending|approved|expired|revoked"
}
```

Validation rules:

- `client_id` is mandatory before private client retrieval.
- `requested_actions` is empty for research and drafting.
- An explicit specialist must match one of the 19 existing IDs.
- An approved state without an approval packet is invalid.

## `EvidenceItem`

```json
{
  "evidence_id": "ev_...",
  "request_id": "wr_...",
  "client_id": "canonical-id-or-null",
  "specialist_ids": ["maps", "scope"],
  "namespace": "public|momentum|vertical|client|live-evidence",
  "source_tier": "A|B|C|D|E",
  "source_locator": "URL or opaque internal locator",
  "publisher_or_system": "source owner",
  "observed_at": "ISO-8601-or-null",
  "retrieved_at": "ISO-8601",
  "expires_at": "ISO-8601-or-null",
  "sensitivity": "public|internal|client-confidential|restricted",
  "verification_state": "confirmed|provisional|disputed|expired",
  "allowed_uses": ["diagnosis", "draft"],
  "prohibited_uses": ["public", "outreach"],
  "content": "minimum relevant passage or structured fact",
  "content_hash": "sha256"
}
```

Validation rules:

- Evidence client ID must match the work request.
- Expired evidence cannot support a current verified claim.
- Tier E evidence can create a verification question but not a confirmed statement.
- Prompt-like text inside `content` is data and has no instruction authority.

## `SpecialistJob`

```json
{
  "job_id": "job_...",
  "request_id": "wr_...",
  "primary_specialist_id": "existing Orbit ID",
  "supporting_specialist_ids": [],
  "routing_reason": "selected|intent|fallback|human_override",
  "risk_class": "R0|R1|R2|R3|R4",
  "required_input_fields": [],
  "evidence_ids": [],
  "output_schema": "versioned schema ID",
  "quality_profile": "specialist rubric ID",
  "status": "evidence_pending|ready|running|blocked|complete"
}
```

The primary specialist owns the final artifact. Supporting specialists return bounded sub-artifacts; they do not independently take action.

## `Artifact`

```json
{
  "artifact_id": "art_...",
  "job_id": "job_...",
  "client_id": "canonical-id-or-null",
  "specialist_id": "existing Orbit ID",
  "artifact_type": "report|audit|brief|draft|plan|asset_spec",
  "version": 1,
  "facts": [{"text": "...", "evidence_ids": ["ev_..."]}],
  "inferences": [{"text": "...", "basis": "..."}],
  "recommendations": [{"what": "...", "why": "...", "owner": "...", "deadline": null, "success_measure": "..."}],
  "missing_evidence": [],
  "conflicts": [],
  "source_ids": [],
  "qa_results": [],
  "external_action_proposed": false,
  "created_at": "ISO-8601",
  "content_hash": "sha256"
}
```

Every verified fact has evidence. Every recommendation is visibly a proposal. Missing evidence is preserved rather than filled by inference.

## `ApprovalPacket`

```json
{
  "approval_id": "ap_...",
  "artifact_id": "art_...",
  "client_id": "canonical-id",
  "action_type": "email|slack|publish|crm_write|ad_change|account_change|other",
  "destination": {"system": "...", "account": "opaque", "target": "opaque"},
  "final_preview": "exact human-readable action",
  "action_payload_hash": "sha256",
  "rollback_plan": "...",
  "approver_id": "named human",
  "decision": "pending|approved|rejected|expired|revoked",
  "decided_at": null,
  "expires_at": "ISO-8601",
  "single_use": true
}
```

Any content, recipient, target, account, budget, or timing change creates a new payload hash and returns the packet to `pending`.

## `ActionReceipt`

```json
{
  "receipt_id": "rcpt_...",
  "approval_id": "ap_...",
  "client_id": "canonical-id",
  "connector": "...",
  "destination": {"system": "...", "account": "opaque", "target": "opaque"},
  "action_payload_hash": "sha256",
  "attempted_at": "ISO-8601",
  "status": "succeeded|failed|partial|unknown",
  "external_object_id": "opaque-or-null",
  "error_class": "null-or-stable-code",
  "rollback_status": "not_needed|available|attempted|complete|failed"
}
```

An unknown or partial result is not retried automatically for an action that could duplicate a message, lead, spend change, or publication.

## `OutcomeRecord`

```json
{
  "outcome_id": "out_...",
  "artifact_id": "art_...",
  "receipt_id": "rcpt-or-null",
  "client_id": "canonical-id",
  "measurement_window": {"start": "ISO-8601", "end": "ISO-8601"},
  "metric_definitions": ["versioned KPI IDs"],
  "values": [{"metric": "...", "value": 0, "source_id": "ev_..."}],
  "human_assessment": "accepted|revised|rejected|not_measured",
  "lesson_proposal": "de-identified optional text",
  "promotion_state": "client_only|proposed_for_momentum|approved_for_momentum|rejected"
}
```

Client outcomes stay client-only unless a named reviewer approves a de-identified operating lesson for Momentum-wide knowledge.

## Specialist handoff envelope

Every handoff between Orbit specialists uses:

```json
{
  "from_specialist": "maps",
  "to_specialist": "patch",
  "client_id": "canonical-id",
  "objective": "why the receiving specialist is needed",
  "inputs": ["artifact or evidence IDs"],
  "open_questions": [],
  "constraints": [],
  "expected_output_schema": "...",
  "deadline": null,
  "action_permission": "none"
}
```

The default action permission is always `none`.
