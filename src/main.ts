import './styles/main.css';
import { initNavbarAndScroll } from './ui/navbar';
import { initLeadForm } from './services/leadForm';

document.addEventListener('DOMContentLoaded', () => {
  initNavbarAndScroll();
  initLeadForm();
});