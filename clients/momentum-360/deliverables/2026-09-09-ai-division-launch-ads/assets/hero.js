// Shared dimensional hero for the Momentum AI launch ads.
//
// Every spot gets a DIFFERENT form — a repeated shape across a campaign reads
// as a template. What is shared is the lighting, the material and the safety
// math, so all five look like one set and none of them crop.
//
// Determinism contract (hyperframes `three` adapter):
//   - the adapter has NO duration inference, so the composition root MUST
//     carry data-duration
//   - every value below is a pure function of hf-seek time. No
//     requestAnimationFrame, no wall clock, no Math.random.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";

const FOV = 34;
const CAM_Z = 8.0;
const ASPECT = 1920 / 1080;

// Half-width of the frustum at z=0. Anything beyond this is off-frame.
export const FRUSTUM_HALF_W =
  Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z * ASPECT;

const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * @param {object} o
 * @param {string} o.canvas      canvas element id
 * @param {THREE.BufferGeometry} o.geometry
 * @param {number} [o.x]         world x of the hero (positive = right of centre)
 * @param {number} [o.scale]     desired scale; auto-reduced if it would crop
 * @param {number} [o.spin]      y-rotation rate, radians/sec
 * @param {number} [o.color]     material colour
 * @param {number} [o.inAt]      entrance start, seconds
 * @param {number} [o.outAt]     exit start, seconds
 * @param {boolean} [o.allowCrop] skip the auto-fit clamp — for a DELIBERATE
 *                                edge crop. Only pass this when the crop is a
 *                                design decision, never to force a size.
 * @param {(t:number)=>number} [o.xOf] x as a function of time, so the form can
 *                                drift across/behind the type instead of
 *                                sitting in its own column.
 * @param {(t:number)=>number} [o.camZOf] camera z as a function of time, for a
 *                                slow push.
 */
export function mountHero(o) {
  const canvas = document.getElementById(o.canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(1920, 1080, false);
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);

  const x = o.x ?? 2.3;
  const spin = o.spin ?? 0.52;
  const inAt = o.inAt ?? 0.1;
  const outAt = o.outAt ?? 4.35;

  // Fit the form to frame from its OWN bounding sphere rather than a
  // hand-tuned number. The first 3D pass cropped on rotation because the
  // radius was guessed; measuring it makes that impossible.
  o.geometry.computeBoundingSphere();
  const r = o.geometry.boundingSphere.radius;
  const maxScale = ((FRUSTUM_HALF_W * 0.97) - x) / r;
  const scale = o.allowCrop ? (o.scale ?? 0.9) : Math.min(o.scale ?? 0.9, maxScale);

  const mesh = new THREE.Mesh(
    o.geometry,
    new THREE.MeshStandardMaterial({
      color: o.color ?? 0x1d6f9c,
      metalness: 0.42,
      roughness: 0.22,
    })
  );

  const hero = new THREE.Group();
  hero.position.set(x, 0, 0);
  hero.add(mesh);
  scene.add(hero);

  // Key from top-left, brand-lift rim from behind-right. The rim is what
  // produces real specular and edge separation — without it the form reads
  // as a flat silhouette with a blur behind it, which is the failure mode.
  const key = new THREE.DirectionalLight(0xffffff, 3.1);
  key.position.set(-4.5, 5.5, 4.5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x3897cc, 4.4);
  rim.position.set(4.2, -1.8, -3.4);
  scene.add(rim);

  // Ground bounce. A near-black ground colour crushes the lower faces of
  // flat-faceted forms (the icosahedron went almost solid black underneath);
  // lifting it to a deep brand blue keeps them readable without washing out
  // the key/rim separation.
  scene.add(new THREE.HemisphereLight(0xdfefff, 0x16323f, 1.05));

  // Weak fill from below-left, opposite the key, so no facet reads as a hole.
  const fill = new THREE.DirectionalLight(0x9fc6e0, 0.9);
  fill.position.set(-2.6, -3.4, 2.2);
  scene.add(fill);

  function renderAt(time) {
    const inP = easeOutExpo(clamp01((time - inAt) / 1.2));
    const outP = clamp01((time - outAt) / 0.65);
    const s = scale * inP * (1 - outP);

    hero.scale.setScalar(Math.max(s, 0.0001));
    hero.position.x = o.xOf ? o.xOf(time) : x;
    hero.position.y = (1 - inP) * -1.9 + Math.sin(time * 0.9) * 0.075;
    if (o.camZOf) camera.position.z = o.camZOf(time);

    mesh.rotation.y = time * spin;
    mesh.rotation.x = Math.sin(time * 0.42) * 0.2;

    renderer.render(scene, camera);
  }

  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  renderAt(window.__hfThreeTime || 0);

  return { scale, radius: r, maxScale };
}

/** The signature wipe: one hard-edged sweep covering a slide cut. */
export function wipeTween(tl, selector, at) {
  tl.fromTo(
    selector,
    { xPercent: -105 },
    { xPercent: 0, duration: 0.22, ease: "power3.in" },
    at - 0.22
  );
  tl.to(selector, { xPercent: 105, duration: 0.26, ease: "power3.out" }, at);
}
