const fs = require("fs");
const path = require("path");
const http = require("http");

const OUT = process.argv[2] || ".";
const PORT = 9223;

const URLS = [
  {
    key: "verification",
    url: "https://ads.google.com/localservices/verification?cid=7626327026&bid=11037577158&pid=9999999999&euid=7377323401&hl=en&gl=US",
  },
  {
    key: "policymanager",
    url: "https://ads.google.com/localservices/policymanager?cid=7626327026&bid=11037577158&pid=9999999999&euid=7377323401",
  },
  {
    key: "leads",
    url: "https://ads.google.com/localservices/leads?cid=7626327026&bid=11037577158&pid=9999999999&euid=7377323401",
  },
];

function getJson(pathname) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "127.0.0.1", port: PORT, path: pathname }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("JSON parse fail: " + data.slice(0, 200)));
          }
        });
      })
      .on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class Cdp {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e.error || e);
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      };
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error("CDP timeout: " + method));
        }
      }, 60000);
    });
  }
  close() {
    try {
      this.ws.close();
    } catch (_) {}
  }
}

async function waitReady(cdp, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const state = await cdp.send("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      if (state.result && state.result.value === "complete") {
        // give SPA a beat
        await sleep(2500);
        return;
      }
    } catch (_) {}
    await sleep(500);
  }
}

async function dumpPage(cdp, key) {
  const evalText = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const t = (document.body && document.body.innerText) ? document.body.innerText : "";
      return {
        title: document.title || "",
        href: location.href || "",
        text: t.slice(0, 100000)
      };
    })()`,
    returnByValue: true,
  });
  const info = evalText.result.value;
  const textPath = path.join(OUT, `dump-${key}.txt`);
  fs.writeFileSync(
    textPath,
    `TITLE: ${info.title}\nURL: ${info.href}\nCAPTURED: ${new Date().toISOString()}\n\n${info.text}\n`,
    "utf8"
  );

  // screenshot
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  const shotPath = path.join(OUT, "screenshots", `${key}.png`);
  fs.writeFileSync(shotPath, Buffer.from(shot.data, "base64"));

  return { key, title: info.title, href: info.href, textPath, shotPath, textLen: (info.text || "").length, preview: (info.text || "").slice(0, 1500) };
}

async function main() {
  const list = await getJson("/json/list");
  let page = list.find((t) => t.type === "page" && t.url && !t.url.startsWith("chrome"));
  if (!page) page = list.find((t) => t.type === "page");
  if (!page || !page.webSocketDebuggerUrl) {
    console.error(JSON.stringify({ ok: false, error: "no page target on 9223", targets: list.map((t) => ({ type: t.type, url: t.url, title: t.title })) }, null, 2));
    process.exit(2);
  }

  const cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const results = [];
  for (const item of URLS) {
    console.error(`NAV ${item.key} -> ${item.url}`);
    await cdp.send("Page.navigate", { url: item.url });
    await waitReady(cdp, 50000);
    // extra settle for Google SPA / possible auth redirect
    await sleep(4000);
    const dump = await dumpPage(cdp, item.key);
    results.push(dump);
    console.error(`DUMPED ${item.key} len=${dump.textLen} href=${dump.href}`);
  }

  const summary = {
    ok: true,
    observedAt: new Date().toISOString(),
    port: PORT,
    targetId: page.id,
    results: results.map((r) => ({
      key: r.key,
      title: r.title,
      href: r.href,
      textPath: r.textPath,
      shotPath: r.shotPath,
      textLen: r.textLen,
    })),
  };
  fs.writeFileSync(path.join(OUT, "capture-summary.json"), JSON.stringify(summary, null, 2));
  // also write previews for quick parse
  for (const r of results) {
    fs.writeFileSync(path.join(OUT, `preview-${r.key}.txt`), r.preview, "utf8");
  }
  console.log(JSON.stringify(summary, null, 2));
  cdp.close();
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e && e.stack ? e.stack : e) }));
  process.exit(1);
});
