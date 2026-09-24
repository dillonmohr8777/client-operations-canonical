import React from 'react';
import {interpolate} from 'remotion';
import {clamp, enter} from './Shared';
import {INK} from './theme';

// ---------------------------------------------------------------------------
// Performance note (read before touching filter params): everything below
// that uses an SVG filter (TornCard, Grain) is DETERMINISTIC -- fixed seed,
// no frame/time input into the filter graph itself. That's what lets a
// software-rendered Chromium rasterize the filtered result ONCE per element
// and just transform the cached bitmap for animation. The earlier version of
// this file had a full-canvas 1080x1920 CSS repeating-gradient "halftone"
// (tens of thousands of individually-computed dots, redrawn every frame for
// 280+ frames) and that -- not the card count -- was what made renders take
// minutes instead of seconds. Grain replaces it: one filter, one bitmap,
// reused. Keep any new texture SCOPED to a card-sized element, never the
// full frame, and never drive a filter primitive's numeric attributes from
// `frame` -- animate transform/opacity on a wrapper instead.
// ---------------------------------------------------------------------------

let filterId = 0;
const nextId = (prefix: string) => `${prefix}-${filterId++}`;

// Torn-paper card, real edge: an SVG rect pushed through feTurbulence ->
// feDisplacementMap so the boundary is genuinely irregular (fractal noise),
// not a hand-tuned polygon. Fixed seed per card (from `seed`) so it's stable
// across every frame and cacheable.
export function TornCard({
  w,
  h,
  rot = 0,
  bg = '#FFFFFF',
  shadow = true,
  seed = 3,
  children,
}: {
  w: number;
  h: number;
  rot?: number;
  bg?: string;
  shadow?: boolean;
  seed?: number;
  children?: React.ReactNode;
}) {
  const fid = React.useMemo(() => nextId('torn'), []);
  const pad = 22; // filter region headroom so displacement doesn't clip at the SVG edge
  return (
    <div style={{position: 'relative', width: w, height: h, transform: `rotate(${rot}deg)`}}>
      {shadow && (
        <svg width={w + pad * 2} height={h + pad * 2} style={{position: 'absolute', left: 4 - pad, top: 7 - pad, filter: 'blur(4px)'}}>
          <filter id={`${fid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={2} seed={seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={11} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <rect x={pad} y={pad} width={w} height={h} fill="rgba(14,20,23,.18)" filter={`url(#${fid}-shadow)`} />
        </svg>
      )}
      <svg width={w + pad * 2} height={h + pad * 2} style={{position: 'absolute', left: -pad, top: -pad}}>
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={2} seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={11} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <rect x={pad} y={pad} width={w} height={h} fill={bg} filter={`url(#${fid})`} stroke="rgba(14,20,23,.07)" strokeWidth={1} />
      </svg>
      {/* content sits inside a safe margin -- it is not itself torn, only the card beneath it is */}
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h}}>{children}</div>
    </div>
  );
}

// Fine paper grain via the same turbulence technique, scoped to whatever box
// you put it in (never call this at full-canvas size -- see the note above).
export function Grain({w, h, opacity = 0.5, seed = 7}: {w: number; h: number; opacity?: number; seed?: number}) {
  const fid = React.useMemo(() => nextId('grain'), []);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, opacity, mixBlendMode: 'multiply'}}>
      <filter id={fid}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.09  0 0 0 0 0.10  0 0 0 0.35 0" />
      </filter>
      <rect width={w} height={h} filter={`url(#${fid})`} />
    </svg>
  );
}

// Tape: dual-layer clay lighting (a directional base gradient + a thin
// specular rim-light on the top edge) instead of a flat translucent strip,
// plus a curl-in entrance -- it unrolls from flat-against-the-roll to
// pressed-down, transform-origin at the top so it reads as applied, not
// pasted.
export function Tape({x, y, w = 74, rot = -6, frame, from, dur = 16}: {x: number; y: number; w?: number; rot?: number; frame: number; from: number; dur?: number}) {
  const t = interpolate(frame, [from, from + dur], [0, 1], clamp);
  const e = enter(t);
  const curl = (1 - e) * 62; // degrees, rotateX
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: 26,
        opacity: interpolate(t, [0, 0.3], [0, 1], clamp),
        transform: `rotate(${rot}deg) perspective(220px) rotateX(${curl}deg)`,
        transformOrigin: '50% 0%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(165deg, rgba(250,248,244,.88) 0%, rgba(238,232,220,.78) 55%, rgba(214,206,190,.7) 100%)',
          boxShadow: '0 2px 5px rgba(14,20,23,.14)',
          mixBlendMode: 'multiply',
        }}
      >
        {/* specular rim: the second clay layer, a thin bright edge along the top */}
        <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: '38%', background: 'linear-gradient(180deg, rgba(255,255,255,.55), transparent)'}} />
      </div>
    </div>
  );
}

