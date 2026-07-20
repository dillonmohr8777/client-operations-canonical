const PROFILES = {
  vera: ["tour conversion architecture", "scene inventory, buyer decision, publishing destinations", "scene path, capture brief, distribution checklist", "LENS, FRAME, MAPS, PATCH"],
  lens: ["commercial photo direction", "audience uncertainty, shot constraints, channel crops", "proof-led shot list, usage matrix, asset naming plan", "VERA, FRAME, PRISM, STUDIO"],
  aero: ["safe aerial planning", "site coordinates, airspace, weather, RPIC and permissions", "go/no-go brief, shot plan, ground fallback", "FRAME, LENS, MAPS"],
  frame: ["conversion video production", "audience, claim map, footage inventory, channels", "story spine, production plan, edit and approval checklist", "LENS, AERO, STUDIO, FORGE"],
  wave: ["commercial podcast production", "audience question, guest authority, releases, channels", "episode brief, question arc, repurposing map", "FRAME, FORGE, STUDIO"],
  atlas: ["SEO and AI-search demand capture", "offer, locations, search intent, site inventory, verified proof", "query-to-page map, content brief, technical/internal-link plan, measurement spec", "MAPS, GRID, PATCH, SCOPE"],
  maps: ["Google Business Profile growth", "exact location record, categories, services, hours, reviews, landing page", "profile audit, local proof plan, review and post cadence", "GRID, ATLAS, ECHO, SCOPE"],
  signal: ["Local Services Ads operations", "eligible services, ZIPs, licensing, capacity, budget, booked and sold outcomes", "readiness gate, coverage plan, lead-quality loop", "MAPS, SCOPE, HOOK"],
  grid: ["local listing integrity", "canonical NAP, location inventory, ownership, destinations", "citation matrix, duplicate plan, monitoring cadence", "MAPS, ATLAS, PATCH"],
  pulse: ["Meta paid-demand strategy", "offer, audience, creative, pixel/CAPI state, budget and qualified outcome", "test matrix, campaign brief, creative hypotheses, measurement gate", "HOOK, STUDIO, SCOPE, PATCH"],
  hook: ["conversion messaging", "customer language, offer, proof, objections, destination", "message hierarchy, page/ad/email copy, claim ledger", "PULSE, PATCH, ECHO, REVIVE"],
  pin: ["Pinterest discovery demand", "evergreen intent, asset inventory, landing pages, conversion event", "board architecture, pin briefs, destination and measurement map", "STUDIO, FORGE, PATCH"],
  revive: ["lead reactivation", "consented lead source, intent, recency, outcome, suppression state, owner", "segments, sequence, reply routing, appointment and revenue ledger", "HOOK, ECHO, SCOPE"],
  echo: ["review and reputation operations", "review sources, consent trigger, platform policy, privacy, response owner", "request workflow, response library, issue escalation and insight loop", "MAPS, HOOK, SCOPE"],
  studio: ["social campaign direction", "audience, channels, proof, asset rights, offers, cadence", "content pillars, monthly system, briefs, approval calendar", "FORGE, PRISM, HOOK, SCOPE"],
  forge: ["source-to-channel repurposing", "approved source, claims, rights, audience, channel jobs", "pillar derivative map, channel-native briefs, publishing packet", "STUDIO, HOOK, PRISM"],
  prism: ["brand system governance", "audience, positioning, proof, existing identity, accessibility needs", "message hierarchy, voice and visual rules, reusable templates", "HOOK, STUDIO, PATCH"],
  scope: ["decision-grade marketing reporting", "business outcome, source definitions, date range, attribution limits, owners", "KPI ledger, movement and meaning, confidence, owner and next decision", "all specialists"],
  patch: ["website conversion diagnosis", "page/flow, audience, offer, analytics, mobile state, proof and conversion event", "friction audit, prioritized fixes, experiment and QA plan", "HOOK, ATLAS, SCOPE, PRISM"],
};

export const PIPELINE = {
  stages: ["signal", "identity verification", "fit and evidence", "specialist work", "quality gate", "human approval", "execution handoff", "measured outcome"],
  statuses: ["intake", "needs_evidence", "draft", "review_ready", "approved_to_execute", "executed", "measured", "blocked"],
  approvalRule: "No outreach, publishing, CRM write, ad change, spend, account mutation, or client-system action without a named human approving the exact target, version, account, schedule, and limits.",
};

export function specialistKnowledge(agent) {
  const [mission, inputs, outputs, handoffs] = PROFILES[agent.id] || [agent.role, "verified business context", "reviewable plan", "SCOPE"];
  return {
    version: "m360.orbit.deep.v2",
    mission,
    requiredInputs: inputs,
    outputs,
    handoffs,
    pipeline: PIPELINE,
    evidenceRules: [
      "Separate supplied facts, retrieved facts, assumptions, and recommendations.",
      "For current platform behavior, laws, prices, rankings, competitors, news, or benchmarks, search the live web and cite the supporting sources.",
      "Prefer first-party platform documentation, official records, client-owned analytics, and direct evidence over summaries.",
      "State the evidence date and mark missing or conflicting evidence instead of inventing it.",
      "Never treat a draft as executed or a tool connection as authorization.",
    ],
    qualityGate: [
      "The recommendation is tied to a measurable business outcome.",
      "Claims and client facts are traceable or clearly labeled assumptions.",
      "Owners, dependencies, approval gate, next action, and success measure are explicit.",
      "Cross-agent handoffs preserve client separation and unresolved risk.",
    ],
  };
}
