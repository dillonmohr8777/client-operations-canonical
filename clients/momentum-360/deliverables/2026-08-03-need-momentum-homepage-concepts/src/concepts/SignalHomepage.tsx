import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight, Play } from 'lucide-react';
import { AmbientParticleSpine, SignalScene } from '../components/SignalScene';
import { FinalCta, Footer } from '../components/Footer';
import { Founders } from '../components/Founders';
import { Header } from '../components/Header';
import { Reveal } from '../components/Reveal';
import { ScrollProgress } from '../components/ScrollProgress';
import { auditUrl, proofImages, services } from '../shared/content';

const teamSpotlight = [
  {
    name: 'Melissa Silber',
    role: 'Director of Operations',
    image: '/assets/team/melissa-silber.jpg'
  },
  {
    name: 'Jenny McClain Miller',
    role: 'Account Manager',
    image: '/assets/team/jenny-mcclain-miller.jpg'
  },
  {
    name: 'Dillon Mohr',
    role: 'AI Marketing Director',
    image: '/assets/team/dillon-mohr.jpg'
  },
  {
    name: 'Obaid Shaikh',
    role: 'Full Stack Web Developer',
    image: '/assets/team/obaid-shaikh.webp'
  },
  {
    name: 'Madison Spada',
    role: 'Social Media Account Manager',
    image: '/assets/team/madison-spada.jpg'
  },
  {
    name: 'Jason Fallon',
    role: 'Sales Director',
    image: '/assets/team/jason-fallon.jpg'
  }
];

function SignalManifesto() {
  const section = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = section.current;
    if (!node || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    node.classList.add('is-motion-ready');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('is-in-view');
      observer.disconnect();
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={section} className="signal-manifesto">
      <div className="signal-manifesto__line"><span>Search finds you.</span><strong>Story holds attention.</strong></div>
      <div className="signal-manifesto__line"><strong>Space builds trust.</strong><span>Systems move people.</span></div>
      <p>One company moves every part together.</p>
    </section>
  );
}

function ServicesGallery() {
  return (
    <section className="signal-services-gallery" id="services" aria-labelledby="signal-services-title">
      <div className="signal-section-heading signal-services-gallery__heading">
        <h2 id="signal-services-title">One team. Every way forward.</h2>
        <p>Choose the work. See how it connects.</p>
      </div>
      <div className="signal-services-grid">
        {services.map(({ title, short, description, icon: Icon, image, hue }) => (
          <a className="signal-service-tile" data-hue={hue} href="#portfolio" key={title}>
            <article>
              <figure>
                <img src={image} alt="" loading="lazy" decoding="async" />
                <span aria-hidden="true" />
                <Icon aria-hidden="true" />
              </figure>
              <div>
                <p>{short}</p>
                <h3>{title}</h3>
                <span>{description}</span>
                <strong>See related work <ArrowUpRight aria-hidden="true" /></strong>
              </div>
            </article>
          </a>
        ))}
      </div>
    </section>
  );
}

function SignalProof() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = section.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
        node.style.setProperty('--proof-progress', String(progress));
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section className="signal-proof" id="portfolio" ref={section}>
      <div className="signal-proof__sticky">
        <div className="signal-proof__copy">
          <h2>A portfolio that moves.</h2>
          <p>Real places and real production work take over the frame.</p>
          <a href="https://www.needmomentum.com/case-studies/">Explore the current work <ArrowUpRight /></a>
        </div>
        <div className="signal-proof__stage">
          {proofImages.slice(0, 4).map((image, index) => (
            <figure className={`proof-layer proof-layer--${index + 1}`} key={image.src}>
              <img src={image.src} alt={image.alt} />
              <figcaption>{image.label}</figcaption>
            </figure>
          ))}
          <div className="signal-proof__reticle" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="signal-proof__wipe" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="signal-about" id="about">
      <div className="signal-about__story">
        <h2>Born in Philly.<br />Built to move.</h2>
        <p>Mac Frederick brought his Google small business experience into Momentum in 2015. Sean Boyle helped build it into one connected agency, with Momentum 360 as its spatial media arm.</p>
        <strong>Boutique by relationship. Broad by capability.</strong>
      </div>
      <div className="signal-about__recognition">
        <p>Recognition earned by the team behind the work.</p>
        <div>
          <img src="/assets/badges/inc-5000.png" alt="Inc. 5000" />
          <img src="/assets/badges/philly-100.png" alt="Philadelphia 100" />
          <img src="/assets/badges/google-partner.webp" alt="Google Partner" />
          <img src="/assets/badges/best-of-pennsylvania.webp" alt="Best of Pennsylvania" />
        </div>
      </div>
    </section>
  );
}

