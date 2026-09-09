# Marketing Chief execution graph

- Graph: $GraphRunId
- Status: **running**
- Queue snapshot: revision **394**
- Work item: $WorkItemId version **2**
- Client: $clientId
- Execution nodes: **8**
- Definition verifiers: **1**
- Knowledge graph: **10 nodes / 9 edges**
- Approval gate: **none**
- Canonical queue writes: **none**
- External actions: **none**

The Marketing Chief remains the only canonical queue writer. Validate this graph before execution, update only ready nodes whose dependencies are complete, and assemble a worker handoff only after the required verifier nodes pass.
