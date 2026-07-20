import test from "node:test";
import assert from "node:assert/strict";
import { handler } from "../netlify/functions/ask.mjs";

test("the function rejects short questions", async () => {
  const result = await handler({ httpMethod: "POST", headers: {}, body: JSON.stringify({ question: "Help" }) });
  assert.equal(result.statusCode, 400);
});

test("the function provides a safe starter plan when no API key exists", async () => {
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
    assert.equal(payload.mode, "deep-research");
    assert.equal(payload.knowledgeVersion, "m360.orbit.deep.v2");
    assert.match(payload.answer, /ATLAS/);
  } finally {
    if (previous) process.env.OPENAI_API_KEY = previous;
  }
});

test("the function sends a bounded Responses API request and returns live output", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = globalThis.fetch;
  let captured;
  process.env.OPENAI_API_KEY = "test-key-not-a-secret";
  process.env.OPENAI_BASE_URL = "https://api.openai.com";
  process.env.OPENAI_MODEL = "gpt-5.5";
  globalThis.fetch = async (url, options) => {
    captured = { url, options, body: JSON.parse(options.body) };
    return {
      ok: true,
      status: 200,
      async json() {
        return { output_text: "## Priority plan\n\n1. Fix the service page.\n\n**Next move:** Ship it this week." };
      },
    };
  };

  try {
    const result = await handler({
      httpMethod: "POST",
      headers: { "x-nf-client-connection-ip": "203.0.113.10" },
      body: JSON.stringify({
        question: "Build a local SEO plan for a family-owned HVAC business.",
        business: "Example HVAC",
      }),
    });
    const payload = JSON.parse(result.body);

    assert.equal(result.statusCode, 200);
    assert.equal(payload.mode, "deep-live");
    assert.equal(payload.knowledgeVersion, "m360.orbit.deep.v2");
    assert.equal(payload.agent.id, "atlas");
    assert.equal(captured.url, "https://api.openai.com/v1/responses");
    assert.equal(captured.body.model, "gpt-5.5");
    assert.equal(captured.body.store, false);
    assert.equal(captured.body.max_output_tokens, 1400);
    assert.deepEqual(captured.body.tools, [{ type: "web_search" }]);
    assert.deepEqual(captured.body.include, ["web_search_call.action.sources"]);
    assert.equal(captured.body.input, "Build a local SEO plan for a family-owned HVAC business.");
    assert.match(captured.body.instructions, /Example HVAC/);
    assert.match(captured.body.instructions, /Deep operating knowledge version/);
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
