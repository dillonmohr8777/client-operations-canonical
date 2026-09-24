import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type LogoVariant = 'mark' | 'wordmark' | 'm360';

type PointCloud = {
  scatter: Float32Array;
  target: Float32Array;
  colors: Float32Array;
  phases: Float32Array;
};

const vertexShader = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uDrift;
  uniform float uPointBase;
  uniform float uPointVariance;
  uniform float uPointSettle;
  attribute vec3 aTarget;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vGlow;
  varying float vResolved;

  void main() {
    float settled = smoothstep(0.0, 1.0, uMorph);
    vec3 p = mix(position, aTarget, settled);
    float noise = sin(uTime * 0.72 + aPhase * 6.2831 + position.x * 0.72);
    float curl = cos(uTime * 0.54 + aPhase * 9.2 + position.y * 1.35);
    float freedom = 1.0 - settled;
    p.y += noise * 0.12 * freedom;
    p.x += curl * 0.07 * freedom;
    p.z += sin(uTime * 0.44 + aPhase * 13.0) * 0.13 * freedom;
    p.y += uDrift * (0.08 + aPhase * 0.06) * freedom;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    float depthScale = clamp(8.0 / -mvPosition.z, 0.55, 2.2);
    gl_PointSize = (uPointBase + aPhase * uPointVariance + settled * uPointSettle) * depthScale;
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    vGlow = settled * 0.09 + (1.0 - settled) * (0.16 + aPhase * 0.18);
    vResolved = settled;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vGlow;
  varying float vResolved;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float crispEdge = mix(0.13, 0.34, vResolved);
    float core = 1.0 - smoothstep(crispEdge, 0.5, d);
    float halo = (1.0 - smoothstep(0.22, 0.5, d)) * vGlow;
    gl_FragColor = vec4(vColor * (1.0 + halo), core * mix(0.88, 0.98, vResolved));
  }
