(function () {
  const currentScript = document.currentScript as HTMLScriptElement;
  const tenantSlug = currentScript?.getAttribute('data-tenant') || 'default';
  const apiBase = currentScript?.getAttribute('data-api') || (window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api');

  // Session ID for memory
  let sessionId = sessionStorage.getItem('contextiq_widget_session');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 12);
    sessionStorage.setItem('contextiq_widget_session', sessionId);
  }

  // Create host container
  const container = document.createElement('div');
  container.id = 'contextiq-chat-root';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '2147483647';
  container.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const shadow = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  // Styling inside Shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .ciq-launcher {
      width: 56px; height: 56px; border-radius: 50%;
      background: #E8675F; color: #fff; display: flex;
      align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: none; outline: none;
    }
    .ciq-launcher:hover { transform: scale(1.08); }
    .ciq-launcher:active { transform: scale(0.95); }
    .ciq-window {
      position: absolute; bottom: 70px; right: 0;
      width: 380px; height: 560px; max-height: calc(100vh - 100px);
      max-width: calc(100vw - 40px);
      background: #ffffff; border-radius: 24px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.18);
      display: none; flex-direction: column; overflow: hidden;
      border: 1px solid #ECECEC;
      animation: ciqFadeIn 0.25s ease-out forwards;
    }
    @keyframes ciqFadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ciq-header {
      padding: 16px 20px; background: #E8675F; color: #fff;
      display: flex; align-items: center; justify-content: space-between;
    }
    .ciq-header-title { font-weight: 700; font-size: 15px; }
    .ciq-header-sub { font-size: 11px; opacity: 0.85; }
    .ciq-close {
      background: transparent; border: none; color: #fff;
      cursor: pointer; font-size: 20px; line-height: 1;
      padding: 4px; border-radius: 50%;
    }
    .ciq-messages {
      flex: 1; padding: 16px; overflow-y: auto;
      background: #F7F7F7; display: flex; flex-direction: column; gap: 12px;
    }
    .ciq-bubble {
      padding: 12px 16px; border-radius: 18px; font-size: 13px;
      line-height: 1.5; max-width: 82%; word-break: break-word;
    }
    .ciq-bubble-user {
      background: #E8675F; color: #fff; align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .ciq-bubble-assistant {
      background: #fff; color: #17171A; align-self: flex-start;
      border-bottom-left-radius: 4px; border: 1px solid #ECECEC;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .ciq-source-tag {
      font-size: 10px; color: #8E8E93; margin-top: 6px;
      display: block; font-style: italic;
    }
    .ciq-input-bar {
      padding: 12px 16px; background: #fff; border-top: 1px solid #ECECEC;
      display: flex; gap: 8px; align-items: center;
    }
    .ciq-input {
      flex: 1; padding: 10px 14px; border: 1px solid #ECECEC;
      border-radius: 12px; font-size: 13px; outline: none;
      background: #F7F7F7; color: #17171A;
    }
    .ciq-input:focus { border-color: #E8675F; background: #fff; }
    .ciq-send-btn {
      width: 36px; height: 36px; border-radius: 10px;
      background: #E8675F; color: #fff; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .ciq-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  shadow.appendChild(style);

  // Markup
  const launcher = document.createElement('button');
  launcher.className = 'ciq-launcher';
  launcher.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  const windowEl = document.createElement('div');
  windowEl.className = 'ciq-window';
  windowEl.innerHTML = `
    <div class="ciq-header" id="ciqHeader">
      <div>
        <div class="ciq-header-title" id="ciqTitle">ContextIQ Assistant</div>
        <div class="ciq-header-sub">Grounded by Verified Docs</div>
      </div>
      <button class="ciq-close" id="ciqClose">✕</button>
    </div>
    <div class="ciq-messages" id="ciqMessages"></div>
    <form class="ciq-input-bar" id="ciqForm">
      <input type="text" class="ciq-input" id="ciqInput" placeholder="Ask a question..." autocomplete="off" />
      <button type="submit" class="ciq-send-btn" id="ciqSend">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  `;

  shadow.appendChild(windowEl);
  shadow.appendChild(launcher);

  // State
  let isOpen = false;
  let botConfig: any = {
    name: 'ContextIQ Assistant',
    greeting: 'Hi there! How can I help you today?',
    accentColor: '#E8675F',
    placeholder: 'Ask a question...',
  };

  const messagesEl = shadow.getElementById('ciqMessages')!;
  const inputEl = shadow.getElementById('ciqInput') as HTMLInputElement;
  const formEl = shadow.getElementById('ciqForm') as HTMLFormElement;
  const closeBtn = shadow.getElementById('ciqClose')!;
  const titleEl = shadow.getElementById('ciqTitle')!;
  const headerEl = shadow.getElementById('ciqHeader')!;
  const sendBtn = shadow.getElementById('ciqSend') as HTMLButtonElement;

  function toggleChat() {
    isOpen = !isOpen;
    windowEl.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      inputEl.focus();
    }
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  function appendMessage(role: 'user' | 'assistant', text: string, sources?: any[]) {
    const bubble = document.createElement('div');
    bubble.className = `ciq-bubble ciq-bubble-${role}`;
    bubble.textContent = text;

    if (sources && sources.length > 0) {
      const sourceTag = document.createElement('span');
      sourceTag.className = 'ciq-source-tag';
      sourceTag.textContent = `Sources: ${sources.map((s) => s.title).join(', ')}`;
      bubble.appendChild(sourceTag);
    }

    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Load Bot Config
  async function loadBotConfig() {
    try {
      const res = await fetch(`${apiBase}/chatbot/public/${tenantSlug}`);
      if (res.ok) {
        const data = await res.json();
        botConfig = data;
        titleEl.textContent = data.name || 'Assistant';
        inputEl.placeholder = data.placeholder || 'Ask a question...';
        
        if (data.accentColor) {
          launcher.style.background = data.accentColor;
          headerEl.style.background = data.accentColor;
          sendBtn.style.background = data.accentColor;
        }

        appendMessage('assistant', data.greeting || 'Hi! How can I help you?');
      }
    } catch (e) {
      appendMessage('assistant', 'Hi! How can I help you today?');
    }
  }

  loadBotConfig();

  // Send message
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    appendMessage('user', text);

    sendBtn.disabled = true;

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          sessionId,
          message: text,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        appendMessage('assistant', data.answer, data.sources);
      } else {
        appendMessage('assistant', data.error || 'Sorry, I could not generate an answer.');
      }
    } catch (err) {
      appendMessage('assistant', 'Connection error. Please try again.');
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  });
})();
