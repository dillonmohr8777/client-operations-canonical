import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PaperEnd, PAPER_END_FRAMES} from './Shared';
import {LaneFilm, LaneSpec, LANE_TOTAL_FRAMES} from './LaneFilm';
import {CarouselCard, CAROUSEL_FRAMES} from './Carousel';
import {PaperIntro, INTRO_FRAMES} from './PaperIntro';
import {Hero, heroTotalFrames} from './Hero';
import {H02, H02_TOTAL_FRAMES} from './H02';
import {Scrapbook, SCRAPBOOK_TOTAL_FRAMES} from './Scrapbook';
import {H04Diagnostic, H04_TOTAL_FRAMES} from './H04-diagnostic';
import {SocialShort, SOCIAL_SHORTS, SHORT_DURATION_FRAMES, SHORT_FPS} from './SocialShorts';
import {Receiver} from './props/Receiver';
import {Blueprint} from './props/Blueprint';
import {Frames} from './props/Frames';
import {Spine} from './props/Spine';
import {LaunchSpot, SPOT_FRAMES, CUT15, CUT15_FRAMES, BUMPER6, BUMPER6_FRAMES} from './Spot';

const FPS = 24;

// Own entry so this composition set never imports the shared theme/fonts.ts
// (that module fetches Google Fonts at module scope and stalls offline
// renders). Render with:
//   npx remotion render src/paper/index.tsx <composition-id> out.mp4 \
//     --concurrency=1 --gl=swangle --crf=18 --codec=h264 --x264-preset=medium \
//     --image-format=jpeg --jpeg-quality=95

// Copy sourced verbatim from offers.json's real lane language. No prices,
// no citation/ranking/lead claims, no invented numbers.
const LANES: Record<string, LaneSpec> = {
  L01: {
    eyebrow: '01 · AEO / GEO',
    question: ['Can AI systems', 'read your site?'],
    headline: ['Get found', 'by AI.'],
    footnote: 'AI-crawler allowlist. Entity and schema. Answer architecture. Measured monthly on the questions your buyers ask.',
    Prop: Receiver,
  },
  L02: {
    eyebrow: '02 · AI Design',
    question: ['The thing you', 'were describing.'],
    headline: ['Prototype', 'in a week.'],
    footnote: 'Five working days after kickoff. Built from your real assets and first-party facts.',
    Prop: Blueprint,
  },
  L03: {
    eyebrow: '03 · AI Marketing',
    question: ['Still frames', 'that refuse to', 'stay still.'],
    headline: ['Content that', 'moves.'],
    footnote: 'A brand film and a set of stills, every month. Your logo never touches a model.',
    Prop: Frames,
  },
  L04: {
    eyebrow: '04 · AI Automation',
    question: ['Every lead,', 'with a receipt.'],
    headline: ['The attribution', 'spine.'],
    footnote: 'One intake to one destination. Duplicates and exceptions included. Replies stay internal drafts.',
    Prop: Spine,
  },
};

// Composition.defaultProps is serialized (CLI-parametrized rendering reads it
// back through a props-evaluation pass), so a live React component reference
// (LaneSpec.Prop) can't travel through it -- it lands as undefined on the
// other side (React error #130). Close over the spec in a thin per-lane
// component instead, so the composition's own `component` reference (which
// is never serialized) carries it.
const laneComponent = (spec: LaneSpec): React.FC => () => <LaneFilm spec={spec} />;
const carouselComponent = (spec: LaneSpec, n: string): React.FC => () => <CarouselCard spec={spec} n={n} />;
const LANE_NUMS: Record<string, string> = {L01: '01', L02: '02', L03: '03', L04: '04'};
const LANE_LIST = Object.values(LANES);
const heroComponent = (cut: boolean): React.FC => () => <Hero lanes={LANE_LIST} cut={cut} />;

// Clips actually on disk for the launch spot; a shot whose clip is missing renders its still with a push.
const SPOT_CLIPS_ON_DISK = ['momentum_01_launch_clip_a_v2.mp4', 'momentum_01_launch_clip_b.mp4', 'momentum_02_services_clip_a.mp4', 'momentum_02_services_clip_b.mp4', 'momentum_05_launch_clip_b.mp4', 'momentum_logo_particles_v1.mp4', 'momentum_x3_the_fold_clip.mp4', 'momentum_x5_particles_converge.mp4'];

