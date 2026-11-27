(() => {
  if (document.getElementById("tm-3mien-root")) return;

  const BRANCH_LABELS = {
    grounded: { text: "Có căn cứ", cls: "badge-grounded" },
    clarify: { text: "Hỏi ngược G10", cls: "badge-clarify" },
    refuse: { text: "Ngoài phạm vi", cls: "badge-refuse" },
    guardrail: { text: "Chặn Guardrail", cls: "badge-guardrail" },
  };

  const state = {
    open: false,
    sending: false,
    selectedText: "",
    detectedDay: "",
    player: null,
    activeCite: null,
    segmentByCode: new Map(),
  };

  const host = document.createElement("div");
  host.id = "tm-3mien-root";
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.zIndex = "2147483646";
  host.style.bottom = "20px";
  host.style.right = "20px";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #0f172a;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }

      .fab {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid #bae0f0;
        background: linear-gradient(135deg, #0b5374, #0ea5e9);
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(11, 83, 116, 0.32);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .fab:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(11, 83, 116, 0.38);
      }
      .fab-badge {
        background: rgba(255,255,255,0.22);
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 11px;
      }

      .drawer {
        position: fixed;
        top: 16px;
        right: 16px;
        bottom: 16px;
        width: 400px;
        max-width: calc(100vw - 24px);
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      .drawer.open { display: flex; }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 12px 14px;
        background: #0b5374;
        color: #ffffff;
      }
      .header-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.25;
      }
      .header-sub {
        font-size: 11px;
        opacity: 0.85;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .icon-btn {
        background: rgba(255,255,255,0.16);
        border: none;
        color: #ffffff;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        display: grid;
        place-items: center;
      }
      .icon-btn:hover { background: rgba(255,255,255,0.28); }

      .status-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 14px;
        background: #f4f7fa;
        border-bottom: 1px solid #e2e8f0;
        font-size: 11px;
        color: #475569;
      }
      .dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        margin-right: 6px;
        background: #94a3b8;
      }
      .dot.ok { background: #059669; }
      .dot.err { background: #dc2626; }
      .player-pill {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #0b5374;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
        max-width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .player-pill:hover {
        background: #e6f2f8;
        border-color: #0b5374;
      }
      .player-pill.linked {
        background: #ecfdf5;
        border-color: #a7f3d0;
        color: #047857;
      }

      .selection-bar {
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 14px;
        background: #fff7ed;
        border-bottom: 1px solid #fed7aa;
        font-size: 11.5px;
        color: #9a3412;
      }
      .selection-bar.show { display: flex; }
      .selection-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
      .selection-btn {
        background: #c2410c;
        color: #fff;
        border: none;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
      }

      .messages {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 12px;
        background: #f6f8fc;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .welcome {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px;
        font-size: 12.5px;
        color: #475569;
        line-height: 1.5;
      }
      .welcome strong { color: #0b5374; }
      .quick-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 10px;
      }
      .quick-btn {
        text-align: left;
        background: #f4f7fa;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        color: #0f172a;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .quick-btn:hover {
        background: #e6f2f8;
        border-color: #bae0f0;
      }

      .msg {
        display: flex;
        flex-direction: column;
        max-width: 92%;
      }
      .msg.user { align-self: flex-end; }
      .msg.bot { align-self: flex-start; width: 100%; }

      .bubble {
        padding: 10px 12px;
        border-radius: 12px;
        font-size: 12.5px;
        line-height: 1.55;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .msg.user .bubble {
        background: #0b5374;
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }
      .msg.bot .bubble {
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
      }
      .msg.bot.err .bubble {
        background: #fff1f2;
        border-color: #fecdd3;
        color: #be123c;
      }

      .msg-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 5px;
        font-size: 11px;
        font-weight: 700;
        color: #475569;
      }
      .badge {
        padding: 1px 7px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
      }
      .badge-grounded { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
      .badge-clarify { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
      .badge-refuse, .badge-guardrail { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }

      .cite-btn {
        display: inline-flex;
        align-items: center;
        padding: 1px 6px;
        margin: 0 2px;
        border-radius: 5px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #047857;
        font-family: ui-monospace, Consolas, monospace;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }
      .cite-btn:hover {
        background: #0b5374;
        border-color: #0b5374;
        color: #ffffff;
      }

      .trace {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px dashed #e2e8f0;
        font-size: 10.5px;
        color: #64748b;
      }

      .cite-preview {
        display: none;
        padding: 10px 12px;
        background: #f0f9ff;
        border-top: 1px solid #bae6fd;
        font-size: 12px;
        color: #0f172a;
        max-height: 155px;
        overflow-y: auto;
      }
      .cite-preview.show { display: block; }
      .cite-preview-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
        font-weight: 700;
        color: #0b5374;
      }
      .cite-close {
        border: none;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        font-size: 13px;
      }
      .cite-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 7px;
        padding-top: 6px;
        border-top: 1px dashed #bae6fd;
      }
      .cite-seek-status {
        font-size: 11px;
        color: #0369a1;
        flex: 1;
      }
      .cite-seek-status.ok { color: #047857; font-weight: 600; }
      .cite-seek-status.err { color: #b45309; }
      .cite-seek-btn {
        border: 1px solid #0b5374;
        background: #0b5374;
        color: #ffffff;
        border-radius: 999px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
      }
      .cite-seek-btn:hover { background: #0ea5e9; border-color: #0ea5e9; }

      .composer {
        padding: 10px 12px;
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }
      .composer textarea {
        flex: 1;
        resize: none;
        border: 1.5px solid #cbd5e1;
        border-radius: 10px;
        padding: 8px 10px;
        font-family: inherit;
        font-size: 12.5px;
        color: #0f172a;
        background: #f8fafc;
        outline: none;
        max-height: 90px;
      }
      .composer textarea:focus {
        border-color: #0b5374;
        background: #ffffff;
      }
      .send-btn {
        background: #0b5374;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        padding: 9px 13px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    </style>

    <button id="fab" class="fab" type="button" title="Mở Trợ giảng Pre-class 3mien">
      <span class="fab-badge">3m</span>
      <span>Trợ giảng có căn cứ</span>
    </button>

    <div id="drawer" class="drawer" role="dialog" aria-label="Trợ giảng Pre-class 3mien">
      <div class="header">
        <div>
          <div class="header-title">3mien · Trợ giảng Pre-class</div>
          <div class="header-sub">Grounding theo bài học · Hỏi ngược G10</div>
        </div>
        <div class="header-actions">
          <button id="btnClear" class="icon-btn" type="button" title="Làm mới chat">↻</button>
          <button id="btnClose" class="icon-btn" type="button" title="Thu gọn">✕</button>
        </div>
      </div>

      <div class="status-strip">
        <span id="statusText"><span class="dot"></span>Đang kiểm tra server cục bộ…</span>
        <button id="pageHint" class="player-pill" type="button" title="Bấm để điền mốc video đang xem vào ô hỏi">preclass-online.com</button>
      </div>

      <div id="selectionBar" class="selection-bar">
        <span id="selectionText" class="selection-text"></span>
        <button id="btnAskSelection" class="selection-btn" type="button">Hỏi đoạn này</button>
      </div>

      <div id="messages" class="messages">
        <div id="welcome" class="welcome">
          <strong>Xin chào!</strong> Bạn có thể bôi đen chữ trên slide <em>preclass-online.com</em> hoặc gõ câu hỏi vào đây. Trợ giảng sẽ dẫn đúng <strong>[mã đoạn · phút:giây]</strong> để bạn kiểm chứng ngay.
          <div class="quick-list">
            <button class="quick-btn" data-q="Trong bài Day 8, 5 khuôn workflow gồm những gì và xem ở phút thứ mấy?" type="button">• 5 khuôn workflow xem ở phút thứ mấy? (Day 8)</button>
            <button class="quick-btn" data-q="Điểm lưu (checkpoint) và khoá idempotency trong bài Day 8 khác nhau thế nào?" type="button">• Checkpoint & khoá idempotency khác nhau thế nào?</button>
            <button class="quick-btn" data-q="Cái này khác gì?" type="button">• Thử câu mơ hồ: "Cái này khác gì?"</button>
          </div>
        </div>
      </div>

      <div id="citePreview" class="cite-preview">
        <div class="cite-preview-head">
          <span id="citeTitle"></span>
          <button id="btnCloseCite" class="cite-close" type="button">✕</button>
        </div>
        <div id="citeBody"></div>
        <div class="cite-actions">
          <span id="citeSeekStatus" class="cite-seek-status"></span>
          <button id="btnSeekAgain" class="cite-seek-btn" type="button">▶ Tua video tới mốc này</button>
        </div>
      </div>

      <form id="form" class="composer">
        <textarea id="input" rows="1" placeholder="Hỏi khái niệm hoặc dán mã đoạn D08-S02..."></textarea>
        <button id="btnSend" class="send-btn" type="submit">Gửi</button>
      </form>
    </div>
  `;

  const $ = (id) => shadow.getElementById(id);
  const fab = $("fab");
  const drawer = $("drawer");
  const btnClose = $("btnClose");
  const btnClear = $("btnClear");
  const statusText = $("statusText");
  const pageHint = $("pageHint");
  const selectionBar = $("selectionBar");
  const selectionText = $("selectionText");
  const btnAskSelection = $("btnAskSelection");
  const messagesEl = $("messages");
  const welcomeEl = $("welcome");
  const citePreview = $("citePreview");
  const citeTitle = $("citeTitle");
  const citeBody = $("citeBody");
  const citeSeekStatus = $("citeSeekStatus");
  const btnSeekAgain = $("btnSeekAgain");
  const btnCloseCite = $("btnCloseCite");
  const form = $("form");
  const input = $("input");
  const btnSend = $("btnSend");

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseTimeToSeconds(timeStr) {
    if (!timeStr) return null;
    const parts = String(timeStr).trim().split(":").map((x) => parseInt(x, 10));
    if (!parts.length || parts.some((n) => isNaN(n) || n < 0)) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  function formatSeconds(sec) {
    if (typeof sec !== "number" || !isFinite(sec) || sec < 0) return "";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function extractSlideNum(seg) {
    if (!seg) return null;
    if (typeof seg.slide_num === "number" && seg.slide_num >= 1) return seg.slide_num;
    const src = `${seg.video_title || ""} ${seg.title || ""}`;
    const m = src.match(/Slide\s*0?(\d{1,3})/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function detectDayFromText(str) {
    const m = String(str || "").match(/(?:day|d)[\s_-]?0?(\d{1,2})/i);
    return m ? `Day${String(m[1]).padStart(2, "0")}` : "";
  }

  function renderPlayerHint() {
    const p = state.player;
    if (p && p.found) {
      const parts = [];
      if (state.detectedDay) parts.push(state.detectedDay);
      if (typeof p.seconds === "number") parts.push(formatSeconds(p.seconds));
      else if (p.slide) parts.push(`Slide ${p.slide}`);
      else parts.push(p.mode);
      pageHint.textContent = `🎬 ${parts.join(" · ")}`;
      pageHint.classList.add("linked");
      pageHint.title = `Đã gắn với ${p.mode}${p.slide ? ` (Slide ${p.slide})` : ""}. Bấm để điền mốc đang xem vào câu hỏi.`;
    } else if (state.detectedDay) {
      pageHint.textContent = `Đang xem: ${state.detectedDay}`;
      pageHint.classList.remove("linked");
      pageHint.title = "Bấm để điền tên bài đang xem vào câu hỏi";
    } else {
      pageHint.textContent = location.hostname || "preclass-online.com";
      pageHint.classList.remove("linked");
      pageHint.title = "Bấm để dò lại player video trên trang";
    }
  }

  function detectPageDay() {
    state.detectedDay = detectDayFromText(`${document.title} ${location.href}`);
    renderPlayerHint();
  }

  function refreshPlayerState(onDone) {
    chrome.runtime.sendMessage({ type: "GET_PLAYER_STATE" }, (res) => {
      if (!chrome.runtime.lastError && res && res.ok && res.found) {
        state.player = res;
        const innerDay = detectDayFromText(`${res.title || ""} ${res.href || ""}`);
        if (innerDay) state.detectedDay = innerDay;
      } else {
        state.player = null;
      }
      renderPlayerHint();
      if (typeof onDone === "function") onDone(state.player);
    });
  }

  function seekPageVideo(seconds, slide, label) {
    citeSeekStatus.className = "cite-seek-status";
    citeSeekStatus.textContent = `Đang trỏ video tới ${label || "mốc trích dẫn"}…`;

    chrome.runtime.sendMessage(
      {
        type: "SEEK_VIDEO",
        seconds: typeof seconds === "number" ? seconds : null,
        slide: typeof slide === "number" ? slide : null,
      },
      (res) => {
        if (chrome.runtime.lastError || !res || !res.ok) {
          citeSeekStatus.className = "cite-seek-status err";
          citeSeekStatus.textContent =
            (res && res.error) || "Không tìm thấy player video trên trang hiện tại.";
          return;
        }
        const detail = [];
        if (typeof res.seconds === "number") detail.push(formatSeconds(res.seconds));
        else if (label) detail.push(label);
        if (res.slide) detail.push(`Slide ${res.slide}`);
        citeSeekStatus.className = "cite-seek-status ok";
        citeSeekStatus.textContent = `✓ Đã trỏ lên ${res.mode} (${detail.join(" · ") || label})`;
        refreshPlayerState();
      }
    );
  }

  function toggleDrawer(force) {
    state.open = typeof force === "boolean" ? force : !state.open;
    drawer.classList.toggle("open", state.open);
    fab.style.display = state.open ? "none" : "inline-flex";
    if (state.open) {
      refreshInfo();
      refreshPlayerState();
      input.focus();
    }
  }

  function refreshInfo() {
    chrome.runtime.sendMessage({ type: "GET_INFO" }, (res) => {
      if (chrome.runtime.lastError || !res || !res.ok) {
        statusText.innerHTML = `<span class="dot err"></span>Chưa bật server (chạy: python frontend/server.py)`;
        return;
      }
      const d = res.data;
      statusText.innerHTML = `<span class="dot ok"></span>${esc(d.provider)} · ${esc(d.model || "fake")} (${d.segments_count} đoạn)`;
    });

    if (state.segmentByCode.size === 0) {
      chrome.runtime.sendMessage({ type: "GET_LESSONS" }, (res) => {
        if (res && res.ok && res.data && Array.isArray(res.data.segments)) {
          for (const seg of res.data.segments) {
            state.segmentByCode.set(seg.code.toUpperCase(), seg);
          }
        }
      });
    }
  }

  function formatOutput(text) {
    const safe = esc(text);
    return safe.replace(/\[?(D\d{2}-S\d{2})(?:\s*·\s*(\d{1,2}:\d{2}(?::\d{2})?))?\]?/gi, (m, code, timeStr) => {
      const upper = code.toUpperCase();
      if (state.segmentByCode.has(upper) || timeStr) {
        const lbl = timeStr ? `▶ [${upper} · ${timeStr}]` : `▶ [${upper}]`;
        return `<button type="button" class="cite-btn" data-code="${upper}" data-time="${timeStr || ""}" title="Bấm để xem trích đoạn và tua video tới mốc này">${lbl}</button>`;
      }
      return m;
    });
  }

  function showCitation(code, timeStr) {
    const upper = String(code || "").toUpperCase();
    const seg = state.segmentByCode.get(upper);
    const displayTime = timeStr || (seg && seg.timestamp) || "";
    const seconds = parseTimeToSeconds(displayTime);
    const slide = extractSlideNum(seg);

    state.activeCite = { code: upper, timeStr: displayTime, seconds, slide };
    citeTitle.textContent = seg
      ? `${seg.code} · ${displayTime} — ${seg.title || seg.topic}`
      : `${upper}${displayTime ? ` · ${displayTime}` : ""}`;
    citeBody.textContent = seg ? seg.text : "Bấm nút bên dưới để tua video tới đúng mốc trích dẫn.";
    citePreview.classList.add("show");

    if (seconds !== null || slide !== null) {
      seekPageVideo(seconds, slide, displayTime || (slide ? `Slide ${slide}` : upper));
    } else {
      citeSeekStatus.className = "cite-seek-status err";
      citeSeekStatus.textContent = "Đoạn này chưa có mốc giây để tua tự động.";
    }
  }

  function appendMsg(role, html, isErr = false) {
    if (welcomeEl) welcomeEl.style.display = "none";
    const div = document.createElement("div");
    div.className = `msg ${role}` + (isErr ? " err" : "");
    div.innerHTML = `<div class="bubble">${html}</div>`;
    div.querySelectorAll(".cite-btn").forEach((b) => {
      b.addEventListener("click", () => showCitation(b.dataset.code, b.dataset.time));
    });
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function send(text) {
    const q = (text || "").trim();
    if (!q || state.sending) return;
    state.sending = true;
    btnSend.disabled = true;
    input.value = "";
    appendMsg("user", esc(q));
    const loading = appendMsg("bot", `<div class="msg-head"><span>Trợ giảng 3mien</span></div>Đang tra căn cứ bài học…`);

    chrome.runtime.sendMessage({ type: "CHAT", message: q }, (res) => {
      loading.remove();
      state.sending = false;
      btnSend.disabled = false;

      if (chrome.runtime.lastError || !res || !res.ok) {
        const errMsg = (res && (res.error || (res.data && res.data.error))) || "Lỗi kết nối server cục bộ.";
        appendMsg("bot", `<div class="msg-head"><span>Lỗi kết nối</span></div>${esc(errMsg)}`, true);
        return;
      }

      const d = res.data;
      const b = BRANCH_LABELS[d.branch] || BRANCH_LABELS.grounded;
      const s = d.summary || {};
      const modelTxt = s.models && s.models.length ? s.models.join(", ") : "không gọi model";
      const html = `
        <div class="msg-head">
          <span>Trợ giảng 3mien</span>
          <span class="badge ${b.cls}">${b.text}</span>
        </div>
        <div>${formatOutput(d.output || "")}</div>
        <div class="trace">Model: ${esc(modelTxt)} · Tool: ${s.tool_calls ?? 0} · Token: ${s.tokens_in ?? 0}/${s.tokens_out ?? 0} · ${d.elapsed_s ?? 0}s</div>
      `;
      appendMsg("bot", html);
    });
  }

  // Bắt đoạn chữ học viên bôi đen trên trang preclass-online.com
  document.addEventListener("mouseup", () => {
    const sel = (window.getSelection() ? window.getSelection().toString() : "").trim();
    if (sel.length >= 4 && sel.length <= 240) {
      state.selectedText = sel;
      selectionText.textContent = `Đang bôi đen: "${sel}"`;
      selectionBar.classList.add("show");
    } else if (!sel) {
      state.selectedText = "";
      selectionBar.classList.remove("show");
    }
  });

  fab.addEventListener("click", () => toggleDrawer(true));
  btnClose.addEventListener("click", () => toggleDrawer(false));
  btnCloseCite.addEventListener("click", () => citePreview.classList.remove("show"));
  btnSeekAgain.addEventListener("click", () => {
    if (!state.activeCite) return;
    seekPageVideo(
      state.activeCite.seconds,
      state.activeCite.slide,
      state.activeCite.timeStr || state.activeCite.code
    );
  });
  pageHint.addEventListener("click", () => {
    refreshPlayerState((p) => {
      const ctx = [];
      if (state.detectedDay) ctx.push(`bài ${state.detectedDay}`);
      if (p && typeof p.seconds === "number") ctx.push(`mốc ${formatSeconds(p.seconds)}`);
      else if (p && p.slide) ctx.push(`Slide ${p.slide}`);
      if (ctx.length) {
        const prefix = `Trong ${ctx.join(" ở ")}, `;
        if (!input.value.startsWith(prefix)) {
          input.value = prefix + input.value;
        }
        input.focus();
      }
    });
  });
  btnClear.addEventListener("click", () => {
    messagesEl.querySelectorAll(".msg").forEach((m) => m.remove());
    citePreview.classList.remove("show");
    if (welcomeEl) welcomeEl.style.display = "block";
  });

  btnAskSelection.addEventListener("click", () => {
    if (!state.selectedText) return;
    const dayPrefix = state.detectedDay ? ` (${state.detectedDay})` : "";
    send(`Giải thích giúp mình khái niệm "${state.selectedText}" theo bài pre-class${dayPrefix}.`);
  });

  shadow.querySelectorAll(".quick-btn").forEach((b) => {
    b.addEventListener("click", () => send(b.dataset.q));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });

  ["keydown", "keypress", "keyup"].forEach((evt) => {
    drawer.addEventListener(evt, (e) => {
      e.stopPropagation();
    });
  });

  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.value);
      return;
    }
    // Dự phòng: nếu trang web đã gọi preventDefault() lên phím Space trước khi F5 nạp page-guard.js,
    // tự chèn dấu cách tại đúng vị trí con trỏ của ô chat.
    if (
      (e.key === " " || e.code === "Space") &&
      e.defaultPrevented &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0, start) + " " + input.value.slice(end);
      input.selectionStart = input.selectionEnd = start + 1;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "TOGGLE_DRAWER") {
      toggleDrawer();
    }
  });

  detectPageDay();
  refreshPlayerState();
})();
