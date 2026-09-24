import { ArrowDown, ArrowUpRight, CircleCheck, Crosshair, Orbit, ScanLine } from 'lucide-react';
import { EarthScene } from '../components/EarthScene';
import { FinalCta, Footer } from '../components/Footer';
import { Founders } from '../components/Founders';
import { Header } from '../components/Header';
import { Reveal } from '../components/Reveal';
import { ScrollProgress } from '../components/ScrollProgress';
import { auditUrl, proofImages, services, values } from '../shared/content';

export function MapHomepage() {
  return (
    <div className="map-page" id="top">
      <ScrollProgress />
      <div className="map-hero">
        <Header variant="map" />
        <div className="map-hero__earth" aria-hidden="true"><EarthScene /></div>
        <div className="map-hero__glow" aria-hidden="true" />
        <main className="map-hero__content">
          <div className="map-hero__copy">
            <h1>Put Your Business <span>on the Map.</span></h1>
            <p>Need Momentum brings search, ads, websites, social and spatial media together in one growth team.</p>
            <div className="hero-actions">
              <a className="button button--yellow" href={auditUrl}>Request a free audit <ArrowUpRight /></a>
              <a className="text-link" href="#momentum-360">Explore Momentum 360 <ArrowDown /></a>
            </div>
          </div>
          <div className="map-hero__lens">
            <div className="lens__ring lens__ring--one" />
            <div className="lens__ring lens__ring--two" />
            <Crosshair aria-hidden="true" />
            <span>Philadelphia</span>
            <strong>40.007° N<br />75.135° W</strong>
          </div>
        </main>
        <div className="map-hero__status">
          <span><i /> Need Momentum</span>
          <span>Digital growth + spatial media</span>
          <span>Built for the next customer</span>
        </div>
      </div>

      <section className="map-unify" id="system">
        <Reveal className="map-unify__statement">
          <h2>Your customer does not experience channels. They experience one business.</h2>
          <p>So the search result, ad, website, review, photo and in-person space should all point in the same direction.</p>
        </Reveal>
        <div className="map-unify__diagram" aria-label="Need Momentum connects discovery, trust and action">
          <div className="diagram-node diagram-node--search"><ScanLine /><span>Discovery</span></div>
          <div className="diagram-orbit"><span>Need<br />Momentum</span></div>
          <div className="diagram-node diagram-node--trust"><Orbit /><span>Trust</span></div>
          <div className="diagram-node diagram-node--action"><Crosshair /><span>Action</span></div>
        </div>
      </section>

      <section className="atlas">
        <Reveal className="section-heading section-heading--light">
          <h2>A growth atlas, not a pile of tactics.</h2>
          <p>Choose the route you need now. Every service is designed to connect with the rest when the business is ready.</p>
        </Reveal>
        <div className="atlas__grid">
          {services.map(({ title, short, description, icon: Icon, hue }, index) => (
            <article className={`atlas-route atlas-route--${hue}`} key={title}>
              <div className="atlas-route__bearing"><Icon /><span>{String(index + 1).padStart(2, '0')}°</span></div>
              <p>{short}</p>
              <h3>{title}</h3>
              <span>{description}</span>
              <a href={auditUrl} aria-label={`Discuss ${title}`}>Plot this route <ArrowUpRight /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="m360-feature" id="momentum-360">
        <div className="m360-feature__gallery">
          {proofImages.slice(0, 3).map((image, index) => (
            <figure key={image.src} style={{ '--i': index } as React.CSSProperties}>
              <img src={image.src} alt={image.alt} />
              <figcaption>{image.label}</figcaption>
            </figure>
          ))}
        </div>
        <Reveal className="m360-feature__copy">
          <span className="m360-mark">Momentum 360</span>
          <h2>Your physical space belongs in the growth system.</h2>
          <p>Momentum 360 is now the spatial-media engine inside Need Momentum: virtual tours, photography, video and 3D experiences that turn place into proof.</p>
          <ul>
            <li><CircleCheck /> Nationwide capture network</li>
            <li><CircleCheck /> Google-ready virtual experiences</li>
            <li><CircleCheck /> Media built to travel across search, web and social</li>
          </ul>
          <a className="button button--blue" href="https://www.momentumvirtualtours.com/services/custom-360-virtual-tours/">Explore Momentum 360 <ArrowUpRight /></a>
        </Reveal>
      </section>

      <section className="map-work" id="work">
        <Reveal className="section-heading">
          <h2>Real places. Real people. One connected signal.</h2>
          <p>The work should feel like the business, not like an agency template.</p>
        </Reveal>
        <div className="map-work__strip">
          {proofImages.map((image, index) => (
            <figure key={image.src} className={`map-work__frame map-work__frame--${index + 1}`}>
              <img src={image.src} alt={image.alt} />
              <figcaption><span>{image.label}</span><small>Momentum 360 source work</small></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="map-principles">
        {values.map(({ icon: Icon, title, text }) => (
          <Reveal className="map-principle" key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </Reveal>
        ))}
      </section>

      <Founders variant="map" />
      <section className="recognition">
        <p>Independent recognition. Shared standard.</p>
        <div>
          <img src="/assets/badges/inc-5000.png" alt="Inc. 5000" />
          <img src="/assets/badges/philly-100.png" alt="Philadelphia 100" />
          <img src="/assets/badges/google-partner.webp" alt="Google Partner" />
          <img src="/assets/badges/best-of-pennsylvania.webp" alt="Best of Pennsylvania" />
        </div>
      </section>
      <FinalCta variant="map" />
      <Footer variant="map" />
    </div>
  );
}
