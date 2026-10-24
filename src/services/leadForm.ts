import type { LeadPayload } from '../types/lead';

const API_URL = 'https://8cd2d84iii.execute-api.us-east-1.amazonaws.com/prod/lead';

export function initLeadForm(): void {
  const form = document.getElementById('leadForm') as HTMLFormElement | null;
  const status = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;

  if (!form || !status || !submitBtn) return;

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    status.textContent = 'Enviando...';
    status.style.color = '#aaa7a0';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(form);
    const payload: LeadPayload = {
      whatsapp: String(formData.get('whatsapp') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      rubro: String(formData.get('rubro') ?? '').trim(),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      status.textContent = '✓ Recibido. Te contactamos pronto.';
      status.style.color = '#76d391';
      form.reset();
    } catch {
      status.textContent = 'No se pudo enviar. Escríbenos por WhatsApp.';
      status.style.color = '#ff6b7f';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar diagnóstico →';
    }
  });
}