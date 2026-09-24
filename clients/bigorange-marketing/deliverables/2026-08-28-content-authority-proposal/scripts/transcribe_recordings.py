import json
from pathlib import Path

from faster_whisper import WhisperModel


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "source" / "recordings"
OUTPUT_DIR = ROOT / "working" / "transcripts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SOURCES = [
    SOURCE_DIR / "call-recording-2.m4a",
    SOURCE_DIR / "call-recording.m4a",
]

INITIAL_PROMPT = (
    "BigOrange Marketing. Janice Brewster Weiser, Dillon Mohr, Margee Moore, "
    "Emelia Pitlick, Paula Rae. SEO, AEO, GEO, Semrush, Moz, WordPress, HubSpot, "
    "authority content, custom home builders, keyword research, blogs, articles, "
    "thought leadership, backlinks, schema markup, conversion tracking."
)


def srt_time(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


def transcribe(source: Path, model: WhisperModel) -> dict:
    segments, info = model.transcribe(
        str(source),
        language="en",
        beam_size=5,
        temperature=0,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 400},
        word_timestamps=True,
        condition_on_previous_text=True,
        initial_prompt=INITIAL_PROMPT,
    )

    rows = []
    for segment in segments:
        rows.append(
            {
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip(),
                "avg_logprob": segment.avg_logprob,
                "no_speech_prob": segment.no_speech_prob,
                "words": [
                    {
                        "start": word.start,
                        "end": word.end,
                        "word": word.word,
                        "probability": word.probability,
                    }
                    for word in (segment.words or [])
                ],
            }
        )

    stem = source.stem
    payload = {
        "source": source.name,
        "model": "small.en",
        "device": "cpu",
        "compute_type": "int8",
        "language": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration,
        "segments": rows,
    }

    (OUTPUT_DIR / f"{stem}.json").write_text(
        json.dumps(payload, indent=2), encoding="utf-8"
    )

    with (OUTPUT_DIR / f"{stem}.srt").open("w", encoding="utf-8") as handle:
        for index, row in enumerate(rows, start=1):
            handle.write(
                f"{index}\n{srt_time(row['start'])} --> {srt_time(row['end'])}\n"
                f"{row['text']}\n\n"
            )

    transcript_lines = [
        f"[{srt_time(row['start']).replace(',', '.')} - "
        f"{srt_time(row['end']).replace(',', '.')}] {row['text']}"
        for row in rows
    ]
    (OUTPUT_DIR / f"{stem}.txt").write_text(
        "\n".join(transcript_lines) + "\n", encoding="utf-8"
    )

    return {
        "source": source.name,
        "duration_seconds": info.duration,
        "segments": len(rows),
        "language": info.language,
        "language_probability": info.language_probability,
    }


def main() -> None:
    missing = [str(path) for path in SOURCES if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Missing source recordings: {missing}")

    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    results = [transcribe(source, model) for source in SOURCES]
    (OUTPUT_DIR / "transcription-manifest.json").write_text(
        json.dumps(results, indent=2), encoding="utf-8"
    )
    print(json.dumps(results))


if __name__ == "__main__":
    main()
