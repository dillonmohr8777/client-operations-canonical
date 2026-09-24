(function () {
  'use strict';

  const TAU = Math.PI * 2;

  function seededRandom(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6D2B79F5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function ease(value) {
    const x = Math.max(0, Math.min(1, value));
    return 1 - Math.pow(1 - x, 4);
  }

  class BrandParticles {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', { alpha: true });
      this.options = Object.assign({
        src: '/assets/bigorange-logo-particle-8777.png',
        count: 4200,
        seed: 8777,
        loop: true,
        settle: false,
        assembleMs: 1450,
        holdMs: 4200,
        dissolveMs: 1150,
        pointSize: 1.35,
        opacity: 1
      }, options || {});
      this.random = seededRandom(this.options.seed);
      this.points = [];
      this.startedAt = performance.now();
      this.frame = 0;
      this.visible = true;
      this.pointer = { x: 0, y: 0 };
      this.resolveTarget = canvas.closest('[data-brand-resolve]');
      this.didResolve = false;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas);
      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        if (this.visible && !this.frame) this.frame = requestAnimationFrame((time) => this.draw(time));
      }, { rootMargin: '240px' });
      this.intersectionObserver.observe(canvas);
      canvas.addEventListener('pointermove', (event) => this.onPointer(event), { passive: true });
      canvas.addEventListener('pointerleave', () => { this.pointer.x = 0; this.pointer.y = 0; });
      this.load();
    }

    async load() {
      const image = new Image();
      image.decoding = 'async';
      image.src = this.options.src;
      try {
        await image.decode();
      } catch (error) {
        if (!image.complete || !image.naturalWidth) {
          this.markResolved();
          return;
        }
      }
      this.image = image;
      this.sampleLogo();
      this.resize();
      this.startedAt = performance.now();
      if (!this.frame) this.frame = requestAnimationFrame((time) => this.draw(time));
    }

    markResolved() {
      if (this.didResolve) return;
      this.didResolve = true;
      this.resolveTarget?.classList.add('is-resolved');
      this.canvas.dispatchEvent(new CustomEvent('brandresolved'));
    }

    sampleLogo() {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 1000;
      sampleCanvas.height = 380;
      const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
      const scale = Math.min((sampleCanvas.width - 24) / this.image.naturalWidth, (sampleCanvas.height - 24) / this.image.naturalHeight);
      const width = this.image.naturalWidth * scale;
      const height = this.image.naturalHeight * scale;
      sampleContext.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleContext.drawImage(this.image, (sampleCanvas.width - width) / 2, (sampleCanvas.height - height) / 2, width, height);
      const pixels = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      const candidates = [];
      for (let y = 0; y < sampleCanvas.height; y += 2) {
        for (let x = 0; x < sampleCanvas.width; x += 2) {
          const offset = (y * sampleCanvas.width + x) * 4;
          if (pixels[offset + 3] < 58) continue;
          candidates.push({
            u: x / sampleCanvas.width,
            v: y / sampleCanvas.height,
            color: `rgb(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]})`
          });
        }
      }
      const count = Math.min(this.options.count, Math.max(900, candidates.length));
      this.points = Array.from({ length: count }, (_, index) => {
        const candidate = candidates[Math.floor((index / count) * candidates.length + this.random() * Math.max(1, candidates.length / count)) % candidates.length];
        const angle = this.random() * TAU;
        const radius = 0.22 + Math.pow(this.random(), 0.72) * 0.82;
        return {
          u: candidate.u,
          v: candidate.v,
          color: candidate.color,
          sx: 0.5 + Math.cos(angle) * radius,
          sy: 0.5 + Math.sin(angle) * radius * 0.48,
          phase: this.random() * TAU,
          depth: this.random(),
          size: 0.66 + this.random() * 1.55
        };
      });
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 1.6);
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      const nextWidth = Math.round(this.width * dpr);
      const nextHeight = Math.round(this.height * dpr);
      if (this.canvas.width !== nextWidth || this.canvas.height !== nextHeight) {
        this.canvas.width = nextWidth;
        this.canvas.height = nextHeight;
        this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      this.logoWidth = Math.min(this.width * 0.9, this.height * 2.5);
      this.logoHeight = this.logoWidth * 0.38;
      if (this.logoHeight > this.height * 0.78) {
        this.logoHeight = this.height * 0.78;
        this.logoWidth = this.logoHeight / 0.38;
      }
      this.left = (this.width - this.logoWidth) / 2;
      this.top = (this.height - this.logoHeight) / 2;
    }

    onPointer(event) {
      if (this.reduced) return;
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      this.pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    progress(time) {
      if (this.reduced) return 1;
      if (this.options.settle) return ease((time - this.startedAt) / this.options.assembleMs);
      const total = this.options.assembleMs + this.options.holdMs + this.options.dissolveMs;
      const elapsed = this.options.loop ? (time - this.startedAt) % total : Math.min(total, time - this.startedAt);
      if (elapsed < this.options.assembleMs) return ease(elapsed / this.options.assembleMs);
      if (elapsed < this.options.assembleMs + this.options.holdMs) return 1;
      return 1 - ease((elapsed - this.options.assembleMs - this.options.holdMs) / this.options.dissolveMs);
    }

    draw(time) {
      this.frame = 0;
      if (!this.context || !this.width || !this.points.length) return;
      this.context.clearRect(0, 0, this.width, this.height);
      const morph = this.progress(time);
      if (morph >= .998) this.markResolved();
      const inverse = 1 - morph;
      const driftTime = time * 0.00034;
      this.context.globalAlpha = this.options.opacity;
      for (const point of this.points) {
        const targetX = this.left + point.u * this.logoWidth;
        const targetY = this.top + point.v * this.logoHeight;
        const orbit = Math.sin(driftTime + point.phase) * (3 + point.depth * 7) * inverse;
        const scatterX = point.sx * this.width + Math.cos(point.phase + driftTime) * 20;
        const scatterY = point.sy * this.height + Math.sin(point.phase * 0.7 + driftTime) * 14;
        const x = scatterX + (targetX - scatterX) * morph + this.pointer.x * point.depth * 7 * inverse + orbit;
        const y = scatterY + (targetY - scatterY) * morph + this.pointer.y * point.depth * 5 * inverse;
        const size = this.options.pointSize * point.size * (0.72 + morph * 0.35);
        this.context.fillStyle = point.color;
        this.context.globalAlpha = this.options.opacity * (0.38 + point.depth * 0.62);
        this.context.beginPath();
        this.context.arc(x, y, size, 0, TAU);
        this.context.fill();
      }
      this.context.globalAlpha = 1;
      if (this.visible && (!this.reduced || morph < 1) && !(this.options.settle && morph >= .998)) {
        this.frame = requestAnimationFrame((next) => this.draw(next));
      }
    }

    destroy() {
      cancelAnimationFrame(this.frame);
      this.resizeObserver.disconnect();
      this.intersectionObserver.disconnect();
    }
  }

  window.BrandParticles = BrandParticles;
})();
