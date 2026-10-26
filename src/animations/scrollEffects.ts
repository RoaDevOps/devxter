import gsap from 'gsap';

export function initInteractiveEffects(): void {
  const heroVisual = document.getElementById('heroVisual');
  const cityCard = document.getElementById('cityCard');
  const orb = cityCard?.querySelector<HTMLElement>('.orb');
  const pills = cityCard?.querySelectorAll<HTMLElement>('.float-pill');
  const screenBox = cityCard?.querySelector<HTMLElement>('.screen');
  const brandBlock = cityCard?.querySelector<HTMLElement>('.visual-brand-block');
  const servicesGrid = document.getElementById('servicesGrid');
  const serviceCards = document.querySelectorAll<HTMLElement>('.cards .card');

  // 1. Movimiento flotante orgánico de la esfera y las cápsulas del Hero
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

  if (pills && pills.length > 0) {
    gsap.to(pills, {
      y: -5,
      duration: 2.2,
      stagger: 0.25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // 2. Parallax 3D interactivo en la tarjeta del Hero
  if (heroVisual && cityCard && window.matchMedia('(pointer: fine)').matches) {
    heroVisual.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = heroVisual.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(cityCard, {
        rotationY: relX * 10,
        rotationX: -relY * 10,
        duration: 0.5,
        ease: 'power2.out'
      });

      if (orb) {
        gsap.to(orb, { x: relX * -24, duration: 0.5, ease: 'power2.out' });
      }
      if (brandBlock) {
        gsap.to(brandBlock, { x: relX * 14, y: relY * 10, duration: 0.5, ease: 'power2.out' });
      }
      if (screenBox) {
        gsap.to(screenBox, { x: relX * 18, y: relY * 12, duration: 0.5, ease: 'power2.out' });
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
      if (brandBlock) gsap.to(brandBlock, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
      if (screenBox) gsap.to(screenBox, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
    });
  }

  // 3. Efecto Focus + Blur en tarjetas de Nuestros Servicios y luz radial que sigue al cursor
  serviceCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      servicesGrid?.classList.add('is-hovering');
      card.classList.add('is-active-card');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-active-card');
      if (!servicesGrid?.querySelector('.is-active-card')) {
        servicesGrid?.classList.remove('is-hovering');
      }
    });

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 4. Al hacer clic en una cápsula del Hero, lleva a esa tarjeta de servicio y la ilumina
  document.querySelectorAll<HTMLAnchorElement>('.float-pill').forEach((pill) => {
    pill.addEventListener('click', (e: MouseEvent) => {
      const targetId = pill.getAttribute('data-target');
      if (!targetId) return;
      const targetCard = document.getElementById(targetId);
      if (!targetCard) return;

      e.preventDefault();
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      servicesGrid?.classList.add('is-hovering');
      serviceCards.forEach((c) => c.classList.remove('is-active-card', 'highlight-pulse'));
      targetCard.classList.add('is-active-card', 'highlight-pulse');

      setTimeout(() => {
        targetCard.classList.remove('is-active-card', 'highlight-pulse');
        servicesGrid?.classList.remove('is-hovering');
      }, 2200);
    });
  });
}