function TeamSpotlight() {
  return (
    <section className="signal-team-roster" id="team" aria-labelledby="team-roster-title">
      <div className="signal-section-heading">
        <h2 id="team-roster-title">The team behind the momentum.</h2>
        <p>Strategy, operations, creative, AI, web and account leadership, connected.</p>
      </div>
      <div className="signal-team-grid">
        {teamSpotlight.map((member) => (
          <article key={member.name}>
            <img src={member.image} alt={member.name} loading="lazy" decoding="async" />
            <div><h3>{member.name}</h3><p>{member.role}</p></div>
          </article>
        ))}
      </div>
      <a className="signal-team-link" href="https://www.needmomentum.com/team/">Meet the full team <ArrowUpRight /></a>
    </section>
  );
}

export function SignalHomepage() {
  useEffect(() => {
    document.title = 'Need Momentum — Make It Move.';
  }, []);

  return (
    <div className="signal-page signal-page--v2" id="top">
      <AmbientParticleSpine />
      <ScrollProgress />
      <section className="signal-hero">
        <Header variant="signal" />
        <div className="signal-hero__scene" aria-hidden="true"><SignalScene /></div>
        <main className="signal-hero__content">
          <h1><span data-text="Need Momentum?">Need Momentum?</span><span data-text="Make It Move.">Make It Move.</span></h1>
          <p className="signal-hero__intro">A Philadelphia born digital marketing agency. Boutique by relationship. Built for serious work.</p>
          <div className="hero-actions">
            <a className="button button--yellow button--signal-3d" href={auditUrl}>Request a free audit <ArrowUpRight /></a>
            <a className="text-link text-link--glass" href="#services">See what we do <ArrowDown /></a>
          </div>
        </main>
        <div className="signal-hero__ticker" aria-hidden="true">
          <span>GET FOUND</span><i /> <span>GET CHOSEN</span><i /> <span>SHOW THE SPACE</span><i /> <span>BUILD MOMENTUM</span><i />
        </div>
      </section>

      <SignalManifesto />

      <ServicesGallery />
      <SignalProof />

      <section className="signal-m360" id="momentum-360">
        <div className="signal-m360__media">
          <img src="/assets/proof/hospitality.jpg" alt="A hospitality space captured for Momentum 360" />
          <a href="https://www.momentumvirtualtours.com/services/custom-360-virtual-tours/" aria-label="Explore the Momentum 360 virtual tour story"><Play fill="currentColor" /></a>
          <span>Move through the space</span>
        </div>
        <Reveal className="signal-m360__copy">
          <div className="signal-m360__logo-chamber" role="img" aria-label="Momentum 360 logo forming from particles">
            <span className="logo-orbit logo-orbit--one" aria-hidden="true" />
            <span className="logo-orbit logo-orbit--two" aria-hidden="true" />
            <div className="signal-m360__particle-logo" aria-hidden="true"><SignalScene variant="m360" /></div>
          </div>
          <h2>The spatial-media arm of Need Momentum.</h2>
          <p>Virtual tours, photography, video and 3D rendering make a business tangible before the customer ever arrives.</p>
          <a className="signal-inline-cta" href="https://www.momentumvirtualtours.com/services/custom-360-virtual-tours/">Step inside the work <ArrowUpRight /></a>
        </Reveal>
      </section>

      <AboutSection />
      <Founders variant="signal" />
      <TeamSpotlight />
      <FinalCta variant="signal" />
      <Footer variant="signal" />
    </div>
  );
}
