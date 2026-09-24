import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


OUTPUT_DIR = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-30-3d-scroll-site\site\assets\frames"
)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def look_at(camera, target):
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def clone_camera(source_name, new_name, location, target, lens):
    source = bpy.data.objects[source_name]
    camera = source.copy()
    camera.data = source.data.copy()
    camera.name = new_name
    camera.data.name = f"{new_name} data"
    bpy.context.collection.objects.link(camera)
    camera.location = location
    camera.data.lens = lens
    look_at(camera, target)
    return camera


scene = bpy.context.scene
scene.render.resolution_x = 1600
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = False

if hasattr(scene, "eevee"):
    scene.eevee.taa_render_samples = 32

try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE"

scene.view_settings.look = "AgX - Medium High Contrast"

exterior_aerial = clone_camera(
    "Exterior hero camera",
    "Scroll 01 aerial",
    (11.8, -20.8, 10.4),
    (0.0, 0.4, 1.8),
    51.0,
)
exterior_close = clone_camera(
    "Exterior hero camera",
    "Scroll 07 exterior close",
    (8.5, -14.5, 5.1),
    (0.0, 0.2, 2.2),
    43.0,
)

shots = [
    ("01-aerial-arrival", exterior_aerial),
    ("02-exterior-hero", bpy.data.objects["Exterior hero camera"]),
    ("03-living-kitchen", bpy.data.objects["Living kitchen camera"]),
    ("04-interior-360", bpy.data.objects["Interior 360 panorama"]),
    ("05-bedroom-suite", bpy.data.objects["Bedroom suite camera"]),
    ("06-spa-bathroom", bpy.data.objects["Spa bathroom camera"]),
    ("07-exterior-close", exterior_close),
]

receipt = []
for index, (slug, camera) in enumerate(shots, start=1):
    scene.camera = camera
    scene.render.filepath = str(OUTPUT_DIR / f"{slug}.png")
    bpy.ops.render.render(write_still=True)
    receipt.append(
        {
            "index": index,
            "slug": slug,
            "camera": camera.name,
            "location": [round(value, 4) for value in camera.location],
            "rotation": [round(value, 6) for value in camera.rotation_euler],
            "lens": camera.data.lens,
            "path": scene.render.filepath,
        }
    )
    print(f"rendered:{slug}:{scene.render.filepath}")

(OUTPUT_DIR / "render-receipt.json").write_text(
    json.dumps(
        {
            "sourceBlend": bpy.data.filepath,
            "engine": scene.render.engine,
            "resolution": [scene.render.resolution_x, scene.render.resolution_y],
            "shots": receipt,
        },
        indent=2,
    ),
    encoding="utf-8",
)
print("render_keyframes:complete")
