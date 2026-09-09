# Marketing Chief execution graph

- Graph: $GraphRunId
- Status: **planned**
- Queue snapshot: revision **347**
- Work item: $WorkItemId version **1**
- Client: $clientId
- Execution nodes: **12**
- Definition verifiers: **5**
- Knowledge graph: **10 nodes / 9 edges**
- Approval gate: **none**
- Canonical queue writes: **none**
- External actions: **none**

The Marketing Chief remains the only canonical queue writer. Validate this graph before execution, update only ready nodes whose dependencies are complete, and assemble a worker handoff only after the required verifier nodes pass.
