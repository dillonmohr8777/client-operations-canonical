#!/usr/bin/env python3
"""Build the polished cut of the Momentum 360 "AI in Slack" walkthrough.

Improvements over the source:
  * audio brought from -19.6 LUFS to -14 LUFS, de-hissed, 22.05k mono -> 48k stereo
  * accurate captions (soft subtitle track + sidecar SRT)
  * 0.35s dissolves between slides instead of hard cuts
  * brand-purple progress bar
  * 8 embedded chapters + YouTube/Loom chapter list
  * dead air capped at 0.62s (trims only within a slide, never across a boundary)
"""
import json
import os
import re
import subprocess
import sys

SRC = "/home/user/client-operations-canonical/clients/momentum-360/deliverables/2026-07-23-mac-ai-in-slack-5-minute-walkthrough.mp4"
HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(HERE, "out")
WORK = os.path.join(HERE, "buildwork")
DUR = 276.961315
BOUNDS = [0.0, 35.797, 72.555, 107.773, 143.867, 176.172, 211.984, 246.773, DUR]

SILENCE_CAP = 0.62
XFADE = 0.35
TAIL = 0.60
ACCENT = "0x8A5AF7"

SLIDES = [
    "AI is already in Slack",
    "1 · Prioritize the day",
    "2 · Catch up fast",
    "3 · Create a first draft",
    "4 · Prepare a focused meeting",
    "5 · Make it reusable",
    "6 · Guardrails",
    "Start today — three habits",
]

# Corrected narration. Timings from small.en; wording reconciled against
# medium.en and the shooting script.
CAPTIONS = [
    (0.00, 2.14, "We already have AI inside Slack."),
    (3.18, 6.84, "You do not need another website or a new workflow to get started."),
    (7.86, 14.18, "Click Chat with Slackbot AI in the top bar, or use Control, Shift, O on Windows."),
    (15.38, 17.42, "This opens your private work assistant."),
    (18.52, 26.86, "It can use the Slack channels and documents you already have permission to see, "
                   "and it cannot give you access to anything outside those permissions."),
    (27.82, 35.30, "The goal is simple: use AI to find context, organize work, "
                   "and create a first draft without leaving Slack."),
    (36.52, 38.74, "This is the fastest way to start the day."),
    (39.80, 46.88, "Ask which direct messages or mentions need your attention first, "
                   "and request the top five with links and next actions."),
    (47.92, 52.36, "A specific format turns a general answer into something you can use immediately."),
    (53.12, 61.22, "If the first result is too broad, follow up with \"only include client work,\" "
                   "or \"turn this into a checklist.\""),
    (62.48, 65.26, "You do not need to rewrite the full prompt every time."),
    (66.34, 72.02, "Keep the conversation focused and use short follow-ups "
                   "until the output matches the way you work."),
    (73.18, 80.00, "When a channel moves quickly, name the channel, give a time window, "
                   "and ask for a specific output."),
    (81.10, 86.00, "Decisions, action items, owners, and open questions is a useful default."),
    (87.20, 92.28, "You can also paste a link to one Slack thread "
                   "and ask for only the context in that thread."),
    (93.52, 97.26, "This works well before a meeting or when you have been away for part of the day."),
    (98.26, 101.62, "Always open the linked messages before you rely on the summary."),
    (102.72, 107.62, "The assistant saves reading time, but the source messages remain the final record."),
    (108.58, 111.30, "AI is best used as a first-draft partner."),
    (112.40, 118.28, "Give it the thread, tell it the structure you want, "
                     "and explicitly say not to send anything."),
    (119.46, 126.00, "Completed work, blockers, and next step is a strong format for most client updates."),
    (126.02, 131.42, "Then review the names, dates, numbers, commitments, and tone "
                     "before the message leaves Slack."),
    (132.38, 138.02, "If the draft feels generic, ask it to make the wording warmer, shorter, or more direct."),
    (139.26, 143.32, "The account manager is still responsible for the final client communication."),
    (144.68, 147.44, "Give the meeting length, the person, and the sources."),
    (148.58, 151.84, "Then refine the result with short follow-ups such as"),
    (152.34, 157.22, "\"make it shorter,\" \"put the decision first,\" or \"turn this into a checklist.\""),
    (158.06, 165.04, "This is especially useful when you have ten minutes before a call "
                     "and need the key context without rereading a week of Slack."),
    (166.16, 171.78, "A good agenda should make the desired decision clear, "
                     "identify any unresolved questions,"),
    (172.36, 175.56, "and leave the last few minutes for owners and next steps."),
    (177.06, 180.50, "Slackbot is personal, but the work can still be collaborative."),
    (181.22, 187.14, "When a prompt works well, share the exact prompt "
                     "and the reviewed result in the relevant channel."),
    (188.22, 192.36, "That gives the team a reusable starting point instead of a one-time answer."),
    (193.58, 197.18, "Save the best prompts for recurring work such as morning priorities,"),
    (197.92, 201.94, "weekly client summaries, meeting preparation, and quality checks."),
    (203.08, 206.70, "Remember that each person's answers follow their own Slack access,"),
    (207.34, 211.80, "so two people may get different context if their channel permissions are different."),
    (213.06, 220.58, "Never paste passwords, API keys, MFA codes, payment details, "
                     "or sensitive client data into a prompt."),
    (221.60, 227.08, "Verify the facts that matter, especially names, numbers, dates, and commitments."),
    (227.96, 230.86, "AI can draft, summarize, and organize,"),
    (231.46, 237.58, "but it should not send, publish, spend, or change an account "
                     "without the responsible human's approval."),
    (238.70, 246.20, "If a response makes a claim that is not linked to a source, ask the assistant "
                     "to show where it came from or mark it as needing verification."),
    (247.60, 254.18, "The three habits are simple: give context, ask for a format, "
                     "and review before action."),
    (255.46, 259.10, "Start small. Use one real prompt today,"),
    (259.64, 265.78, "check the source, improve the result with one follow-up, "
                     "and save the version that works for the team."),
    (266.80, 276.42, "One real prompt, one reviewed result, and one saved template is enough to turn AI "
                     "from a novelty into a repeatable part of the account manager workflow."),
]


