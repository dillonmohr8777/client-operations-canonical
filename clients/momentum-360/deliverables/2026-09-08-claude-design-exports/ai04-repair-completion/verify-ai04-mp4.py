from pathlib import Path
import datetime
import hashlib
import json
import subprocess

from PIL import Image, ImageDraw


base = Path(__file__).parent
out = base / "opaque-review-mp4"


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(args):
    return subprocess.check_output(args, creationflags=subprocess.CREATE_NO_WINDOW)


films = read(out / "encode-receipt.json")
if isinstance(films, dict):
    films = [films]
assert len(films) == 2

verified = []
for film in films:
    path = Path(film["path"])
    probe = json.loads(run([
        "ffprobe", "-v", "error",
        "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames",
        "-show_entries", "format=duration,size", "-of", "json", str(path),
    ]))
    streams = probe["streams"]
    stream = streams[0]
    dimensions = (1920, 1080) if "16x9" in film["name"] else (1080, 1920)
    assert len(streams) == 1
    assert stream["codec_type"] == "video" and stream["codec_name"] == "h264"
    assert (stream["width"], stream["height"]) == dimensions
    assert stream["r_frame_rate"] == "30/1" and int(stream["nb_frames"]) == 540
    assert abs(float(probe["format"]["duration"]) - 18) < 0.001
    digest = sha256(path)
    assert digest.upper() == film["sha256"].upper()

    contact = out / (film["name"] + "-mp4-contact.jpg")
    samples = [42, 165, 282, 390, 539]
    selector = "+".join("eq(n\\," + str(frame) + ")" for frame in samples)
    width = 480 if dimensions[0] > dimensions[1] else 270
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(path),
        "-vf", "select=" + selector + ",scale=" + str(width) + ":-1,tile=5x1",
        "-frames:v", "1", "-q:v", "2", str(contact),
    ])
    image = Image.open(contact).convert("RGB")
    sheet = Image.new("RGB", (image.width, image.height + 30), "#e8edf1")
    sheet.paste(image, (0, 30))
    ImageDraw.Draw(sheet).text(
        (8, 8),
        film["name"] + " | 1.4, 5.5, 9.4, 13, 17.97 seconds | extracted MP4",
        fill="#102d49",
    )
    sheet.save(contact, quality=92)
    verified.append({
        "name": film["name"],
        "path": str(path),
        "sha256": digest,
        "probe": probe,
        "contact": str(contact),
        "audio": "silent",
        "alpha": False,
    })

record = {
    "count": len(verified),
    "verifiedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "films": verified,
}
(base / "mp4-verification.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
print(json.dumps({"verifiedMP4s": len(verified), "contacts": len(verified)}))
