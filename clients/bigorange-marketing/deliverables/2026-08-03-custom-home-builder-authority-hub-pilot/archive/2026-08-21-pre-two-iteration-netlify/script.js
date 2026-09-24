(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('.scroll-progress span');
  const revealNodes = document.querySelectorAll('[data-reveal], [data-image-reveal], .type-line');

  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add('is-in'));
  }

  requestAnimationFrame(() => document.querySelectorAll('.hero .type-line').forEach((node) => node.classList.add('is-in')));

  let ticking = false;
  const updateScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
    document.querySelectorAll('.image-story__media').forEach((media) => {
      const rect = media.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const shift = Math.max(-90, Math.min(90, (innerHeight / 2 - center) * 0.08));
      media.style.setProperty('--image-shift', shift.toFixed(2));
    });
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  const rail = document.querySelector('[data-media-rail]');
  const cards = rail ? [...rail.querySelectorAll('.media-card')] : [];
  const moveRail = (direction) => {
    if (!rail || !cards.length) return;
    const step = cards[0].getBoundingClientRect().width + 22;
    rail.scrollBy({ left: direction * step, behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  document.querySelector('[data-gallery-prev]')?.addEventListener('click', () => moveRail(-1));
  document.querySelector('[data-gallery-next]')?.addEventListener('click', () => moveRail(1));

  if (rail) {
    let pointerDown = false;
    let startX = 0;
    let startScroll = 0;
    rail.addEventListener('pointerdown', (event) => {
      pointerDown = true;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add('is-dragging');
      rail.setPointerCapture(event.pointerId);
    });
    rail.addEventListener('pointermove', (event) => {
      if (pointerDown) rail.scrollLeft = startScroll - (event.clientX - startX);
    });
    const release = () => { pointerDown = false; rail.classList.remove('is-dragging'); };
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
  }

  class ParticleLogo {
    constructor(root) {
      this.root = root;
      this.canvas = root.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.image = root.querySelector('img');
      this.particles = [];
      this.active = false;
      this.raf = 0;
      this.resize = this.resize.bind(this);
      this.frame = this.frame.bind(this);
      this.image.addEventListener('load', this.resize, { once: true });
      if (this.image.complete) this.resize();
      addEventListener('resize', this.resize, { passive: true });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          this.active = entry.isIntersecting;
          if (this.active && !this.raf) this.raf = requestAnimationFrame(this.frame);
        }, { threshold: .2 }).observe(root);
      } else this.active = true;
      this.raf = requestAnimationFrame(this.frame);
    }

    resize() {
      const rect = this.root.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.buildParticles(rect.width, rect.height);
    }

    buildParticles(width, height) {
      if (!this.image.naturalWidth) return;
      const sample = document.createElement('canvas');
      const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
      const targetWidth = Math.min(560, width * .7);
      const targetHeight = targetWidth * this.image.naturalHeight / this.image.naturalWidth;
      sample.width = Math.max(1, Math.floor(targetWidth));
      sample.height = Math.max(1, Math.floor(targetHeight));
      sampleCtx.drawImage(this.image, 0, 0, sample.width, sample.height);
      const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
      const step = width < 620 ? 7 : 5;
      const ox = (width - sample.width) / 2;
      const oy = (height - sample.height) / 2;
      const next = [];
      for (let y = 0; y < sample.height; y += step) {
        for (let x = 0; x < sample.width; x += step) {
          const alpha = pixels[(y * sample.width + x) * 4 + 3];
          if (alpha > 90) {
            const old = this.particles[next.length];
            next.push({
              x: old?.x ?? Math.random() * width,
              y: old?.y ?? height + Math.random() * 160,
              tx: ox + x,
              ty: oy + y,
              vx: 0,
              vy: 0,
              r: 1 + Math.random() * 1.7,
              warm: Math.random() > .72
            });
          }
        }
      }
      this.particles = next.slice(0, 1800);
      if (reducedMotion) this.particles.forEach((p) => { p.x = p.tx; p.y = p.ty; });
    }

    frame(time) {
      this.raf = 0;
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;
      this.ctx.clearRect(0, 0, width, height);
      this.particles.forEach((p, index) => {
        if (!reducedMotion) {
          const targetX = this.active ? p.tx : p.tx + Math.sin(time * .00045 + index) * 50;
          const targetY = this.active ? p.ty : p.ty + 70 + Math.cos(time * .00035 + index * .3) * 40;
          p.vx = (p.vx + (targetX - p.x) * .025) * .86;
          p.vy = (p.vy + (targetY - p.y) * .025) * .86;
          p.x += p.vx;
          p.y += p.vy;
        }
        this.ctx.beginPath();
        this.ctx.fillStyle = p.warm ? 'rgba(244,119,33,.94)' : 'rgba(255,255,255,.82)';
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fill();
      });
      if (this.active && !reducedMotion) this.raf = requestAnimationFrame(this.frame);
    }
  }

  const particleRoot = document.querySelector('[data-particle-logo]');
  if (particleRoot) new ParticleLogo(particleRoot);
})();
