import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function BrandLockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand-lockup ${inverse ? 'brand-lockup--inverse' : ''}`} href="#top" aria-label="Need Momentum home">
      <span className="brand-lockup__need">Need</span>
      <span className="brand-lockup__plate">
        <img src="/assets/brand/need-momentum-logo.png" alt="Momentum" />
      </span>
    </a>
  );
}

export function Header({ variant }: { variant: 'map' | 'signal' }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <header className={`site-header site-header--${variant}`}>
      <BrandLockup inverse={variant === 'signal'} />
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
        {open ? <X /> : <Menu />}
      </button>
      <nav id="site-nav" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Primary">
        <a href="#top">Home</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#portfolio">Portfolio</a>
        <a href="#team">Team</a>
        <a className="nav-contact-mobile" href="#contact">Contact Us</a>
      </nav>
      <a className="header-cta" href="#contact">
        Contact Us <ArrowUpRight aria-hidden="true" />
      </a>
    </header>
  );
}
