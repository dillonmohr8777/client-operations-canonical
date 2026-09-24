from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel


SOURCE = Path(r"C:\Users\dillo\AppData\Local\Temp\bigorange-2026-09-03-meeting.mp3")
AUDIO_RAW = Path(r"C:\Users\dillo\AppData\Local\Temp\bigorange-2026-09-03-meeting.f32le")
MODEL = Path(
    r"C:\Users\dillo\.cache\huggingface\hub\models--Systran--faster-whisper-small.en"
    r"\snapshots\d1d751a5f8271d482d14ca55d9e2deeebbae577f"
)
OUTPUT_DIR = Path(__file__).resolve().parent / "evidence"


def stamp(seconds: float) -> str:
    total = max(0, round(seconds))
    hours, rem = divmod(total, 3600)
    minutes, secs = divmod(rem, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(str(MODEL), device="cpu", compute_type="int8")
    audio = np.fromfile(AUDIO_RAW, dtype=np.float32)
    segments_iter, info = model.transcribe(
        audio,
        language="en",
        beam_size=1,
        best_of=1,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 350},
        condition_on_previous_text=True,
        word_timestamps=False,
    )

    segments = []
    transcript_lines = []
    for index, segment in enumerate(segments_iter, start=1):
        text = segment.text.strip()
        if not text:
            continue
        row = {
            "index": index,
            "start": round(segment.start, 3),
            "end": round(segment.end, 3),
            "text": text,
            "words": [
                {
                    "start": round(word.start, 3) if word.start is not None else None,
                    "end": round(word.end, 3) if word.end is not None else None,
                    "word": word.word,
                    "probability": round(word.probability, 5),
                }
                for word in (segment.words or [])
            ],
        }
        segments.append(row)
        transcript_lines.append(f"[{stamp(segment.start)}] {text}")
        if index % 25 == 0:
            print(f"transcribed through {stamp(segment.end)}", flush=True)

    payload = {
        "source": "Fireflies meeting recording 01M0T41R4Z1J3SEXFY2S5F3022",
        "meeting_title": "Paula Rae / Margee/Dillon - Pilot Project Review Next Phase",
        "meeting_date": "2026-09-03T09:00:00-04:00",
        "duration_seconds": 3164.064,
        "language": info.language,
        "language_probability": info.language_probability,
        "model": "Systran/faster-whisper-small.en",
        "segments": segments,
    }
    (OUTPUT_DIR / "meeting-transcript.raw.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUTPUT_DIR / "meeting-transcript.raw.txt").write_text(
        "\n".join(transcript_lines) + "\n", encoding="utf-8"
    )
    print(f"complete: {len(segments)} segments", flush=True)


if __name__ == "__main__":
    main()
