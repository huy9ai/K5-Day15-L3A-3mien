(() => {
  if (document.getElementById("tm-3mien-root")) return;

  const BRANCH_LABELS = {
    grounded: { text: "Có căn cứ", cls: "badge-grounded" },
    clarify: { text: "Hỏi ngược G10", cls: "badge-clarify" },
    refuse: { text: "Ngoài phạm vi", cls: "badge-refuse" },
    guardrail: { text: "Chặn Guardrail", cls: "badge-guardrail" },
  };

  const PRECLASS_DECK_URLS = {
    Day01: "https://preclass-online.com/decks/phase1/day01-ai-llm-foundation/day01-voiced-v2/index.html?vt=20261113",
    Day02: "https://preclass-online.com/decks/phase1/day02-ai-problem-definition/day02-voiced-v2/index.html?vt=20261113",
    Day03: "https://preclass-online.com/decks/phase1/day03-prompt-engineering-tool-calling/day03-voiced/index.html?v=2&vt=20261113",
    Day04: "https://preclass-online.com/decks/phase1/day04-chatbot-to-agentic-agent/day04-voiced/index.html?vt=20261113",
    Day05: "https://preclass-online.com/decks/phase1/day05-ai-requirements-ux/day05-voiced/index.html?vt=20261113",
    Day06: "https://preclass-online.com/decks/phase1/day06-data-engineering-for-agents/day06-voiced-v2/index.html?vt=20261113",
    Day07: "https://preclass-online.com/decks/phase1/day07-retrieval-context-engineering/day07-voiced/index.html?vt=20261113",
    Day08: "https://preclass-online.com/decks/phase1/day08-from-workflows-to-agents/day08-voiced/index.html?vt=20261113",
    Day09: "https://preclass-online.com/decks/phase1/day09-evaluation-failure-analysis/day09-voiced/index.html?vt=20261113",
    Day10: "https://preclass-online.com/decks/phase1/day10-poc-to-pilot/day10-voiced/index.html?vt=20261113",
    Day11: "https://preclass-online.com/decks/phase1/day11-guardrails-hitl-responsible-ai/day11-voiced/index.html?vt=20261113",
    Day12: "https://preclass-online.com/decks/phase1/day12-ai-sdlc-coding-agent/day12-voiced/index.html?vt=20261113",
    Day13: "https://preclass-online.com/decks/phase1/day13-launch-economics/day13-voiced/index.html?vt=20261113",
    Day14: "https://preclass-online.com/decks/phase1/day14-deployment-observability/day14-voiced/index.html?vt=20261113",
    Day15: "https://preclass-online.com/decks/phase1/day15-capstone-launch-review/day15-voiced/index.html?vt=20261113",
  };

  const state = {
    open: false,
    sending: false,
    catalogOpen: false,
    viewerOpen: false,
    viewerDay: "",
    viewerUrl: "",
    viewerSeekSeq: 0,
    selectedText: "",
    detectedDay: "",
    player: null,
    playerFetchedAt: 0,
    lessonsLoading: false,
    activeCite: null,
    activeCode: "",
    datasetVersion: "",
    segments: [],
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
        width: 416px;
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
        opacity: 0.88;
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
      .icon-btn.active { background: #ffffff; color: #0b5374; }

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
      .status-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
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
        max-width: 175px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 0;
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

      /* Mục lục 15 ngày (Day 01-15) có thể mở nhanh trong drawer */
      .catalog-panel {
        display: none;
        flex-direction: column;
        max-height: 46%;
        background: #ffffff;
        border-bottom: 1px solid #cbd5e1;
      }
      .catalog-panel.show { display: flex; }
      .catalog-top {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      .catalog-search {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 6px 9px;
        font-size: 12px;
        font-family: inherit;
        color: #0f172a;
        background: #ffffff;
        outline: none;
      }
      .catalog-search:focus { border-color: #0b5374; }
      .catalog-list {
        overflow-y: auto;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cat-day {
        border: 1px solid #e2e8f0;
        border-radius: 9px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .cat-day-head {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 7px 10px;
        background: #f4f7fa;
        border: none;
        font-size: 11.5px;
        font-weight: 700;
        color: #0b5374;
        cursor: pointer;
        text-align: left;
      }
      .cat-day-head:hover { background: #e6f2f8; }
      .cat-day-segs {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px;
        background: #ffffff;
      }
      .cat-day.collapsed .cat-day-segs { display: none; }
      .cat-seg {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 6px 7px;
        border: 1px solid #e2e8f0;
        border-radius: 7px;
        background: #f8fafc;
        font-size: 11.5px;
      }
      .cat-seg.active {
        background: #e6f2f8;
        border-color: #0b5374;
      }
      .cat-seg-main {
        flex: 1;
        min-width: 0;
        cursor: pointer;
      }
      .cat-seg-code {
        font-family: ui-monospace, Consolas, monospace;
        font-size: 10.5px;
        font-weight: 700;
        color: #047857;
      }
      .cat-seg-title {
        color: #0f172a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 1px;
      }
      .cat-seg-ask {
        border: 1px solid #bae0f0;
        background: #ffffff;
        color: #0b5374;
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
      }
      .cat-seg-ask:hover { background: #0b5374; color: #ffffff; border-color: #0b5374; }

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
        padding: 7px 10px;
        font-size: 11.8px;
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
        max-width: 94%;
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

      /* Chip hành động 1 chạm (HAX G9) & nút tạo bản nháp TA Discord (HITL) */
      .action-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .action-chips:empty { display: none; }
      .action-chip {
        border: 1px solid #bae0f0;
        background: #f0f9ff;
        color: #0b5374;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .action-chip:hover {
        background: #0b5374;
        border-color: #0b5374;
        color: #ffffff;
      }
      .action-chip.ta-chip {
        background: #fffbeb;
        border-color: #fde68a;
        color: #92400e;
      }
      .action-chip.ta-chip:hover {
        background: #d97706;
        border-color: #d97706;
        color: #ffffff;
      }

      .ta-draft-box {
        margin-top: 8px;
        padding: 8px;
        border-radius: 9px;
        background: #fffbeb;
        border: 1px solid #fde68a;
      }
      .ta-draft-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 6px;
        font-size: 10.5px;
        font-weight: 700;
        color: #92400e;
      }
      .btn-copy-draft {
        border: 1px solid #f59e0b;
        background: #ffffff;
        color: #92400e;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-copy-draft:hover {
        background: #d97706;
        border-color: #d97706;
        color: #ffffff;
      }
      .ta-draft-box textarea {
        width: 100%;
        min-height: 92px;
        resize: vertical;
        border: 1px solid #fcd34d;
        border-radius: 7px;
        padding: 6px 8px;
        font-family: inherit;
        font-size: 11.5px;
        line-height: 1.45;
        color: #0f172a;
        background: #ffffff;
        outline: none;
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

      /* Thanh ngữ cảnh đoạn đang xem (1 chạm) */
      .active-context-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 12px;
        background: #f0f9ff;
        border-top: 1px solid #bae6fd;
        font-size: 11.2px;
        color: #0b5374;
      }
      .active-context-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
      }
      .btn-ask-current {
        border: 1px solid #0b5374;
        background: #ffffff;
        color: #0b5374;
        border-radius: 999px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
      }
      .btn-ask-current:hover {
        background: #0b5374;
        color: #ffffff;
      }

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

      /* Khung chiếu chỉ dẫn bài giảng nổi (hoạt động từ mọi trang: Trang chủ, bài khác, v.v.) */
      .viewer-modal {
        position: fixed;
        top: 16px;
        bottom: 16px;
        left: 16px;
        right: 444px;
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 16px;
        box-shadow: 0 20px 54px rgba(15, 23, 42, 0.36);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      .viewer-modal.open { display: flex; }
      .viewer-modal.drawer-closed { right: 16px; }
      @media (max-width: 900px) {
        .viewer-modal {
          left: 12px;
          right: 12px;
          top: 12px;
          bottom: 52%;
        }
      }
      .viewer-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 12px;
        background: #0b5374;
        color: #ffffff;
        flex-shrink: 0;
      }
      .viewer-info {
        min-width: 0;
        flex: 1;
      }
      .viewer-title {
        font-size: 12.5px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .viewer-status {
        font-size: 11px;
        opacity: 0.9;
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .viewer-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .viewer-btn {
        border: 1px solid rgba(255,255,255,0.28);
        background: rgba(255,255,255,0.14);
        color: #ffffff;
        border-radius: 8px;
        padding: 5px 9px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }
      .viewer-btn:hover { background: rgba(255,255,255,0.28); }
      .viewer-btn.close-btn {
        background: rgba(239, 68, 68, 0.85);
        border-color: rgba(254, 202, 202, 0.45);
      }
      .viewer-btn.close-btn:hover { background: #dc2626; }
      .viewer-stage {
        flex: 1;
        min-height: 0;
        background: #0f172a;
        position: relative;
      }
      .viewer-frame {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
        background: #0f172a;
      }
    </style>

    <button id="fab" class="fab" type="button" title="Mở Trợ giảng Pre-class 3mien">
      <span class="fab-badge">3m</span>
      <span>Trợ giảng có căn cứ</span>
    </button>

    <div id="viewerModal" class="viewer-modal" role="region" aria-label="Trình chiếu chỉ dẫn bài giảng 3mien">
      <div class="viewer-head">
        <div class="viewer-info">
          <div id="viewerTitle" class="viewer-title">🎬 Chỉ dẫn bài giảng Pre-class</div>
          <div id="viewerStatus" class="viewer-status">Đang chuẩn bị bài giảng…</div>
        </div>
        <div class="viewer-actions">
          <button id="btnViewerSeek" class="viewer-btn" type="button" title="Tua lại đúng mốc trích dẫn">↺ Đúng mốc</button>
          <button id="btnViewerNewTab" class="viewer-btn" type="button" title="Mở toàn màn hình ở tab mới">↗ Tab mới</button>
          <button id="btnViewerClose" class="viewer-btn close-btn" type="button" title="Đóng khung chiếu">✕ Đóng</button>
        </div>
      </div>
      <div class="viewer-stage">
        <iframe id="viewerFrame" name="tm-3mien-viewer-frame" class="viewer-frame" allow="autoplay"></iframe>
      </div>
    </div>

    <div id="drawer" class="drawer" role="dialog" aria-label="Trợ giảng Pre-class 3mien">
      <div class="header">
        <div>
          <div class="header-title">3mien · Trợ giảng Pre-class</div>
          <div class="header-sub">Day 01–15 · Có căn cứ · Hỏi ngược G10</div>
        </div>
        <div class="header-actions">
          <button id="btnCatalog" class="icon-btn" type="button" title="Mục lục 15 ngày (86 đoạn)">📑</button>
          <button id="btnClear" class="icon-btn" type="button" title="Làm mới chat">↻</button>
          <button id="btnClose" class="icon-btn" type="button" title="Thu gọn">✕</button>
        </div>
      </div>

      <div class="status-strip">
        <span id="statusText" class="status-text"><span class="dot"></span>Đang kiểm tra server cục bộ…</span>
        <button id="pageHint" class="player-pill" type="button" title="Bấm để điền mốc video đang xem vào ô hỏi">preclass-online.com</button>
      </div>

      <div id="selectionBar" class="selection-bar">
        <span id="selectionText" class="selection-text"></span>
        <button id="btnAskSelection" class="selection-btn" type="button">Hỏi đoạn này</button>
      </div>

      <div id="catalogPanel" class="catalog-panel">
        <div class="catalog-top">
          <input id="catalogSearch" class="catalog-search" type="search" placeholder="Tìm nhanh Day 01–15, mã D08-S02, chủ đề..." />
        </div>
        <div id="catalogList" class="catalog-list"></div>
      </div>

      <div id="messages" class="messages">
        <div id="welcome" class="welcome">
          <strong>Xin chào!</strong> Trợ giảng phủ đủ <strong>15 ngày Pre-class (Day 01 → Day 15)</strong>. Bạn có thể bôi đen chữ trên slide, bấm <strong>Hỏi đoạn đang xem</strong>, hoặc gõ câu hỏi để nhận giải thích kèm <strong>[mã đoạn · phút:giây]</strong>.
          <div class="quick-list">
            <button class="quick-btn" data-q="Nội dung Day 1 gồm những phần nào và bắt đầu từ phút thứ mấy?" type="button">• Day 01 gồm những phần nào? (tổng quan)</button>
            <button class="quick-btn" data-q="Trong bài Day 3, kỹ thuật Prompt Engineering và Tool Calling nằm ở đoạn nào?" type="button">• Prompt Engineering & Tool Calling (Day 03)</button>
            <button class="quick-btn" data-q="Trong bài Day 8, 5 khuôn workflow gồm những gì và xem ở phút thứ mấy?" type="button">• 5 khuôn workflow xem ở phút thứ mấy? (Day 08)</button>
            <button class="quick-btn" data-q="Bài Day 14 nói gì về Deployment và Observability?" type="button">• Deployment & Observability (Day 14)</button>
            <button class="quick-btn" data-q="Cái này khác gì?" type="button">• Thử câu mơ hồ G10: "Cái này khác gì?"</button>
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

      <div id="activeContextBar" class="active-context-bar">
        <span id="activeContextText" class="active-context-text">📌 Đang dò bài giảng Pre-class…</span>
        <button id="btnAskCurrent" class="btn-ask-current" type="button">Hỏi đoạn đang xem</button>
      </div>

      <form id="form" class="composer">
        <textarea id="input" rows="1" placeholder="Hỏi bất kỳ bài nào Day 01–15 hoặc gõ mã đoạn D08-S02..."></textarea>
        <button id="btnSend" class="send-btn" type="submit">Gửi</button>
      </form>
    </div>
  `;

  const $ = (id) => shadow.getElementById(id);
  const fab = $("fab");
  const viewerModal = $("viewerModal");
  const viewerTitle = $("viewerTitle");
  const viewerStatus = $("viewerStatus");
  const viewerFrame = $("viewerFrame");
  const btnViewerSeek = $("btnViewerSeek");
  const btnViewerNewTab = $("btnViewerNewTab");
  const btnViewerClose = $("btnViewerClose");
  const drawer = $("drawer");
  const btnCatalog = $("btnCatalog");
  const btnClose = $("btnClose");
  const btnClear = $("btnClear");
  const statusText = $("statusText");
  const pageHint = $("pageHint");
  const selectionBar = $("selectionBar");
  const selectionText = $("selectionText");
  const btnAskSelection = $("btnAskSelection");
  const catalogPanel = $("catalogPanel");
  const catalogSearch = $("catalogSearch");
  const catalogList = $("catalogList");
  const messagesEl = $("messages");
  const welcomeEl = $("welcome");
  const citePreview = $("citePreview");
  const citeTitle = $("citeTitle");
  const citeBody = $("citeBody");
  const citeSeekStatus = $("citeSeekStatus");
  const btnSeekAgain = $("btnSeekAgain");
  const btnCloseCite = $("btnCloseCite");
  const activeContextText = $("activeContextText");
  const btnAskCurrent = $("btnAskCurrent");
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

  function stripAccents(str) {
    return String(str || "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
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

  function extractSlideNum(seg, timeStr) {
    if (!seg) return null;
    const cleanTime = String(timeStr || "").trim();
    if (cleanTime && Array.isArray(seg.sub_slides)) {
      const sub = seg.sub_slides.find((s) => s && s.timestamp === cleanTime);
      if (sub && typeof sub.slide === "number" && sub.slide >= 1) return sub.slide;
    }
    if (typeof seg.slide === "number" && seg.slide >= 1) return seg.slide;
    if (typeof seg.slide_num === "number" && seg.slide_num >= 1) return seg.slide_num;
    const src = `${seg.video_title || ""} ${seg.title || ""}`;
    const m = src.match(/Slide\s*0?(\d{1,3})/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function detectDayFromText(str) {
    const s = String(str || "");
    const m = s.match(/\bday[\s_-]*0?(\d{1,2})\b/i) || s.match(/\bd0?(\d{1,2})(?=[-_/\s]|$)/i);
    if (!m) return "";
    const num = parseInt(m[1], 10);
    if (isNaN(num) || num < 1 || num > 15) return "";
    return `Day${String(num).padStart(2, "0")}`;
  }

  function findCurrentSegment() {
    const day = state.detectedDay;
    if (day && state.segments.length > 0) {
      const daySegs = state.segments.filter((s) => (s.day || s.lesson) === day);
      if (daySegs.length > 0) {
        const p = state.player;
        if (p && p.found && typeof p.seconds === "number") {
          let chosen = daySegs[0];
          for (const seg of daySegs) {
            const sec = parseTimeToSeconds(seg.timestamp);
            if (sec !== null && sec <= p.seconds + 2) {
              chosen = seg;
            }
          }
          return chosen;
        }
        if (p && p.found && typeof p.slide === "number") {
          let chosen = daySegs[0];
          for (const seg of daySegs) {
            const sNum = extractSlideNum(seg, "");
            if (sNum !== null && sNum <= p.slide) {
              chosen = seg;
            }
          }
          return chosen;
        }
        if (state.activeCode) {
          const activeSeg = state.segmentByCode.get(state.activeCode.toUpperCase());
          if (activeSeg && (activeSeg.day || activeSeg.lesson) === day) return activeSeg;
        }
        return daySegs[0];
      }
    }
    if (state.activeCode) {
      return state.segmentByCode.get(state.activeCode.toUpperCase()) || null;
    }
    return null;
  }

  function updateActiveContextBar() {
    if (!activeContextText) return;
    const seg = findCurrentSegment();
    const p = state.player;
    if (seg) {
      const liveTime =
        p && p.found && typeof p.seconds === "number" && (!state.detectedDay || (seg.day || seg.lesson) === state.detectedDay)
          ? formatSeconds(p.seconds)
          : seg.timestamp;
      activeContextText.textContent = `📌 Đang xem: ${seg.code} · ${liveTime} — ${seg.title || seg.topic}`;
      activeContextText.title = `${seg.lesson_title || seg.day} · ${seg.code} (${seg.timestamp}) — ${seg.title || seg.topic}`;
      return;
    }
    if (state.detectedDay) {
      const timePart = p && p.found && typeof p.seconds === "number" ? ` · ${formatSeconds(p.seconds)}` : "";
      activeContextText.textContent = `📌 Đang xem: ${state.detectedDay}${timePart}`;
      activeContextText.title = `Đang mở bài ${state.detectedDay} trên preclass-online.com`;
      return;
    }
    activeContextText.textContent = "📌 Sẵn sàng hỗ trợ cả 15 ngày Pre-class (Day 01–15)";
    activeContextText.title = "Mở một bài trên preclass-online.com để đồng bộ tự động theo mốc video";
  }

  function buildTaDraftText(userQuestion, botOutput) {
    const seg = findCurrentSegment();
    const p = state.player;
    let ctxLine = state.detectedDay || "Chưa xác định bài";
    if (seg) {
      const timeNote =
        p && p.found && typeof p.seconds === "number" && (!state.detectedDay || (seg.day || seg.lesson) === state.detectedDay)
          ? formatSeconds(p.seconds)
          : seg.timestamp;
      const slideNote = p && p.found && p.slide ? ` · Slide ${p.slide}` : "";
      ctxLine = `${seg.lesson_title || seg.day} · [${seg.code} · ${timeNote}${slideNote}] ${seg.title || seg.topic}`;
    } else if (p && p.found) {
      const parts = [state.detectedDay || location.pathname];
      if (typeof p.seconds === "number") parts.push(formatSeconds(p.seconds));
      if (p.slide) parts.push(`Slide ${p.slide}`);
      ctxLine = parts.filter(Boolean).join(" · ");
    }
    const shortNote = String(botOutput || "").replace(/\s+/g, " ").trim().slice(0, 140);
    return [
      "[Hỏi TA · Lớp L3 · Pre-class]",
      `- Bài đang xem: ${ctxLine}`,
      `- Câu hỏi của mình: ${userQuestion || "(chưa nhập)"}`,
      `- Ghi chú từ trợ giảng AI: ${shortNote}`,
      "- Nhờ TA giải đáp thêm giúp mình ạ!",
    ].join("\n");
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
    updateActiveContextBar();
  }

  function detectPageDay() {
    state.detectedDay = detectDayFromText(`${document.title} ${location.href}`);
    renderPlayerHint();
  }

  function refreshPlayerState(onDone) {
    const pageDay = detectDayFromText(`${document.title} ${location.href}`);
    chrome.runtime.sendMessage({ type: "GET_PLAYER_STATE" }, (res) => {
      state.playerFetchedAt = Date.now();
      if (!chrome.runtime.lastError && res && res.ok && res.found) {
        state.player = res;
        const innerDay = detectDayFromText(`${res.title || ""} ${res.href || ""}`);
        state.detectedDay = innerDay || pageDay;
      } else {
        state.player = null;
        state.detectedDay = pageDay;
      }
      renderPlayerHint();
      if (typeof onDone === "function") onDone(state.player);
    });
  }

  function closeFloatingViewer() {
    state.viewerOpen = false;
    state.viewerDay = "";
    state.viewerUrl = "";
    state.viewerSeekSeq += 1;
    viewerModal.classList.remove("open");
    chrome.runtime.sendMessage({ type: "STOP_VIEWER" }, () => {
      try {
        viewerFrame.src = "about:blank";
      } catch (e) {}
      refreshPlayerState();
    });
  }

  function pollViewerSeek(cite, seq, attempt = 0) {
    if (seq !== state.viewerSeekSeq || !state.viewerOpen) return;
    chrome.runtime.sendMessage(
      {
        type: "SEEK_VIDEO",
        seconds: typeof cite.seconds === "number" ? cite.seconds : null,
        slide: typeof cite.slide === "number" ? cite.slide : null,
        targetDay: cite.day || "",
        viewerOnly: true,
      },
      (res) => {
        if (seq !== state.viewerSeekSeq || !state.viewerOpen) return;
        if (!chrome.runtime.lastError && res && res.ok) {
          const detail = [];
          if (typeof res.seconds === "number") detail.push(formatSeconds(res.seconds));
          else if (cite.timeStr) detail.push(cite.timeStr);
          if (res.slide) detail.push(`Slide ${res.slide}`);
          const detailStr = detail.join(" · ") || cite.timeStr || cite.code;
          viewerStatus.textContent = `✓ Đang chiếu đúng mốc ${cite.day || ""} (${detailStr})`;
          citeSeekStatus.className = "cite-seek-status ok";
          citeSeekStatus.textContent = `✓ Đã mở & trỏ đúng ${cite.day || ""} (${detailStr})`;
          refreshPlayerState();
          return;
        }
        if (attempt < 18) {
          setTimeout(() => pollViewerSeek(cite, seq, attempt + 1), 220);
        } else {
          const fallbackSlide = cite.slide ? `Slide ${cite.slide}` : cite.timeStr || cite.code;
          viewerStatus.textContent = `Đã mở ${cite.day || "bài giảng"} tại ${fallbackSlide} (bấm ↺ Đúng mốc nếu cần tua lại)`;
          citeSeekStatus.className = "cite-seek-status ok";
          citeSeekStatus.textContent = `✓ Đã mở khung chiếu ${cite.day || ""} (${fallbackSlide})`;
        }
      }
    );
  }

  function openFloatingViewer(cite) {
    const dayKey = cite && cite.day;
    const baseUrl = dayKey ? PRECLASS_DECK_URLS[dayKey] : "";
    if (!baseUrl) {
      citeSeekStatus.className = "cite-seek-status err";
      citeSeekStatus.textContent = "Chưa có đường dẫn trình chiếu cho ngày học này.";
      return;
    }

    const slideHash = cite.slide ? `#${cite.slide}` : "#1";
    const fullUrl = `${baseUrl}${slideHash}`;
    const label = cite.timeStr || (cite.slide ? `Slide ${cite.slide}` : cite.code);
    const seg = state.segmentByCode.get(cite.code);
    const titlePart = seg ? `${seg.code} · ${label} — ${seg.title || seg.topic}` : `${cite.code} · ${label}`;

    state.viewerSeekSeq += 1;
    const mySeq = state.viewerSeekSeq;
    const sameDayAlreadyOpen = state.viewerOpen && state.viewerDay === dayKey;

    state.viewerOpen = true;
    state.viewerDay = dayKey;
    state.viewerUrl = fullUrl;
    viewerTitle.textContent = `🎬 ${dayKey} · ${titlePart}`;
    viewerModal.classList.add("open");
    viewerModal.classList.toggle("drawer-closed", !state.open);

    if (sameDayAlreadyOpen) {
      viewerStatus.textContent = `Đang tua tới ${label}…`;
      citeSeekStatus.className = "cite-seek-status";
      citeSeekStatus.textContent = `Đang tua khung chiếu ${dayKey} tới ${label}…`;
      pollViewerSeek(cite, mySeq, 0);
      return;
    }

    viewerStatus.textContent = `Đang tải bài ${dayKey} tới mốc ${label}…`;
    citeSeekStatus.className = "cite-seek-status";
    citeSeekStatus.textContent = `Đang mở trình chiếu ${dayKey} tới ${label}…`;

    const onFrameLoad = () => {
      viewerFrame.removeEventListener("load", onFrameLoad);
      if (mySeq !== state.viewerSeekSeq || !state.viewerOpen) return;
      setTimeout(() => pollViewerSeek(cite, mySeq, 0), 250);
    };
    viewerFrame.addEventListener("load", onFrameLoad);
    viewerFrame.src = fullUrl;
  }

  function seekPageVideo(cite) {
    if (!cite) return;
    const label = cite.timeStr || (cite.slide ? `Slide ${cite.slide}` : cite.code);
    citeSeekStatus.className = "cite-seek-status";
    citeSeekStatus.textContent = `Đang chiếu đúng ${cite.day || "bài giảng"} (${label})…`;

    chrome.runtime.sendMessage(
      {
        type: "SEEK_VIDEO",
        seconds: typeof cite.seconds === "number" ? cite.seconds : null,
        slide: typeof cite.slide === "number" ? cite.slide : null,
        targetDay: cite.day || "",
        viewerOnly: false,
      },
      (res) => {
        if (!chrome.runtime.lastError && res && res.ok) {
          const detail = [];
          if (typeof res.seconds === "number") detail.push(formatSeconds(res.seconds));
          else if (label) detail.push(label);
          if (res.slide) detail.push(`Slide ${res.slide}`);
          const detailStr = detail.join(" · ") || label;
          citeSeekStatus.className = "cite-seek-status ok";
          citeSeekStatus.textContent = `✓ Đã trỏ lên ${res.mode} (${detailStr})`;
          if (res.isViewer && state.viewerOpen) {
            const seg = state.segmentByCode.get(cite.code);
            viewerTitle.textContent = `🎬 ${cite.day || ""} · ${seg ? `${seg.code} · ${label} — ${seg.title || seg.topic}` : `${cite.code} · ${label}`}`;
            viewerStatus.textContent = `✓ Đang chiếu đúng mốc ${cite.day || ""} (${detailStr})`;
          }
          refreshPlayerState();
          return;
        }

        // Không có player bài tương ứng đang hiển thị trên trang (vd đang ở Trang chủ hoặc bài ngày khác)
        // -> tự mở khung chiếu nổi đúng bài giảng & tua thẳng tới mốc trích dẫn!
        if (cite.day && PRECLASS_DECK_URLS[cite.day]) {
          openFloatingViewer(cite);
          return;
        }

        citeSeekStatus.className = "cite-seek-status err";
        citeSeekStatus.textContent =
          (res && res.error) || "Không tìm thấy player video tương ứng trên trang hiện tại.";
      }
    );
  }

  function renderCatalog(filterText = "") {
    if (!catalogList) return;
    const q = stripAccents(filterText.trim());
    if (!state.segments.length) {
      catalogList.innerHTML = `<div style="font-size:11.5px;color:#64748b;padding:8px;">Chưa tải được danh sách bài giảng từ server cục bộ.</div>`;
      return;
    }

    const grouped = new Map();
    for (const seg of state.segments) {
      if (q) {
        const hay = stripAccents(
          `${seg.code} ${seg.day} ${seg.lesson_title} ${seg.title || seg.topic} ${(seg.keywords || []).join(" ")}`
        );
        if (!hay.includes(q)) continue;
      }
      const dKey = seg.day || seg.lesson || "Khác";
      if (!grouped.has(dKey)) {
        grouped.set(dKey, { title: seg.lesson_title || dKey, items: [] });
      }
      grouped.get(dKey).items.push(seg);
    }

    if (grouped.size === 0) {
      catalogList.innerHTML = `<div style="font-size:11.5px;color:#64748b;padding:8px;">Không tìm thấy đoạn bài giảng phù hợp.</div>`;
      return;
    }

    catalogList.innerHTML = "";
    const focusDay = state.detectedDay || "Day01";
    for (const [day, group] of grouped.entries()) {
      const box = document.createElement("div");
      const expand = Boolean(q) || day === focusDay;
      box.className = "cat-day" + (expand ? "" : " collapsed");

      const head = document.createElement("button");
      head.type = "button";
      head.className = "cat-day-head";
      head.innerHTML = `<span>${esc(group.title)}</span><span>${group.items.length} đoạn ▾</span>`;
      head.addEventListener("click", () => box.classList.toggle("collapsed"));

      const segWrap = document.createElement("div");
      segWrap.className = "cat-day-segs";
      for (const seg of group.items) {
        const row = document.createElement("div");
        row.className = "cat-seg" + (state.activeCode === seg.code ? " active" : "");
        row.innerHTML = `
          <div class="cat-seg-main" title="Bấm để xem tóm tắt và tua mốc ${esc(seg.timestamp)}">
            <div class="cat-seg-code">${esc(seg.code)} · ⏱ ${esc(seg.timestamp)}</div>
            <div class="cat-seg-title">${esc(seg.title || seg.topic)}</div>
          </div>
          <button type="button" class="cat-seg-ask">Hỏi</button>
        `;
        row.querySelector(".cat-seg-main").addEventListener("click", () => {
          showCitation(seg.code, seg.timestamp);
        });
        row.querySelector(".cat-seg-ask").addEventListener("click", () => {
          toggleCatalog(false);
          send(`Giải thích ngắn gọn các ý chính của đoạn ${seg.code} (${seg.title || seg.topic}) giúp mình.`);
        });
        segWrap.appendChild(row);
      }

      box.appendChild(head);
      box.appendChild(segWrap);
      catalogList.appendChild(box);
    }
  }

  function toggleCatalog(force) {
    state.catalogOpen = typeof force === "boolean" ? force : !state.catalogOpen;
    catalogPanel.classList.toggle("show", state.catalogOpen);
    btnCatalog.classList.toggle("active", state.catalogOpen);
    if (state.catalogOpen) {
      renderCatalog(catalogSearch.value);
      catalogSearch.focus();
    }
  }

  function toggleDrawer(force) {
    state.open = typeof force === "boolean" ? force : !state.open;
    drawer.classList.toggle("open", state.open);
    viewerModal.classList.toggle("drawer-closed", !state.open);
    fab.style.display = state.open ? "none" : "inline-flex";
    if (state.open) {
      refreshInfo();
      refreshPlayerState();
      input.focus();
    }
  }

  function sendMessageWithTimeout(payload, timeoutMs, onDone) {
    let settled = false;
    const guard = setTimeout(() => {
      if (settled) return;
      settled = true;
      onDone({
        ok: false,
        error: `Extension quá thời gian chờ (${Math.round(timeoutMs / 1000)}s). Hãy bấm biểu tượng 3m trên thanh extension → "Lưu & Kiểm tra" để cấp quyền Local Network Access, hoặc tải lại extension.`,
      });
    }, timeoutMs);

    try {
      chrome.runtime.sendMessage(payload, (res) => {
        if (settled) return;
        settled = true;
        clearTimeout(guard);
        if (chrome.runtime.lastError) {
          onDone({ ok: false, error: chrome.runtime.lastError.message || "Lỗi kết nối service worker extension." });
          return;
        }
        onDone(res);
      });
    } catch (e) {
      if (!settled) {
        settled = true;
        clearTimeout(guard);
        onDone({ ok: false, error: e.message || "Extension đã được tải lại — hãy nhấn F5 trang web." });
      }
    }
  }

  function loadLessonsFromServer() {
    if (state.lessonsLoading) return;
    state.lessonsLoading = true;
    sendMessageWithTimeout({ type: "GET_LESSONS" }, 12000, (res) => {
      state.lessonsLoading = false;
      if (res && res.ok && res.data && Array.isArray(res.data.segments)) {
        state.segments = res.data.segments;
        state.segmentByCode.clear();
        for (const seg of state.segments) {
          state.segmentByCode.set(seg.code.toUpperCase(), seg);
        }
        if (res.data.version) state.datasetVersion = res.data.version;
        updateActiveContextBar();
        if (state.catalogOpen) renderCatalog(catalogSearch.value);
      }
    });
  }

  function refreshInfo() {
    sendMessageWithTimeout({ type: "GET_INFO" }, 10000, (res) => {
      if (!res || !res.ok) {
        const errHint = res && res.error ? res.error : "Chưa bật server (chạy: python frontend/server.py)";
        statusText.innerHTML = `<span class="dot err"></span>Không kết nối được server (bấm icon 3m kiểm tra)`;
        statusText.title = errHint;
        return;
      }
      const d = res.data;
      const daysPart = d.days_count ? `${d.days_count} ngày · ` : "";
      statusText.innerHTML = `<span class="dot ok"></span>${esc(d.provider)} · ${esc(d.model || "fake")} (${daysPart}${d.segments_count} đoạn)`;
      statusText.title = `Đã kết nối ${d.provider} · ${d.model || "fake"}`;
      if (state.segments.length === 0 || (d.dataset_version && d.dataset_version !== state.datasetVersion)) {
        state.datasetVersion = d.dataset_version || state.datasetVersion;
        loadLessonsFromServer();
      }
    });
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
    const slide = extractSlideNum(seg, displayTime);
    const codeDayMatch = upper.match(/^D(\d{2})-S\d{2}$/);
    const segDay = (seg && (seg.day || seg.lesson)) || (codeDayMatch ? `Day${codeDayMatch[1]}` : "");

    state.activeCode = upper;
    state.activeCite = { code: upper, day: segDay, timeStr: displayTime, seconds, slide };
    citeTitle.textContent = seg
      ? `${seg.code} · ${displayTime} — ${seg.title || seg.topic}`
      : `${upper}${displayTime ? ` · ${displayTime}` : ""}`;
    citeBody.textContent = seg ? seg.text : "Bấm nút bên dưới để mở đúng slide và mốc video trích dẫn.";
    citePreview.classList.add("show");
    updateActiveContextBar();

    if (seconds !== null || slide !== null || (segDay && PRECLASS_DECK_URLS[segDay])) {
      seekPageVideo(state.activeCite);
    } else {
      citeSeekStatus.className = "cite-seek-status err";
      citeSeekStatus.textContent = "Đoạn này chưa có mốc giây để chiếu tự động.";
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

  function attachActionChips(msgEl, data, userQuestion) {
    const chipsWrap = msgEl.querySelector(".action-chips");
    const draftSlot = msgEl.querySelector(".ta-draft-slot");
    if (!chipsWrap || !draftSlot) return;

    const citeButtons = msgEl.querySelectorAll(".cite-btn");

    if (data.branch === "clarify") {
      const suggestedCodes = [];
      citeButtons.forEach((b) => {
        if (!suggestedCodes.includes(b.dataset.code)) suggestedCodes.push(b.dataset.code);
      });
      // Dự phòng nếu mã đoạn trong câu clarify chưa có cite-btn
      if (suggestedCodes.length === 0) {
        const matches = String(data.output || "").match(/D\d{2}-S\d{2}/gi) || [];
        matches.forEach((m) => {
          const u = m.toUpperCase();
          if (!suggestedCodes.includes(u)) suggestedCodes.push(u);
        });
      }
      suggestedCodes.slice(0, 3).forEach((code) => {
        const seg = state.segmentByCode.get(code);
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "action-chip";
        chip.textContent = seg ? `→ Hỏi ${code}: ${(seg.title || "").slice(0, 24)}` : `→ Hỏi về ${code}`;
        chip.addEventListener("click", () => send(`Giải thích giúp mình nội dung đoạn ${code}.`));
        chipsWrap.appendChild(chip);
      });
      const curSeg = findCurrentSegment();
      if (curSeg && !suggestedCodes.includes(curSeg.code)) {
        const curChip = document.createElement("button");
        curChip.type = "button";
        curChip.className = "action-chip";
        curChip.textContent = `📌 Đoạn đang xem (${curSeg.code})`;
        curChip.addEventListener("click", () => send(`Giải thích giúp mình nội dung đoạn ${curSeg.code}.`));
        chipsWrap.appendChild(curChip);
      }
    } else if (data.branch === "grounded" && citeButtons.length > 0) {
      const firstCode = citeButtons[0].dataset.code;
      state.activeCode = firstCode;
      updateActiveContextBar();
      const simplerBtn = document.createElement("button");
      simplerBtn.type = "button";
      simplerBtn.className = "action-chip";
      simplerBtn.textContent = "💡 Giải thích dễ hiểu hơn";
      simplerBtn.addEventListener("click", () =>
        send(`Giải thích lại đoạn ${firstCode} thật ngắn gọn, dễ hiểu hơn bằng gạch đầu dòng theo căn cứ bài học.`)
      );
      chipsWrap.appendChild(simplerBtn);
    }

    // HITL: Nút Tạo bản nháp gửi TA Discord (chỉ tạo bản nháp chờ người duyệt, KHÔNG tự gửi)
    if (data.branch !== "guardrail") {
      const taBtn = document.createElement("button");
      taBtn.type = "button";
      taBtn.className = "action-chip ta-chip";
      taBtn.textContent = "📋 Tạo bản nháp hỏi TA Discord";
      taBtn.addEventListener("click", () => {
        if (draftSlot.innerHTML) {
          draftSlot.innerHTML = "";
          return;
        }
        const draftText = buildTaDraftText(userQuestion, data.output || "");
        draftSlot.innerHTML = `
          <div class="ta-draft-box">
            <div class="ta-draft-head">
              <span>Bản nháp gửi TA (chỉ copy, không tự gửi)</span>
              <button type="button" class="btn-copy-draft">📋 Sao chép</button>
            </div>
            <textarea>${esc(draftText)}</textarea>
          </div>
        `;
        const copyBtn = draftSlot.querySelector(".btn-copy-draft");
        const taArea = draftSlot.querySelector("textarea");
        copyBtn.addEventListener("click", () => {
          navigator.clipboard
            .writeText(taArea.value)
            .then(() => {
              copyBtn.textContent = "✓ Đã sao chép!";
              setTimeout(() => {
                copyBtn.textContent = "📋 Sao chép";
              }, 2000);
            })
            .catch(() => {
              taArea.select();
              document.execCommand("copy");
              copyBtn.textContent = "✓ Đã sao chép!";
            });
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
      chipsWrap.appendChild(taBtn);
    }
  }

  function send(text) {
    const q = (text || "").trim();
    if (!q || state.sending) return;
    state.sending = true;
    btnSend.disabled = true;
    input.value = "";
    appendMsg("user", esc(q));
    const startedAt = performance.now();
    const loading = appendMsg(
      "bot",
      `<div class="msg-head"><span>Trợ giảng 3mien</span></div><span class="loading-status">Đang tra căn cứ bài học…</span>`
    );
    const loadingLabel = loading.querySelector(".loading-status");
    const tickTimer = setInterval(() => {
      if (!loadingLabel) return;
      const sec = ((performance.now() - startedAt) / 1000).toFixed(1);
      loadingLabel.textContent = `Đang tra căn cứ bài học… (${sec}s)`;
    }, 250);

    sendMessageWithTimeout({ type: "CHAT", message: q }, 38000, (res) => {
      clearInterval(tickTimer);
      loading.remove();
      state.sending = false;
      btnSend.disabled = false;

      if (!res || !res.ok) {
        const errMsg = (res && (res.error || (res.data && res.data.error))) || "Lỗi kết nối server cục bộ.";
        appendMsg("bot", `<div class="msg-head"><span>Lỗi kết nối</span></div>${esc(errMsg)}`, true);
        return;
      }

      const d = res.data;
      const b = BRANCH_LABELS[d.branch] || BRANCH_LABELS.grounded;
      const s = d.summary || {};
      const totalSec = ((performance.now() - startedAt) / 1000).toFixed(2);
      const modelTxt = s.models && s.models.length ? s.models.join(", ") : "không gọi model";
      const html = `
        <div class="msg-head">
          <span>Trợ giảng 3mien</span>
          <span class="badge ${b.cls}">${b.text}</span>
        </div>
        <div>${formatOutput(d.output || "")}</div>
        <div class="action-chips"></div>
        <div class="ta-draft-slot"></div>
        <div class="trace">Model: ${esc(modelTxt)} · Tool: ${s.tool_calls ?? 0} · Token: ${s.tokens_in ?? 0}/${s.tokens_out ?? 0} · Server: ${d.elapsed_s ?? 0}s · Tổng: ${totalSec}s</div>
      `;
      const msgEl = appendMsg("bot", html);
      attachActionChips(msgEl, d, q);
      messagesEl.scrollTop = messagesEl.scrollHeight;
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
  btnCatalog.addEventListener("click", () => toggleCatalog());
  btnClose.addEventListener("click", () => toggleDrawer(false));
  btnCloseCite.addEventListener("click", () => citePreview.classList.remove("show"));
  catalogSearch.addEventListener("input", () => renderCatalog(catalogSearch.value));

  btnSeekAgain.addEventListener("click", () => {
    if (!state.activeCite) return;
    seekPageVideo(state.activeCite);
  });

  btnViewerSeek.addEventListener("click", () => {
    if (!state.activeCite) return;
    state.viewerSeekSeq += 1;
    pollViewerSeek(state.activeCite, state.viewerSeekSeq, 0);
  });

  btnViewerNewTab.addEventListener("click", () => {
    if (state.viewerUrl) {
      window.open(state.viewerUrl, "_blank", "noopener");
    }
  });

  btnViewerClose.addEventListener("click", () => closeFloatingViewer());

  btnAskCurrent.addEventListener("click", () => {
    const fire = () => {
      const seg = findCurrentSegment();
      if (seg) {
        send(`Giải thích ngắn gọn các ý chính của đoạn ${seg.code} (${seg.title || seg.topic}) giúp mình.`);
      } else if (state.detectedDay) {
        send(`Nội dung ${state.detectedDay} gồm những phần nào?`);
      } else {
        send("Nội dung Day 1 gồm những phần nào?");
      }
    };
    if (Date.now() - state.playerFetchedAt < 2500) {
      fire();
      return;
    }
    let done = false;
    const fallbackTimer = setTimeout(() => {
      if (!done) {
        done = true;
        fire();
      }
    }, 350);
    refreshPlayerState(() => {
      if (!done) {
        done = true;
        clearTimeout(fallbackTimer);
        fire();
      }
    });
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
