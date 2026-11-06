export function initNavbarAndScroll(): void {
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menuBtn');

  if (nav) {
    window.addEventListener(
      'scroll',
      () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
      },
      { passive: true }
    );
  }

  if (menu && menuBtn) {
    const toggleMenu = (forceState?: boolean): void => {
      const isOpen = typeof forceState === 'boolean' ? forceState : !menu.classList.contains('open');
      menu.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.textContent = isOpen ? '✕' : '☰';
    };

    menuBtn.addEventListener('click', () => toggleMenu());

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        toggleMenu(false);
      }
    });
  }

  const revealElements = document.querySelectorAll<HTMLElement>('.reveal');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealElements.forEach((el) => observer.observe(el));

  // Fuerza la revelación inmediata de los elementos en el viewport inicial (Hero) sin esperar scroll
  const revealViewportNow = (): void => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.95) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  };

  window.addEventListener('intro:reveal', revealViewportNow);
}