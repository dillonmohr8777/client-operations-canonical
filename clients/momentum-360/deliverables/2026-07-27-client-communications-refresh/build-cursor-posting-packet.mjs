import fs from "node:fs/promises";
import path from "node:path";

const root = path.dirname(
  new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
);
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "publish-ready-manifest.json"), "utf8"),
);

const lines = [
  "# Cursor Slack posting packet",
  "",
  "Dillon Mohr explicitly approved immediate publication of every exact message in this packet on July 27, 2026.",
  "",
  "Posting contract:",
  "",
  "- Post each message verbatim as Cursor to the exact Slack channel ID listed.",
  "- Create one standalone channel post per packet item. Do not use threads.",
  "- Do not add introductions, conclusions, mentions, or agent commentary to any client channel.",
  "- Do not alter facts, links, formatting, punctuation, or wording.",
  "- Do not include the BEGIN_MESSAGE or END_MESSAGE markers in the channel post.",
  "- Fresh Blends and Replenish are separate posts in the same channel and must remain separate brands.",
  "- If a post fails, do not substitute another destination. Report the exact failure in the Cursor DM.",
  "- After all attempts, return one Cursor DM reply with each successful Slack permalink and any exact failure.",
  "",
];

for (const [index, slack] of manifest.slacks.entries()) {
  const body = await fs.readFile(slack.bodyFile, "utf8");
  lines.push(
    `## ${index + 1}. ${slack.slug}`,
    "",
    `Channel: #${slack.channel}`,
    `Channel ID: ${slack.channelId}`,
    "",
    "BEGIN_MESSAGE",
    body.trim(),
    "END_MESSAGE",
    "",
  );
}

const output = path.join(root, "cursor-slack-posting-packet.md");
await fs.writeFile(output, `${lines.join("\n")}\n`, "utf8");
console.log(output);
