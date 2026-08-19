# Audiobook Factory

Turns a catalogue of online courses into distribution-ready audiobooks.
Built for the Global Leader Solutions job (20+ courses, 10-30 pages each) but
client-agnostic: every client-specific value lives in a job file and a lexicon.

```
source files            script                 audio                  package
---------------------   --------------------   --------------------   -------------------
.docx .pdf .md .txt     chapterize             TTS per segment        chaptered .m4b
.vtt .srt (video)  -->  normalize for ear -->  master to profile -->  per-chapter files
.html                   flag visual-only       loudness + room tone   RSS feed, manifest
                        segment for API        cached by hash         QA report (pass/fail)
```

## Why this exists rather than pasting text into a TTS tool

Course text is written for a screen. Turned into audio unedited it says
"see the diagram below" to someone driving. The pipeline finds those lines
before narration, not after.

- **Ingest** handles the formats a course actually ships in, including video
  captions (`.vtt`/`.srt`), which is usually where the real content lives.
- **Flagging** catches on-screen instructions, worksheet blanks, download
  prompts, raw URLs and email addresses, and reports them for a human edit.
- **Lexicon** locks pronunciation per client. The moment a listener flags a
  mispronounced name it goes in the lexicon and never recurs.
- **Caching** is content-hashed, so a run that dies at chapter 18 of 20 resumes
  without re-paying for chapters 1-17.
- **QA** is a hard gate with measured numbers, not a listen-through.

## Quick start

```bash
node bin/afx.js providers                              # which engines have keys
node bin/afx.js estimate --courses 20 --pages 10-30    # cost before committing
node bin/afx.js estimate jobs/my-job.json              # exact cost from real files
node bin/afx.js script  jobs/my-job.json               # script + human-edit flags
node bin/afx.js build   jobs/my-job.json --provider local     # free proof pass
node bin/afx.js build   jobs/my-job.json --provider elevenlabs # delivery pass
npm test
```

## The two-pass method

Run every book twice. This is the whole cost discipline.

1. **Proof pass** on `--provider local` (espeak-ng, offline, free, no key).
   It produces the same chapter splits, the same runtimes, the same packaging
   and the same QA report as a paid run. You catch a bad chapter break on page
   300, a mispronounced client term, or a missing source file for nothing.
2. **Delivery pass** on the paid engine, once the script is signed off.

The proof voice is never a deliverable. It exists so the paid run happens once.

## Engines

| id | engine | delivery rate | notes |
|---|---|---|---|
| `local` | espeak-ng | free | offline proof voice, no key, never shipped |
| `elevenlabs` | ElevenLabs | $100 / 1M chars | best long-form prosody; clones the author's voice |
| `openai` | OpenAI TTS | $15 / 1M chars | cheapest credible delivery voice; stock voices only |
| `google` | Google Chirp 3 HD | $30 / 1M chars | 1,000,000 free chars/month |
| `azure` | Azure Neural HD | $22 / 1M chars | $7.50 on a commitment tier; good if already on Azure |

Rates are read from `config/pricing.json`, which carries a `verified` and an
`expires` date. `afx providers` warns when the table is stale. Re-verify before
quoting.

Keys are read from the environment at call time and are never logged or stored:
`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_TTS_API_KEY`,
`AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`.

ElevenLabs runs pass `previous_text`/`next_text` between segments so prosody
carries across chunk boundaries and the seams stop being audible.

## Output profiles

`config/profiles/*.json` defines the delivery spec and the QA thresholds.

| profile | target | use |
|---|---|---|
| `podcast` | -16 LUFS, -1.5 dBTP, 128k mono MP3 | private feed, Spotify, Apple |
| `acx` | -20 dB RMS (+/-2.5), peak <= -3 dB, floor <= -60 dB, 192k | Audible/ACX retail spec |
| `lms` | -16 LUFS, 96k mono AAC | companion audio inside a course platform |

**ACX caveat:** ACX's submission requirements call for human narration unless
otherwise authorised, and list unauthorised text-to-speech and AI recordings as
prohibited. The `acx` profile exists so a master *meets the technical spec*; it
does not make an AI-narrated file eligible for ACX. Confirm the distribution
path in writing before promising Audible. See `docs/distribution.md`.

## Job files

```jsonc
{
  "title": "Course Title",
  "author": "Author Name",
  "profile": "podcast",              // podcast | acx | lms
  "provider": "local",               // overridden by --provider
  "lexiconFile": "../config/lexicon/client.json",
  "outDir": "../out/course-title",
  "feedBaseUrl": "https://cdn.example.com/course",   // omit to skip RSS
  "credits": { "opening": "...", "closing": "..." },
  "sources": [{ "file": "../source/module-01.docx", "title": "Module One" }]
}
```

## Outputs

```
out/<title>/
  script.json          every chapter and segment, with content hashes
  script.md            chapter table + the human-edit flag list
  chapters/            mastered per-chapter files
  <title>.m4b          single chaptered audiobook
  chapters.txt         timecoded chapter sheet
  feed.xml             private-podcast RSS (when feedBaseUrl is set)
  manifest.json        durations, bytes, and what the run actually cost
  qa-report.md/.json   measured pass/fail per file
  .cache/<provider>/   content-hashed audio; delete to force re-synthesis
```

## What QA checks

Measured with ffmpeg, per file: integrated loudness (or RMS on ACX), true peak,
noise floor at the 5th-percentile frame RMS, longest continuous silence
(catches a segment that failed to synthesize), runtime against the profile cap,
and runtime against the book average (catches truncated chapters).

QA does not judge pronunciation or tone. A human still listens before delivery.

## Requirements

`node >= 20`, `ffmpeg`, `python3`. `espeak-ng` for the proof voice.
`pypdf` only if PDF sources are used.

## Layout

```
bin/afx.js              CLI
lib/extract.py          docx/pdf/vtt/srt/html -> structured text
lib/script.js           chapterize, normalize, flag, segment
lib/providers/          one adapter per engine, one interface
lib/master.js           shaping, loudness, room tone, encode
lib/packager.js         M4B chapters, RSS, chapter sheet, manifest
lib/qa.js               measurement and pass/fail
lib/cost.js             pricing math and catalogue sizing
config/pricing.json     dated, sourced vendor rates
config/profiles/        delivery specs
config/lexicon/         per-client pronunciation
```
