import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { auditUrl } from '../shared/content';
import { Reveal } from './Reveal';

const founderFilmPoster = '/assets/founders/need-momentum-founders-poster.webp';

const macBio = [
  'Mac Frederick is Founder and Managing Partner of Need Momentum. He began his career at Google, where he worked with small and midsize businesses, then founded Momentum Digital in Philadelphia in 2015.',
  'He built the agency to help small-business owners grow online with expertise that is accessible, transparent and practical. Mac now leads strategy and growth across Need Momentum\'s connected digital services.'
];

const seanBio = [
  'Sean Boyle is Managing Partner of Need Momentum and Co-Founder and Managing Partner of Momentum 360. A Penn State marketing graduate, he joined Momentum in 2017 as a sales intern and grew through sales leadership into partner, COO and owner.',
  'He focuses on operations, management, marketing, networking and entrepreneurship. Sean also runs Momentum 360\'s property-marketing division, bringing together content, photography and virtual tours.'
];

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

type FilmParticle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  radius: number;
  color: string;
};

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function FounderParticleReveal({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active || reducedMotion) return;

    let animationFrame = 0;
    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.35);
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));

      const context = canvas.getContext('2d');
      if (!context) return;

      const sample = document.createElement('canvas');
      const sampleWidth = Math.min(184, Math.max(118, Math.round(bounds.width / 7)));
      const sampleHeight = Math.max(64, Math.round(sampleWidth * (bounds.height / bounds.width)));
      sample.width = sampleWidth;
      sample.height = sampleHeight;
      const sampleContext = sample.getContext('2d', { willReadFrequently: true });
      if (!sampleContext) return;
      drawImageCover(sampleContext, image, sampleWidth, sampleHeight);
      const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;

      let seed = 20260803;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      const particles: FilmParticle[] = [];
      for (let y = 0; y < sampleHeight; y += 2) {
        for (let x = 0; x < sampleWidth; x += 2) {
          const index = (y * sampleWidth + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
          if (random() > (luminance > 32 ? 0.86 : 0.34)) continue;

          const targetX = ((x + 0.5) / sampleWidth) * canvas.width;
          const targetY = ((y + 0.5) / sampleHeight) * canvas.height;
          const fromCenterX = targetX - canvas.width / 2;
          const fromCenterY = targetY - canvas.height / 2;
          particles.push({
            x: targetX,
            y: targetY,
            startX: targetX + (random() - 0.5) * canvas.width * 0.34,
            startY: targetY + (random() - 0.5) * canvas.height * 0.42,
            driftX: fromCenterX * (0.08 + random() * 0.12) + (random() - 0.5) * 70 * pixelRatio,
            driftY: fromCenterY * (0.07 + random() * 0.11) + (random() - 0.5) * 55 * pixelRatio,
            radius: (0.58 + random() * 1.4) * pixelRatio,
            color: `rgb(${Math.min(255, red + 18)}, ${Math.min(255, green + 23)}, ${Math.min(255, blue + 32)})`
          });
        }
      }

      const duration = 1580;
      const startedAt = performance.now();
      const easeOut = (value: number) => 1 - Math.pow(1 - value, 4);
      const easeInOut = (value: number) => value < 0.5
        ? 8 * Math.pow(value, 4)
        : 1 - Math.pow(-2 * value + 2, 4) / 2;

      const draw = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const assemble = easeOut(Math.min(1, progress / 0.39));
        const disperse = easeInOut(Math.max(0, Math.min(1, (progress - 0.47) / 0.53)));
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (const particle of particles) {
          const assembledX = particle.startX + (particle.x - particle.startX) * assemble;
          const assembledY = particle.startY + (particle.y - particle.startY) * assemble;
          const x = assembledX + particle.driftX * disperse;
          const y = assembledY + particle.driftY * disperse;
          const opacity = Math.min(1, assemble * 1.18) * (1 - disperse);
          if (opacity <= 0.01) continue;
          context.globalAlpha = opacity;
          context.fillStyle = particle.color;
          context.beginPath();
          context.arc(x, y, particle.radius * (1 + disperse * 0.45), 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = 1;

        if (progress < 1 && !cancelled) {
          animationFrame = window.requestAnimationFrame(draw);
        } else {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      animationFrame = window.requestAnimationFrame(draw);
    };
    image.src = founderFilmPoster;

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, [active, reducedMotion]);

  return <canvas className="founder-film__particles" ref={canvasRef} aria-hidden="true" />;
}

function SignalFounders() {
  const filmRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [showEndCard, setShowEndCard] = useState(false);

  useEffect(() => {
    const node = filmRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setRevealed(true);
    }, { threshold: 0.18, rootMargin: '8% 0px -8% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  const shouldPlay = inView && pageVisible && !reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <section className="founders founders--signal founders--cinematic" id="leadership">
      <div ref={filmRef} className={`founder-film${revealed ? ' is-revealed' : ''}${showEndCard ? ' is-end-card' : ''}`}>
        <img
          className="founder-film__ambient"
          src={founderFilmPoster}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
        <video
          className="founder-film__video"
          ref={videoRef}
          poster={founderFilmPoster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onTimeUpdate={(event) => setShowEndCard(event.currentTarget.currentTime >= 7.45)}
        >
          <source src="/assets/founders/need-momentum-founders-film.webm" type="video/webm" />
          <source src="/assets/founders/need-momentum-founders-film.mp4" type="video/mp4" />
        </video>
        <div className="founder-film__ink" aria-hidden="true" />
        <FounderParticleReveal active={revealed} reducedMotion={reducedMotion} />
        <div className="founder-film__vignette" aria-hidden="true" />

        <div className="founder-film__heading">
          <h2>Leadership that has done the work.</h2>
          <p>Mac Frederick and Sean Boyle built one connected Philadelphia team around digital growth, operations and spatial media.</p>
        </div>

        <div className="founder-film__identity founder-film__identity--mac">
          <span className="founder__signal" aria-hidden="true" />
          <div><strong>Mac Frederick</strong><span>Founder &amp; Managing Partner</span></div>
        </div>
        <div className="founder-film__identity founder-film__identity--sean">
          <span className="founder__signal" aria-hidden="true" />
          <div><strong>Sean Boyle</strong><span>Managing Partner</span></div>
        </div>
      </div>

      <div className="founder-profile-deck">
        <div className="founder-bios">
          <article className="founder-profile founder-profile--mac">
            <img
              className="founder__photo founder__photo--mac-v2"
              src="/assets/founders/mac-frederick-workshop-2026.webp"
              alt="Mac Frederick, the blond founder and managing partner of Need Momentum"
              loading="lazy"
              decoding="async"
            />
            <div className="founder-profile__content">
              <div className="founder-profile__identity">
                <span className="founder__signal" aria-hidden="true" />
                <div>
                  <h3>Mac Frederick</h3>
                  <p>Founder &amp; Managing Partner</p>
                </div>
              </div>
              <div className="founder-profile__bio">
                <p>{macBio[0]}</p>
                <p>{macBio[1]}</p>
              </div>
            </div>
          </article>

          <article className="founder-profile founder-profile--sean">
            <img
              className="founder__photo"
              src="/assets/founders/sean-boyle-founder.webp"
              alt="Sean Boyle, the dark-haired managing partner of Need Momentum and co-founder of Momentum 360"
              loading="lazy"
              decoding="async"
            />
            <div className="founder-profile__content">
              <div className="founder-profile__identity">
                <span className="founder__signal" aria-hidden="true" />
                <div>
                  <h3>Sean Boyle</h3>
                  <p>Managing Partner · Momentum 360 Co-Founder</p>
                </div>
              </div>
              <div className="founder-profile__bio">
                <p>{seanBio[0]}</p>
                <p>{seanBio[1]}</p>
              </div>
            </div>
          </article>
        </div>

        <a className="founder-cta" href={auditUrl}>Bring us your next challenge <ArrowUpRight /></a>
      </div>
    </section>
  );
}

function MapFounders() {
  return (
    <section className="founders founders--map" id="founders">
      <Reveal className="section-heading founders__heading">
        <h2>Built by people who know small business.</h2>
        <p>Mac Frederick and Sean Boyle built Momentum by doing the work close to the customer: photographing spaces, solving local visibility and helping owners make the next smart move.</p>
      </Reveal>

      <div className="founder-stage">
        <article className="founder founder--mac">
          <div className="founder__photo founder__photo--mac" role="img" aria-label="Mac Frederick, the blond founder of Need Momentum" />
          <div className="founder__caption">
            <div><strong>Mac Frederick</strong><span>Blond founder · strategy &amp; growth</span></div>
            <span className="founder__signal" aria-hidden="true" />
          </div>
        </article>

        <figure className="founder-team">
          <img src="/assets/founders/mac-sean-award-2026.webp" alt="Mac Frederick, blond and on the left, with Sean Boyle, dark-haired and on the right, holding their 2026 Inc. award" />
          <figcaption>Mac left. Sean right. One team, every angle.</figcaption>
        </figure>

        <article className="founder founder--sean">
          <img className="founder__photo" src="/assets/founders/sean-boyle-founder.webp" alt="Sean Boyle, the dark-haired founder of Need Momentum" />
          <div className="founder__caption">
            <div><strong>Sean Boyle</strong><span>Dark-haired founder · operations &amp; media</span></div>
            <span className="founder__signal" aria-hidden="true" />
          </div>
        </article>
      </div>

      <a className="founder-cta" href={auditUrl}>Bring us your next challenge <ArrowUpRight /></a>
    </section>
  );
}

export function Founders({ variant }: { variant: 'map' | 'signal' }) {
  return variant === 'signal' ? <SignalFounders /> : <MapFounders />;
}
