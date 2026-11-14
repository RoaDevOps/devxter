const WHATSAPP_NUMBER = '525539106492';

const SYSTEM_PROMPT = `Eres Xter, el asistente virtual inteligente de DevXter (Agencia de Marketing, Desarrollo Web y Soluciones Digitales en CDMX).
Tu objetivo es asesorar con calidez, claridad y enfoque comercial, respondiendo en español de forma breve (máximo 3-4 oraciones por turno).
Servicios principales:
1. Páginas Web (rápidas, responsive, orientadas a conversión).
2. Redes Sociales (contenido, estrategia y gestión en Facebook, Instagram, TikTok).
3. Publicidad ADS (Meta Ads y Google Ads para captar prospectos).
4. Fotografía y Video (producción audiovisual comercial).
5. Soluciones Digitales (automatización, chatbots con IA, sistemas a medida).
Casos de éxito en la sección #clientes:
- El Campirano (Restaurante Buffet: gestión de redes sociales en Facebook e Instagram).
- Villa Península (Hotel: diseño y desarrollo de sitio web).
- Una Oportunidad Más (Centro de Rehabilitación: página web y presencia en Facebook).
Siempre invita al usuario a dejar sus datos o conversar por WhatsApp para un diagnóstico personalizado.`;

function ensureXterDOMAndStyles(): void {
  const legacyWaFloat = document.querySelector<HTMLElement>('.wa-float');
  if (legacyWaFloat) {
    legacyWaFloat.style.display = 'none';
  }

  if (!document.getElementById('xter-bot-styles')) {
    const style = document.createElement('style');
    style.id = 'xter-bot-styles';
    style.textContent = `
      .xter-widget {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 9999;
        font-family: 'DM Sans', sans-serif;
        transition: opacity 0.45s ease, transform 0.45s ease;
      }
      body.intro-active .xter-widget {
        opacity: 0;
        pointer-events: none;
        transform: translateY(14px);
      }
      .xter-tooltip {
        position: absolute;
        bottom: 74px;
        right: 0;
        width: 235px;
        background: rgba(16, 16, 22, 0.96);
        border: 1px solid rgba(233, 198, 108, 0.42);
        border-radius: 16px;
        padding: 11px 14px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(12px);
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      .xter-tooltip::after {
        content: "";
        position: absolute;
        bottom: -7px;
        right: 22px;
        width: 12px;
        height: 12px;
        background: rgba(16, 16, 22, 0.96);
        border-right: 1px solid rgba(233, 198, 108, 0.42);
        border-bottom: 1px solid rgba(233, 198, 108, 0.42);
        transform: rotate(45deg);
      }
      .xter-tooltip.is-hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(8px);
      }
      .xter-tooltip-close {
        position: absolute;
        top: 6px;
        right: 8px;
        background: none;
        border: 0;
        color: #aaa7a0;
        font-size: 12px;
        cursor: pointer;
      }
      .xter-tooltip-body {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
      }
      .xter-status-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #25d366;
        box-shadow: 0 0 10px #25d366;
        flex-shrink: 0;
      }
      .xter-tooltip-body p {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.35;
        color: #f5f4f0;
      }
      .xter-tooltip-body strong {
        color: #e9c66c;
      }
      .xter-tooltip-body small {
        color: #aaa7a0;
      }
      .xter-launcher {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        border: 1.5px solid rgba(233, 198, 108, 0.65);
        background: linear-gradient(135deg, #ff1748, #c80032);
        color: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        box-shadow: 0 14px 34px rgba(255, 23, 72, 0.45);
        transition: transform 0.28s ease, box-shadow 0.28s ease;
      }
      .xter-launcher:hover {
        transform: translateY(-4px) scale(1.06);
        box-shadow: 0 18px 40px rgba(255, 23, 72, 0.65);
      }
      .xter-launcher svg {
        width: 26px;
        height: 26px;
      }
      .xter-chat-window {
        position: absolute;
        right: 0;
        bottom: 74px;
        width: min(370px, calc(100vw - 32px));
        height: 500px;
        max-height: calc(100dvh - 110px);
        background: #0d0d12;
        border: 1px solid rgba(233, 198, 108, 0.32);
        border-radius: 22px;
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
        transform: translateY(16px) scale(0.97);
        transition: opacity 0.28s ease, transform 0.28s ease;
      }
      .xter-chat-window.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }
      .xter-header {
        padding: 15px 18px;
        background: linear-gradient(90deg, #16151d, #1f1118);
        border-bottom: 1px solid #29282d;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .xter-header-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .xter-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff1748, #e9c66c);
        display: grid;
        place-items: center;
        font: 800 14px Montserrat, sans-serif;
        color: #070709;
      }
      .xter-header h4 {
        margin: 0;
        font: 700 15px Montserrat, sans-serif;
        color: #f5f4f0;
      }
      .xter-header small {
        color: #6df09c;
        font-size: 11px;
      }
      .xter-close-btn {
        background: none;
        border: 0;
        color: #aaa7a0;
        font-size: 18px;
        cursor: pointer;
      }
      .xter-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .xter-msg {
        max-width: 85%;
        padding: 11px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.5;
      }
      .xter-msg.bot {
        align-self: flex-start;
        background: #171720;
        border: 1px solid #29282d;
        color: #f5f4f0;
        border-bottom-left-radius: 4px;
      }
      .xter-msg.user {
        align-self: flex-end;
        background: linear-gradient(135deg, #ef0040, #ff1748);
        color: #fff;
        border-bottom-right-radius: 4px;
      }
      .xter-quick-actions {
        padding: 8px 14px;
        display: flex;
        gap: 6px;
        overflow-x: auto;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        scrollbar-width: none;
      }
      .xter-quick-actions::-webkit-scrollbar {
        display: none;
      }
      .xter-chip {
        flex-shrink: 0;
        background: rgba(233, 198, 108, 0.1);
        border: 1px solid rgba(233, 198, 108, 0.32);
        color: #f3dfb0;
        padding: 6px 11px;
        border-radius: 999px;
        font-size: 11.5px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .xter-chip:hover {
        background: rgba(233, 198, 108, 0.22);
      }
      .xter-footer {
        padding: 10px 12px 12px;
        border-top: 1px solid #29282d;
        background: #101016;
        display: grid;
        gap: 8px;
      }
      .xter-input-row {
        display: flex;
        gap: 8px;
      }
      .xter-input-row input {
        flex: 1;
        background: #08080b;
        border: 1px solid #2f2e35;
        border-radius: 10px;
        padding: 10px 12px;
        color: #fff;
        font: inherit;
        font-size: 13px;
        outline: none;
      }
      .xter-input-row input:focus {
        border-color: #e9c66c;
      }
      .xter-send-btn {
        background: #ff1748;
        color: #fff;
        border: 0;
        border-radius: 10px;
        padding: 0 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .xter-wa-direct {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px;
        border-radius: 10px;
        background: rgba(37, 211, 102, 0.14);
        border: 1px solid rgba(37, 211, 102, 0.45);
        color: #6df09c;
        font-size: 12px;
        font-weight: 700;
        text-align: center;
      }
      .xter-inline-link {
        display: inline-block;
        margin-top: 8px;
        color: #e9c66c;
        font-weight: 700;
        text-decoration: underline;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  const existingWidget = document.getElementById('xterWidget');
  if (existingWidget) {
    existingWidget.remove();
  }

  const widget = document.createElement('div');
  widget.className = 'xter-widget';
  widget.id = 'xterWidget';
  widget.innerHTML = `
    <div class="xter-tooltip" id="xterTooltip">
      <button class="xter-tooltip-close" id="xterTooltipClose" type="button" aria-label="Cerrar aviso">✕</button>
      <div class="xter-tooltip-body" id="xterTooltipTrigger">
        <span class="xter-status-dot"></span>
        <p>👋 ¡Hola! <strong>Habla con Xter</strong><br><small>Tu asesor IA en línea</small></p>
      </div>
    </div>

    <aside class="xter-chat-window" id="xterChatWindow" aria-hidden="true">
      <div class="xter-header">
        <div class="xter-header-info">
          <div class="xter-avatar">X</div>
          <div>
            <h4>Xter · Asesor IA</h4>
            <small>● En línea ahora</small>
          </div>
        </div>
        <button class="xter-close-btn" id="xterCloseBtn" type="button" aria-label="Cerrar chat">✕</button>
      </div>

      <div class="xter-messages" id="xterMessages">
        <div class="xter-msg bot">
          ¡Hola! Soy <strong>Xter</strong>, el asistente virtual de <strong>DevXter</strong>. ¿Te gustaría cotizar una página web, mejorar tus redes sociales o conocer nuestros casos de éxito?
        </div>
      </div>

      <div class="xter-quick-actions" id="xterQuickActions">
        <button type="button" class="xter-chip" data-prompt="Quiero cotizar una página web">💻 Páginas Web</button>
        <button type="button" class="xter-chip" data-prompt="Cuéntame de sus clientes y casos de éxito">⭐ Ver Clientes</button>
        <button type="button" class="xter-chip" data-prompt="Me interesa Redes Sociales y ADS">📈 Redes y ADS</button>
        <button type="button" class="xter-chip" data-prompt="Quiero hablar con un asesor por WhatsApp">💬 WhatsApp</button>
      </div>

      <div class="xter-footer">
        <form class="xter-input-row" id="xterForm">
          <input type="text" id="xterInput" placeholder="Escribe tu duda aquí..." autocomplete="off" required>
          <button type="submit" class="xter-send-btn">→</button>
        </form>
        <a class="xter-wa-direct" id="xterWaDirect" href="https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20DevXter,%20vengo%20del%20sitio%20web%20y%20quiero%20una%20asesor%C3%ADa" target="_blank" rel="noopener">
          Continuar en WhatsApp directo ↗
        </a>
      </div>
    </aside>

    <button class="xter-launcher" id="xterLauncher" type="button" aria-label="Abrir asistente Xter">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="8" width="16" height="12" rx="3"></rect>
        <path d="M12 4v4"></path>
        <circle cx="12" cy="3" r="1"></circle>
        <circle cx="9" cy="13" r="1.2" fill="currentColor"></circle>
        <circle cx="15" cy="13" r="1.2" fill="currentColor"></circle>
        <path d="M9 17h6"></path>
      </svg>
    </button>
  `;
  document.body.appendChild(widget);
}

function getLocalSmartReply(input: string): { text: string; scrollToId?: string } {
  const q = input.toLowerCase();

  if (
    q.includes('cliente') ||
    q.includes('portafolio') ||
    q.includes('ejemplo') ||
    q.includes('caso') ||
    q.includes('trabajo') ||
    q.includes('campirano') ||
    q.includes('villa')
  ) {
    return {
      text: 'Hemos trabajado con marcas como El Campirano (Restaurante Buffet), Hotel Villa Península y Una Oportunidad Más. Te llevo a nuestra sección de Clientes para que veas sus testimonios y resultados.',
      scrollToId: '#clientes'
    };
  }

  if (q.includes('web') || q.includes('página') || q.includes('pagina') || q.includes('sitio')) {
    return {
      text: 'Desarrollamos páginas web rápidas, adaptables a celular y enfocadas en convertir visitas en clientes reales (como el sitio de Hotel Villa Península). ¿De qué giro es tu negocio?',
      scrollToId: '#servicios'
    };
  }

  if (q.includes('redes') || q.includes('facebook') || q.includes('instagram') || q.includes('ads') || q.includes('publicidad')) {
    return {
      text: 'Creamos contenido estratégico, gestionamos tus redes y lanzamos campañas en Meta/Google ADS orientadas a generar prospectos por WhatsApp.',
      scrollToId: '#servicios'
    };
  }

  if (q.includes('precio') || q.includes('costo') || q.includes('cotiza') || q.includes('cuánto') || q.includes('cuanto')) {
    return {
      text: 'Armamos cada propuesta a la medida de tu negocio tras un diagnóstico sin costo. Puedes dejarnos tus datos en el formulario o escribirnos directo por WhatsApp con el botón verde de abajo.',
      scrollToId: '#contacto'
    };
  }

  if (q.includes('proceso') || q.includes('cómo trabajan') || q.includes('como trabajan')) {
    return {
      text: 'Trabajamos en 4 etapas claras: 01 Diagnóstico, 02 Estrategia, 03 Ejecución y 04 Mejora continua.',
      scrollToId: '#proceso'
    };
  }

  return {
    text: 'Con gusto te ayudamos en DevXter con páginas web, redes sociales, publicidad ADS, foto/video y automatización. ¿Te gustaría ver nuestros casos de clientes o hablar por WhatsApp con un especialista?'
  };
}

export function initXterBot(): void {
  ensureXterDOMAndStyles();

  const launcher = document.getElementById('xterLauncher');
  const chatWindow = document.getElementById('xterChatWindow');
  const closeBtn = document.getElementById('xterCloseBtn');
  const tooltip = document.getElementById('xterTooltip');
  const tooltipClose = document.getElementById('xterTooltipClose');
  const tooltipTrigger = document.getElementById('xterTooltipTrigger');
  const form = document.getElementById('xterForm') as HTMLFormElement | null;
  const input = document.getElementById('xterInput') as HTMLInputElement | null;
  const messages = document.getElementById('xterMessages');
  const quickActions = document.getElementById('xterQuickActions');

  if (!launcher || !chatWindow || !messages || !form || !input) return;

  chatWindow.setAttribute('data-system-ready', String(SYSTEM_PROMPT.length > 0));

  const toggleChat = (forceOpen?: boolean): void => {
    const isOpen =
      typeof forceOpen === 'boolean' ? forceOpen : !chatWindow.classList.contains('open');
    chatWindow.classList.toggle('open', isOpen);
    chatWindow.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen && tooltip) {
      tooltip.classList.add('is-hidden');
      setTimeout(() => input.focus(), 150);
    }
  };

  launcher.addEventListener('click', () => toggleChat());
  closeBtn?.addEventListener('click', () => toggleChat(false));
  tooltipTrigger?.addEventListener('click', () => toggleChat(true));
  tooltipClose?.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    tooltip?.classList.add('is-hidden');
  });

  // Auto-ocultar el globo informativo cuando el usuario hace scroll hacia las secciones inferiores
  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 280 && tooltip && !tooltip.classList.contains('is-hidden')) {
        tooltip.classList.add('is-hidden');
      }
    },
    { passive: true }
  );

  const appendMessage = (
    text: string,
    sender: 'user' | 'bot',
    scrollToId?: string
  ): void => {
    const div = document.createElement('div');
    div.className = `xter-msg ${sender}`;
    div.textContent = text;

    if (sender === 'bot' && scrollToId) {
      const link = document.createElement('span');
      link.className = 'xter-inline-link';
      link.textContent = 'Ir a la sección →';
      link.addEventListener('click', () => {
        const target = document.querySelector<HTMLElement>(scrollToId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (window.innerWidth < 650) {
            toggleChat(false);
          }
        }
      });
      div.appendChild(document.createElement('br'));
      div.appendChild(link);
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const handleUserPrompt = (userText: string): void => {
    const cleanText = userText.trim();
    if (!cleanText) return;

    appendMessage(cleanText, 'user');
    input.value = '';

    setTimeout(() => {
      const reply = getLocalSmartReply(cleanText);
      appendMessage(reply.text, 'bot', reply.scrollToId);

      if (reply.scrollToId === '#clientes') {
        const target = document.querySelector<HTMLElement>('#clientes');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 380);
  };

  form.addEventListener('submit', (e: SubmitEvent) => {
    e.preventDefault();
    handleUserPrompt(input.value);
  });

  quickActions?.querySelectorAll<HTMLButtonElement>('.xter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) handleUserPrompt(promptText);
    });
  });
}