// Polaroid-style frame with dual-layer lighting on the white border (a broad
// directional light + a tight specular highlight, same two-layer idea as the
// clay props) and a curl-in entrance -- corner lifts first, settles flat.
export function PolaroidFrame({
  w,
  h,
  photoH,
  rot = 0,
  frame,
  from,
  dur = 22,
  caption,
  children,
}: {
  w: number;
  h: number;
  photoH: number;
  rot?: number;
  frame: number;
  from: number;
  dur?: number;
  caption?: string;
  children?: React.ReactNode;
}) {
  const t = interpolate(frame, [from, from + dur], [0, 1], clamp);
  const e = enter(t);
  const curl = (1 - e) * 34;
  const lift = (1 - e) * 46;
  return (
    <div
      style={{
        width: w,
        height: h,
        opacity: e,
        transform: `translateY(${lift}px) rotate(${rot + (1 - e) * -9}deg) perspective(900px) rotateX(${curl}deg)`,
        transformOrigin: '50% 100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(155deg, #FFFFFF 0%, #F4F1EA 60%, #E8E2D6 100%)',
          boxShadow: '0 14px 26px rgba(14,20,23,.22), inset 0 1px 0 rgba(255,255,255,.6)',
          padding: '14px 14px 0',
          boxSizing: 'border-box',
        }}
      >
        {/* second lighting layer: a soft specular patch, top-left */}
        <div style={{position: 'absolute', left: 0, top: 0, width: '55%', height: '35%', background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,.7), transparent 70%)', pointerEvents: 'none'}} />
        <div style={{position: 'relative', width: '100%', height: photoH, overflow: 'hidden'}}>{children}</div>
        {caption && (
          <div style={{fontFamily: "'Nunito Sans', 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 15, color: INK, textAlign: 'center', marginTop: 10, opacity: 0.82}}>{caption}</div>
        )}
      </div>
    </div>
  );
}

// settle-in: fly from an offset with a slight rotation snap, for paper
// fragments landing into a grid.
export function settle(frame: number, from: number, dur = 20, dx = 90, dy = -40, rotFrom = -8) {
  const t = interpolate(frame, [from, from + dur], [0, 1], clamp);
  const e = enter(t);
  const overshoot = Math.sin(e * Math.PI) * 0.06 * (1 - e);
  return {
    opacity: e,
    transform: `translate(${(1 - e) * dx}px, ${(1 - e) * dy}px) rotate(${(1 - e) * rotFrom + overshoot * 40}deg)`,
  };
}

// Spring-style impact bounce: overshoot past 1.0, settle back, one small
// second bounce -- three cheap interpolate() keyframe segments, no physics
// sim needed.
export function impactBounce(frame: number, from: number) {
  const t = frame - from;
  if (t < 0) return {scale: 0, opacity: 0};
  const scale = interpolate(
    t,
    [0, 7, 12, 17, 22],
    [1.7, 0.92, 1.06, 0.98, 1],
    {...clamp, easing: enter}
  );
  const opacity = interpolate(t, [0, 4], [0, 1], clamp);
  return {scale, opacity};
}

// Ink-bleed: a second, larger, blurred, low-opacity copy sat directly behind
// the crisp element -- ink spreading into paper fiber, not a drop shadow.
export function InkBleed({children, spread = 6, blur = 5, opacity = 0.28}: {children: React.ReactNode; spread?: number; blur?: number; opacity?: number}) {
  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute', inset: -spread, filter: `blur(${blur}px)`, opacity, transform: 'scale(1.04)'}}>{children}</div>
      {children}
    </div>
  );
}
