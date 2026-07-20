export const SQUADS = {
  capture: {
    name: "Capture & Showcase",
    short: "Capture",
    description: "Turn places, properties, and expertise into proof people can experience.",
  },
  found: {
    name: "Get Found",
    short: "Visibility",
    description: "Own the searches, maps, listings, and AI answers that create demand.",
  },
  win: {
    name: "Win Customers",
    short: "Demand",
    description: "Convert attention into conversations, appointments, and revenue.",
  },
  run: {
    name: "Content & Operations",
    short: "Operations",
    description: "Keep the brand, content system, reporting, and conversion surface moving.",
  },
};

export const AGENTS = [
  {
    id: "vera",
    name: "VERA",
    role: "360 Virtual Tour Architect",
    squad: "capture",
    signal: "Immersive experience",
    description: "Plans tours that build confidence before a customer ever walks through the door.",
    keywords: ["360 virtual tour", "virtual tour", "matterport", "street view", "immersive tour", "walkthrough", "tour shoot"],
    playbook: [
      "Define the one decision the tour must make easier for the viewer.",
      "Build a scene path that reveals proof in the order a buyer needs it.",
      "Distribute the tour across the website, Google Business Profile, listings, and sales follow-up.",
    ],
  },
  {
    id: "lens",
    name: "LENS",
    role: "Listing Photo Director",
    squad: "capture",
    signal: "Still-image proof",
    description: "Creates shot lists and image systems that make spaces feel clear, credible, and premium.",
    keywords: ["listing photo", "photography", "photoshoot", "photo shoot", "shot list", "property photos", "headshots", "brand photos"],
    playbook: [
      "Choose the visual proof points that remove the buyer's biggest uncertainty.",
      "Plan hero, context, detail, people, and conversion images before the shoot.",
      "Deliver crops and naming conventions for search, social, listings, and paid media.",
    ],
  },
  {
    id: "aero",
    name: "AERO",
    role: "Drone & Aerial Planner",
    squad: "capture",
    signal: "Scale and context",
    description: "Maps aerial sequences that show location, access, scale, and surrounding value.",
    keywords: ["drone", "aerial", "faa", "flight plan", "overhead", "property boundary", "site context"],
    playbook: [
      "Start with the location story the ground camera cannot communicate.",
      "Plan safe establishing, approach, reveal, orbit, and exit shots.",
      "Pair aerial footage with map, access, and neighborhood context that supports the sale.",
    ],
  },
  {
    id: "frame",
    name: "FRAME",
    role: "Property Video Producer",
    squad: "capture",
    signal: "Motion and story",
    description: "Turns a property or service into a concise narrative built to hold attention.",
    keywords: ["property video", "videography", "video shoot", "video script", "reel shoot", "b-roll", "walkthrough video", "promo video"],
    playbook: [
      "Open on the strongest transformation or visual proof, not an introduction.",
      "Structure the story as context, evidence, experience, and next action.",
      "Capture one master narrative plus modular clips for ads, reels, listings, and sales.",
    ],
  },
  {
    id: "wave",
    name: "WAVE",
    role: "Podcast Studio Producer",
    squad: "capture",
    signal: "Authority at scale",
    description: "Builds episodes that create trust once and feed every content channel afterward.",
    keywords: ["podcast", "episode", "guest interview", "show notes", "studio", "recording", "podcast clips"],
    playbook: [
      "Anchor every episode to one customer question with commercial relevance.",
      "Design the conversation around stories, proof, frameworks, and quotable moments.",
      "Repurpose each recording into short video, email, social, blog, and sales assets.",
    ],
  },
  {
    id: "atlas",
    name: "ATLAS",
    role: "AI Search & SEO Strategist",
    squad: "found",
    signal: "Search demand",
    description: "Maps the topics, pages, and proof that earn rankings and AI citations.",
    keywords: ["local seo", "seo", "ai seo", "ai search", "aeo", "geo", "rank on google", "organic traffic", "keywords", "search visibility", "chatgpt", "gemini", "perplexity"],
    playbook: [
      "Map commercial questions to focused pages with a clear search intent.",
      "Add first-hand proof, entity clarity, internal links, and answer-ready structure.",
      "Measure qualified calls, forms, rankings, and AI citations instead of traffic alone.",
    ],
  },
  {
    id: "maps",
    name: "MAPS",
    role: "Google Business Strategist",
    squad: "found",
    signal: "Map Pack presence",
    description: "Strengthens the local profile signals that turn nearby searches into calls and visits.",
    keywords: ["google business profile", "google my business", "gbp", "map pack", "google maps", "local profile", "business profile", "near me"],
    playbook: [
      "Lock name, address, phone, categories, services, hours, and landing-page alignment.",
      "Publish fresh visual proof, offers, questions, and service-specific updates.",
      "Build a review and citation rhythm that reinforces relevance, trust, and location.",
    ],
  },
  {
    id: "signal",
    name: "SIGNAL",
    role: "Local Service Ads Operator",
    squad: "found",
    signal: "High-intent calls",
    description: "Plans Local Service Ads around qualified leads, coverage, and booked-job economics.",
    keywords: ["local service ads", "local services ads", "lsa", "google screened", "google guaranteed", "disputed lead", "service area ads"],
    playbook: [
      "Choose only the services and ZIP codes the team can answer and fulfill profitably.",
      "Protect responsiveness, budget pacing, reviews, and lead-dispute hygiene.",
      "Score calls by booked and sold outcomes so bidding follows revenue quality.",
    ],
  },
  {
    id: "grid",
    name: "GRID",
    role: "Local Listings Controller",
    squad: "found",
    signal: "Entity consistency",
    description: "Finds and fixes listing gaps that weaken trust across the local search ecosystem.",
    keywords: ["local listings", "citations", "directories", "nap consistency", "business listings", "yelp listing", "duplicate listing", "directory"],
    playbook: [
      "Establish one canonical business record for every location.",
      "Fix high-authority, industry, local, and data-aggregator listings first.",
      "Monitor duplicates, ownership, category drift, and broken destination URLs monthly.",
    ],
  },
  {
    id: "pulse",
    name: "PULSE",
    role: "Meta Ads Strategist",
    squad: "win",
    signal: "Paid demand",
    description: "Builds Meta campaigns around offers, creative learning, and qualified pipeline.",
    keywords: ["meta ads", "facebook ads", "instagram ads", "paid social", "facebook campaign", "instagram campaign", "social ads"],
    playbook: [
      "Lead with one sharp audience problem and one credible outcome.",
      "Test angles and creative concepts before multiplying audiences or campaigns.",
      "Optimize against qualified appointments and revenue, not cheap form fills.",
    ],
  },
  {
    id: "hook",
    name: "HOOK",
    role: "Conversion Copywriter",
    squad: "win",
    signal: "Message-market fit",
    description: "Writes ads and offers that turn a specific pain into a believable next step.",
    keywords: ["ad copy", "copywriting", "headline", "landing page copy", "offer", "call to action", "cta", "sales copy", "email copy"],
    playbook: [
      "Name the customer's live problem in the words they already use.",
      "Connect the offer to a concrete outcome and support it with proof.",
      "Ask for one low-friction next action with a clear reason to act now.",
    ],
  },
  {
    id: "pin",
    name: "PIN",
    role: "Pinterest Demand Planner",
    squad: "win",
    signal: "Visual discovery",
    description: "Turns evergreen visual intent into campaigns and content that compound over time.",
    keywords: ["pinterest", "promoted pin", "pin strategy", "pinterest ads", "boards", "visual search"],
    playbook: [
      "Organize the account around evergreen customer intent, not internal categories.",
      "Build vertical creative that communicates the benefit before the click.",
      "Connect every pin to a fast, tightly matched destination with a measurable action.",
    ],
  },
  {
    id: "revive",
    name: "REVIVE",
    role: "Lead Reactivation Operator",
    squad: "win",
    signal: "Dormant pipeline",
    description: "Reopens old conversations with relevant, human follow-up instead of generic blasts.",
    keywords: ["cold leads", "old leads", "lead reactivation", "reactivation", "follow up", "follow-up", "nurture", "dormant", "pipeline", "missed leads"],
    playbook: [
      "Segment leads by original intent, last action, value, and reason they stalled.",
      "Reopen with context, a useful update, and a simple reply-based question.",
      "Route positive replies quickly and measure conversations, appointments, and recovered revenue.",
    ],
  },
  {
    id: "echo",
    name: "ECHO",
    role: "Review & Reputation Manager",
    squad: "win",
    signal: "Trust at decision time",
    description: "Builds review systems and responses that sound human and reinforce the brand promise.",
    keywords: ["reviews", "review response", "reputation", "one star", "five star", "google review", "bad review", "testimonial", "review request"],
    playbook: [
      "Ask at the moment value becomes visible and make the request effortless.",
      "Respond specifically, protect privacy, and move complex issues to a direct channel.",
      "Turn recurring praise and complaints into proof assets and operating improvements.",
    ],
  },
  {
    id: "studio",
    name: "STUDIO",
    role: "Social Campaign Director",
    squad: "win",
    signal: "Consistent attention",
    description: "Plans social content that connects expertise, proof, personality, and offers.",
    keywords: ["social media", "instagram post", "facebook post", "linkedin post", "content calendar", "reels", "social posts", "tiktok", "engagement"],
    playbook: [
      "Balance education, proof, point of view, people, and offers across the month.",
      "Create repeatable formats so consistency does not depend on inspiration.",
      "Measure profile actions, conversations, assisted conversions, and creative learnings.",
    ],
  },
  {
    id: "forge",
    name: "FORGE",
    role: "Content Repurposing Engine",
    squad: "run",
    signal: "One idea, many assets",
    description: "Transforms one useful source into a complete, channel-ready content system.",
    keywords: ["content engine", "repurpose", "repurposing", "blog post", "newsletter", "month of content", "content plan", "content strategy", "turn this into"],
    playbook: [
      "Start with one first-hand idea, story, result, or customer question.",
      "Create a pillar asset, then derive channel-native pieces instead of copy-pasting.",
      "Give every piece one job: attract, educate, prove, convert, or retain.",
    ],
  },
  {
    id: "prism",
    name: "PRISM",
    role: "Brand System Strategist",
    squad: "run",
    signal: "Recognition and trust",
    description: "Clarifies positioning, voice, identity, and the rules that keep every touchpoint coherent.",
    keywords: ["branding", "brand strategy", "logo", "color palette", "brand voice", "positioning", "visual identity", "rebrand", "style guide"],
    playbook: [
      "Define the audience, alternative, differentiated value, and proof before styling.",
      "Translate the position into a repeatable voice, visual system, and message hierarchy.",
      "Create rules and templates that improve consistency without slowing production.",
    ],
  },
  {
    id: "scope",
    name: "SCOPE",
    role: "Marketing Report Analyst",
    squad: "run",
    signal: "Decision clarity",
    description: "Turns channel data into a short answer: what changed, why it matters, and what to do next.",
    keywords: ["report", "reporting", "analytics", "dashboard", "metrics", "kpi", "performance", "attribution", "roi", "results", "data"],
    playbook: [
      "Start with the business outcome, then trace the few signals that explain it.",
      "Separate movement, meaning, confidence, and action so the report drives a decision.",
      "End with one priority, one owner, one deadline, and one success measure.",
    ],
  },
  {
    id: "patch",
    name: "PATCH",
    role: "Website Conversion Auditor",
    squad: "run",
    signal: "Conversion leaks",
    description: "Finds the page-level friction that costs calls, forms, bookings, and trust.",
    keywords: ["website audit", "website", "conversion rate", "cro", "landing page", "page speed", "form", "homepage", "site redesign", "website fix"],
    playbook: [
      "Check message match, proof, offer clarity, friction, and mobile usability in that order.",
      "Prioritize leaks by likely revenue impact and implementation effort.",
      "Define a measurable test for every change instead of redesigning by preference.",
    ],
  },
];

