import fs from "node:fs/promises";
import path from "node:path";

const repo = process.cwd();
const netlifyConfig = path.join(
  process.env.APPDATA,
  "netlify",
  "Config",
  "config.json",
);

const reports = [
  {
    slug: "kimberly-james-bridal",
    key: "kimberly-james-bridal",
    deployId: "6a5e2aec47c635e9cf13c459",
    deployUrl:
      "https://6a5e2aec47c635e9cf13c459--kimberly-james-bridal-2026-06-06.netlify.app",
    data: {
      clientName: "Kimberly James Bridal",
      reportMonth: "July 20-July 26, 2026",
      reportView: "Week",
      reportingMonth: "2026-07",
      logoAlt: "Kimberly James Bridal logo",
      logoPanel: "light",
      industry: "Bridal / Google Ads + Meta Ads",
      status: "Optimizing",
      executiveSummary:
        "Kimberly James Bridal invested $202.23 across Google Ads and Meta Ads in the July 20-July 26 reporting window. Google delivered 10,212 impressions and 282 clicks on $144.48 in spend. Meta reporting through July 25 delivered 5,999 impressions, 4,462 people reached, and 123 landing-page views on $57.75 in spend. Meta's July 26 row is still pending platform finalization, and appointment reporting remains pending validation.",
      primaryGoal:
        "Keep Google and Meta measured separately while reconciling appointment quality and source attribution before the next budget decision.",
      kpis: [
        {
          label: "Combined Spend",
          value: "$202.23",
          change: "Google + Meta",
          trend: "neutral",
          context: "Channels separated below",
        },
        {
          label: "Google Clicks",
          value: "282",
          change: "2.76% CTR",
          trend: "up",
          context: "$0.51 average CPC",
        },
        {
          label: "Meta LP Views",
          value: "123",
          change: "$0.47 per view",
          trend: "up",
          context: "Verified through Jul 25",
        },
        {
          label: "Impressions",
          value: "16,211",
          change: "10,212 Google + 5,999 Meta",
          trend: "up",
          context: "Cross-channel delivery",
        },
      ],
      channels: [
        {
          name: "Google | Performance Max Bridal Appointment",
          spend: 142.62,
          leads: 0,
          cpl: 0,
          resultLabel: "281 clicks",
          costLabel: "$0.51 CPC",
          status: "Paused",
          notes:
            "July 20-July 26: 10,185 impressions, 281 clicks, and $142.62 spend. The campaign is paused.",
        },
        {
          name: "Google | Local Bridal | Philadelphia Search",
          spend: 1.86,
          leads: 0,
          cpl: 0,
          resultLabel: "1 click",
          costLabel: "$1.86 spend",
          status: "Active",
          notes:
            "July 20-July 26: 27 impressions, 1 click, and $1.86 spend.",
        },
        {
          name: "Meta | Website Carousel | Philadelphia",
          spend: 57.75,
          leads: 0,
          cpl: 0,
          resultLabel: "123 landing-page views",
          costLabel: "$0.47 per view",
          status: "Active through Jul 25",
          notes:
            "Meta delivered 5,999 impressions and reached 4,462 people through July 25. July 26 remains pending platform finalization.",
        },
      ],
      chartData: [
        {
          week: "Google Ads",
          impressions: 10212,
          clicks: 282,
          leads: 0,
          conversions: 0,
        },
        {
          week: "Meta Ads",
          impressions: 5999,
          clicks: 0,
          leads: 0,
          conversions: 0,
        },
      ],
      wins: [
        "Google delivered 282 clicks at a $0.51 average CPC.",
        "Meta produced 123 landing-page views at $0.47 each.",
        "The two channels generated 16,211 confirmed impressions while remaining separately measured.",
      ],
      watchouts: [
        "Meta has not finalized the July 26 reporting row.",
        "Appointment and conversion reporting remains pending validation against named outcomes.",
        "Four Meta drafts remain unpublished and are not included as active delivery.",
      ],
      changesMade: [
        "Updated the standard Momentum 360 dashboard with the verified July 20-July 26 Google totals.",
        "Updated Meta delivery through July 25 and marked July 26 as pending platform finalization.",
        "Kept Google traffic, Meta landing-page views, and appointment validation as separate measurement layers.",
      ],
      nextMoves: [
        "Reconcile appointment outcomes by source before changing budget.",
        "Keep the active Google search campaign learning while the Performance Max campaign remains paused.",
        "Complete the Meta lead-creative review before publishing any draft.",
      ],
      leadBreakdown: {
        forms: 0,
        calls: 0,
        other: 0,
        source: "Google Ads and Meta Ads platform reporting",
        notes:
          "Appointment and conversion reporting is pending validation against named business outcomes.",
      },
      reviewContactName: "",
      reviewContactEmail: "",
      reviewDocuments: [
        {
          title: "Kimberly James Bridal July 20-July 26 performance review",
          status: "Ready for review",
        },
      ],
    },
  },
  {
    slug: "omega-landscaping",
    key: "omega-landscaping",
    deployId: "6a5d399edee7080633e540dc",
    deployUrl:
      "https://6a5d399edee7080633e540dc--omega-landscaping-2026-06-06.netlify.app",
    data: {
      clientName: "Omega Landscaping",
      reportMonth: "July 20-July 26, 2026",
      reportView: "Week",
      reportingMonth: "2026-07",
      logoAlt: "Omega Landscaping logo",
      logoPanel: "light",
      industry: "Landscaping / Google Ads",
      status: "Optimizing",
      executiveSummary:
        "Omega Landscaping's active Colorado Springs Performance Max campaign spent $271.93 in the July 20-July 26 window. It delivered 1,492 impressions, 71 interactions, 45 clicks, and one Google-counted conversion event. The event remains a platform signal until it is reconciled to a named call, form, inbox, or CRM record.",
      primaryGoal:
        "Keep Colorado Springs demand concentrated in the active campaign while validating the Google-counted event before changing budget.",
      kpis: [
        {
          label: "Spend",
          value: "$271.93",
          change: "Jul 20-Jul 26",
          trend: "neutral",
          context: "Performance Max",
        },
        {
          label: "Clicks",
          value: "45",
          change: "3.02% CTR",
          trend: "up",
          context: "71 interactions",
        },
        {
          label: "Impressions",
          value: "1,492",
          change: "Colorado Springs",
          trend: "up",
          context: "Google Ads",
        },
        {
          label: "Tracked Event",
          value: "1",
          change: "Pending lead validation",
          trend: "neutral",
          context: "$271.93 platform CPA",
        },
      ],
      channels: [
        {
          name: "Google | Omega Landscaping & Concrete | Colorado Springs | PMax",
          spend: 271.93,
          leads: 1,
          cpl: 271.93,
          resultLabel: "1 tracked event",
          costLabel: "$271.93 platform CPA",
          status: "Active",
          notes:
            "July 20-July 26: 1,492 impressions, 71 interactions, 45 clicks, 3.02% CTR, $271.93 spend, and one Google-counted conversion event pending named-lead validation.",
        },
      ],
      chartData: [
        {
          week: "Jul 20-Jul 26",
          impressions: 1492,
          clicks: 45,
          leads: 0,
          conversions: 1,
        },
      ],
      wins: [
        "All confirmed delivery remained concentrated in the intended Colorado Springs Performance Max campaign.",
        "The campaign generated 71 interactions and 45 clicks from 1,492 impressions.",
        "Google recorded one conversion event for downstream reconciliation.",
      ],
      watchouts: [
        "The Google-counted event is not yet tied to a named lead or project outcome.",
        "Budget changes should wait for call, form, inbox, and CRM reconciliation.",
        "Platform count alone should not be treated as a closed landscaping job.",
      ],
      changesMade: [
        "Updated Omega to the verified July 20-July 26 Google Ads totals.",
        "Preserved the standard Momentum 360 reporting dashboard and Omega client logo.",
        "Separated the Google-counted event from named-lead validation.",
      ],
      nextMoves: [
        "Match the tracked event to calls, forms, inbox, and CRM records.",
        "Confirm the inquiry's project type, location, and qualification status.",
        "Use the named outcome to decide whether budget should change.",
      ],
      leadBreakdown: {
        forms: 0,
        calls: 0,
        other: 1,
        source: "Google Ads platform event",
        notes:
          "One Google-counted event is visible. Named call, form, inbox, or CRM reconciliation remains pending.",
      },
      reviewContactName: "",
      reviewContactEmail: "",
      reviewDocuments: [
        {
          title: "Omega Landscaping July 20-July 26 performance review",
          status: "Ready for review",
        },
      ],
    },
  },
  {
    slug: "onsite-concrete-landscape",
    key: "onsite-concrete-and-landscape",
    renderKey: "fagan-painting",
    deployId: "6a5e74f1fe9d525c730016f7",
    deployUrl:
      "https://6a5e74f1fe9d525c730016f7--fagan-painting-2026-07-06.netlify.app",
    data: {
      clientName: "Onsite Concrete & Landscape",
      reportMonth: "July 20-July 26, 2026",
      reportView: "Week",
      reportingMonth: "2026-07",
      logoAlt: "Onsite Concrete & Landscape logo",
      logoPanel: "light",
      industry: "Concrete & Landscape / Google Ads",
      status: "Optimizing",
      executiveSummary:
        "Onsite Concrete & Landscape spent $60.36 across Google Ads in the July 20-July 26 window. The account delivered 11,008 impressions and 344 clicks. Performance Max generated all six visible tracked conversion events on $23.13 in campaign spend, while the Smart campaign supplied most of the reach and click volume.",
      primaryGoal:
        "Reconcile the six tracked events to qualified estimates, then use the verified contact mix to guide the next budget decision.",
      kpis: [
        {
          label: "Account Spend",
          value: "$60.36",
          change: "Jul 20-Jul 26",
          trend: "neutral",
          context: "All Google activity",
        },
        {
          label: "Clicks",
          value: "344",
          change: "Account total",
          trend: "up",
          context: "Google Ads",
        },
        {
          label: "Impressions",
          value: "11,008",
          change: "Account total",
          trend: "up",
          context: "Google Ads",
        },
        {
          label: "Tracked Events",
          value: "6",
          change: "$3.86 PMax event cost",
          trend: "up",
          context: "Pending named-contact validation",
        },
      ],
      channels: [
        {
          name: "Google | Onsite Concrete & Landscape Smart Campaign",
          spend: 37.23,
          leads: 0,
          cpl: 0,
          resultLabel: "277 clicks",
          costLabel: "$37.23 spend",
          status: "Active",
          notes:
            "July 20-July 26: 10,551 impressions, 277 clicks, and $37.23 spend.",
        },
        {
          name: "Google | Leads - Performance Max",
          spend: 23.13,
          leads: 6,
          cpl: 3.86,
          resultLabel: "6 tracked events",
          costLabel: "$3.86 per event",
          status: "Active",
          notes:
            "July 20-July 26: 457 impressions, 67 clicks, $23.13 spend, and six visible tracked conversion events.",
        },
      ],
      chartData: [
        {
          week: "Smart Campaign",
          impressions: 10551,
          clicks: 277,
          leads: 0,
          conversions: 0,
        },
        {
          week: "Performance Max",
          impressions: 457,
          clicks: 67,
          leads: 0,
          conversions: 6,
        },
      ],
      wins: [
        "The account generated 344 clicks on $60.36 in total spend.",
        "Performance Max produced all six visible tracked conversion events.",
        "The Smart campaign continued supplying the majority of reach and click volume.",
      ],
      watchouts: [
        "The six tracked events still need reconciliation to named contacts and qualified estimates.",
        "Smart campaign traffic and Performance Max action signals should remain separately measured.",
        "Budget decisions should follow the qualified-estimate mix rather than platform count alone.",
      ],
      changesMade: [
        "Updated Onsite to the verified July 20-July 26 Google Ads totals.",
        "Preserved the standard Momentum 360 reporting dashboard and Onsite logo.",
        "Separated Smart campaign traffic from Performance Max tracked events.",
      ],
      nextMoves: [
        "Match all six tracked events to call, form, inbox, and CRM records.",
        "Classify each verified contact by estimate quality and project type.",
        "Tune the next budget decision around confirmed qualified estimates.",
      ],
      leadBreakdown: {
        forms: 0,
        calls: 0,
        other: 6,
        source: "Google Ads tracked conversion events",
        notes:
          "Six platform events are visible. Form, call, and named-contact classification remains pending validation.",
      },
      reviewContactName: "",
      reviewContactEmail: "",
      reviewDocuments: [
        {
          title: "Onsite July 20-July 26 performance review",
          status: "Ready for review",
        },
      ],
    },
  },
  {
    slug: "fagan-painting",
    key: "fagan-painting",
    deployId: "6a5e74f1fe9d525c730016f7",
    deployUrl:
      "https://6a5e74f1fe9d525c730016f7--fagan-painting-2026-07-06.netlify.app",
    data: {
      clientName: "Fagan Painting LLC",
      reportMonth: "July 20-July 26, 2026",
      reportView: "Week",
      reportingMonth: "2026-07",
      logoAlt: "Fagan Painting LLC logo",
      logoPanel: "light",
      industry: "Painting / Meta Ads",
      status: "Payment Action Needed",
      executiveSummary:
        "Fagan Painting LLC recorded $478.14 in Meta spend and 10,563 campaign impressions in the confirmed July 20-July 25 reporting rows. The Pittsburgh 25-mile campaign produced six lead-form results on $340.48 in spend, for a $56.75 cost per lead. Meta has not finalized the July 26 row, and current delivery is interrupted by the account payment state.",
      primaryGoal:
        "Confirm disposition of the six lead-form results, resolve the payment state, and resume only the campaign and routing path that produced verified lead delivery.",
      kpis: [
        {
          label: "Meta Spend",
          value: "$478.14",
          change: "Two delivered campaigns",
          trend: "neutral",
          context: "Verified through Jul 25",
        },
        {
          label: "Impressions",
          value: "10,563",
          change: "Campaign total",
          trend: "up",
          context: "Verified delivery",
        },
        {
          label: "Lead Forms",
          value: "6",
          change: "Pittsburgh 25mi campaign",
          trend: "up",
          context: "Whole-integer Meta result",
        },
        {
          label: "Primary CPL",
          value: "$56.75",
          change: "Six-lead campaign",
          trend: "neutral",
          context: "$340.48 spend",
        },
      ],
      channels: [
        {
          name: "Meta | Primary First Optimized Lead Campaign",
          spend: 137.66,
          leads: 0,
          cpl: 0,
          resultLabel: "Lead reporting pending validation",
          costLabel: "$137.66 spend",
          status: "Delivered - now off",
          notes:
            "Confirmed period: 2,253 impressions, 1,353 reach, and $137.66 spend. Lead reporting remains pending validation.",
        },
        {
          name: "Meta | Pittsburgh 25mi Lead Campaign - Copy",
          spend: 340.48,
          leads: 6,
          cpl: 56.75,
          resultLabel: "6 lead forms",
          costLabel: "$56.75 CPL",
          status: "Payment state",
          notes:
            "Confirmed period: 8,310 impressions, 4,129 reach, $340.48 spend, and six lead-form results.",
        },
      ],
      chartData: [
        {
          week: "Primary Campaign",
          impressions: 2253,
          clicks: 0,
          leads: 0,
          conversions: 0,
        },
        {
          week: "Pittsburgh 25mi",
          impressions: 8310,
          clicks: 0,
          leads: 6,
          conversions: 6,
        },
      ],
      wins: [
        "The Pittsburgh 25-mile campaign generated six lead-form results.",
        "The six-result campaign held to a $56.75 cost per lead.",
        "The weekly dashboard keeps the two delivered campaigns and their result quality separated.",
      ],
      watchouts: [
        "Meta has not finalized the July 26 reporting row.",
        "The current payment state is interrupting delivery.",
        "Lead follow-up outcomes are needed before any campaign restart decision.",
      ],
      changesMade: [
        "Updated Fagan to the confirmed July 20-July 25 Meta delivery rows.",
        "Marked the July 26 row as pending platform finalization.",
        "Separated the six-result campaign from the campaign whose lead reporting remains pending validation.",
      ],
      nextMoves: [
        "Confirm the disposition and qualification of all six lead-form results.",
        "Resolve the Meta account payment state.",
        "Resume only the verified campaign and lead-routing path after billing recovery.",
      ],
      leadBreakdown: {
        forms: 6,
        calls: 0,
        other: 0,
        source: "Meta Ads Manager lead-form results",
        notes:
          "Six lead-form results were confirmed through July 25. Lead disposition and July 26 platform finalization remain pending.",
      },
      reviewContactName: "",
      reviewContactEmail: "",
      reviewDocuments: [
        {
          title: "Fagan Painting July 20-July 26 performance review",
          status: "Ready for review",
        },
      ],
    },
  },
  {
    slug: "fresh-blends-kwik-trip",
    key: "fresh-blends-kwik-trip-ice-box",
    deployId: "6a38459e8c35057867bc8f54",
    deployUrl:
      "https://6a38459e8c35057867bc8f54--fresh-blends-2026-05-31-report.netlify.app",
    data: {
      clientName: "Fresh Blends / Kwik Trip",
      reportMonth: "July 20-July 26, 2026",
      reportView: "Week",
      reportingMonth: "2026-07",
      logoAlt: "Fresh Blends / Kwik Trip logo",
      logoPanel: "light",
      industry: "Retail Beverage / Google Ads",
      status: "Paused",
      executiveSummary:
        "Fresh Blends remains a separate reporting lane from Replenish. Four Kwik Trip Ice Box campaigns were reviewed in the shared Google Ads child account, and all four remain paused. This dashboard reports the verified delivery state without blending Replenish store performance into the Fresh Blends account view.",
      primaryGoal:
        "Keep the four Ice Box campaigns paused until launch authority, store scope, and measurement definitions are confirmed.",
      kpis: [
        {
          label: "Delivery",
          value: "Paused",
          change: "Verified Jul 26",
          trend: "neutral",
          context: "No active claim",
        },
        {
          label: "Campaigns",
          value: "4",
          change: "Ice Box campaigns",
          trend: "neutral",
          context: "All paused",
        },
        {
          label: "Store Scope",
          value: "Kwik Trip",
          change: "Fresh Blends lane",
          trend: "neutral",
          context: "Shared child account",
        },
        {
          label: "Replenish Data",
          value: "Excluded",
          change: "Separate report",
          trend: "neutral",
          context: "No blended totals",
        },
      ],
      channels: [
        {
          name: "Google | Kwik Trip #633 | Ice Box | PMax",
          spend: 0,
          leads: 0,
          cpl: 0,
          resultLabel: "Paused",
          costLabel: "Delivery paused",
          status: "Paused",
          notes:
            "Verified July 26 in the shared child account. Replenish store performance is excluded.",
        },
        {
          name: "Google | Kwik Trip #1110 | Ice Box | PMax",
          spend: 0,
          leads: 0,
          cpl: 0,
          resultLabel: "Paused",
          costLabel: "Delivery paused",
          status: "Paused",
          notes:
            "Verified July 26 in the shared child account. Replenish store performance is excluded.",
        },
        {
          name: "Google | Two additional Kwik Trip Ice Box campaigns",
          spend: 0,
          leads: 0,
          cpl: 0,
          resultLabel: "Paused",
          costLabel: "Delivery paused",
          status: "Paused",
          notes:
            "Both additional Ice Box campaigns remain paused. No Replenish metrics are included.",
        },
      ],
      chartData: [
        {
          week: "#633",
          impressions: 0,
          clicks: 0,
          leads: 0,
          conversions: 0,
        },
        {
          week: "#1110",
          impressions: 0,
          clicks: 0,
          leads: 0,
          conversions: 0,
        },
        {
          week: "Other Ice Box",
          impressions: 0,
          clicks: 0,
          leads: 0,
          conversions: 0,
        },
      ],
      wins: [
        "The Fresh Blends reporting lane remains separated from Replenish.",
        "All four Ice Box campaigns were verified in the shared child account.",
        "The dashboard makes the paused delivery state explicit without publishing blended KPI totals.",
      ],
      watchouts: [
        "The four campaigns should remain paused until launch authority is confirmed.",
        "Store scope and measurement definitions still need approval.",
        "Replenish campaign performance must remain outside this client dashboard.",
      ],
      changesMade: [
        "Restored the standard Momentum 360 client-dashboard format.",
        "Updated the report to the verified July 26 campaign state.",
        "Excluded all Replenish metrics and active-delivery claims.",
      ],
      nextMoves: [
        "Confirm launch authority for the Ice Box campaign group.",
        "Confirm the exact Kwik Trip store scope.",
        "Approve measurement definitions before any campaign restart.",
      ],
      leadBreakdown: {
        forms: 0,
        calls: 0,
        other: 0,
        source: "Google Ads campaign-status review",
        notes:
          "Campaign delivery remains paused. Conversion reporting is pending validation before any restart.",
      },
      reviewContactName: "",
      reviewContactEmail: "",
      reviewDocuments: [
        {
          title: "Fresh Blends July 20-July 26 delivery review",
          status: "Ready for review",
        },
      ],
    },
  },
];

