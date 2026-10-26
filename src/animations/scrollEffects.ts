import gsap from 'gsap';

export function initInteractiveEffects(): void {
  const heroVisual = document.getElementById('heroVisual');
  const cityCard = document.getElementById('cityCard');
  const orb = cityCard?.querySelector<HTMLElement>('.orb');
  const pills = cityCard?.querySelectorAll<HTMLElement>('.float-pill');
  const screenBox = cityCard?.querySelector<HTMLElement>('.screen');
  const brandBlock = cityCard?.querySelector<HTMLElement>('.visual-brand-block');
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

  // 3. Efecto garantizado en Nuestros Servicios: Iluminar tarjeta activa + Desenfocar las demás
  const highlightCard = (activeCard: HTMLElement): void => {
    serviceCards.forEach((card) => {
      if (card === activeCard) {
        gsap.to(card, {
          y: -12,
          scale: 1.03,
          filter: 'blur(0px) brightness(1.12)',
          opacity: 1,
          borderColor: '#e9c66c',
          boxShadow: '0 24px 55px rgba(0,0,0,0.9), 0 0 35px rgba(255,23,72,0.45), 0 0 15px rgba(233,198,108,0.35)',
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        gsap.to(card, {
          y: 0,
          scale: 0.95,
          filter: 'blur(4.5px) brightness(0.5)',
          opacity: 0.4,
          borderColor: '#29282d',
          boxShadow: 'none',
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });
  };

  const resetAllCards = (): void => {
    serviceCards.forEach((card) => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        filter: 'blur(0px) brightness(1)',
        opacity: 1,
        borderColor: '#29282d',
        boxShadow: 'none',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
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

  // 4. Iluminación garantizada en todos los botones de WhatsApp (Navbar, Contacto y Flotante)
  const waButtons = document.querySelectorAll<HTMLElement>('.wa-outline, .wa-cta, .wa-float');
  waButtons.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.07,
        y: -3,
        backgroundColor: '#25d366',
        borderColor: '#a7f3d0',
        color: '#ffffff',
        boxShadow: '0 0 28px rgba(37, 211, 102, 0.85), 0 10px 30px rgba(37, 211, 102, 0.45)',
        duration: 0.25,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        y: 0,
        clearProps: 'backgroundColor,borderColor,color,boxShadow',
        duration: 0.28,
        ease: 'power2.out'
      });
    });
  });

  // 5. Al hacer clic en una cápsula del Hero, baja directo a esa tarjeta y la ilumina
  document.querySelectorAll<HTMLAnchorElement>('.float-pill').forEach((pill) => {
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