const AGENT_BY_ID = new Map(AGENTS.map((agent) => [agent.id, agent]));

function normalize(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getAgent(id) {
  return AGENT_BY_ID.get(normalize(id)) || null;
}

export function selectAgent(question, requestedAgentId = "") {
  const requested = getAgent(requestedAgentId);
  if (requested) return { agent: requested, score: Number.POSITIVE_INFINITY, reason: "selected" };

  const text = normalize(question);
  let winner = AGENT_BY_ID.get("scope");
  let winnerScore = 0;

  for (const agent of AGENTS) {
    let score = 0;
    for (const phrase of agent.keywords) {
      if (!text.includes(phrase)) continue;
      const words = phrase.split(" ").length;
      score += words * words + 2;
    }

    if (agent.id === "atlas" && /\b(local|organic|search|rank|ranking)\b/.test(text)) score += 2;
    if (agent.id === "maps" && /\b(map|maps|near me|profile)\b/.test(text)) score += 2;
    if (agent.id === "hook" && /\b(write|rewrite|headline|copy)\b/.test(text)) score += 2;
    if (agent.id === "patch" && /\b(site|page|website|conversion)\b/.test(text)) score += 2;

    if (score > winnerScore) {
      winner = agent;
      winnerScore = score;
    }
  }

  return {
    agent: winner,
    score: winnerScore,
    reason: winnerScore > 0 ? "intent" : "fallback",
  };
}

export function publicAgent(agent) {
  const squad = SQUADS[agent.squad];
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    squad: squad.name,
    squadId: agent.squad,
    signal: agent.signal,
    description: agent.description,
  };
}

export function buildStarterPlan(agent) {
  return [
    `## ${agent.name}'s first move`,
    ...agent.playbook.map((step, index) => `${index + 1}. ${step}`),
    "",
    "**Next move:** Pick the first step you can finish this week, assign an owner, and tie it to one measurable business outcome.",
  ].join("\n");
}
