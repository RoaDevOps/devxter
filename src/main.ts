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
    intro.play();

    document.querySelectorAll('.brand').forEach((brandEl) => {
      brandEl.addEventListener('click', (e: Event) => e.preventDefault());
      brandEl.addEventListener('dblclick', (e: Event) => {
        e.preventDefault();
        intro.play();
      });
    });
  } catch {
    overlay.style.display = 'none';
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