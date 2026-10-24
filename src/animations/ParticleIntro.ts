import gsap from 'gsap';

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
  private isFinished = false;
  private pointer = { x: -9999, y: -9999, radius: 90 };
  private timeline: gsap.core.Timeline | null = null;

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

    this.resizeCanvas();
    this.bindEvents();
  }

  private resizeCanvas = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private bindEvents(): void {
    window.addEventListener('resize', this.resizeCanvas);

    window.addEventListener('mousemove', (e: MouseEvent) => {
      this.pointer.x = e.clientX;
      this.pointer.y = e.clientY;
    });

    window.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length > 0) {
          this.pointer.x = e.touches[0].clientX;
          this.pointer.y = e.touches[0].clientY;
        }
      },
      { passive: true }
    );
  }

  /**
   * Dibuja texto en un canvas virtual y extrae las coordenadas (x, y) y color de cada partícula
   */
  private sampleTextCoordinates(word: 'BIENVENIDO' | 'DEVXTER'): TargetPoint[] {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return [];

    const isMobile = width < 650;
    const fontSize =
      word === 'BIENVENIDO'
        ? Math.min(Math.max(width * (isMobile ? 0.12 : 0.095), 36), 115)
        : Math.min(Math.max(width * (isMobile ? 0.16 : 0.125), 48), 150);

    offCtx.font = `800 ${fontSize}px Montserrat, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    const centerY = height / 2;

    if (word === 'BIENVENIDO') {
      const grad = offCtx.createLinearGradient(width * 0.2, 0, width * 0.8, 0);
      grad.addColorStop(0, '#f5f4f0');
      grad.addColorStop(0.6, '#f5f4f0');
      grad.addColorStop(1, '#e9c66c');
      offCtx.fillStyle = grad;
      offCtx.fillText('BIENVENIDO', width / 2, centerY);
    } else {
      // Colores oficiales de marca: DEV en dorado (#e9c66c) y XTER en rojo (#ff1748)
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

    const imageData = offCtx.getImageData(0, 0, width, height).data;
    const points: TargetPoint[] = [];
    const gap = isMobile ? 4 : 5;

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const index = (y * width + x) * 4;
        const alpha = imageData[index + 3];

        if (alpha > 140) {
          const r = imageData[index];
          const g = imageData[index + 1];
          const b = imageData[index + 2];
          points.push({
            x,
            y,
            color: `rgb(${r}, ${g}, ${b})`
          });
        }
      }
    }

    return points;
  }

  /**
   * Asigna nuevos puntos de destino a las partículas existentes
   */
  private morphToWord(word: 'BIENVENIDO' | 'DEVXTER'): void {
    const targets = this.sampleTextCoordinates(word);
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Si hay más puntos nuevos que partículas actuales, creamos las faltantes
    while (this.particles.length < targets.length) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(width, height) * (0.4 + Math.random() * 0.4);
      this.particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        tx: width / 2,
        ty: height / 2,
        color: '#f5f4f0',
        size: Math.random() * 1.6 + 1.4,
        alpha: 1,
        friction: 0.84,
        ease: 0.08 + Math.random() * 0.04
      });
    }

    // Mezclamos ligeramente los destinos para que el cruce de partículas sea orgánico
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (i < targets.length) {
        const target = targets[i];
        p.tx = target.x;
        p.ty = target.y;
        p.color = target.color;
        p.alpha = 1;
      } else {
        // Partículas sobrantes flotan suavemente en el fondo
        p.tx = Math.random() * width;
        p.ty = Math.random() * height;
        p.alpha = 0.15;
      }
    }
  }

  /**
   * Dispara una onda expansiva para desintegrar el texto antes de formar la siguiente palabra
   */
  private triggerDispersion(): void {
    this.isDispersing = true;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (const p of this.particles) {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
      const force = 8 + Math.random() * 18;
      p.vx = Math.cos(angle) * force;
      p.vy = Math.sin(angle) * force;
    }
  }

  private renderLoop = (): void => {
    if (this.isFinished) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Estela suave de movimiento sobre fondo oscuro (#070709)
    this.ctx.fillStyle = 'rgba(7, 7, 9, 0.32)';
    this.ctx.fillRect(0, 0, width, height);

    for (const p of this.particles) {
      if (!this.isDispersing) {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.vx += dx * p.ease;
        p.vy += dy * p.ease;
      }

      // Repulsión interactiva con el mouse o dedo
      const mdx = p.x - this.pointer.x;
      const mdy = p.y - this.pointer.y;
      const distSq = mdx * mdx + mdy * mdy;
      const maxDistSq = this.pointer.radius * this.pointer.radius;

      if (distSq < maxDistSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (this.pointer.radius - dist) / this.pointer.radius;
        p.vx += (mdx / dist) * force * 4.5;
        p.vy += (mdy / dist) * force * 4.5;
      }

      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;

      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * Inicia la secuencia coreografiada: BIENVENIDO -> Dispersión -> DEVXTER -> Salida
   */
  public async start(onComplete?: () => void): Promise<void> {
    document.body.style.overflow = 'hidden';

    if ('fonts' in document) {
      await document.fonts.ready;
    }

    // 1. Formar "BIENVENIDO"
    this.morphToWord('BIENVENIDO');
    this.renderLoop();

    this.timeline = gsap.timeline({
      onComplete: () => this.finish(onComplete)
    });

    // Sostenemos "BIENVENIDO" 1.65s y luego dispersamos las partículas
    this.timeline.call(() => this.triggerDispersion(), [], 1.65);

    // 0.45s después reagrupamos las partículas formando "DEVXTER"
    this.timeline.call(
      () => {
        this.isDispersing = false;
        this.morphToWord('DEVXTER');
        if (this.subtitleEl) {
          gsap.to(this.subtitleEl, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out'
          });
        }
      },
      [],
      2.1
    );

    // A los 3.9s hacemos una última expansión y desvanecemos el telón
    this.timeline.call(() => this.triggerDispersion(), [], 3.9);

    this.timeline.to(
      this.overlay,
      {
        opacity: 0,
        duration: 0.75,
        ease: 'power2.inOut'
      },
      4.05
    );
  }

  public finish(onComplete?: () => void): void {
    if (this.isFinished) return;
    this.isFinished = true;

    if (this.timeline) {
      this.timeline.kill();
    }

    gsap.to(this.overlay, {
      opacity: 0,
      duration: 0.35,
      onComplete: () => {
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
        }
        window.removeEventListener('resize', this.resizeCanvas);
        this.overlay.remove();
        document.body.style.overflow = '';
        if (onComplete) onComplete();
      }
    });
  }
}