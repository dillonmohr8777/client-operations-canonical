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

test("all nineteen specialists expose complete public and deep operating contracts", async () => {
  const { specialistKnowledge } = await import("../lib/knowledge.mjs");
  for (const agent of AGENTS) {
    assert.ok(agent.name);
    assert.ok(agent.role);
    assert.ok(agent.squad);
    assert.ok(agent.playbook.length >= 3);
    const knowledge = specialistKnowledge(agent);
    assert.ok(knowledge.mission);
    assert.ok(knowledge.requiredInputs);
    assert.ok(knowledge.outputs);
    assert.ok(knowledge.handoffs);
    assert.ok(knowledge.pipeline.approvalRule);
  }
});

test("representative intents can route to every specialist", () => {
  const examples = {
    vera: "Plan a Matterport 360 virtual tour walkthrough.",
    lens: "Create a listing photography shot list.",
    aero: "Create a drone aerial flight plan.",
    frame: "Plan a property video shoot.",
    wave: "Produce a podcast episode and guest interview.",
    atlas: "Improve organic SEO rankings and keyword visibility.",
    maps: "Improve our Google Business Profile and map pack position.",
    signal: "Improve our Local Services Ads lead quality.",
    grid: "Fix our local listings and NAP consistency.",
    pulse: "Build a Meta Ads paid social campaign.",
    hook: "Write conversion copy and a stronger offer.",
    pin: "Create a Pinterest ads and board strategy.",
    revive: "Reactivate cold leads and dormant pipeline.",
    echo: "Improve online reviews and reputation responses.",
    studio: "Create our social media content calendar.",
    forge: "Repurpose one blog post into a month of content.",
    prism: "Create brand positioning and a visual identity.",
    scope: "Create KPI reporting and a marketing dashboard.",
    patch: "Audit our website conversion rate and landing page.",
  };
  for (const [id, question] of Object.entries(examples)) {
    assert.equal(selectAgent(question).agent.id, id, `${id} routing`);
  }
});
