const WHATSAPP_NUMBER = '525539106492';

const SYSTEM_PROMPT = `Eres Xter, el asistente virtual oficial de inteligencia artificial de DevXter, una agencia de estrategia, marketing digital, desarrollo web y soluciones tecnológicas ubicada en Ciudad de México (CDMX).
Tu objetivo es asesorar con un tono profesional, moderno, breve y persuasivo (máximo 3 párrafos cortos por respuesta) y convertir visitantes en prospectos.
Servicios de DevXter:
1. Páginas Web: Sitios rápidos, modernos, responsivos y optimizados para ventas y SEO.
2. Redes Sociales: Estrategia, diseño de contenido y gestión de comunidad.
3. Publicidad ADS: Campañas en Meta Ads y Google Ads enfocadas en retorno de inversión y prospectos.
4. Fotografía y Video: Producción audiovisual comercial para marcas y productos.
5. Soluciones Digitales: Sistemas a la medida, automatizaciones, chatbots e integraciones con APIs.
Cuando el usuario quiera cotizar o hablar con un humano, invítalo a llenar el formulario de diagnóstico de la página o a escribir por WhatsApp al +52 55 3910 6492.`;

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function initXterBot(): void {
  const widget = document.getElementById('xterWidget');
  const launcher = document.getElementById('xterLauncher');
  const closeBtn = document.getElementById('xterCloseBtn');
  const chatWindow = document.getElementById('xterChatWindow');
  const tooltip = document.getElementById('xterTooltip');
  const tooltipClose = document.getElementById('xterTooltipClose');
  const tooltipTrigger = document.getElementById('xterTooltipTrigger');
  const messagesContainer = document.getElementById('xterMessages');
  const chatForm = document.getElementById('xterChatForm') as HTMLFormElement | null;
  const chatInput = document.getElementById('xterInput') as HTMLInputElement | null;
  const quickChips = document.getElementById('xterQuickChips');

  if (!widget || !launcher || !chatWindow || !messagesContainer || !chatForm || !chatInput) {
    return;
  }

  let isOpen = false;
  let hasGreeted = false;
  const history: ChatHistoryItem[] = [];

  const scrollToBottom = (): void => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const appendMessage = (sender: 'bot' | 'user', htmlContent: string): HTMLElement => {
    const msg = document.createElement('div');
    msg.className = `xter-msg xter-msg-${sender}`;
    msg.innerHTML = `<div class="xter-bubble">${htmlContent}</div>`;
    messagesContainer.appendChild(msg);
    scrollToBottom();
    return msg;
  };

  const showTypingIndicator = (): HTMLElement => {
    const typing = document.createElement('div');
    typing.className = 'xter-msg xter-msg-bot xter-typing';
    typing.innerHTML = `<div class="xter-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    messagesContainer.appendChild(typing);
    scrollToBottom();
    return typing;
  };

  /**
   * Motor local inteligente (Funciona al instante incluso sin API Key)
   */
  const getLocalSmartResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola DevXter, vengo del chat con Xter. Me interesa: ${userText}`)}`;

    if (text.includes('web') || text.includes('página') || text.includes('pagina') || text.includes('sitio')) {
      return `En <strong>DevXter</strong> diseñamos y programamos sitios web ultrarrápidos, 100% responsivos y enfocados en convertir visitas en clientes.<br><br>¿Tu negocio ya tiene página o buscamos crearla desde cero? <br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Cotizar mi web por WhatsApp →</a>`;
    }

    if (text.includes('ads') || text.includes('publicidad') || text.includes('anuncio') || text.includes('clientes')) {
      return `Nuestras campañas de <strong>Publicidad ADS</strong> (Meta Ads y Google Ads) están diseñadas para atraer prospectos calificados listos para comprar en CDMX y todo México.<br><br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Armar mi campaña en WhatsApp →</a>`;
    }

    if (text.includes('redes') || text.includes('instagram') || text.includes('tiktok') || text.includes('facebook')) {
      return `Gestionamos tus <strong>Redes Sociales</strong> con estrategia comercial, diseño de alto impacto y calendario de contenidos para que tu marca proyecte autoridad.<br><br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Revisar mis redes por WhatsApp →</a>`;
    }

    if (text.includes('foto') || text.includes('video') || text.includes('producción')) {
      return `Contamos con producción de <strong>Fotografía y Video</strong> profesional en CDMX para elevar la imagen de tu negocio, productos o servicios.<br><br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Agendar sesión por WhatsApp →</a>`;
    }

    if (text.includes('precio') || text.includes('costo') || text.includes('cuánto') || text.includes('cotiza')) {
      return `Trabajamos con trajes a la medida según la etapa de tu negocio. Podemos hacerte un <strong>diagnóstico sin costo</strong> hoy mismo.<br><br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Pedir diagnóstico en WhatsApp →</a>`;
    }

    if (text.includes('whatsapp') || text.includes('asesor') || text.includes('humano') || text.includes('contacto')) {
      return `¡Claro! Puedes hablar directamente con nuestro equipo en WhatsApp haciendo clic aquí:<br><br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Abrir WhatsApp (+52 55 3910 6492) →</a>`;
    }

    return `¡Excelente! En <strong>DevXter</strong> combinamos estrategia, marketing, desarrollo web y automatizaciones en CDMX para escalar tu negocio.<br><br>¿Sobre qué área te gustaría profundizar o prefieres que un especialista revise tu caso?<br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Hablar con un especialista →</a>`;
  };

  /**
   * Consulta a Google Gemini API si existe VITE_GEMINI_API_KEY en .env,
   * o utiliza el motor local inteligente como respaldo inmediato.
   */
  const fetchBotReply = async (userText: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 650));
      return getLocalSmartResponse(userText);
    }

    try {
      history.push({ role: 'user', parts: [{ text: userText }] });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: history,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 280
            }
          })
        }
      );

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      const rawReply: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || getLocalSmartResponse(userText);

      history.push({ role: 'model', parts: [{ text: rawReply }] });

      const formatted = rawReply
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola DevXter, hablé con Xter sobre: ${userText}`)}`;
      return `${formatted}<br><a class="xter-wa-link" href="${waUrl}" target="_blank" rel="noopener">Continuar en WhatsApp →</a>`;
    } catch {
      return getLocalSmartResponse(userText);
    }
  };

  // Botón de expandir/contraer junto al botón de cerrar en la cabecera
  if (closeBtn && closeBtn.parentElement) {
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'xter-header-actions';

    const expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'xter-expand-btn';
    expandBtn.title = 'Cambiar tamaño';
    expandBtn.setAttribute('aria-label', 'Cambiar tamaño del chat');
    expandBtn.textContent = '⤢';

    expandBtn.addEventListener('click', () => {
      const expanded = chatWindow.classList.toggle('is-expanded');
      expandBtn.textContent = expanded ? '⤡' : '⤢';
      scrollToBottom();
    });

    closeBtn.parentElement.insertBefore(actionsWrapper, closeBtn);
    actionsWrapper.appendChild(expandBtn);
    actionsWrapper.appendChild(closeBtn);
  }

  const handleUserMessage = async (text: string): Promise<void> => {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Pestañas de sugerencias al iniciar conversación 
    quickChips?.classList.add('is-collapsed');

    appendMessage('user', cleanText.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    chatInput.value = '';

    const typingEl = showTypingIndicator();
    const replyHtml = await fetchBotReply(cleanText);
    typingEl.remove();

    appendMessage('bot', replyHtml);
  };

  const toggleChat = (forceState?: boolean): void => {
    isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
    widget.classList.toggle('is-open', isOpen);
    chatWindow.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      tooltip?.classList.add('is-dismissed');
      if (!hasGreeted) {
        hasGreeted = true;
        appendMessage(
          'bot',
          `¡Hola! 👋 Soy <strong>Xter</strong>, tu asesor IA de <strong>DevXter</strong>.<br>¿Qué área de tu negocio quieres impulsar hoy?`
        );
      }
      setTimeout(() => chatInput.focus(), 200);
    }
  };

  launcher.addEventListener('click', () => toggleChat());
  closeBtn?.addEventListener('click', () => toggleChat(false));
  tooltipTrigger?.addEventListener('click', () => toggleChat(true));

  tooltipClose?.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    tooltip?.classList.add('is-dismissed');
  });

  chatForm.addEventListener('submit', (e: SubmitEvent) => {
    e.preventDefault();
    handleUserMessage(chatInput.value);
  });

  quickChips?.querySelectorAll<HTMLButtonElement>('button').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) handleUserMessage(prompt);
    });
  });
}