def run(args, **kw):
    r = subprocess.run(args, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        sys.exit(f"FAILED: {' '.join(args[:9])}...\n{r.stderr[-2500:]}")
    return r


def detect_silences():
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", SRC,
                          "-af", "silencedetect=noise=-34dB:d=0.30", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    s = [float(m) for m in re.findall(r"silence_start: *([0-9.]+)", out)]
    e = [float(m) for m in re.findall(r"silence_end: *([0-9.]+)", out)]
    return list(zip(s, e))


def crosses_boundary(a, b):
    return any(a < x < b for x in BOUNDS[1:-1])


def build_plan():
    """Return (keep_intervals, removed_total)."""
    removes = []
    for s, e in detect_silences():
        gap = e - s
        if gap <= SILENCE_CAP:
            continue
        rs, re_ = s + SILENCE_CAP, e
        if re_ - rs < 0.06:
            continue
        if crosses_boundary(rs, re_):
            continue           # never trim across a slide change
        removes.append((rs, re_))
    # trailing silence: leave a clean tail
    if removes and removes[-1][1] > DUR - 0.05:
        removes[-1] = (removes[-1][0], DUR)
    removes.sort()
    keeps, cur = [], 0.0
    for rs, re_ in removes:
        if rs > cur + 0.01:
            keeps.append((cur, rs))
        cur = re_
    if cur < DUR - 0.01:
        keeps.append((cur, DUR))
    return keeps, sum(b - a for a, b in removes)


def make_map(keeps):
    cum, table = 0.0, []
    for a, b in keeps:
        table.append((a, b, cum))
        cum += b - a
    def m(t):
        for a, b, base in table:
            if t < a:
                return base
            if t <= b:
                return base + (t - a)
        return cum
    return m, cum


def wrap(text, width=48):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > width:
            lines.append(cur); cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines


def split_text(text, maxlen=96, minpart=24):
    """Split a long sentence into cue-sized chunks, preferring punctuation breaks."""
    text = text.strip()
    if len(text) <= maxlen:
        return [text]
    mid = len(text) / 2
    for pattern in (r"[,;:]\s", r"\s"):
        cands = [m.end() if pattern.startswith("[") else m.start()
                 for m in re.finditer(pattern, text)]
        cands = [c for c in cands if minpart <= c <= len(text) - minpart]
        if cands:
            b = min(cands, key=lambda i: abs(i - mid))
            return split_text(text[:b], maxlen, minpart) + split_text(text[b:], maxlen, minpart)
    return [text]


def make_cues(mapfn):
    """Split corrected sentences into <=2-line cues, timed proportionally."""
    cues = []
    for s, e, text in CAPTIONS:
        chunks = split_text(text)
        total = sum(len(c) for c in chunks) or 1
        t = s
        for c in chunks:
            d = (e - s) * len(c) / total
            ns, ne = mapfn(t), mapfn(min(t + d, e))
            if ne - ns > 0.25:
                cues.append((ns, ne, "\n".join(wrap(c))))
            t += d
    cues.sort()
    for i in range(len(cues) - 1):      # no overlaps
        if cues[i][1] > cues[i + 1][0]:
            cues[i] = (cues[i][0], max(cues[i][0] + 0.2, cues[i + 1][0] - 0.02), cues[i][2])
    return cues


def ts(t, comma=True):
    h, rem = divmod(max(0.0, t), 3600)
    m, s = divmod(rem, 60)
    ms = int(round((s - int(s)) * 1000))
    s = int(s)
    if ms == 1000:
        s, ms = s + 1, 0
    sep = "," if comma else "."
    return f"{int(h):02d}:{int(m):02d}:{s:02d}{sep}{ms:03d}"


def main():
    os.makedirs(OUTDIR, exist_ok=True)
    os.makedirs(WORK, exist_ok=True)

    keeps, removed = build_plan()
    mapfn, newdur = make_map(keeps)
    print(f"keep intervals={len(keeps)}  removed={removed:.2f}s  "
          f"new duration={newdur:.2f}s (was {DUR:.2f}s)")

    nb = [mapfn(b) for b in BOUNDS]
    durs = [nb[i + 1] - nb[i] for i in range(8)]
    print("slide durations:", " ".join(f"{d:.2f}" for d in durs))

    # ---------- audio ----------
    print("building audio…")
    parts = "".join(f"[0:a]atrim=start={a:.4f}:end={b:.4f},asetpts=PTS-STARTPTS[a{i}];"
                    for i, (a, b) in enumerate(keeps))
    concat = "".join(f"[a{i}]" for i in range(len(keeps))) + f"concat=n={len(keeps)}:v=0:a=1[ac]"
    run(["ffmpeg", "-y", "-v", "error", "-i", SRC,
         "-filter_complex", parts + concat, "-map", "[ac]",
         "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", f"{WORK}/a_raw.wav"])

    meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", f"{WORK}/a_raw.wav",
                           "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=summary",
                           "-f", "null", "-"], capture_output=True, text=True).stderr
    g = {k: re.search(rf"Input {k}: *(-?[0-9.]+)", meas) for k in
         ("Integrated", "True Peak", "LRA", "Threshold")}
    if all(g.values()):
        ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={g['Integrated'].group(1)}"
              f":measured_TP={g['True Peak'].group(1)}:measured_LRA={g['LRA'].group(1)}"
              f":measured_thresh={g['Threshold'].group(1)}:linear=true")
        print(f"  measured I={g['Integrated'].group(1)} LUFS -> targeting -14")
    else:
        ln = "loudnorm=I=-14:TP=-1.5:LRA=11"
        print("  two-pass parse failed, single-pass")
    af = (f"highpass=f=70,afftdn=nr=8:nf=-32,equalizer=f=3000:t=q:w=1.2:g=1.5,"
          f"{ln},alimiter=limit=0.94,"
          f"afade=t=in:st=0:d=0.08,afade=t=out:st={newdur - 0.35:.3f}:d=0.35")
    run(["ffmpeg", "-y", "-v", "error", "-i", f"{WORK}/a_raw.wav", "-af", af,
         "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k", f"{WORK}/audio.m4a"])

    # ---------- stills ----------
    print("extracting slide stills…")
    for i in range(8):
        mid = (BOUNDS[i] + BOUNDS[i + 1]) / 2
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{mid:.3f}", "-i", SRC,
             "-frames:v", "1", f"{WORK}/slide{i+1}.png"])

    # ---------- video ----------
    print("building video (dissolves + progress bar)…")
    ins, fc = [], ""
    for i in range(8):
        # every still carries one XFADE of overlap; the last gets extra headroom
        # so the video never ends short of the audio (mux trims with -shortest).
        d = durs[i] + XFADE + (0.8 if i == 7 else 0.0)
        ins += ["-loop", "1", "-t", f"{d:.4f}", "-i", f"{WORK}/slide{i+1}.png"]
        fc += f"[{i}:v]scale=1920:1080,fps=30,format=yuv420p,setsar=1[v{i}];"
    prev, off = "v0", 0.0
    for i in range(1, 8):
        off += durs[i - 1] - (XFADE if i > 1 else 0.0)
        # offset = when the dissolve starts on the accumulated stream
        off_start = sum(durs[:i]) - XFADE
        fc += (f"[{prev}][v{i}]xfade=transition=fade:duration={XFADE}"
               f":offset={off_start:.4f}[x{i}];")
        prev = f"x{i}"
    # Progress bar: a static dim track plus a purple bar slid in from the left.
    # drawbox cannot animate width (it evaluates w once, and w=0 means "to edge"),
    # so the moving part is an overlay, whose x does honour per-frame `t`.
    ins += ["-f", "lavfi", "-i", f"color=c={ACCENT}:s=1920x6:r=30:d={newdur + 2:.3f}"]
    fc += (f"[{prev}]drawbox=x=0:y=1074:w=iw:h=6:color=white@0.10:t=fill[track];"
           f"[track][8:v]overlay=x='-1920+1920*t/{newdur:.4f}':y=1074[vout]")
    run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fc, "-map", "[vout]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
         "-profile:v", "high", "-level", "4.1", "-g", "60", f"{WORK}/video.mp4"])

    # ---------- captions ----------
    cues = make_cues(mapfn)
    srt = os.path.join(OUTDIR, "ai-in-slack-captions.srt")
    with open(srt, "w") as fh:
        for i, (s, e, t) in enumerate(cues, 1):
            fh.write(f"{i}\n{ts(s)} --> {ts(e)}\n{t}\n\n")
    print(f"captions: {len(cues)} cues -> {os.path.basename(srt)}")

    # ---------- chapters ----------
    meta = os.path.join(WORK, "chapters.ffmeta")
    yt = os.path.join(OUTDIR, "ai-in-slack-chapters.txt")
    with open(meta, "w") as fh, open(yt, "w") as fy:
        fh.write(";FFMETADATA1\ntitle=AI in Slack in 5 Minutes\nartist=Momentum 360\n")
        for i, name in enumerate(SLIDES):
            fh.write(f"[CHAPTER]\nTIMEBASE=1/1000\nSTART={int(nb[i]*1000)}\n"
                     f"END={int(nb[i+1]*1000)}\ntitle={name}\n")
            fy.write(f"{int(nb[i]//60)}:{int(nb[i]%60):02d}  {name}\n")

    # ---------- mux ----------
    out = os.path.join(OUTDIR, "ai-in-slack-5-minute-walkthrough-polished.mp4")
    print("muxing…")
    run(["ffmpeg", "-y", "-v", "error", "-i", f"{WORK}/video.mp4", "-i", f"{WORK}/audio.m4a",
         "-i", srt, "-i", meta,
         "-map", "0:v", "-map", "1:a", "-map", "2:s", "-map_metadata", "3",
         "-c:v", "copy", "-c:a", "copy", "-c:s", "mov_text", "-shortest",
         "-metadata:s:s:0", "language=eng", "-movflags", "+faststart", out])

    print(f"\nwrote {out}")
    json.dump({"new_duration": newdur, "removed": removed,
               "new_bounds": nb, "slide_durations": durs, "cues": len(cues)},
              open(os.path.join(WORK, "plan.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
