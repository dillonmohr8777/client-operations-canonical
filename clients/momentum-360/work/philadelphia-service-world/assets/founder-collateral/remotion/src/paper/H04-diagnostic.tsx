import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Fonts, rise, clamp, enter, PaperEnd, PAPER_END_FRAMES} from './Shared';
import {PANEL, PAPER, INK, MUTED, FONT_DISPLAY, FONT_BODY, BRAND, SIGNAL} from './theme';
import {TornCard, Tape, Grain, settle, PolaroidFrame} from './ScrapbookParts';

// H04, "Readiness Diagnostic" film (1080x1920 vertical, 9:16).
// Visualizes the conversion tool: six factual operational questions,
// not a fake 100-point score, leading to the exact next step.

const INTRO_FRAMES = 60; // 2.5s
const QUESTIONS_FRAMES = 180; // 7.5s (3 core diagnostic questions)
const VERDICT_FRAMES = 90; // 3.75s
const BODY_FRAMES = INTRO_FRAMES + QUESTIONS_FRAMES + VERDICT_FRAMES;
export const H04_TOTAL_FRAMES = BODY_FRAMES + PAPER_END_FRAMES;

const FrameGate: React.FC<{from: number; to: number; children: (frame: number) => React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children(frame)}</>;
};

const DIAG_QUESTIONS = [
  {
    num: '01',
    label: 'Lead Ownership',
    q: 'Can you name the person who answers new leads?',
    status: 'NO OPERATOR',
    tag: 'HANDLING RISK',
  },
  {
    num: '02',
    label: 'Crawler Access',
    q: 'Do you know if GPTBot is allowed in robots.txt?',
    status: 'BLOCKED',
    tag: 'DISCOVERY RISK',
  },
  {
    num: '03',
    label: 'Entity Definition',
    q: 'Is the business typed as what it actually is in Schema?',
    status: 'MISCLASSIFIED',
    tag: 'ATTRIBUTION RISK',
  },
];

export const H04Diagnostic: React.FC = () => {
  return (
    <AbsoluteFill style={{background: PANEL}}>
      <Fonts />
      <Sequence durationInFrames={BODY_FRAMES}>
        {/* Title Torn Card - Persists across all body frames */}
        <FrameGate from={0} to={BODY_FRAMES}>
          {(frame) => (
            <div style={{position: 'absolute', left: 80, top: 120, ...rise(frame, 2, 16, 36)}}>
              <TornCard w={920} h={300} rot={-1.2} seed={5}>
                <Grain w={920} h={300} opacity={0.06} seed={5} />
                <div style={{position: 'relative', padding: '38px 46px'}}>
                  <div style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 19, letterSpacing: '0.14em', textTransform: 'uppercase', color: BRAND}}>
                    Momentum AI &middot; diagnostic
                  </div>
                  <div style={{fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 58, lineHeight: 0.96, marginTop: 14, color: INK}}>
                    Six facts.<br />Not a score.
                  </div>
                </div>
              </TornCard>
              <Tape x={40} y={-14} rot={-7} frame={frame} from={4} />
              <Tape x={820} y={-10} rot={8} frame={frame} from={8} />
            </div>
          )}
        </FrameGate>

        {/* The 3 Staggered Diagnostic Cards */}
        {DIAG_QUESTIONS.map((item, idx) => {
          const from = INTRO_FRAMES + idx * 36;
          const yPos = 470 + idx * 240;
          return (
            <FrameGate key={idx} from={from} to={INTRO_FRAMES + QUESTIONS_FRAMES}>
              {(frame) => {
                const local = frame - from;
                return (
                  <div style={{position: 'absolute', left: 90, top: yPos, ...settle(frame, from, 16, -60, -25, idx % 2 === 0 ? -4 : 4)}}>
                    <TornCard w={900} h={210} rot={idx % 2 === 0 ? -1.5 : 1.8} bg="#FFFFFF" seed={idx + 10}>
                      <div style={{padding: '24px 34px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%'}}>
                        <div style={{maxWidth: 580}}>
                          <div style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A35309'}}>
                            {item.num} &middot; {item.label}
                          </div>
                          <div style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 25, color: INK, marginTop: 8, lineHeight: 1.15}}>
                            {item.q}
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{background: 'rgba(226,113,19,0.12)', border: '1px solid #E27113', color: '#A35309', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 12, padding: '6px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                            {item.tag}
                          </div>
                          <div style={{fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 22, color: SIGNAL, marginTop: 10}}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                    </TornCard>
                    <Tape x={idx % 2 === 0 ? 120 : 700} y={-12} rot={idx % 2 === 0 ? -4 : 6} frame={local} from={4} />
                  </div>
                );
              }}
            </FrameGate>
          );
        })}

        {/* Verdict Sheet Stamp */}
        <Sequence from={INTRO_FRAMES + QUESTIONS_FRAMES} durationInFrames={VERDICT_FRAMES}>
          <DiagnosticVerdict />
        </Sequence>
      </Sequence>

      {/* Standard Outro */}
      <Sequence from={BODY_FRAMES} durationInFrames={PAPER_END_FRAMES}>
        <PaperEnd />
      </Sequence>
    </AbsoluteFill>
  );
};

const DiagnosticVerdict: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 10], [1.3, 1], {...clamp, easing: enter});
  const opacity = interpolate(frame, [0, 8], [0, 1], clamp);

  return (
    <AbsoluteFill style={{padding: '0 80px', top: 480, alignItems: 'center'}}>
      <div style={{transform: `scale(${scale}) rotate(-1.5deg)`, opacity, width: '100%'}}>
        <TornCard w={920} h={700} rot={-1.5} bg="#FFFFFF" seed={99}>
          <Grain w={920} h={700} opacity={0.06} seed={99} />
          <div style={{padding: '50px 56px'}}>
            <div style={{display: 'inline-block', background: SIGNAL, color: '#FFFFFF', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 14, letterSpacing: '0.14em', padding: '6px 16px', borderRadius: 999, textTransform: 'uppercase'}}>
              Prescribed Next Step
            </div>
            <div style={{fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 52, color: INK, marginTop: 24, lineHeight: 1.05}}>
              Start with the Snapshot.
            </div>
            <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 24, color: MUTED, marginTop: 18, lineHeight: 1.4, maxWidth: 780}}>
              You do not yet have a verified fetch or entity story. Do not buy a film or a chatbot first. We inspect what AI crawlers actually see.
            </div>
            <div style={{marginTop: 36, display: 'flex', flexDirection: 'column', gap: 16}}>
              <div style={{border: '1.5px solid #155E86', borderRadius: 12, padding: '16px 24px', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 20, color: '#155E86', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>AI Search Snapshot &middot; Free Opener</span>
                <span style={{fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#155E86', background: 'rgba(21,94,134,0.08)', padding: '4px 10px', borderRadius: 6}}>Live Verification</span>
              </div>
              <div style={{fontFamily: FONT_BODY, fontWeight: 700, fontSize: 16, color: '#888888'}}>
                Zero fluff scorecards. 100% verified crawler & entity findings.
              </div>
            </div>
          </div>
        </TornCard>
        <Tape x={70} y={-14} rot={-6} frame={frame} from={6} />
        <Tape x={780} y={-12} rot={7} frame={frame} from={10} />
      </div>
    </AbsoluteFill>
  );
};