const PaperRoot: React.FC = () => (
  <>
    <Composition id="LaunchSpot30" component={LaunchSpot} width={1920} height={1080} fps={FPS} durationInFrames={SPOT_FRAMES} defaultProps={{available: SPOT_CLIPS_ON_DISK}} />
    <Composition id="LaunchSpot15" component={LaunchSpot} width={1920} height={1080} fps={FPS} durationInFrames={CUT15_FRAMES} defaultProps={{available: SPOT_CLIPS_ON_DISK, shots: CUT15}} />
    <Composition id="LaunchBumper6" component={LaunchSpot} width={1920} height={1080} fps={FPS} durationInFrames={BUMPER6_FRAMES} defaultProps={{available: SPOT_CLIPS_ON_DISK, shots: BUMPER6}} />
    <Composition id="LaunchSpot30-9x16" component={LaunchSpot} width={1080} height={1920} fps={FPS} durationInFrames={SPOT_FRAMES} defaultProps={{available: SPOT_CLIPS_ON_DISK, fmt: '9x16'}} />
    <Composition id="LaunchSpot30-1x1" component={LaunchSpot} width={1080} height={1080} fps={FPS} durationInFrames={SPOT_FRAMES} defaultProps={{available: SPOT_CLIPS_ON_DISK, fmt: '1x1'}} />
    <Composition id="LaunchSpot15-9x16" component={LaunchSpot} width={1080} height={1920} fps={FPS} durationInFrames={CUT15_FRAMES} defaultProps={{available: SPOT_CLIPS_ON_DISK, shots: CUT15, fmt: '9x16'}} />
    <Composition id="LaunchBumper6-9x16" component={LaunchSpot} width={1080} height={1920} fps={FPS} durationInFrames={BUMPER6_FRAMES} defaultProps={{available: SPOT_CLIPS_ON_DISK, shots: BUMPER6, fmt: '9x16'}} />
    <Composition id="S02-outro" component={PaperEnd} width={1920} height={1080} fps={FPS} durationInFrames={PAPER_END_FRAMES} />
    {Object.entries(LANES).map(([id, spec]) => (
      <Composition
        key={id}
        id={`${id}-9x16`}
        component={laneComponent(spec)}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={LANE_TOTAL_FRAMES}
      />
    ))}
    {Object.entries(LANES).map(([id, spec]) => (
      <Composition
        key={`${id}-c`}
        id={`C-${id}-1x1`}
        component={carouselComponent(spec, LANE_NUMS[id])}
        width={1080}
        height={1080}
        fps={FPS}
        durationInFrames={CAROUSEL_FRAMES}
      />
    ))}
    <Composition id="S01-intro" component={PaperIntro} width={1920} height={1080} fps={FPS} durationInFrames={INTRO_FRAMES} />
    <Composition id="H01-hero-16x9" component={heroComponent(false)} width={1920} height={1080} fps={FPS} durationInFrames={heroTotalFrames(false, LANE_LIST.length)} />
    <Composition id="H01-cut-16x9" component={heroComponent(true)} width={1920} height={1080} fps={FPS} durationInFrames={heroTotalFrames(true, LANE_LIST.length)} />
    <Composition id="H02-momo-16x9" component={H02} width={1920} height={1080} fps={FPS} durationInFrames={H02_TOTAL_FRAMES} />
    <Composition id="H03-scrapbook-9x16" component={() => <Scrapbook lanes={LANE_LIST} />} width={1080} height={1920} fps={FPS} durationInFrames={SCRAPBOOK_TOTAL_FRAMES} />
    <Composition id="H04-diagnostic-9x16" component={H04Diagnostic} width={1080} height={1920} fps={FPS} durationInFrames={H04_TOTAL_FRAMES} />
    {Object.entries(SOCIAL_SHORTS).map(([id, spec]) => (
      <Composition
        key={id}
        id={`${id}-9x16`}
        component={() => <SocialShort spec={spec} />}
        width={1080}
        height={1920}
        fps={SHORT_FPS}
        durationInFrames={SHORT_DURATION_FRAMES}
      />
    ))}
  </>
);

registerRoot(PaperRoot);
