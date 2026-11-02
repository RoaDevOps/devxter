import gsap from 'gsap';

export function initInteractiveEffects(): void {
  const heroVisual = document.getElementById('heroVisual');
  const cityCard = document.getElementById('cityCard');
  const orb = cityCard?.querySelector<HTMLElement>('.orb');
  const pills = cityCard?.querySelectorAll<HTMLElement>('.float-pill');
  const screenBox = cityCard?.querySelector<HTMLElement>('.screen');
  const brandBlock = cityCard?.querySelector<HTMLElement>('.visual-brand-block');
  const servicesGrid = document.getElementById('servicesGrid');
  const serviceCards = Array.from(document.querySelectorAll<HTMLElement>('.cards .card'));

  // 1. Movimiento flotante suave en la tarjeta del Hero
  if (orb) {
    gsap.to(orb, {
      y: -10,
      scale: 1.04,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  if (pills && pills.length > 0) {
    gsap.to(pills, {
      y: -4,
      duration: 2.2,
      stagger: 0.25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // 2. Parallax 3D en la tarjeta derecha del Hero
  if (heroVisual && cityCard && window.matchMedia('(pointer: fine)').matches) {
    heroVisual.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = heroVisual.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(cityCard, {
        rotationY: relX * 10,
        rotationX: -relY * 10,
        duration: 0.45,
        ease: 'power2.out'
      });

      if (orb) gsap.to(orb, { x: relX * -22, duration: 0.45, ease: 'power2.out' });
      if (brandBlock) gsap.to(brandBlock, { x: relX * 14, y: relY * 10, duration: 0.45, ease: 'power2.out' });
      if (screenBox) gsap.to(screenBox, { x: relX * 16, y: relY * 12, duration: 0.45, ease: 'power2.out' });
    });

    heroVisual.addEventListener('mouseleave', () => {
      gsap.to(cityCard, { rotationY: 0, rotationX: 0, duration: 0.7, ease: 'power3.out' });
      if (orb) gsap.to(orb, { x: 0, duration: 0.7, ease: 'power3.out' });
      if (brandBlock) gsap.to(brandBlock, { x: 0, y: 0, duration: 0.7, ease: 'power3.out' });
      if (screenBox) gsap.to(screenBox, { x: 0, y: 0, duration: 0.7, ease: 'power3.out' });
    });
  }

  // 3. Control instantáneo Focus/Blur en Nuestros Servicios (0ms lag, acelerado por CSS GPU)
  const setActiveCard = (activeCard: HTMLElement): void => {
    servicesGrid?.classList.add('is-hovering');
    for (const card of serviceCards) {
      card.classList.toggle('is-active-card', card === activeCard);
    }
  };

  const clearActiveCards = (): void => {
    servicesGrid?.classList.remove('is-hovering');
    for (const card of serviceCards) {
      card.classList.remove('is-active-card');
    }
  };

  serviceCards.forEach((card) => {
    let rafId: number | null = null;

    card.addEventListener('mouseenter', () => {
      setActiveCard(card);
    });

    card.addEventListener(
      'mousemove',
      (e: MouseEvent) => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${Math.round(e.clientX - rect.left)}px`);
          card.style.setProperty('--mouse-y', `${Math.round(e.clientY - rect.top)}px`);
          rafId = null;
        });
      },
      { passive: true }
    );
  });

  // Solo restauramos todas las tarjetas cuando el cursor sale por completo del bloque de servicios
  servicesGrid?.addEventListener('mouseleave', () => {
    clearActiveCards();
  });

  // 4. Al hacer clic en una cápsula del Hero, baja directo a esa tarjeta y la ilumina
  document.querySelectorAll<HTMLAnchorElement>('.float-pill').forEach((pill) => {
    pill.addEventListener('click', (e: MouseEvent) => {
      const targetId = pill.getAttribute('data-target');
      if (!targetId) return;
      const targetCard = document.getElementById(targetId);
      if (!targetCard) return;

      e.preventDefault();
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveCard(targetCard);

      setTimeout(() => {
        if (!servicesGrid?.matches(':hover')) {
          clearActiveCards();
        }
      }, 2000);
    });
  });
}