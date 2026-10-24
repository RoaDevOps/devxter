import './styles/main.css';
import { initNavbarAndScroll } from './ui/navbar';
import { initLeadForm } from './services/leadForm';
import { ParticleIntro } from './animations/ParticleIntro';

const INTRO_STORAGE_KEY = 'devxter_intro_seen';

function setupParticleIntro(): void {
  const overlay = document.getElementById('intro-overlay');
  const skipBtn = document.getElementById('skipIntroBtn');
  if (!overlay) return;

  const urlParams = new URLSearchParams(window.location.search);
  const forceIntro = urlParams.get('intro') === '1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen = sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true';

  // Si el usuario ya vio la intro en esta sesión (y no se fuerza con ?intro=1) o prefiere reducir movimiento
  if ((alreadySeen && !forceIntro) || prefersReducedMotion) {
    overlay.remove();
    return;
  }

  try {
    const intro = new ParticleIntro('intro-overlay', 'intro-canvas');

    const markAsSeen = (): void => {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    };

    intro.start(markAsSeen);

    skipBtn?.addEventListener('click', () => {
      markAsSeen();
      intro.finish();
    });

    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          markAsSeen();
          intro.finish();
        }
      },
      { once: true }
    );
  } catch {
    overlay.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupParticleIntro();
  initNavbarAndScroll();
  initLeadForm();
});