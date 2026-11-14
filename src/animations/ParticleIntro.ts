import gsap from 'gsap';

type IntroStageWord = 'BIENVENIDO A' | 'DEVXTER';

interface TargetPoint {
  x: number;
  y: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
  alpha: number;
  friction: number;
  ease: number;
}

export class ParticleIntro {
  private overlay: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private subtitleEl: HTMLElement | null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private isDispersing = false;
  private isPlaying = false;
  private pointer = { x: -9999, y: -9999, radius: 75 };
  private timeline: gsap.core.Timeline | null = null;

  private handleMouseMove = (e: MouseEvent): void => {
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.pointer.x = e.touches[0].clientX;
      this.pointer.y = e.touches[0].clientY;
    }
  };

  private handlePointerLeave = (): void => {
    this.pointer.x = -9999;
    this.pointer.y = -9999;
  };

  constructor(overlayId = 'intro-overlay', canvasId = 'intro-canvas') {
    const overlay = document.getElementById(overlayId);
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;

    if (!overlay || !canvas) {
      throw new Error('No se encontraron los elementos del DOM para ParticleIntro');
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('No se pudo inicializar el contexto 2D del Canvas');
    }

    this.overlay = overlay;
    this.canvas = canvas;
    this.ctx = ctx;
    this.subtitleEl = document.getElementById('intro-subtitle');

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.applyFullscreenStyles();
    this.resizeCanvas();
    this.bindEvents();
  }

  private applyFullscreenStyles(): void {
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100vw',
      height: '100dvh',
      zIndex: '999999',
      backgroundColor: '#070709',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      userSelect: 'none',
      opacity: '1',
      visibility: 'visible'
    });

    Object.assign(this.canvas.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      display: 'block'
    });

    if (this.subtitleEl) {
      Object.assign(this.subtitleEl.style, {
        position: 'absolute',
        bottom: '12vh',
        left: '0px',
        right: '0px',
        zIndex: '2',
        margin: '0px',
        padding: '0 24px',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '600',
        fontSize: 'clamp(10px, 2.6vw, 13px)',
        lineHeight: '1.6',
        letterSpacing: '4px',
        color: '#aaa7a0',
        textTransform: 'uppercase',
        textAlign: 'center',
        pointerEvents: 'none',
        opacity: '0',
        visibility: 'hidden',
        transform: 'translateY(16px)'
      });
    }
  }

  private resizeCanvas = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private bindEvents(): void {
    window.addEventListener('resize', this.resizeCanvas);
    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('touchend', this.handlePointerLeave, { passive: true });
  }

  private unbindEvents(): void {
    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handlePointerLeave);
  }

  private sampleTextCoordinates(word: IntroStageWord): TargetPoint[] {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return [];

    const isMobile = width < 650;
    const fontSize =
      word === 'BIENVENIDO A'
        ? Math.min(Math.max(width * (isMobile ? 0.1 : 0.08), 30), 102)
        : Math.min(Math.max(width * (isMobile ? 0.16 : 0.125), 48), 150);

    offCtx.font = `800 ${fontSize}px Montserrat, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    const centerY = height / 2;

    if (word === 'BIENVENIDO A') {
      const grad = offCtx.createLinearGradient(width * 0.15, 0, width * 0.85, 0);
      grad.addColorStop(0, '#f5f4f0');
      grad.addColorStop(0.72, '#f5f4f0');
      grad.addColorStop(1, '#e9c66c');
      offCtx.fillStyle = grad;
      offCtx.fillText('BIENVENIDO A', width / 2, centerY);
    } else {
      const part1 = 'DEV';
      const part2 = 'XTER';
      const w1 = offCtx.measureText(part1).width;
      const w2 = offCtx.measureText(part2).width;
      const totalWidth = w1 + w2;
      const startX = (width - totalWidth) / 2;

      offCtx.textAlign = 'left';
      offCtx.fillStyle = '#e9c66c';
      offCtx.fillText(part1, startX, centerY);

      offCtx.fillStyle = '#ff1748';
      offCtx.fillText(part2, startX + w1, centerY);
    }

    const imgData = offCtx.getImageData(0, 0, width, height).data;
    const points: TargetPoint[] = [];
    const step = isMobile ? 3 : 4;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const alpha = imgData[idx + 3];
        if (alpha > 128) {
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          points.push({
            x,
            y,
            color: `rgb(${r},${g},${b})`
          });
        }
      }
    }

    return points;
  }

  private morphToWord(word: IntroStageWord): void {
    const targets = this.sampleTextCoordinates(word);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 650;

    const minSize = isMobile ? 0.85 : 1.25;
    const sizeRange = isMobile ? 0.45 : 1.1;

    while (this.particles.length < targets.length) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(width, height) * (0.35 + Math.random() * 0.45);
      this.particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        tx: width / 2,
        ty: height / 2,
        color: '#f5f4f0',
        size: minSize + Math.random() * sizeRange,
        alpha: 1,
        friction: 0.88,
        ease: 0.018 + Math.random() * 0.014
      });
    }

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.size = minSize + Math.random() * sizeRange;
      if (i < targets.length) {
        const target = targets[i];
        p.tx = target.x;
        p.ty = target.y;
        p.color = target.color;
        p.alpha = 1;
      } else {
        p.tx = Math.random() * width;
        p.ty = Math.random() * height;
        p.alpha = 0;
      }
    }
  }

  private triggerSlowDispersion(strength = 4.2): void {
    this.isDispersing = true;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (const p of this.particles) {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.65;
      const force = (0.5 + Math.random() * 1.1) * strength;
      p.vx += Math.cos(angle) * force;
      p.vy += Math.sin(angle) * force;
    }
  }

  private renderLoop = (): void => {
    if (!this.isPlaying) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.ctx.fillStyle = 'rgba(7, 7, 9, 0.34)';
    this.ctx.fillRect(0, 0, width, height);

    for (const p of this.particles) {
      if (p.alpha <= 0.01) continue;

      if (!this.isDispersing) {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.vx += dx * p.ease;
        p.vy += dy * p.ease;
      }

      const pdx = p.x - this.pointer.x;
      const pdy = p.y - this.pointer.y;
      const distSq = pdx * pdx + pdy * pdy;
      const maxDistSq = this.pointer.radius * this.pointer.radius;

      if (distSq < maxDistSq && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const force = (this.pointer.radius - dist) / this.pointer.radius;
        p.vx += (pdx / dist) * force * 2.4;
        p.vy += (pdy / dist) * force * 2.4;
      }

      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;

      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  public async play(): Promise<void> {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.isDispersing = false;

    if (this.timeline) {
      this.timeline.kill();
    }

    window.scrollTo(0, 0);
    document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('visible'));

    this.applyFullscreenStyles();
    this.bindEvents();
    document.body.classList.add('intro-active');
    document.body.style.overflow = 'hidden';

    if (this.subtitleEl) {
      gsap.set(this.subtitleEl, { opacity: 0, visibility: 'hidden', y: 16 });
    }

    this.resizeCanvas();
    this.ctx.fillStyle = '#070709';
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    this.particles = [];

    if ('fonts' in document) {
      await document.fonts.ready;
    }

    this.morphToWord('BIENVENIDO A');
    this.renderLoop();

    this.timeline = gsap.timeline({
      onComplete: () => this.finish()
    });

    this.timeline.call(() => this.triggerSlowDispersion(4.0), [], 3.3);

    this.timeline.call(
      () => {
        this.isDispersing = false;
        this.morphToWord('DEVXTER');
        if (this.subtitleEl) {
          gsap.set(this.subtitleEl, { visibility: 'visible' });
          gsap.to(this.subtitleEl, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            delay: 0.5,
            ease: 'power2.out'
          });
        }
      },
      [],
      4.2
    );

    this.timeline.call(
      () => {
        if (this.subtitleEl) {
          gsap.to(this.subtitleEl, {
            opacity: 0,
            y: -10,
            duration: 0.45,
            ease: 'power2.in'
          });
        }
      },
      [],
      7.75
    );

    this.timeline.call(
      () => {
        this.triggerSlowDispersion(5.0);
        document.body.classList.remove('intro-active');
        document.body.style.overflow = '';
        document.body.style.overflowY = 'auto';
      },
      [],
      8.0
    );

    this.timeline.to(
      this.overlay,
      {
        opacity: 0,
        duration: 1.05,
        ease: 'power2.inOut'
      },
      8.05
    );
  }

  private finish(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.unbindEvents();
    this.particles = [];
    if (this.subtitleEl) {
      this.subtitleEl.style.opacity = '0';
      this.subtitleEl.style.visibility = 'hidden';
    }
    this.overlay.style.display = 'none';
    this.overlay.style.visibility = 'hidden';
    this.overlay.style.pointerEvents = 'none';
    document.body.classList.remove('intro-active');
    document.body.style.overflow = '';
    document.body.style.overflowY = 'auto';
  }
}