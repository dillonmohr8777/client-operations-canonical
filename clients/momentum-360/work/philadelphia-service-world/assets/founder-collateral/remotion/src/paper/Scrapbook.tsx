import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Fonts, rise, PaperEnd, PAPER_END_FRAMES} from './Shared';
import {PANEL, INK, MUTED, FONT_DISPLAY, FONT_BODY, BRAND, SIGNAL} from './theme';
import {TornCard, Tape, Grain, PolaroidFrame, settle, impactBounce, InkBleed} from './ScrapbookParts';
import {LaneSpec} from './LaneFilm';

// H03, "Scrapbook assembly" (v2). Same tactile grammar as the reference:
// torn paper, tape, staggered material changes, a proof/contact-sheet hold,
// clean logo resolution, brand close -- built with our own lane marks per
// the DESIGN.md rule ("use agency tools and service marks, not the
// reference's own symbols"), never another client's assets, never a face.
// v2: real SVG-noise torn edges and grain (ScrapbookParts.tsx), Polaroid
// framing with dual-layer lighting and a curl-in entrance, an ink-bled
// impact-bounced proof stamp. No full-canvas texture -- see the perf note
// at the top of ScrapbookParts.tsx.
const TITLE_FRAMES = 66; // 2.75s
const ASSEMBLE_FRAMES = 216; // 9s, 4 fragments ~2s apart
const PROOF_FRAMES = 84; // 3.5s
const BODY_FRAMES = TITLE_FRAMES + ASSEMBLE_FRAMES + PROOF_FRAMES;
export const SCRAPBOOK_TOTAL_FRAMES = BODY_FRAMES + PAPER_END_FRAMES;

const FrameGate: React.FC<{from: number; to: number; children: (frame: number) => React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children(frame)}</>;
};

export const Scrapbook: React.FC<{lanes: LaneSpec[]}> = ({lanes}) => {
  return (
    <AbsoluteFill style={{background: PANEL}}>
      <Fonts />
      <Sequence durationInFrames={BODY_FRAMES}>
        {/* title, torn card with real noise-torn edge + a scoped grain wash */}
        {/* Preserved throughout the entire assembly so the top frame never feels empty */}
        <FrameGate from={0} to={BODY_FRAMES}>
          {(frame) => (
            <div style={{position: 'absolute', left: 80, top: 120, ...rise(frame, 2, 16, 36)}}>
              <TornCard w={920} h={310} rot={-1.4} seed={2}>
                <Grain w={920} h={310} opacity={0.05} seed={2} />
                <div style={{position: 'relative', padding: '40px 48px'}}>
                  <div style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: BRAND}}>Momentum AI &middot; field notes</div>
                  <div style={{fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 64, lineHeight: 0.94, marginTop: 14, color: INK}}>Four lanes.<br />One machine.</div>
                </div>
              </TornCard>
              <Tape x={40} y={-14} rot={-8} frame={frame} from={4} />
              <Tape x={820} y={-10} rot={7} frame={frame} from={9} />
            </div>
          )}
        </FrameGate>

        {/* four fragments assemble into a 2x2 contact sheet -- Polaroid frames now, not flat cards */}
        {lanes.map((lane, i) => {
          const from = TITLE_FRAMES + i * 46;
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = 90 + col * 460;
          const y = 500 + row * 570;
          return (
            <FrameGate key={i} from={from} to={BODY_FRAMES}>
              {(frame) => {
                // frame here is ABSOLUTE (FrameGate is a plain conditional, not
                // a <Sequence>) -- PolaroidFrame/Tape expect a frame local to
                // this card's own entrance, so re-zero it before handing it in.
                // (settle() below is fine as-is: it already takes the absolute
                // frame and the absolute `from` together.)
                const local = frame - from;
                return (
                  <div style={{position: 'absolute', left: x, top: y, ...settle(frame, from, 18, i % 2 === 0 ? -100 : 100, -50, i % 2 === 0 ? -9 : 9)}}>
                    <PolaroidFrame w={410} h={520} photoH={360} rot={i % 2 === 0 ? -2.6 : 3.1} frame={local} from={0} caption={lane.headline.join(' ')}>
                      <div style={{position: 'relative', width: '100%', height: '100%', background: '#FBF8F4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{position: 'absolute', top: 12, left: 14, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A35309'}}>{lane.eyebrow}</div>
                        <lane.Prop frame0={from} size={200} />
                      </div>
                    </PolaroidFrame>
                    <Tape x={150} y={-14} rot={i % 2 === 0 ? -5 : 5} frame={local} from={6} />
                  </div>
                );
              }}
            </FrameGate>
          );
        })}
      </Sequence>

      {/* proof stamp overlay: ink-bled, impact-bounced, a real sourced number */}
      <Sequence from={TITLE_FRAMES + ASSEMBLE_FRAMES} durationInFrames={PROOF_FRAMES}>
        <ProofStamp />
      </Sequence>

      <Sequence from={BODY_FRAMES} durationInFrames={PAPER_END_FRAMES}>
        <PaperEnd />
      </Sequence>
    </AbsoluteFill>
  );
};

const ProofStamp: React.FC = () => {
  const frame = useCurrentFrame();
  const {scale, opacity} = impactBounce(frame, 0);
  return (
    <AbsoluteFill style={{background: 'rgba(240,236,229,.92)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${scale}) rotate(-7deg)`, opacity}}>
        <InkBleed spread={7} blur={6} opacity={0.22}>
          <div style={{border: `5px solid ${SIGNAL}`, borderRadius: 16, padding: '30px 44px', textAlign: 'center', background: 'rgba(251,248,244,.4)'}}>
            <div style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', color: SIGNAL}}>PROOF</div>
            <div style={{fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 110, lineHeight: 1, color: INK, marginTop: 8}}>35</div>
            <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 19, color: MUTED, marginTop: 8, maxWidth: 380}}>
              AI visibility score for a B2B equipment manufacturer, from zero tracked.
            </div>
          </div>
        </InkBleed>
      </div>
    </AbsoluteFill>
  );
};
