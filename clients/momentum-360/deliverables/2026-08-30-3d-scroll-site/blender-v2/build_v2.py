"""Cloud-ready Blender source for Momentum 360 v2.

The local review uses the deterministic SVG depth-card renderer because this
host does not expose a Blender binary.  This script is the corresponding
Blender 2.5D build: it creates named shot pods, depth cards, bevels, Principled
materials, animated cameras, blue-hour/warm practical lighting, and AgX color
management.  On a Blender-enabled render host run:

    blender -b -P blender-v2/build_v2.py -- --build-only
    blender -b -P blender-v2/build_v2.py -- --render

The web contract stays unchanged when the low-sample Eevee preview frames are
replaced with a Cycles render farm export.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "site-v2" / "assets" / "layers" / "manifest.json"
RENDER_ROOT = ROOT / "blender-v2" / "renders"
BLEND_PATH = ROOT / "blender-v2" / "momentum360-v2-depth-cards.blend"


def args_after_double_dash():
    if "--" not in sys.argv:
        return set()
    return set(sys.argv[sys.argv.index("--") + 1 :])


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)


def collection(name):
    current = bpy.data.collections.get(name)
    if current:
        return current
    current = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(current)
    return current


def move_to_collection(obj, target):
    for owner in list(obj.users_collection):
        owner.objects.unlink(obj)
    target.objects.link(obj)


def make_material(name, color, roughness=0.52, metallic=0.0, emission=None):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    if emission:
        shader.inputs["Emission Color"].default_value = (*emission, 1)
        shader.inputs["Emission Strength"].default_value = 2.5
    links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    return material


def add_card(name, pod, depth, material, texture_path=None):
    bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, -depth * 2.2))
    card = bpy.context.object
    card.name = name
    card.scale = (8.0, 4.5, 1.0)
    card.rotation_euler = (0, 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = card.modifiers.new("Depth card micro bevel", "BEVEL")
    bevel.width = 0.035
    bevel.segments = 2
    card.data.materials.append(material)
    move_to_collection(card, pod)

    if texture_path and texture_path.exists() and texture_path.suffix.lower() in {".png", ".jpg", ".jpeg", ".exr"}:
        image = bpy.data.images.load(str(texture_path), check_existing=True)
        material.use_nodes = True
        nodes = material.node_tree.nodes
        links = material.node_tree.links
        shader = nodes.get("Principled BSDF")
        if shader:
            texture = nodes.new("ShaderNodeTexImage")
            texture.image = image
            texture.interpolation = "Linear"
            links.new(texture.outputs["Color"], shader.inputs["Base Color"])
            links.new(texture.outputs["Alpha"], shader.inputs["Alpha"])
            material.surface_render_method = "DITHERED"
    return card


def add_target(name, location, pod):
    target = bpy.data.objects.new(name, None)
    target.empty_display_type = "PLAIN_AXES"
    target.empty_display_size = 0.25
    target.location = location
    pod.objects.link(target)
    return target


def add_camera(name, location, target_location, pod, lens=43.0):
    data = bpy.data.cameras.new(f"{name} data")
    camera = bpy.data.objects.new(name, data)
    pod.objects.link(camera)
    camera.location = location
    data.lens = lens
    data.sensor_width = 36
    target = add_target(f"{name} target", target_location, pod)
    constraint = camera.constraints.new(type="TRACK_TO")
    constraint.target = target
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"
    return camera, target


def add_practical(name, location, color, energy, pod, size=2.0):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.color = color
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name, data)
    light.location = location
    pod.objects.link(light)
    return light


def configure_scene():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 720
    scene.render.resolution_y = 405
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.use_file_extension = True
    scene.render.fps = 24
    scene.render.image_settings.color_mode = "RGBA"
    scene.world.color = (0.005, 0.008, 0.018)
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except (TypeError, ValueError):
        pass
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 16


def build_pod(shot, pod_index):
    pod = collection(f"M360_V2_POD_{pod_index + 1:02d}_{shot['id']}")
    pod.hide_render = pod_index != 0
    base_colors = [
        (0.014, 0.024, 0.055),
        (0.06, 0.12, 0.19),
        (0.18, 0.22, 0.29),
        (0.34, 0.39, 0.45),
        (0.06, 0.08, 0.10),
    ]
    cards = []
    for layer_index, layer in enumerate(shot["layers"]):
        color = base_colors[layer_index % len(base_colors)]
        if shot["id"] in {"03-marble-living", "05-foyer-stairs"} and layer_index > 0:
            color = (0.48, 0.52, 0.54)
        if shot["id"] == "04-dark-game":
            color = (0.02 + layer_index * 0.012, 0.026, 0.055 + layer_index * 0.012)
        material = make_material(f"M360 V2 {shot['id']} card {layer_index + 1}", color, roughness=0.42 + layer_index * 0.06)
        # PNG texture slots are optional; the generated SVG depth cards remain
        # the authoritative local preview and can be rasterized on a render host.
        texture = ROOT / "blender-v2" / "texture-cache" / shot["id"] / f"layer-{layer_index:02d}.png"
        cards.append(add_card(f"CARD_{shot['id']}_{layer_index + 1:02d}_D{layer['depth']}", pod, layer["depth"], material, texture))

    move = shot.get("move", {})
    camera_start = (0, -18, 7)
    target = (0, 0, 0)
    if shot["id"] == "01-aerial":
        camera_start, target = (19, -23, 19), (0, 1, 0)
    elif shot["id"] == "02-rear-pool":
        camera_start, target = (13, -24, 8), (0, 0, 0)
    elif shot["id"] == "03-marble-living":
        camera_start, target = (8, -12, 3), (0, 0, 0)
    elif shot["id"] == "04-dark-game":
        camera_start, target = (-8, -13, 3.5), (0, 0, 0)
    elif shot["id"] == "05-foyer-stairs":
        camera_start, target = (-7, -15, 4), (0, 0, 1)
    elif shot["id"] == "06-front-hero":
        camera_start, target = (0, -25, 7), (0, 0, 1)
    camera, target_obj = add_camera(f"CAM_{shot['id']}", camera_start, target, pod, lens=46)
    camera.data.dof.use_dof = False
    start_frame = pod_index * 8
    end_frame = start_frame + 7
    camera.keyframe_insert(data_path="location", frame=start_frame)
    camera.location.x += float(move.get("x", 0)) * 0.045
    camera.location.y += float(move.get("y", 0)) * 0.045
    camera.location.z += 0.35
    camera.keyframe_insert(data_path="location", frame=end_frame)
    target_obj.keyframe_insert(data_path="location", frame=start_frame)
    target_obj.location.x += float(move.get("x", 0)) * 0.015
    target_obj.location.z += float(move.get("y", 0)) * -0.008
    target_obj.keyframe_insert(data_path="location", frame=end_frame)
    for fcurve in camera.animation_data.action.fcurves if camera.animation_data and camera.animation_data.action else []:
        for keyframe in fcurve.keyframe_points:
            keyframe.interpolation = "BEZIER"
    add_practical(f"PRACTICAL_{shot['id']}_warm", (0, -2, 11), (1.0, 0.42, 0.12), 280, pod, 4)
    add_practical(f"PRACTICAL_{shot['id']}_cool", (0, 4, 9), (0.12, 0.32, 1.0), 90, pod, 6)
    return pod, camera


def set_visibility(active_pod):
    for pod in [item for item in bpy.data.collections if item.name.startswith("M360_V2_POD_")]:
        pod.hide_render = pod != active_pod


def render_previews(manifest):
    scene = bpy.context.scene
    receipt = []
    for index, shot in enumerate(manifest["shots"]):
        pod_name = f"M360_V2_POD_{index + 1:02d}_{shot['id']}"
        pod = bpy.data.collections[pod_name]
        camera = bpy.data.objects[f"CAM_{shot['id']}"]
        set_visibility(pod)
        scene.camera = camera
        output_dir = RENDER_ROOT / shot["id"]
        output_dir.mkdir(parents=True, exist_ok=True)
        for frame in range(shot.get("frameCount", 8)):
            scene.frame_set(index * 8 + frame)
            destination = output_dir / f"frame-{frame:02d}.png"
            scene.render.filepath = str(destination)
            bpy.ops.render.render(write_still=True)
        receipt.append({"shot": shot["id"], "camera": camera.name, "frames": shot.get("frameCount", 8), "path": str(output_dir)})
        print(f"rendered:{shot['id']}:{shot.get('frameCount', 8)}")
    (ROOT / "blender-v2" / "render-receipt.json").write_text(json.dumps({"engine": scene.render.engine, "resolution": [720, 405], "shots": receipt}, indent=2), encoding="utf-8")


def main():
    if not MANIFEST_PATH.exists():
        raise SystemExit(f"missing manifest: {MANIFEST_PATH}")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    clear_scene()
    configure_scene()
    for index, shot in enumerate(manifest["shots"]):
        build_pod(shot, index)
    bpy.context.scene.frame_start = 0
    bpy.context.scene.frame_end = len(manifest["shots"]) * 8 - 1
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    print(f"blend-saved:{BLEND_PATH}")
    if "--render" in args_after_double_dash():
        render_previews(manifest)
    print("build_v2:complete")


if __name__ == "__main__":
    main()
