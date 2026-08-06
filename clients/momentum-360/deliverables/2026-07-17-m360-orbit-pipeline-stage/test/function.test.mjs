import test from "node:test";
import assert from "node:assert/strict";
import { handler } from "../netlify/functions/ask.mjs";

test("the function rejects short questions", async () => {
  const result = await handler({ httpMethod: "POST", headers: {}, body: JSON.stringify({ question: "Help" }) });
  assert.equal(result.statusCode, 400);
});

test("the function provides an evidence-safe deep plan when no API key exists", async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const result = await handler({
      httpMethod: "POST",
      headers: { "x-nf-client-connection-ip": "127.0.0.1" },
      body: JSON.stringify({ question: "Build a local SEO plan for an HVAC company." }),
    });
    const payload = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(payload.agent.id, "atlas");
    assert.equal(payload.mode, "deep-plan");
    assert.equal(payload.knowledgeVersion, "m360.orbit.deep.v2");
    assert.deepEqual(payload.sources, []);
    assert.deepEqual(payload.collaborators, []);
    assert.match(payload.answer, /ATLAS/);
    assert.match(payload.answer, /pending validation/);
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
});

test("the function sends a bounded multi-agent Responses request and returns the root answer", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = globalThis.fetch;
  let captured;
  process.env.OPENAI_API_KEY = "test-key-not-a-secret";
  process.env.OPENAI_BASE_URL = "https://api.openai.com";
  process.env.OPENAI_MODEL = "gpt-5.6";
  globalThis.fetch = async (url, options) => {
    captured = { url, options, body: JSON.parse(options.body) };
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          output: [
            {
              type: "web_search_call",
              action: {
                sources: [
                  { url: "not a valid URL", title: "Malformed source" },
                  { url: "https://example.com/guide", title: "" },
                ],
              },
            },
            { type: "multi_agent_call", action: "spawn", arguments: JSON.stringify({ agent_name: "maps" }) },
            {
              type: "message",
              phase: "final_answer",
              agent: { agent_name: "/root/maps" },
              content: [{ type: "output_text", text: "Private MAPS detail should not be the public answer." }],
            },
            {
              type: "message",
              phase: "final_answer",
              agent: { agent_name: "/root" },
              content: [{ type: "output_text", text: "## Priority plan\n\n1. Fix the service page.\n\n**Next move:** Ship it this week." }],
            },
          ],
        };
      },
    };
  };

  try {
    const result = await handler({
      httpMethod: "POST",
      headers: { "x-nf-client-connection-ip": "203.0.113.10" },
      body: JSON.stringify({
        question: "Build a local SEO and Google Business Profile plan for a family-owned HVAC business.",
        business: "Example HVAC",
        agentId: "atlas",
      }),
    });
    const payload = JSON.parse(result.body);

    assert.equal(result.statusCode, 200);
    assert.equal(payload.mode, "deep-multi");
    assert.equal(payload.knowledgeVersion, "m360.orbit.deep.v2");
    assert.equal(payload.agent.id, "atlas");
    assert.deepEqual(payload.collaborators.map((agent) => agent.id), ["maps"]);
    assert.deepEqual(payload.sources, [{ url: "https://example.com/guide", title: "example.com" }]);
    assert.doesNotMatch(payload.answer, /Private MAPS detail/);
    assert.equal(captured.url, "https://api.openai.com/v1/responses");
    assert.equal(captured.options.headers["openai-beta"], "responses_multi_agent=v1");
    assert.equal(captured.body.model, "gpt-5.6");
    assert.equal(captured.body.store, false);
    assert.equal(captured.body.max_output_tokens, 1800);
    assert.deepEqual(captured.body.multi_agent, { enabled: true, max_concurrent_subagents: 3 });
    assert.deepEqual(captured.body.tools, [{ type: "web_search" }]);
    assert.deepEqual(captured.body.include, ["web_search_call.action.sources"]);
    assert.equal(captured.body.input, "Build a local SEO and Google Business Profile plan for a family-owned HVAC business.");
    assert.match(captured.body.instructions, /Example HVAC/);
    assert.match(captured.body.instructions, /Deep operating knowledge version/);
    assert.match(captured.body.instructions, /MAPS \(maps\)/);
    assert.match(captured.body.instructions, /Approval boundary/);
    assert.equal(captured.body.safety_identifier.length, 32);
    assert.doesNotMatch(captured.body.safety_identifier, /203\.0\.113\.10/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
  }
});

test("the function retries without the beta contract when multi-agent is unavailable", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-key-not-a-secret";
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls += 1;
    if (calls === 1) {
      return { ok: false, status: 400, async json() { return { error: { code: "unsupported_beta" } }; } };
    }
    const parsed = JSON.parse(options.body);
    assert.equal(parsed.multi_agent, undefined);
    assert.equal(options.headers["openai-beta"], undefined);
    return { ok: true, status: 200, async json() { return { output_text: "## Plan\n\n**Next move:** Validate the brief." }; } };
  };

  try {
    const result = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ question: "Create a complete local marketing plan for this business." }),
    });
    const payload = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(payload.mode, "deep-live");
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});