function getNetlifyToken(config) {
  const users = Object.values(config.users ?? {});
  const token = users.find((user) => user?.auth?.token)?.auth?.token;
  if (!token) {
    throw new Error("Authenticated Netlify CLI token was not found.");
  }
  return token;
}

function injectReport(source, key, data, renderKey = key) {
  const escapedRenderKey = renderKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const renderer = new RegExp(
    `function\\s+[A-Za-z0-9_$]+\\(\\)\\{const\\s+t=([A-Za-z0-9_$]+)\\["${escapedRenderKey}"\\];return`,
    "g",
  );
  const matches = [...source.matchAll(renderer)];
  if (matches.length === 0) {
    return null;
  }

  const match = matches.at(-1);
  const reportMap = match[1];
  const override = `;Object.assign(${reportMap}[${JSON.stringify(
    key,
  )}],${JSON.stringify(data)});`;
  const rendererSource = match[0].replace(
    `${reportMap}[${JSON.stringify(renderKey)}]`,
    `${reportMap}[${JSON.stringify(key)}]`,
  );
  return `${source.slice(0, match.index)}${override}${rendererSource}${source.slice(
    match.index + match[0].length,
  )}`;
}

async function fetchNetlifyJson(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Netlify API returned ${response.status} for ${url}`);
  }
  return response.json();
}

async function restoreReport(report, token) {
  const outDir = path.join(
    repo,
    "clients",
    report.slug,
    "deliverables",
    "2026-07-26-weekly-performance-dashboard",
  );
  const normalizedOut = path.resolve(outDir);
  const allowedRoot = path.resolve(repo, "clients");
  if (!normalizedOut.startsWith(`${allowedRoot}${path.sep}`)) {
    throw new Error(`Refusing to write outside the client workspace: ${outDir}`);
  }

  const files = await fetchNetlifyJson(
    `https://api.netlify.com/api/v1/deploys/${report.deployId}/files`,
    token,
  );
  const webFiles = files.filter(
    (file) =>
      file.path !== "/netlify.toml" &&
      !file.path.toLowerCase().includes("shadow-heating-cooling"),
  );

  await fs.rm(path.join(outDir, "assets"), { recursive: true, force: true });
  let injectedCount = 0;

  for (const file of webFiles) {
    const relativePath = file.path.replace(/^\/+/, "");
    const destination = path.join(outDir, relativePath);
    await fs.mkdir(path.dirname(destination), { recursive: true });

    const response = await fetch(`${report.deployUrl}${file.path}`);
    if (!response.ok) {
      throw new Error(
        `Prior deploy returned ${response.status} for ${report.deployUrl}${file.path}`,
      );
    }

    const isText =
      file.mime_type?.startsWith("text/") ||
      file.mime_type === "application/javascript" ||
      /\.(html|css|js|mjs)$/i.test(relativePath);

    if (isText) {
      const source = await response.text();
      const updated = injectReport(
        source,
        report.key,
        report.data,
        report.renderKey,
      );
      if (updated) {
        injectedCount += 1;
        await fs.writeFile(destination, updated, "utf8");
      } else {
        await fs.writeFile(destination, source, "utf8");
      }
    } else {
      await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
    }
  }

  if (injectedCount === 0) {
    throw new Error(`Could not find the active dashboard renderer for ${report.key}`);
  }

  return {
    client: report.data.clientName,
    outDir,
    sourceDeploy: report.deployId,
    files: webFiles.length,
    injectedFiles: injectedCount,
  };
}

const config = JSON.parse(await fs.readFile(netlifyConfig, "utf8"));
const token = getNetlifyToken(config);
const results = [];

for (const report of reports) {
  results.push(await restoreReport(report, token));
}

console.log(JSON.stringify(results, null, 2));
