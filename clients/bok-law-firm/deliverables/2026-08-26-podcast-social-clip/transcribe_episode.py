import json
from pathlib import Path

from faster_whisper import WhisperModel


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "episode-58-source.mp3"


def srt_time(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    str(SOURCE),
    beam_size=5,
    vad_filter=True,
    vad_parameters={"min_silence_duration_ms": 450},
    word_timestamps=True,
)

rows = []
for segment in segments:
    rows.append(
        {
            "start": segment.start,
            "end": segment.end,
            "text": segment.text.strip(),
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

(ROOT / "episode-58-transcript.json").write_text(
    json.dumps(
        {
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "segments": rows,
        },
        indent=2,
    ),
    encoding="utf-8",
)

with (ROOT / "episode-58-transcript.srt").open("w", encoding="utf-8") as handle:
    for index, row in enumerate(rows, start=1):
        handle.write(
            f"{index}\n{srt_time(row['start'])} --> {srt_time(row['end'])}\n"
            f"{row['text']}\n\n"
        )

print(json.dumps({"segments": len(rows), "duration": info.duration, "language": info.language}))
