import test from "node:test";
import assert from "node:assert/strict";
import { AGENTS, getAgent, selectAgent } from "../lib/agents.mjs";

test("the roster contains exactly nineteen unique agents", () => {
  assert.equal(AGENTS.length, 19);
  assert.equal(new Set(AGENTS.map((agent) => agent.id)).size, 19);
});

test("local SEO routes to ATLAS instead of a capture agent", () => {
  const { agent } = selectAgent("Give me a three-step local SEO plan for a family-owned HVAC company.");
  assert.equal(agent.id, "atlas");
});

test("Google Business Profile intent routes to MAPS", () => {
  const { agent } = selectAgent("How do I improve my Google Business Profile and get into the map pack?");
  assert.equal(agent.id, "maps");
});

test("an explicit agent choice wins over automatic routing", () => {
  const { agent, reason } = selectAgent("Help me with my website", "prism");
  assert.equal(agent.id, "prism");
  assert.equal(reason, "selected");
});

test("unknown questions fall back to SCOPE", () => {
  const { agent, reason } = selectAgent("I need a sensible next move for my business this quarter.");
  assert.equal(agent.id, "scope");
  assert.equal(reason, "fallback");
});

test("agent lookup is normalized", () => {
  assert.equal(getAgent("  ATLAS ")?.id, "atlas");
});
