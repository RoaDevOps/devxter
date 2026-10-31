import type { LeadPayload } from '../types/lead';

const API_URL = 'https://8cd2d84iii.execute-api.us-east-1.amazonaws.com/prod/lead';

export function initLeadForm(): void {
  const form = document.getElementById('leadForm') as HTMLFormElement | null;
  const status = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;

  if (!form || !status || !submitBtn) return;

  const whatsappInput = form.querySelector<HTMLInputElement>('input[name="whatsapp"]');
  const rubroInput = form.querySelector<HTMLInputElement>('input[name="rubro"]');
  let selectedService = '';

  // 1. Conectar el clic de cada tarjeta de servicio con el formulario de diagnóstico
  document.querySelectorAll<HTMLElement>('.cards .card').forEach((card) => {
    const serviceName = card.getAttribute('data-service') || card.querySelector('h3')?.textContent?.trim();
    const link = card.querySelector<HTMLAnchorElement>('a[href="#contacto"]');

    if (link && serviceName) {
      link.addEventListener('click', () => {
        selectedService = serviceName;
        if (rubroInput && !rubroInput.value) {
          rubroInput.placeholder = `Interés en ${serviceName} · ¿A qué se dedica tu negocio?`;
        }
        status.textContent = `Servicio seleccionado: ${serviceName}`;
        status.style.color = '#e9c66c';
        setTimeout(() => whatsappInput?.focus(), 650);
      });
    }
  });

  // 2. Envío validado y protegido hacia AWS API Gateway
  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Bloqueo anti-bots (Honeypot): si el campo oculto tiene texto, abortamos sin llamar a AWS
    if (formData.get('website_url')) {
      form.reset();
      return;
    }

    // Limpiar el teléfono dejando solo números y validar longitud mínima (10 dígitos)
    const rawPhone = String(formData.get('whatsapp') ?? '').replace(/\D/g, '');
    if (rawPhone.length < 10) {
      status.textContent = '⚠ Ingresa un número de WhatsApp válido de 10 dígitos.';
      status.style.color = '#ff6b7f';
      whatsappInput?.focus();
      return;
    }

    const rawRubro = String(formData.get('rubro') ?? '').trim();
    const finalRubro = selectedService ? `[${selectedService}] ${rawRubro}` : rawRubro;

    status.textContent = 'Enviando solicitud...';
    status.style.color = '#aaa7a0';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const payload: LeadPayload = {
      whatsapp: rawPhone,
      email: String(formData.get('email') ?? '').trim(),
      rubro: finalRubro,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      status.textContent = '✓ Recibido. Nuestro equipo te contactará muy pronto.';
      status.style.color = '#76d391';
      selectedService = '';
      if (rubroInput) {
        rubroInput.placeholder = 'Restaurante, estética, servicios...';
      }
      form.reset();
    } catch {
      status.textContent = 'No se pudo enviar. Escríbenos directo en el botón de WhatsApp.';
      status.style.color = '#ff6b7f';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar diagnóstico →';
    }
  });
}