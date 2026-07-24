# Marketing Chief execution graph

- Graph: $GraphRunId
- Status: **planned**
- Queue snapshot: revision **177**
- Work item: $WorkItemId version **1**
- Client: $clientId
- Execution nodes: **10**
- Definition verifiers: **3**
- Knowledge graph: **8 nodes / 7 edges**
- Approval gate: **none**
- Canonical queue writes: **none**
- External actions: **none**

The Marketing Chief remains the only canonical queue writer. Validate this graph before execution, update only ready nodes whose dependencies are complete, and assemble a worker handoff only after the required verifier nodes pass.
