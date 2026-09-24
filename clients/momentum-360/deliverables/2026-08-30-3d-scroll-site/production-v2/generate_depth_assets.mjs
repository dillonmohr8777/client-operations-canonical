import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "site-v2", "assets", "layers");
const W = 1280;
const H = 720;

fs.mkdirSync(OUT, { recursive: true });

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
const svg = (content, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${content}</svg>`;
const rect = (x, y, w, h, fill, attrs = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${attrs}/>`;
const circle = (cx, cy, r, fill, attrs = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${attrs}/>`;
const ellipse = (cx, cy, rx, ry, fill, attrs = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${attrs}/>`;
const polygon = (points, fill, attrs = "") => `<polygon points="${points}" fill="${fill}" ${attrs}/>`;
const pathEl = (d, fill, attrs = "") => `<path d="${d}" fill="${fill}" ${attrs}/>`;
const line = (x1, y1, x2, y2, stroke, attrs = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" ${attrs}/>`;
const defsBase = (extra = "") => `${extra}<filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="13" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`;
const warmWindow = (x, y, w = 18, h = 36, opacity = 0.96) =>
  rect(x - 5, y - 5, w + 10, h + 10, "#f4bb5e", `opacity="${opacity * 0.18}" filter="url(#glow)"`) +
  rect(x, y, w, h, "#f7c86b", `opacity="${opacity}" rx="2"`) +
  line(x + w / 2, y + 2, x + w / 2, y + h - 2, "#8d5d36", `stroke-width="1" opacity=".65"`);
const tree = (x, y, scale = 1, color = "#0a1c25") =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0 L-46 150 L46 150 Z" fill="${color}"/><path d="M0 24 L-58 190 L58 190 Z" fill="${color}" opacity=".82"/><rect x="-6" y="178" width="12" height="30" fill="#071014"/></g>`;
const manorBody = (x, y, w, h, fill = "#6c7180") =>
  rect(x, y, w, h, fill, `rx="4" stroke="#9da2ad" stroke-opacity=".4" stroke-width="2"`);
const turret = (x, y, r, h, fill = "#4c5365") =>
  `<g><rect x="${x - r}" y="${y}" width="${r * 2}" height="${h}" fill="${fill}"/><polygon points="${x - r - 8},${y} ${x},${y - 78} ${x + r + 8},${y}" fill="#252e42"/><rect x="${x - 4}" y="${y - 48}" width="8" height="14" fill="#b9c0c8" opacity=".46"/></g>`;
const column = (x, y, h, fill = "#dfe2e4") =>
  `<g><rect x="${x - 7}" y="${y}" width="14" height="${h}" fill="${fill}"/><rect x="${x - 11}" y="${y - 5}" width="22" height="8" fill="${fill}"/><rect x="${x - 11}" y="${y + h - 3}" width="22" height="8" fill="${fill}"/></g>`;
const stairWedge = (cx, cy, step, count, fill, direction = 1) => {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const width = 100 + i * 15;
    const y = cy + i * step;
    const x = cx + direction * i * 7 - width / 2;
    out += `<path d="M ${x} ${y} L ${x + width} ${y} L ${x + width - 8} ${y + step} L ${x + 8} ${y + step} Z" fill="${fill}" opacity="${0.98 - i * 0.025}"/>`;
  }
  return out;
};

function aerial() {
  const sky = svg(rect(0, 0, W, H, "url(#sky)") + circle(1030, 126, 48, "#d8e9ff", `opacity=".65"`) + circle(1030, 126, 75, "#a7c7ff", `opacity=".12" filter="url(#glow)"`) +
    [80, 180, 310, 470, 760, 890, 1160].map((x, i) => circle(x, 95 + (i % 3) * 27, 1.6, "#d9e8ff", `opacity="${0.36 + (i % 2) * 0.24}"`)).join(""),
    defsBase('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040713"/><stop offset=".62" stop-color="#112b56"/><stop offset="1" stop-color="#305e85"/></linearGradient>'));
  const land = svg(pathEl("M0 350 C180 318 320 343 470 325 C640 300 795 327 955 310 C1090 296 1200 312 1280 298 L1280 720 L0 720 Z", "#07161c") +
    pathEl("M0 528 C210 490 350 492 490 468 C690 434 960 430 1280 406 L1280 720 L0 720 Z", "#0b252b", `opacity=".96"`) +
    line(0, 528, 1280, 406, "#2a5259", `stroke-width="2" opacity=".32"`), defsBase());
  const estate = svg(manorBody(596, 242, 398, 188, "#667183") +
    polygon("574,244 798,136 1018,244", "#2c3448") + turret(632, 184, 40, 198) + turret(963, 181, 42, 202) +
    manorBody(735, 188, 124, 242, "#727b8a") + polygon("717,188 797,122 876,188", "#30394c") +
    [628, 672, 727, 774, 822, 870, 919, 966].map((x, i) => warmWindow(x, 278 + (i % 2) * 9, 16, 34, .82)).join("") +
    rect(785, 357, 25, 73, "#d1b178", `opacity=".9"`) + rect(791, 365, 13, 65, "#272f37"), defsBase());
  const sports = svg(polygon("80,500 405,455 445,602 122,655", "#225e52", `stroke="#a3d6a2" stroke-width="3"`) +
    line(254, 477, 280, 625, "#c9f2ca", `stroke-width="3"`) + line(101, 578, 424, 528, "#c9f2ca", `stroke-width="3"`) +
    line(173, 480, 207, 629, "#d3f6db", `stroke-width="2"`) + line(338, 464, 370, 611, "#d3f6db", `stroke-width="2"`) +
    ellipse(900, 526, 161, 61, "#1a7587", `opacity=".92" stroke="#7ce6dd" stroke-width="4"`) + ellipse(900, 526, 126, 42, "#0e5f7c", `opacity=".72"`) +
    pathEl("M688 437 C774 453 1014 450 1086 434 L1165 660 C1054 676 851 684 714 656 Z", "#192a2e", `opacity=".95"`), defsBase());
  const foreground = svg(tree(80, 470, 1.25, "#06161b") + tree(1120, 406, 1.55, "#06161b") + tree(1215, 454, 1.12, "#0a1c25") +
    pathEl("M420 720 C515 639 556 603 634 579 C697 560 764 561 845 584 C929 610 1003 657 1089 720 Z", "#101f20") +
    line(575, 685, 1016, 618, "#b2d4c2", `stroke-width="3" opacity=".25"`), defsBase());
  return [sky, land, estate, sports, foreground];
}

function rearPool() {
  const sky = svg(rect(0, 0, W, H, "url(#sky)") + rect(0, 430, W, 290, "#09191d") + circle(1050, 138, 38, "#d9ddff", `opacity=".48"`), defsBase('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a17"/><stop offset=".66" stop-color="#15365b"/><stop offset="1" stop-color="#7a7c83"/></linearGradient>'));
  const trees = svg(tree(66, 280, 1.25, "#061516") + tree(1192, 274, 1.35, "#061516") + tree(104, 348, .88, "#0a2324") + tree(1150, 344, .9, "#0a2324"), defsBase());
  const facade = svg(manorBody(235, 218, 810, 280, "#7e8390") + polygon("204,220 638,116 1072,220", "#30394e") +
    manorBody(564, 168, 146, 330, "#898f9b") + polygon("542,169 637,96 733,169", "#30394e") +
    Array.from({ length: 10 }, (_, i) => warmWindow(293 + i * 78, 280 + (i % 2) * 7, 24, 52, .88)).join("") +
    column(356, 264, 208) + column(422, 264, 208) + column(852, 264, 208) + column(918, 264, 208) +
    rect(600, 354, 74, 144, "#433329", `rx="8"`) + rect(614, 370, 46, 128, "#161922", `rx="7"`), defsBase());
  const pool = svg(pathEl("M110 485 C338 454 948 456 1178 493 L1222 706 L61 706 Z", "#151e25") +
    ellipse(656, 552, 478, 126, "#287f91", `opacity=".96" stroke="#7be8df" stroke-width="4"`) + ellipse(656, 552, 414, 92, "#0e506c", `opacity=".84"`) +
    [390, 510, 642, 781, 907].map((x) => line(x, 490, x + 28, 604, "#a8e8e0", `stroke-width="2" opacity=".18"`)).join(""), defsBase());
  const terrace = svg(rect(0, 635, W, 85, "#0a1115") + line(0, 642, W, 642, "#d4b67d", `stroke-width="2" opacity=".24"`) +
    [60, 180, 298, 1012, 1127, 1225].map((x) => rect(x, 616, 38, 6, "#d2ae6e", `opacity=".44"`)).join(""), defsBase());
  return [sky, trees, facade, pool, terrace];
}

function marbleInterior() {
  const back = svg(rect(0, 0, W, H, "#eff3f3") + rect(0, 500, W, 220, "#6f4d36") +
    rect(76, 72, 230, 362, "#cddce0", `stroke="#ffffff" stroke-width="10"`) + rect(332, 72, 230, 362, "#d3e4e6", `stroke="#ffffff" stroke-width="10"`) +
    rect(101, 98, 180, 288, "#2a667b", `opacity=".54"`) + rect(357, 98, 180, 288, "#315f79", `opacity=".38"`) +
    rect(663, 106, 504, 44, "#ffffff", `opacity=".92"`) + Array.from({ length: 8 }, (_, i) => rect(676 + i * 58, 150, 44, 262, i % 2 ? "#e6e8e7" : "#f5f5f2", `stroke="#bfc3c5" stroke-width="2"`)).join("") +
    pathEl("M0 500 L1280 500 L1280 720 L0 720 Z", "#6b4833"), defsBase());
  const marble = svg(pathEl("M366 400 L855 352 L1038 468 L536 534 Z", "#e6eceb", `stroke="#f9fbfa" stroke-width="4"`) +
    pathEl("M535 534 L1038 468 L1044 520 L543 588 Z", "#b6c7c6", `stroke="#f4f8f6" stroke-width="3"`) +
    pathEl("M403 399 C518 443 660 468 806 442", "none", `stroke="#728e91" stroke-width="3" opacity=".5"`) + pathEl("M553 405 C612 442 679 468 746 470", "none", `stroke="#9ab2b0" stroke-width="2" opacity=".46"`) +
    rect(690, 238, 335, 70, "#d8d9d4", `stroke="#bdc2bf" stroke-width="3"`) + Array.from({ length: 6 }, (_, i) => rect(704 + i * 52, 250, 31, 44, "#a9b0b0", `opacity="${i % 2 ? .7 : .52}"`)).join(""), defsBase());
  const practicals = svg([640, 760, 880, 1000].map((x, i) => `<g><line x1="${x}" y1="0" x2="${x}" y2="110" stroke="#94999c" stroke-width="2"/><ellipse cx="${x}" cy="125" rx="28" ry="13" fill="#fff7db" opacity=".92"/><ellipse cx="${x}" cy="125" rx="54" ry="23" fill="#f5d08a" opacity=".12" filter="url(#glow)"/></g>`).join(""), defsBase());
  const foreground = svg(rect(0, 628, W, 92, "#4a3026") + pathEl("M0 638 C220 613 404 620 628 642 C892 669 1075 658 1280 637 L1280 720 L0 720 Z", "#4c3125") +
    ellipse(190, 597, 45, 12, "#1c2d29", `opacity=".86"`) + rect(168, 542, 44, 58, "#29463b", `rx="2"`), defsBase());
  return [back, marble, practicals, foreground];
}

function gameRoom() {
  const wall = svg(rect(0, 0, W, H, "#070b12") + rect(0, 0, W, 24, "#131d2d") +
    rect(82, 96, 466, 265, "#101e2c", `stroke="#283b52" stroke-width="8"`) + rect(111, 124, 408, 207, "#1f5b72", `stroke="#74e3ea" stroke-width="3"`) +
    pathEl("M130 298 C240 199 317 221 408 142 C452 104 482 141 510 188 L510 331 L130 331 Z", "#8ae8e4", `opacity=".15"`) +
    rect(774, 108, 340, 210, "#231017", `stroke="#a94848" stroke-width="4"`) + rect(807, 141, 274, 144, "#7c302b", `opacity=".9"`) +
    pathEl("M837 259 C901 195 943 221 999 166 C1024 141 1057 168 1082 194 L1082 282 L837 282 Z", "#d08c4a", `opacity=".44"`), defsBase());
  const table = svg(pathEl("M292 462 L916 440 L1094 564 L444 612 Z", "#152d37", `stroke="#86d0c8" stroke-width="4"`) +
    pathEl("M444 612 L1094 564 L1091 595 L442 646 Z", "#402721") +
    [400, 968].map((x) => `<g><line x1="${x}" y1="575" x2="${x - 24}" y2="716" stroke="#2d1b18" stroke-width="18"/><line x1="${x + 92}" y1="560" x2="${x + 120}" y2="696" stroke="#2d1b18" stroke-width="18"/></g>`).join("") +
    [560, 722, 882].map((x, i) => circle(x, 522 - i * 4, 12, i === 1 ? "#f2c65f" : "#f2f4f2", `stroke="#10202c" stroke-width="4"`)).join(""), defsBase());
  const furniture = svg(pathEl("M84 517 C102 465 221 454 301 505 L328 616 L86 630 Z", "#272433", `stroke="#4b3c64" stroke-width="4"`) +
    pathEl("M100 512 C161 476 244 483 293 519 L284 561 L111 561 Z", "#343453") +
    rect(1084, 382, 74, 150, "#2c384b", `rx="8"`) + rect(1101, 397, 40, 116, "#e6b95e", `opacity=".54"`) +
    ellipse(1108, 371, 42, 12, "#e5bf69", `opacity=".32" filter="url(#glow)"`), defsBase());
  const light = svg(line(620, 0, 620, 96, "#607b9e", `stroke-width="3"`) + ellipse(620, 114, 68, 18, "#f0a84c", `opacity=".65"`) + ellipse(620, 114, 142, 32, "#ec9251", `opacity=".12" filter="url(#glow)"`) +
    pathEl("M0 690 C250 632 450 648 642 674 C862 703 1027 687 1280 641 L1280 720 L0 720 Z", "#111d27", `opacity=".92"`), defsBase());
  return [wall, table, furniture, light];
}

function foyer() {
  const wall = svg(rect(0, 0, W, H, "#eef1ee") + rect(0, 544, W, 176, "#705141") +
    pathEl("M0 160 L214 112 L214 545 L0 587 Z", "#d7dddb") + pathEl("M1280 160 L1066 112 L1066 545 L1280 587 Z", "#d7dddb") +
    pathEl("M214 112 L1066 112 L980 544 L300 544 Z", "#f5f5f2") +
    rect(457, 156, 364, 298, "#d9e1df", `stroke="#ffffff" stroke-width="12"`) + rect(482, 180, 314, 250, "#537b8f", `opacity=".35"`) +
    pathEl("M530 166 C620 116 698 116 790 165", "none", `stroke="#8e9c9c" stroke-width="3" opacity=".48"`), defsBase());
  const art = svg(rect(735, 226, 150, 190, "#850f1a", `stroke="#42070e" stroke-width="8"`) + pathEl("M758 384 C788 302 822 312 855 250", "none", `stroke="#f0c36d" stroke-width="10" opacity=".75"`) +
    pathEl("M758 332 C793 348 837 336 864 291", "none", `stroke="#ffdfb1" stroke-width="4" opacity=".7"`), defsBase());
  const stair = svg(stairWedge(1002, 310, 22, 11, "#b7c1bd", -1) + stairWedge(1005, 300, 22, 10, "#d8ddd9", -1) +
    pathEl("M982 300 C890 320 864 415 892 490 C914 550 979 567 1052 537", "none", `stroke="#7d8a88" stroke-width="10"`) +
    pathEl("M964 292 C892 336 882 420 906 474 C932 528 989 540 1040 520", "none", `stroke="#435054" stroke-width="4" opacity=".72"`), defsBase());
  const pendant = svg([390, 640, 890].map((x, i) => `<g><line x1="${x}" y1="0" x2="${x}" y2="${90 + i * 12}" stroke="#88908d" stroke-width="2"/><circle cx="${x}" cy="${108 + i * 12}" r="${24 - i * 3}" fill="#fff5d5" opacity=".92"/><circle cx="${x}" cy="${108 + i * 12}" r="${72 - i * 8}" fill="#f7d889" opacity=".12" filter="url(#glow)"/></g>`).join(""), defsBase());
  const foreground = svg(pathEl("M0 668 C176 624 352 643 514 677 C710 720 998 693 1280 651 L1280 720 L0 720 Z", "#4b3126") +
    rect(88, 482, 128, 22, "#273c36", `rx="4"`) + rect(115, 421, 74, 66, "#49675c", `rx="3"`) + ellipse(153, 414, 58, 14, "#6b957b", `opacity=".54"`), defsBase());
  return [wall, art, stair, pendant, foreground];
}

function frontHero() {
  const sky = svg(rect(0, 0, W, H, "url(#sky)") + circle(966, 135, 42, "#c9dcfa", `opacity=".62"`) + rect(0, 436, W, 284, "#0c181d") +
    [120, 260, 1090, 1210].map((x, i) => tree(x, 304 + (i % 2) * 24, 1.2, "#071619")).join(""), defsBase('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040712"/><stop offset=".6" stop-color="#17365e"/><stop offset="1" stop-color="#61809a"/></linearGradient>'));
  const mass = svg(manorBody(223, 235, 834, 282, "#707886") + polygon("188,236 640,98 1091,236", "#2d374c") +
    turret(300, 175, 62, 341) + turret(978, 174, 62, 342) + manorBody(540, 172, 200, 345, "#7e8691") + polygon("512,173 640,75 767,173", "#2d374c") +
    Array.from({ length: 12 }, (_, i) => warmWindow(278 + i * 64, 302 + (i % 2) * 10, 22, 54, .92)).join("") + rect(600, 371, 80, 146, "#4b3227", `rx="9"`) + rect(616, 386, 48, 131, "#171d25", `rx="8"`), defsBase());
  const entry = svg(column(492, 306, 212) + column(566, 306, 212) + column(714, 306, 212) + column(788, 306, 212) +
    pathEl("M460 518 L820 518 L1020 720 L260 720 Z", "#212b31", `opacity=".98"`) + line(488, 543, 781, 543, "#c5a267", `stroke-width="2" opacity=".44"`) + line(433, 585, 837, 585, "#c5a267", `stroke-width="2" opacity=".3"`), defsBase());
  const drive = svg(pathEl("M405 720 C501 662 554 616 640 592 C726 616 779 662 875 720 Z", "#88919a", `opacity=".42"`) +
    pathEl("M0 678 C246 626 432 641 640 656 C865 672 1062 643 1280 687 L1280 720 L0 720 Z", "#101a1e") +
    line(190, 682, 1086, 690, "#c7d4d4", `stroke-width="3" opacity=".28"`), defsBase());
  const foreground = svg(tree(47, 416, 1.32, "#061519") + tree(1235, 415, 1.35, "#061519") + ellipse(640, 681, 120, 19, "#e7ba67", `opacity=".16" filter="url(#glow)"`), defsBase());
  return [sky, mass, entry, drive, foreground];
}

const shots = [
  { id: "01-aerial", label: "Aerial château / tennis / backyard", layers: aerial(), focal: "court-house seam", move: { x: -22, y: -18, zoom: 0.082, tilt: -0.006 } },
  { id: "02-rear-pool", label: "Rear pool and estate", layers: rearPool(), focal: "pool ellipse", move: { x: 12, y: -14, zoom: 0.072, tilt: 0.004 } },
  { id: "03-marble-living", label: "Bright marble living / kitchen", layers: marbleInterior(), focal: "marble island", move: { x: -18, y: -7, zoom: 0.064, tilt: -0.003 } },
  { id: "04-dark-game", label: "Dark cinema / game room", layers: gameRoom(), focal: "pool table", move: { x: 22, y: -4, zoom: 0.058, tilt: 0.003 } },
  { id: "05-foyer-stairs", label: "Foyer / red art / curved staircase", layers: foyer(), focal: "stair landing", move: { x: -9, y: -24, zoom: 0.068, tilt: -0.004 } },
  { id: "06-front-hero", label: "Front château hero", layers: frontHero(), focal: "front door", move: { x: 0, y: -10, zoom: 0.055, tilt: 0 } },
];

const manifest = { version: 2, width: W, height: H, pipeline: "deterministic layered SVG depth-card projection", shots: [] };
for (const [shotIndex, shot] of shots.entries()) {
  const dir = path.join(OUT, shot.id);
  fs.mkdirSync(dir, { recursive: true });
  const layers = [];
  shot.layers.forEach((markup, index) => {
    const filename = `layer-${String(index).padStart(2, "0")}.svg`;
    fs.writeFileSync(path.join(dir, filename), markup, "utf8");
    layers.push({ src: `assets/layers/${shot.id}/${filename}`, depth: Number((0.12 + index * 0.22).toFixed(2)), name: `${shot.id}-depth-${index + 1}` });
  });
  manifest.shots.push({ index: shotIndex, id: shot.id, label: shot.label, focal: shot.focal, layers, move: shot.move, frameCount: 8 });
}
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
console.log(`depth-assets:generated:${shots.length} shots:${manifest.shots.reduce((sum, shot) => sum + shot.layers.length, 0)} layers`);
