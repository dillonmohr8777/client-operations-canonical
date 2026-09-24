(function () {
  "use strict";

  const TAU = Math.PI * 2;

  function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
  }

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

  function easeOutQuint(value) {
    const x = clamp(value);
    return 1 - Math.pow(1 - x, 5);
  }

  function easeInOutCubic(value) {
    const x = clamp(value);
    return x < 0.5
      ? 4 * x * x * x
      : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  const ORBIT_SPECS = [
    { rotation: 0, radiusX: 1, radiusY: 0.42, speed: 0.00028, alpha: 0.56 },
    { rotation: Math.PI / 3, radiusX: 0.96, radiusY: 0.42, speed: 0.00023, alpha: 0.46 },
    { rotation: -Math.PI / 3, radiusX: 0.96, radiusY: 0.42, speed: 0.0002, alpha: 0.4 }
  ];

  class BrandParticles {
    constructor(canvas, options) {
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError("BrandParticles requires a canvas element.");
      }

      this.canvas = canvas;
      this.context = canvas.getContext("2d", { alpha: true, desynchronized: true });
      if (!this.context) {
        throw new Error("The particle canvas could not be initialized.");
      }

      this.options = Object.assign({
        src: "assets/bigorange-logo-particle-8777.png",
        seed: 8777,
        orbitIntroMs: 1400,
        assembleMs: 2900,
        holdMs: 900,
        gridStep: 4,
        particleScale: 0.82,
        opacity: 1
      }, options || {});
      this.random = seededRandom(this.options.seed);
      this.points = [];
      this.frame = 0;
      this.visible = true;
      this.didLock = false;
      this.didResolve = false;
      this.didFail = false;
      this.startedAt = 0;
      this.targetImage = canvas.parentElement?.querySelector("img") || null;

      this.resizeObserver = typeof ResizeObserver === "function"
        ? new ResizeObserver(() => this.resize())
        : null;
      this.resizeObserver?.observe(canvas);
      if (this.targetImage) this.resizeObserver?.observe(this.targetImage);

      this.intersectionObserver = typeof IntersectionObserver === "function"
        ? new IntersectionObserver((entries) => {
          this.visible = entries.some((entry) => entry.isIntersecting);
          if (this.visible && !this.frame && !this.didResolve && this.startedAt) {
            this.frame = requestAnimationFrame((time) => this.draw(time));
          }
        }, { rootMargin: "180px" })
        : null;
      this.intersectionObserver?.observe(canvas);

      this.load();
    }

    emit(name, detail) {
      this.canvas.dispatchEvent(new CustomEvent(name, { detail }));
    }

    async load() {
      try {
        const image = new Image();
        image.decoding = "async";

        const sourceUrl = new URL(this.options.src, document.baseURI);
        if (sourceUrl.origin !== window.location.origin) image.crossOrigin = "anonymous";
        image.src = sourceUrl.href;

        if (typeof image.decode === "function") {
          try {
            await image.decode();
          } catch (error) {
            if (!image.complete || !image.naturalWidth) throw error;
          }
        } else {
          await new Promise((resolve, reject) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", reject, { once: true });
          });
        }

        if (!image.naturalWidth || !image.naturalHeight) {
          throw new Error("The exact logo image did not load.");
        }

        this.image = image;
        this.sampleLogo();
        if (this.points.length < 300) {
          throw new Error("The logo mask did not produce enough particles.");
        }

        this.resize();
        this.startedAt = performance.now() - 110;
        this.emit("brandready", {
          pointCount: this.points.length,
          width: image.naturalWidth,
          height: image.naturalHeight
        });
        if (!this.frame) this.frame = requestAnimationFrame((time) => this.draw(time));
      } catch (error) {
        this.fail(error);
      }
    }

    sampleLogo() {
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = this.image.naturalWidth;
      sampleCanvas.height = this.image.naturalHeight;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) throw new Error("The logo sampler could not be initialized.");

      sampleContext.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleContext.drawImage(this.image, 0, 0);
      const pixels = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      const step = Math.max(2, Math.round(this.options.gridStep));
      const points = [];

      for (let y = Math.floor(step / 2); y < sampleCanvas.height; y += step) {
        for (let x = Math.floor(step / 2); x < sampleCanvas.width; x += step) {
          const offset = (y * sampleCanvas.width + x) * 4;
          const alpha = pixels[offset + 3] / 255;
          if (alpha < 0.24) continue;

          const u = x / (sampleCanvas.width - 1);
          const v = y / (sampleCanvas.height - 1);
          const orbit = points.length % ORBIT_SPECS.length;
          const atomRole = this.random() < 0.1 ? "nucleus" : "orbit";
          points.push({
            u,
            v,
            alpha,
            color: `rgb(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]})`,
            orbit,
            atomRole,
            orbitAngle: this.random() * TAU,
            orbitRadius: 0.995 + this.random() * 0.01,
            direction: orbit === 1 ? -1 : 1,
            nucleusAngle: this.random() * TAU,
            nucleusRadius: Math.sqrt(this.random()),
            introVisible: this.random() < 0.16,
            delay: clamp(
              (u < 0.34 ? u * 0.28 : 0.12 + (u - 0.34) * 0.62) +
                v * 0.025 + this.random() * 0.03,
              0,
              0.58
            )
          });
        }
      }

      this.points = points;
    }

    resize() {
      const canvasRect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.dpr = dpr;
      this.width = Math.max(1, canvasRect.width);
      this.height = Math.max(1, canvasRect.height);
      const nextWidth = Math.round(this.width * dpr);
      const nextHeight = Math.round(this.height * dpr);

      if (this.canvas.width !== nextWidth || this.canvas.height !== nextHeight) {
        this.canvas.width = nextWidth;
        this.canvas.height = nextHeight;
      }
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const imageRect = this.targetImage?.getBoundingClientRect();
      if (imageRect?.width && imageRect?.height) {
        this.logoWidth = imageRect.width;
        this.logoHeight = imageRect.height;
        this.left = imageRect.left - canvasRect.left;
        this.top = imageRect.top - canvasRect.top;
      } else {
        const ratio = this.image ? this.image.naturalWidth / this.image.naturalHeight : 1000 / 338;
        this.logoWidth = Math.min(this.width * 0.86, this.height * ratio * 0.72);
        this.logoHeight = this.logoWidth / ratio;
        this.left = (this.width - this.logoWidth) / 2;
        this.top = (this.height - this.logoHeight) / 2;
      }

      const screenSpacing = this.logoWidth * this.options.gridStep / (this.image?.naturalWidth || 1000);
      this.particleSize = clamp(screenSpacing * this.options.particleScale, 1.05, 3.8);
      this.atomCenterX = this.width / 2;
      this.atomCenterY = this.height / 2;
      this.orbitRadiusX = Math.min(
        this.width * 0.28,
        Math.max(Math.min(this.logoWidth * 0.34, 310), 84)
      );
      this.orbitRadiusY = Math.min(
        this.height * 0.28,
        Math.max(this.orbitRadiusX * 0.52, 48)
      );
      this.nucleusRadius = clamp(Math.min(this.orbitRadiusY * 0.18, 24), 10, 24);
    }

    orbitPosition(point, elapsed) {
      const spec = ORBIT_SPECS[point.orbit];
      const angle = point.orbitAngle + elapsed * spec.speed * point.direction;
      const localX = Math.cos(angle) * this.orbitRadiusX * spec.radiusX * point.orbitRadius;
      const localY = Math.sin(angle) * this.orbitRadiusY * spec.radiusY * point.orbitRadius;
      const cosine = Math.cos(spec.rotation);
      const sine = Math.sin(spec.rotation);
      return {
        x: this.atomCenterX + localX * cosine - localY * sine,
        y: this.atomCenterY + localX * sine + localY * cosine
      };
    }

    atomPosition(point, elapsed) {
      if (point.atomRole !== "nucleus") return this.orbitPosition(point, elapsed);
      const pulse = 0.97 + Math.sin(elapsed * 0.004 + point.nucleusAngle) * 0.03;
      return {
        x: this.atomCenterX + Math.cos(point.nucleusAngle) * this.nucleusRadius * point.nucleusRadius * pulse,
        y: this.atomCenterY + Math.sin(point.nucleusAngle) * this.nucleusRadius * point.nucleusRadius * 0.72 * pulse
      };
    }

    drawAtomicField(overall, elapsed) {
      const reveal = easeOutQuint(clamp(elapsed / 420));
      const fade = 1 - easeInOutCubic(clamp((overall - 0.06) / 0.48));
      const alpha = reveal * fade;
      if (alpha <= 0.003) return;

      this.context.save();
      this.context.translate(this.atomCenterX, this.atomCenterY);
      this.context.lineWidth = Math.max(1.1, 1.25 / this.dpr);
      for (const spec of ORBIT_SPECS) {
        this.context.save();
        this.context.rotate(spec.rotation);
        this.context.strokeStyle = `rgba(255,122,0,${spec.alpha * alpha})`;
        this.context.beginPath();
        this.context.ellipse(0, 0, this.orbitRadiusX * spec.radiusX, this.orbitRadiusY * spec.radiusY, 0, 0, TAU);
        this.context.stroke();
        this.context.restore();
      }
      this.context.restore();

      const nucleusSize = clamp(this.nucleusRadius * 0.5, 5, 10);
      const nucleusOffsets = [
        [-0.55, -0.42], [0.55, -0.42], [-0.55, 0.42], [0.55, 0.42], [0, 0]
      ];
      this.context.save();
      this.context.globalAlpha = alpha;
      this.context.shadowColor = "rgba(255,122,0,0.72)";
      this.context.shadowBlur = nucleusSize * 2.4;
      for (let index = 0; index < nucleusOffsets.length; index += 1) {
        const [offsetX, offsetY] = nucleusOffsets[index];
        const size = index === nucleusOffsets.length - 1 ? nucleusSize * 0.92 : nucleusSize * 0.72;
        this.context.fillStyle = index % 2 ? "#ff9b3d" : "#ff7a00";
        this.context.fillRect(
          this.atomCenterX + offsetX * nucleusSize - size / 2,
          this.atomCenterY + offsetY * nucleusSize - size / 2,
          size,
          size
        );
      }
      this.context.restore();

      for (let orbit = 0; orbit < ORBIT_SPECS.length; orbit += 1) {
        const electron = this.orbitPosition({
          orbit,
          orbitAngle: 0.38 + orbit * 1.88,
          orbitRadius: 1,
          direction: orbit === 1 ? -1 : 1
        }, elapsed * 2.2);
        const size = clamp(this.particleSize * 3.6, 6, 10);
        this.context.save();
        this.context.globalAlpha = alpha;
        this.context.shadowColor = "rgba(255,122,0,0.9)";
        this.context.shadowBlur = size * 1.8;
        this.context.fillStyle = orbit === 0 ? "#ffb066" : "#ff7a00";
        this.context.fillRect(electron.x - size / 2, electron.y - size / 2, size, size);
        this.context.restore();
      }
      this.context.globalAlpha = 1;
    }

    drawPoint(point, overall, elapsed, atomReveal) {
      const local = clamp((overall - point.delay) / (1 - point.delay));
      const morph = easeInOutCubic(local);
      const targetX = this.left + point.u * this.logoWidth;
      const targetY = this.top + point.v * this.logoHeight;
      const atomicStart = this.atomPosition(point, elapsed);
      const startX = atomicStart.x;
      const startY = atomicStart.y;
      const x = startX + (targetX - startX) * morph;
      const y = startY + (targetY - startY) * morph;
      const introAlpha = point.introVisible ? atomReveal * (point.atomRole === "nucleus" ? 0.82 : 0.62) : 0;
      const introFade = 1 - easeInOutCubic(clamp(local / 0.24));
      const assemblyAlpha = easeOutQuint(clamp(local / 0.16)) * point.alpha * this.options.opacity;
      const alpha = Math.max(introAlpha * introFade, assemblyAlpha);
      if (alpha <= 0.003) return;

      const introSize = this.particleSize * (point.atomRole === "nucleus" ? 0.9 : 0.62);
      const size = introSize + (this.particleSize - introSize) * morph;
      const pixelX = Math.round((x - size / 2) * this.dpr) / this.dpr;
      const pixelY = Math.round((y - size / 2) * this.dpr) / this.dpr;

      this.context.globalAlpha = alpha;
      this.context.fillStyle = point.color;
      this.context.fillRect(pixelX, pixelY, size, size);
    }

    draw(time) {
      this.frame = 0;
      if (!this.context || !this.width || !this.points.length || this.didResolve) return;

      this.context.clearRect(0, 0, this.width, this.height);
      const elapsed = Math.max(0, time - this.startedAt);
      const assemblyElapsed = Math.max(0, elapsed - this.options.orbitIntroMs);
      const overall = clamp(assemblyElapsed / this.options.assembleMs);
      const atomReveal = easeOutQuint(clamp(elapsed / 420));

      this.drawAtomicField(overall, elapsed);
      for (const point of this.points) this.drawPoint(point, overall, elapsed, atomReveal);
      this.context.globalAlpha = 1;

      if (overall >= 1 && !this.didLock) {
        this.didLock = true;
        this.emit("brandlocked", { pointCount: this.points.length });
      }
      if (elapsed >= this.options.orbitIntroMs + this.options.assembleMs + this.options.holdMs) {
        this.markResolved();
        return;
      }
      if (this.visible) this.frame = requestAnimationFrame((next) => this.draw(next));
    }

    fail(error) {
      if (this.didFail || this.didResolve) return;
      this.didFail = true;
      this.emit("branderror", { message: error instanceof Error ? error.message : String(error) });
      this.markResolved();
    }

    markResolved() {
      if (this.didResolve) return;
      this.didResolve = true;
      this.emit("brandresolved", { failed: this.didFail });
    }

    destroy() {
      cancelAnimationFrame(this.frame);
      this.resizeObserver?.disconnect();
      this.intersectionObserver?.disconnect();
    }
  }

  window.BrandParticles = BrandParticles;
})();