`;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function buildLogoCloud(variant: LogoVariant, count: number, compact: boolean): Promise<PointCloud> {
  const isMark = variant === 'mark';
  const isM360 = variant === 'm360';
  const image = new Image();
  image.decoding = 'async';
  image.src = isM360 ? '/assets/brand/momentum-360-logo.png' : '/assets/brand/need-momentum-logo.png';
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = isMark ? 320 : 1000;
  canvas.height = isMark ? 320 : isM360 ? 270 : 230;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Logo sampling canvas is unavailable.');

  context.clearRect(0, 0, canvas.width, canvas.height);
  if (isMark) {
    // Isolate the first connected brand mark before sampling. The source file also
    // contains the MOMENTUM wordmark; measuring only its left-hand square prevents
    // the first letter from appearing as a detached vertical particle stroke.
    const probe = document.createElement('canvas');
    probe.width = Math.min(image.naturalWidth, Math.ceil(image.naturalHeight * 1.17));
    probe.height = image.naturalHeight;
    const probeContext = probe.getContext('2d', { willReadFrequently: true });
    if (!probeContext) throw new Error('Logo crop canvas is unavailable.');
    probeContext.drawImage(image, 0, 0);
    const probePixels = probeContext.getImageData(0, 0, probe.width, probe.height).data;
    let minX = probe.width;
    let minY = probe.height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < probe.height; y += 1) {
      for (let x = 0; x < probe.width; x += 1) {
        if (probePixels[(y * probe.width + x) * 4 + 3] < 56) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    const pad = 4;
    const sourceX = Math.max(0, minX - pad);
    const sourceY = Math.max(0, minY - pad);
    const sourceWidth = Math.max(1, Math.min(probe.width - sourceX, maxX - minX + 1 + pad * 2));
    const sourceHeight = Math.max(1, Math.min(probe.height - sourceY, maxY - minY + 1 + pad * 2));
    const scale = Math.min((canvas.width - 36) / sourceWidth, (canvas.height - 36) / sourceHeight);
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  } else {
    const scale = Math.min((canvas.width - 30) / image.naturalWidth, (canvas.height - 30) / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const candidates: Array<[number, number, number, number, number]> = [];
  const step = 2;
  const alphaFloor = isM360 ? 132 : isMark ? 76 : 88;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const offset = (y * canvas.width + x) * 4;
      if (pixels[offset + 3] < alphaFloor) continue;
      candidates.push([x, y, pixels[offset], pixels[offset + 1], pixels[offset + 2]]);
    }
  }

  const random = seededRandom(isMark ? 360 : isM360 ? 9360 : 720);
  const scatter = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const blue = new THREE.Color('#2f82ff');
  // Shader attributes are consumed as raw linear values, so set the supplied
  // logo RGB directly to preserve #2A80C2 instead of darkening it twice.
  const logoBlue = new THREE.Color().setRGB(42 / 255, 128 / 255, 194 / 255);
  const cyan = new THREE.Color('#7be7ff');
  const yellow = new THREE.Color('#ffc72c');
  const violet = new THREE.Color('#8f7cff');

  for (let index = 0; index < count; index += 1) {
    const t = index / count;
    const strand = index % 4;
    const spread = Math.pow(random(), 1.8);
    const sx = (t - 0.5) * (isMark ? 9.6 : isM360 ? 12.2 : 11.4) + (random() - 0.5) * spread * 1.5;
    const baseWave = strand < 2 ? Math.sin(t * Math.PI * (2.25 + strand * 0.7)) : Math.cos(t * Math.PI * (2.7 + strand * 0.35));
    const sy = baseWave * (0.72 + strand * 0.18) + (random() - 0.5) * spread * 1.45;
    const sz = (random() - 0.5) * (2.1 + spread * 2.2);
    scatter.set([sx, sy, sz], index * 3);

    const binStart = (index * candidates.length) / count;
    const binEnd = ((index + 1) * candidates.length) / count;
    const candidateIndex = candidates.length >= count
      ? Math.min(candidates.length - 1, Math.floor(binStart + random() * Math.max(1, binEnd - binStart)))
      : index % Math.max(candidates.length, 1);
    const sample = candidates[candidateIndex] || [canvas.width / 2, canvas.height / 2, 47, 130, 255];
    const targetWidth = isMark ? 4.2 : isM360 ? (compact ? 7.8 : 9.15) : (compact ? 3.9 : 9.4);
    const targetHeight = isMark ? 4.2 : isM360 ? (compact ? 2.25 : 2.5) : (compact ? 1.04 : 2.28);
    const jitter = isMark ? 0.009 : isM360 ? 0.0035 : 0.0045;
    const tx = ((sample[0] / canvas.width) - 0.5) * targetWidth + (random() - 0.5) * jitter;
    const ty = -((sample[1] / canvas.height) - 0.5) * targetHeight + (random() - 0.5) * jitter;
    const tz = (random() - 0.5) * (isMark ? 0.08 : 0.026);
    target.set([tx, ty, tz], index * 3);

    const luminance = sample[2] * 0.2126 + sample[3] * 0.7152 + sample[4] * 0.0722;
    let color: THREE.Color;
    if (isMark) color = logoBlue;
    else if (isM360 && sample[2] > 170 && sample[3] > 115 && sample[4] < 120) color = yellow.clone().lerp(new THREE.Color('#ffe16d'), random() * 0.34);
    else if (isM360 && luminance > 205) color = new THREE.Color('#f7faff').lerp(cyan, random() * 0.26);
    else if (luminance < 68) color = yellow.clone().lerp(violet, random() * 0.28);
    else if (random() > 0.82) color = yellow.clone().lerp(cyan, random() * 0.18);
    else color = blue.clone().lerp(cyan, random() * 0.72);
    colors.set([color.r, color.g, color.b], index * 3);
    phases[index] = random();
  }

  return { scatter, target, colors, phases };
}

function useLogoCloud(variant: LogoVariant, count: number, compact: boolean) {
  const [cloud, setCloud] = useState<PointCloud | null>(null);
  useEffect(() => {
    let cancelled = false;
    buildLogoCloud(variant, count, compact).then((next) => {
      if (!cancelled) setCloud(next);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [variant, count, compact]);
  return cloud;
}

function LogoParticles({ variant, count, compact, reducedMotion }: { variant: LogoVariant; count: number; compact: boolean; reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const cloud = useLogoCloud(variant, count, compact);

  const pointSizing = variant === 'mark'
    ? { base: 1.7, variance: 2.1, settle: 1.05 }
    : variant === 'm360'
      ? { base: 1.08, variance: 1.28, settle: 0.58 }
      : { base: 1.04, variance: 1.18, settle: 0.54 };

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: reducedMotion ? 1 : 0 },
    uDrift: { value: 0 },
    uPointBase: { value: pointSizing.base },
    uPointVariance: { value: pointSizing.variance },
    uPointSettle: { value: pointSizing.settle }
  }), [pointSizing.base, pointSizing.settle, pointSizing.variance, reducedMotion]);

  useFrame((state) => {
    if (!material.current || !points.current) return;
    if (reducedMotion) {
      material.current.uniforms.uMorph.value = 1;
      return;
    }
    const elapsed = state.clock.elapsedTime;
    const cycle = variant === 'mark' ? 10 : 12;
    const phase = elapsed % cycle;
    let morph = 0;
    if (variant === 'mark') {
      if (phase >= 3.8 && phase < 5) morph = THREE.MathUtils.smoothstep(phase, 3.8, 5);
      else if (phase >= 5 && phase < 8.2) morph = 1;
      else if (phase >= 8.2 && phase < 9.3) morph = 1 - THREE.MathUtils.smoothstep(phase, 8.2, 9.3);
    } else {
      if (phase >= 2.2 && phase < 3.6) morph = THREE.MathUtils.smoothstep(phase, 2.2, 3.6);
      else if (phase >= 3.6 && phase < 9.6) morph = 1;
      else if (phase >= 9.6 && phase < 11.2) morph = 1 - THREE.MathUtils.smoothstep(phase, 9.6, 11.2);
    }
    material.current.uniforms.uTime.value = elapsed;
    material.current.uniforms.uMorph.value = morph;
    material.current.uniforms.uDrift.value = window.scrollY / Math.max(window.innerHeight, 1);
    points.current.rotation.y += ((state.pointer.x * 0.08 * (1 - morph)) - points.current.rotation.y) * 0.025;
    points.current.rotation.x += ((state.pointer.y * -0.055 * (1 - morph)) - points.current.rotation.x) * 0.025;
  });

  if (!cloud) return null;
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.scatter, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[cloud.target, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[cloud.colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[cloud.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={variant === 'mark' ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

function SpineParticles() {
  const points = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const mobile = window.innerWidth < 760;
    const count = mobile ? 1200 : 2600;
    const random = seededRandom(9187);
    const nextPositions = new Float32Array(count * 3);
    const nextColors = new Float32Array(count * 3);
    const blue = new THREE.Color('#2f82ff');
    const cyan = new THREE.Color('#7be7ff');
    const yellow = new THREE.Color('#ffc72c');
    for (let index = 0; index < count; index += 1) {
      const y = (random() - 0.5) * 10.5;
      const center = Math.sin(y * 0.74) * 1.2 + Math.sin(y * 0.21) * 0.6;
      const radius = Math.pow(random(), 2.2) * (mobile ? 1.2 : 2.1);
      const angle = random() * Math.PI * 2;
      nextPositions.set([center + Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.85], index * 3);
      const color = random() > 0.78 ? yellow.clone().lerp(cyan, random() * 0.22) : blue.clone().lerp(cyan, random() * 0.72);
      nextColors.set([color.r, color.g, color.b], index * 3);
    }
    return { positions: nextPositions, colors: nextColors };
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.09) * 0.09;
    points.current.rotation.y = state.clock.elapsedTime * 0.025;
    points.current.position.y = -((window.scrollY / Math.max(document.documentElement.scrollHeight, 1)) - 0.5) * 0.8;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.024} transparent opacity={0.72} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function useCompactParticles() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 700);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 699px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return compact;
}

export function SignalScene({ variant = 'mark' }: { variant?: LogoVariant }) {
  const reducedMotion = useReducedMotion();
  const compact = useCompactParticles();
  const count = variant === 'mark' ? 12500 : variant === 'm360' ? (compact ? 16500 : 22000) : (compact ? 14000 : 19000);
  const cameraZ = variant === 'mark' ? 7.2 : variant === 'm360' ? 8.8 : 8.3;
  const cameraFov = variant === 'mark' ? 42 : variant === 'm360' ? 36 : 38;
  return (
    <Canvas
      dpr={[1, 1.55]}
      camera={{ position: [0, 0, cameraZ], fov: cameraFov }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reducedMotion ? 'demand' : 'always'}
    >
      <LogoParticles variant={variant} count={count} compact={compact} reducedMotion={reducedMotion} />
    </Canvas>
  );
}

export function AmbientParticleSpine() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="signal-particle-spine" aria-hidden="true">
      <Canvas
        dpr={[0.8, 1.2]}
        camera={{ position: [0, 0, 7.4], fov: 54 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <SpineParticles />
      </Canvas>
    </div>
  );
}
