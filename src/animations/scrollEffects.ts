import gsap from 'gsap';

export function initInteractiveEffects(): void {
  const heroVisual = document.getElementById('heroVisual');
  const cityCard = document.getElementById('cityCard');
  const orb = cityCard?.querySelector<HTMLElement>('.orb');
  const badges = cityCard?.querySelectorAll<HTMLElement>('.float-stack span');
  const screenBox = cityCard?.querySelector<HTMLElement>('.screen');
  const visualTitle = cityCard?.querySelector<HTMLElement>('.visual-title');

  // 1. Movimiento flotante continuo en el Hero para que se sienta vivo
  if (orb) {
    gsap.to(orb, {
      y: -12,
      scale: 1.04,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  if (badges && badges.length > 0) {
    gsap.to(badges, {
      y: -6,
      duration: 2.2,
      stagger: 0.25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // 2. Efecto Parallax 3D interactivo al mover el mouse sobre la tarjeta del Hero
  if (heroVisual && cityCard && window.matchMedia('(pointer: fine)').matches) {
    heroVisual.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = heroVisual.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(cityCard, {
        rotationY: relX * 12,
        rotationX: -relY * 12,
        duration: 0.5,
        ease: 'power2.out'
      });

      if (orb) {
        gsap.to(orb, { x: relX * -28, duration: 0.5, ease: 'power2.out' });
      }
      if (visualTitle) {
        gsap.to(visualTitle, { x: relX * 18, y: relY * 14, duration: 0.5, ease: 'power2.out' });
      }
      if (screenBox) {
        gsap.to(screenBox, { x: relX * 22, y: relY * 16, duration: 0.5, ease: 'power2.out' });
      }
    });

    heroVisual.addEventListener('mouseleave', () => {
      gsap.to(cityCard, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      if (orb) gsap.to(orb, { x: 0, duration: 0.8, ease: 'power3.out' });
      if (visualTitle) gsap.to(visualTitle, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
      if (screenBox) gsap.to(screenBox, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
    });
  }

  // 3. Efecto Spotlight (luz que sigue al cursor) en las tarjetas de servicio
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}