import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fonts, rise, clamp, enter} from './Shared';
import {PAPER, PANEL, INK, MUTED, NAVY, BRAND, BLUE, BLUE_LIFT, ON_DEEP, ON_DEEP_MUTED, SIGNAL, FONT_DISPLAY, FONT_BODY} from './theme';
import {TornCard, Tape, Grain} from './ScrapbookParts';

export const SHORT_FPS = 24;
export const SHORT_DURATION_FRAMES = 96; // 4.0 seconds @ 24fps

// Spec for punchy 3-5s social media shorts
export type ShortSpec = {
  id: string;
  badge: string;
  headline: string[];
  subline: string;
  theme: 'paper' | 'navy';
  accentColor?: string;
  ctaText?: string;
};

export const SOCIAL_SHORTS: Record<string, ShortSpec> = {
  'M01-machine': {
    id: 'M01-machine',
    badge: 'Momentum AI',
    headline: ['Built the machine.', 'Now we build yours.'],
    subline: 'Four lanes. Every offer ships with its agent.',
    theme: 'navy',
    accentColor: '#3897CC',
    ctaText: 'needmomentum.com',
  },
  'M02-aeo': {
    id: 'M02-aeo',
    badge: 'Lane 01 · AEO / GEO',
    headline: ['Can AI systems', 'read your site?'],
    subline: 'Crawler allowlist. Schema architecture. Measured monthly.',
    theme: 'paper',
    accentColor: BRAND,
    ctaText: 'Free AI Search Snapshot',
  },
  'M03-prototype': {
    id: 'M03-prototype',
    badge: 'Lane 02 · AI Design',
    headline: ['Working prototype', 'in five days.'],
    subline: 'Built from your verified logo and first-party facts.',
    theme: 'paper',
    accentColor: '#A35309',
    ctaText: 'Spec Build Sprint',
  },
  'M04-motion': {
    id: 'M04-motion',
    badge: 'Lane 03 · AI Marketing',
    headline: ['Still frames that', 'refuse to stay still.'],
    subline: 'Brand films & motion stills. Your logo never touches a model.',
    theme: 'navy',
    accentColor: '#F9A03F',
    ctaText: 'Monthly Motion System',
  },
  'M05-spine': {
    id: 'M05-spine',
    badge: 'Lane 04 · AI Automation',
    headline: ['Every lead,', 'with a receipt.'],
    subline: 'One intake to one destination. Zero leads lost in the cracks.',
    theme: 'paper',
    accentColor: BRAND,
    ctaText: 'Lead Ops Architecture',
  },
  'M06-facts': {
    id: 'M06-facts',
    badge: 'Readiness Diagnostic',
    headline: ['Six facts.', 'Not a score.'],
    subline: 'No fake 100-point grades. Exactly one next conversation.',
    theme: 'paper',
    accentColor: SIGNAL,
    ctaText: 'Take the Diagnostic',
  },
};

export const SocialShort: React.FC<{spec: ShortSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const isNavy = spec.theme === 'navy';

  // Momentum exact logo entrance
  const logoScale = interpolate(frame, [0, 14], [0.88, 1], {...clamp, easing: enter});
  const logoOpacity = interpolate(frame, [0, 10], [0, 1], clamp);

  // CTA bar entrance at bottom
  const ctaY = interpolate(frame, [26, 42], [40, 0], {...clamp, easing: enter});
  const ctaOpacity = interpolate(frame, [26, 38], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: isNavy ? NAVY : PANEL, overflow: 'hidden'}}>
      <Fonts />

      {/* Top Exact Logo Bar */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          zIndex: 10,
        }}
      >
        <Img
          src={staticFile(isNavy ? 'paper-brand/momentum-logo-white.png' : 'paper-brand/momentum-logo.png')}
          style={{width: 440, height: 'auto', objectFit: 'contain'}}
        />
      </div>

      {/* Central Content Card */}
      <div
        style={{
          position: 'absolute',
          top: 260,
          left: 80,
          right: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {isNavy ? (
          // Dark Navy theme presentation
          <div
            style={{
              width: 920,
              borderRadius: 32,
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              padding: '64px 56px',
              ...rise(frame, 6, 16, 50),
            }}
          >
            <div
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: spec.accentColor || '#3897CC',
              }}
            >
              {spec.badge}
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 900,
                fontSize: 66,
                lineHeight: 1.02,
                marginTop: 20,
                color: ON_DEEP,
              }}
            >
              {spec.headline.map((line, i) => (
                <div key={i} style={rise(frame, 12 + i * 5, 14, 30)}>
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                ...rise(frame, 24, 14, 25),
                fontFamily: FONT_BODY,
                fontWeight: 700,
                fontSize: 26,
                lineHeight: 1.35,
                marginTop: 28,
                color: ON_DEEP_MUTED,
              }}
            >
              {spec.subline}
            </div>
          </div>
        ) : (
          // Tactile Paper & Clay theme presentation with real SVG torn edge
          <div style={{...rise(frame, 6, 16, 50)}}>
            <TornCard w={920} h={520} rot={-1.2} seed={spec.id.length * 7}>
              <Grain w={920} h={520} opacity={0.06} seed={spec.id.length * 7} />
              <div style={{position: 'relative', padding: '56px 54px'}}>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 800,
                    fontSize: 22,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: spec.accentColor || BRAND,
                  }}
                >
                  {spec.badge}
                </div>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 900,
                    fontSize: 64,
                    lineHeight: 1.02,
                    marginTop: 20,
                    color: INK,
                  }}
                >
                  {spec.headline.map((line, i) => (
                    <div key={i} style={rise(frame, 12 + i * 5, 14, 30)}>
                      {line}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    ...rise(frame, 24, 14, 25),
                    fontFamily: FONT_BODY,
                    fontWeight: 700,
                    fontSize: 26,
                    lineHeight: 1.35,
                    marginTop: 26,
                    color: MUTED,
                  }}
                >
                  {spec.subline}
                </div>
              </div>
            </TornCard>
            <Tape x={50} y={-14} rot={-7} frame={frame} from={8} />
            <Tape x={810} y={-12} rot={8} frame={frame} from={12} />
          </div>
        )}
      </div>

      {/* Verified Call To Action Pill at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        <div
          style={{
            background: isNavy ? '#155E86' : '#14181B',
            color: '#FFFFFF',
            borderRadius: 999,
            padding: '20px 48px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {spec.ctaText || 'needmomentum.com'}
          </span>
          <span style={{fontSize: 22, transform: 'translateY(-1px)'}}>→</span>
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 18,
            color: isNavy ? ON_DEEP_MUTED : MUTED,
            marginTop: 18,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Philadelphia &middot; Established 2015
        </div>
      </div>
    </AbsoluteFill>
  );
};
