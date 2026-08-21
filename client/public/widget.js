(function(){"use strict";(function(){const s=document.currentScript,x=(s==null?void 0:s.getAttribute("data-tenant"))||"default",h=(s==null?void 0:s.getAttribute("data-api"))||(window.location.origin.includes("localhost")?"http://localhost:5000/api":"/api");let d=sessionStorage.getItem("contextiq_widget_session");d||(d="sess_"+Math.random().toString(36).substring(2,12),sessionStorage.setItem("contextiq_widget_session",d));const n=document.createElement("div");n.id="contextiq-chat-root",n.style.position="fixed",n.style.bottom="24px",n.style.right="24px",n.style.zIndex="2147483647",n.style.fontFamily='Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const t=n.attachShadow({mode:"open"});document.body.appendChild(n);const m=document.createElement("style");m.textContent=`
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
  `,t.appendChild(m);const c=document.createElement("button");c.className="ciq-launcher",c.innerHTML=`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;const p=document.createElement("div");p.className="ciq-window",p.innerHTML=`
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
  `,t.appendChild(p),t.appendChild(c);let u=!1,q={name:"ContextIQ Assistant",greeting:"Hi there! How can I help you today?",accentColor:"#E8675F",placeholder:"Ask a question..."};const f=t.getElementById("ciqMessages"),r=t.getElementById("ciqInput"),w=t.getElementById("ciqForm"),E=t.getElementById("ciqClose"),C=t.getElementById("ciqTitle"),v=t.getElementById("ciqHeader"),b=t.getElementById("ciqSend");function y(){u=!u,p.style.display=u?"flex":"none",u&&r.focus()}c.addEventListener("click",y),E.addEventListener("click",y);function a(i,e,l){const o=document.createElement("div");if(o.className=`ciq-bubble ciq-bubble-${i}`,o.textContent=e,l&&l.length>0){const g=document.createElement("span");g.className="ciq-source-tag",g.textContent=`Sources: ${l.map(I=>I.title).join(", ")}`,o.appendChild(g)}f.appendChild(o),f.scrollTop=f.scrollHeight}async function k(){try{const i=await fetch(`${h}/chatbot/public/${x}`);if(i.ok){const e=await i.json();q=e,C.textContent=e.name||"Assistant",r.placeholder=e.placeholder||"Ask a question...",e.accentColor&&(c.style.background=e.accentColor,v.style.background=e.accentColor,b.style.background=e.accentColor),a("assistant",e.greeting||"Hi! How can I help you?")}}catch{a("assistant","Hi! How can I help you today?")}}k(),w.addEventListener("submit",async i=>{i.preventDefault();const e=r.value.trim();if(e){r.value="",a("user",e),b.disabled=!0;try{const o=await(await fetch(`${h}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tenantSlug:x,sessionId:d,message:e})})).json();o.answer?a("assistant",o.answer,o.sources):a("assistant",o.error||"Sorry, I could not generate an answer.")}catch{a("assistant","Connection error. Please try again.")}finally{b.disabled=!1,r.focus()}}})})()})();
