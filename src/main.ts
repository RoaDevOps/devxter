import './styles/main.css';
import { initNavbarAndScroll } from './ui/navbar';
import { initLeadForm } from './services/leadForm';
import { ParticleIntro } from './animations/ParticleIntro';
import { initInteractiveEffects } from './animations/scrollEffects';
import { initXterBot } from './ui/xterbot';

function setupParticleIntro(): void {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  try {
    const intro = new ParticleIntro('intro-overlay', 'intro-canvas');

    // 1. Ejecutar siempre al entrar o refrescar la página
    intro.play();

    // 2. Manejo limpio de clic simple vs doble clic (repetir pantalla de intro)
    document.querySelectorAll('.brand').forEach((brandEl) => {
      brandEl.addEventListener('click', (e: Event) => {
        e.preventDefault();
      });

      brandEl.addEventListener('dblclick', (e: Event) => {
        e.preventDefault();
        intro.play();
      });
    });
  } catch {
    overlay.classList.add('is-hidden');
    document.body.classList.remove('intro-active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupParticleIntro();
  initNavbarAndScroll();
  initInteractiveEffects();
  initLeadForm();
  initXterBot();
});