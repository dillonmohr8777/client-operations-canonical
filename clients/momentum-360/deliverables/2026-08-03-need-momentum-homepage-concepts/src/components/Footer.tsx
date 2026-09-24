import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { auditUrl } from '../shared/content';
import { BrandLockup } from './Header';
import { SignalScene } from './SignalScene';

export function FinalCta({ variant }: { variant: 'map' | 'signal' }) {
  if (variant === 'signal') {
    return (
      <section className="final-cta final-cta--signal contact-hub" id="contact">
        <div>
          <h2>Tell us what needs momentum.</h2>
          <p>Start with the right conversation for the work in front of you.</p>
        </div>
        <div className="contact-hub__actions">
          <a href="https://www.needmomentum.com/contact/">Work with us <ArrowUpRight /></a>
          <a href="https://www.momentumvirtualtours.com/contact/">Book a tour or shoot <ArrowUpRight /></a>
          <a href={auditUrl}>Request a free audit <ArrowUpRight /></a>
        </div>
      </section>
    );
  }

  const copy = variant === 'map'
    ? {
        title: 'Find the move that changes your map.',
        body: 'We’ll look at the signals around your business and show you where momentum is getting lost.'
      }
    : {
        title: 'Build momentum around your business.',
        body: 'Start with a free audit and find the move that can create momentum now.'
      };
  return (
    <section className={`final-cta final-cta--${variant}`}>
      <div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>
      <a href={auditUrl}>Request a free audit <ArrowUpRight /></a>
    </section>
  );
}

export function Footer({ variant }: { variant: 'map' | 'signal' }) {
  if (variant === 'signal') {
    return (
      <footer className="footer footer--signal footer--particle">
        <div className="footer-particle-stage" aria-hidden="true">
          <SignalScene variant="wordmark" />
          <div className="footer-atom-field"><span /><span /><span /></div>
        </div>
        <div className="footer__statement">
          <p>Strategy, creative, local presence and spatial media in one connected Philadelphia company.</p>
          <a className="footer__book" href="https://www.momentumvirtualtours.com/contact/">Book now <ArrowUpRight /></a>
        </div>
        <div className="footer__contact">
          <a href="https://maps.google.com/?q=1635+Market+St+%231601+Philadelphia+PA+19103"><MapPin aria-hidden="true" /><span>1635 Market St. #1601<br />Philadelphia, PA 19103</span></a>
          <a href="tel:+12152976193"><Phone aria-hidden="true" /><span>215 297 6193</span></a>
          <a href="mailto:hi@needmomentum.com"><Mail aria-hidden="true" /><span>hi@needmomentum.com</span></a>
        </div>
        <div className="footer__socials" aria-label="Need Momentum social profiles">
          <a href="https://www.facebook.com/momentumdigitalagency/" aria-label="Need Momentum on Facebook"><img src="/assets/social/facebook.svg" alt="" /></a>
          <a href="https://www.instagram.com/needmomentum/" aria-label="Need Momentum on Instagram"><img src="/assets/social/instagram.svg" alt="" /></a>
          <a href="https://www.linkedin.com/company/momentum-digital" aria-label="Need Momentum on LinkedIn"><img src="/assets/social/linkedin.svg" alt="" /></a>
          <a href="https://www.youtube.com/channel/UChYVFhQb84HNq6jexYeIHCQ" aria-label="Need Momentum on YouTube"><img src="/assets/social/youtube.svg" alt="" /></a>
        </div>
        <div className="footer__links">
          <a href="https://www.needmomentum.com/privacy-policy/">Privacy</a>
          <a href="https://www.needmomentum.com/contact/">Contact</a>
        </div>
        <small>© 2026 Momentum Digital LLC.</small>
      </footer>
    );
  }
  return (
    <footer className={`footer footer--${variant}`}>
      <BrandLockup inverse />
      <p>Digital growth, local presence and spatial media in one connected company.</p>
      <div className="footer__links">
        <a href="https://www.needmomentum.com/privacy-policy/">Privacy</a>
        <a href="https://www.needmomentum.com/contact-us/">Contact</a>
      </div>
      <small>© 2026 Momentum Digital LLC. Concept preview.</small>
    </footer>
  );
}
