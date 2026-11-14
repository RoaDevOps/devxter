export function initNavbarAndScroll(): void {
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menuBtn');

  if (nav) {
    const updateNavScroll = (): void => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    };
    updateNavScroll();
    window.addEventListener('scroll', updateNavScroll, { passive: true });
  }

  if (menu && menuBtn) {
    const toggleMenu = (forceState?: boolean): void => {
      const isOpen =
        typeof forceState === 'boolean' ? forceState : !menu.classList.contains('open');
      menu.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.textContent = isOpen ? '✕' : '☰';
    };

    menuBtn.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      toggleMenu();
    });

    menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e: MouseEvent) => {
        const targetId = link.getAttribute('href');
        toggleMenu(false);

        if (targetId && targetId.length > 1) {
          const targetEl = document.querySelector<HTMLElement>(targetId);
          if (targetEl) {
            e.preventDefault();
            const navHeight = nav ? nav.offsetHeight : 76;
            const top =
              targetEl.getBoundingClientRect().top + window.scrollY - (navHeight - 6);
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (
        menu.classList.contains('open') &&
        !menu.contains(e.target as Node) &&
        e.target !== menuBtn
      ) {
        toggleMenu(false);
      }
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
    {
      threshold: 0.02,
      rootMargin: '0px 0px 45px 0px'
    }
  );

  revealElements.forEach((el) => observer.observe(el));

  const revealViewportNow = (): void => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.98) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  };

  revealViewportNow();
  window.addEventListener('load', revealViewportNow, { once: true });
}