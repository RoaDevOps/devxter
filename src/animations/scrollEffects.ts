import gsap from 'gsap';

export function initInteractiveEffects(): void {
  const heroVisual =
    document.getElementById('heroVisual') ||
    document.querySelector<HTMLElement>('.hero-visual');
  const cityCard =
    document.getElementById('cityCard') ||
    document.querySelector<HTMLElement>('.city-card');
  const orb = cityCard?.querySelector<HTMLElement>('.orb');
  const pills = cityCard?.querySelectorAll<HTMLElement>('.float-pill');
  const screenBox = cityCard?.querySelector<HTMLElement>('.screen');
  const brandBlock =
    cityCard?.querySelector<HTMLElement>('.visual-brand-block') ||
    cityCard?.querySelector<HTMLElement>('.visual-title');
  const servicesGrid =
    document.getElementById('servicesGrid') ||
    document.querySelector<HTMLElement>('.cards');
  const serviceCards = Array.from(document.querySelectorAll<HTMLElement>('.cards .card'));
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

  if (pills && pills.length > 0 && isDesktopPointer) {
    gsap.to(pills, {
      y: -4,
      duration: 2.2,
      stagger: 0.25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // 2. Parallax 3D en la tarjeta derecha del Hero (en escritorio)
  if (heroVisual && cityCard && isDesktopPointer) {
    heroVisual.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = heroVisual.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(cityCard, {
        rotationY: relX * 10,
        rotationX: -relY * 10,
        transformPerspective: 1100,
        duration: 0.45,
        ease: 'power2.out'
      });

      if (orb) {
        gsap.to(orb, {
          x: relX * -18,
          duration: 0.45,
          ease: 'power2.out'
        });
      }

      if (screenBox) {
        gsap.to(screenBox, {
          x: relX * 14,
          y: relY * 10,
          duration: 0.45,
          ease: 'power2.out'
        });
      }

      if (brandBlock) {
        gsap.to(brandBlock, {
          x: relX * 10,
          y: relY * 8,
          duration: 0.45,
          ease: 'power2.out'
        });
      }
    });

    heroVisual.addEventListener('mouseleave', () => {
      gsap.to(cityCard, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.7,
        ease: 'power3.out'
      });

      if (orb) gsap.to(orb, { x: 0, duration: 0.7, ease: 'power3.out' });
      if (screenBox) gsap.to(screenBox, { x: 0, y: 0, duration: 0.7, ease: 'power3.out' });
      if (brandBlock) gsap.to(brandBlock, { x: 0, y: 0, duration: 0.7, ease: 'power3.out' });
    });
  }

  // 3. Efecto Focus-Blur en las tarjetas de Servicios
  const highlightCard = (activeCard: HTMLElement): void => {
    if (!servicesGrid) return;
    servicesGrid.classList.add('has-active');
    serviceCards.forEach((c) => c.classList.toggle('active', c === activeCard));
  };

  const resetAllCards = (): void => {
    if (!servicesGrid) return;
    servicesGrid.classList.remove('has-active');
    serviceCards.forEach((c) => c.classList.remove('active'));
  };

  serviceCards.forEach((card) => {
    card.addEventListener('mouseenter', () => highlightCard(card));
    card.addEventListener('mouseleave', () => resetAllCards());

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });

  document.querySelectorAll<HTMLElement>('.float-pill').forEach((pill) => {
    pill.addEventListener('click', (e: MouseEvent) => {
      const targetId = pill.getAttribute('data-target');
      if (!targetId) return;
      const targetCard = document.getElementById(targetId);
      if (!targetCard) return;

      e.preventDefault();
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightCard(targetCard);

      setTimeout(() => {
        resetAllCards();
      }, 2200);
    });
  });
}