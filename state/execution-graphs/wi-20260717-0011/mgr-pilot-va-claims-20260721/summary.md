# Marketing Chief execution graph

- Graph: $GraphRunId
- Status: **running**
- Queue snapshot: revision **142**
- Work item: $WorkItemId version **8**
- Client: $clientId
- Execution nodes: **13**
- Definition verifiers: **6**
- Knowledge graph: **25 nodes / 24 edges**
- Approval gate: **none**
- Canonical queue writes: **none**
- External actions: **none**

The Marketing Chief remains the only canonical queue writer. Validate this graph before execution, update only ready nodes whose dependencies are complete, and assemble a worker handoff only after the required verifier nodes pass.
