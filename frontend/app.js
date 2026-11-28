const state = {
  segments: [],
  segmentByCode: new Map(),
  lectures: {},
  currentDay: "Day01",
  activeCode: "D01-S01",
  isSending: false,
};

// Ánh xạ chính xác mốc phút:giây trong Day 8 → số Slide tương ứng trong deck HTML (Slide 01–44)
const DAY8_TIME_TO_SLIDE = {
  "00:00": 1, "00:37": 2, "01:09": 3, "01:53": 4, "02:19": 5, "02:48": 6,
  "03:23": 7, "03:55": 8, "04:17": 9, "04:32": 10, "04:56": 11, "05:22": 12,
  "05:52": 13, "07:02": 16, "07:17": 17, "07:51": 18, "08:26": 19, "08:56": 20,
  "10:24": 23, "10:38": 24, "11:02": 25, "11:30": 26, "12:58": 29, "13:14": 30,
  "13:47": 31, "14:10": 32, "14:40": 33, "15:12": 34, "16:38": 37, "16:52": 38,
  "17:23": 39, "17:53": 40, "18:46": 42, "19:32": 44,
};

const DAY8_CODE_TO_SLIDE = {
  "D08-S01": { slide: 5, time: "02:19" },
  "D08-S02": { slide: 10, time: "04:32" },
  "D08-S03": { slide: 17, time: "07:17" },
  "D08-S04": { slide: 25, time: "11:02" },
  "D08-S05": { slide: 31, time: "13:47" },
  "D08-S06": { slide: 39, time: "17:23" },
};

const els = {
  workspace: document.getElementById("workspace"),
  sidebar: document.getElementById("sidebar"),
  btnToggleSidebar: document.getElementById("btnToggleSidebar"),
  btnCloseSidebar: document.getElementById("btnCloseSidebar"),
  modelStatus: document.getElementById("modelStatus"),
  modelStatusText: document.getElementById("modelStatusText"),
  lessonStats: document.getElementById("lessonStats"),
  lessonSearchInput: document.getElementById("lessonSearchInput"),
  lessonList: document.getElementById("lessonList"),
  stagePhaseTag: document.getElementById("stagePhaseTag"),
  stageTitle: document.getElementById("stageTitle"),
  lectureSelect: document.getElementById("lectureSelect"),
  lectureFrame: document.getElementById("lectureFrame"),
  playerFallback: document.getElementById("playerFallback"),
  playerJumpBadge: document.getElementById("playerJumpBadge"),
  audioBar: document.getElementById("audioBar"),
  lectureAudio: document.getElementById("lectureAudio"),
  timelineLabel: document.getElementById("timelineLabel"),
  chapterTimeline: document.getElementById("chapterTimeline"),
  citationCard: document.getElementById("citationCard"),
  citationCode: document.getElementById("citationCode"),
  citationMeta: document.getElementById("citationMeta"),
  citationTopic: document.getElementById("citationTopic"),
  citationText: document.getElementById("citationText"),
  btnJumpSlide: document.getElementById("btnJumpSlide"),
  chatMessages: document.getElementById("chatMessages"),
  welcomeCard: document.getElementById("welcomeCard"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  btnSend: document.getElementById("btnSend"),
  charCount: document.getElementById("charCount"),
  btnClearChat: document.getElementById("btnClearChat"),
  activeContextText: document.getElementById("activeContextText"),
  btnAskCurrent: document.getElementById("btnAskCurrent"),
};

function updateActiveContextBar() {
  if (!els.activeContextText) return;
  const seg = state.segmentByCode.get(String(state.activeCode || "").toUpperCase());
  if (seg) {
    els.activeContextText.textContent = `📌 Đang xem: ${seg.code} · ${seg.timestamp} — ${seg.title || seg.topic}`;
  } else {
    els.activeContextText.textContent = `📌 Đang xem: ${state.currentDay}`;
  }
}

function buildTaDraftText(userQuestion, botOutput) {
  const seg = state.segmentByCode.get(String(state.activeCode || "").toUpperCase());
  const ctxLine = seg
    ? `${seg.lesson_title} · [${seg.code} · ${seg.timestamp}] ${seg.title || seg.topic}`
    : state.currentDay;
  const shortNote = String(botOutput || "").replace(/\s+/g, " ").trim().slice(0, 140);
  return [
    "[Hỏi TA · Lớp L3 · Pre-class]",
    `- Bài đang xem: ${ctxLine}`,
    `- Câu hỏi của mình: ${userQuestion || "(chưa nhập)"}`,
    `- Ghi chú từ trợ giảng AI: ${shortNote}`,
    "- Nhờ TA giải đáp thêm giúp mình ạ!",
  ].join("\n");
}

const BRANCH_LABELS = {
  grounded: { text: "Có căn cứ", cls: "badge-grounded" },
  clarify: { text: "Hỏi ngược G10", cls: "badge-clarify" },
  refuse: { text: "Ngoài phạm vi", cls: "badge-refuse" },
  guardrail: { text: "Chặn Guardrail", cls: "badge-guardrail" },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripAccents(str) {
  return String(str)
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseTimeToSeconds(timeStr) {
  const m = String(timeStr || "").match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function renderLectureSelect() {
  const days = Object.keys(state.lectures).sort();
  els.lectureSelect.innerHTML = "";
  if (days.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Chưa có bài HTML trong data/data-btc/lectures/";
    els.lectureSelect.appendChild(opt);
    return;
  }
  for (const d of days) {
    const lec = state.lectures[d];
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `${d} — ${lec.title}`;
    opt.selected = d === state.currentDay;
    els.lectureSelect.appendChild(opt);
  }
}

function renderChapterTimeline(day) {
  const daySegs = state.segments.filter((s) => (s.day || s.lesson) === day);
  els.timelineLabel.textContent = `Nhảy nhanh mốc ${day} (${daySegs.length} đoạn):`;
  els.chapterTimeline.innerHTML = "";

  daySegs.forEach((seg, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chapter-pill" + (state.activeCode === seg.code ? " active" : "");
    btn.dataset.code = seg.code;
    btn.textContent = `${String(idx + 1).padStart(2, "0")} · ${seg.timestamp} ${(seg.title || seg.topic).slice(0, 32)}`;
    btn.addEventListener("click", () => inspectSegment(seg.code, seg.timestamp, true));
    els.chapterTimeline.appendChild(btn);
  });
}

function stopIframeAudio() {
  try {
    const win = els.lectureFrame && els.lectureFrame.contentWindow;
    if (win) {
      if (win.VinTutor && typeof win.VinTutor.pause === "function") {
        win.VinTutor.pause();
      }
      if (typeof win.__3mienStopAllAudio === "function") {
        win.__3mienStopAllAudio();
      }
    }
  } catch (e) {}
}

function selectLectureDay(day, initialSlide = 1) {
  stopIframeAudio();
  state.currentDay = day;
  if (els.lectureSelect.value !== day && state.lectures[day]) {
    els.lectureSelect.value = day;
  }
  const lec = state.lectures[day];
  const sampleSeg = state.segments.find((s) => (s.day || s.lesson) === day);

  els.stagePhaseTag.textContent = `${day.toUpperCase()} · BÀI GIẢNG PRE-CLASS`;
  els.stageTitle.textContent = (sampleSeg && sampleSeg.lesson_title) || (lec && lec.title) || day;

  if (lec && lec.html_url) {
    const base = lec.html_url.split("#")[0];
    els.lectureFrame.src = `${base}#${initialSlide}`;
    els.playerFallback.classList.add("hidden");
  } else {
    els.lectureFrame.removeAttribute("src");
    els.playerFallback.classList.remove("hidden");
  }

  if (lec && lec.audio_url) {
    if (els.lectureAudio.getAttribute("src") !== lec.audio_url) {
      els.lectureAudio.src = lec.audio_url;
    }
    els.audioBar.classList.remove("hidden");
  } else {
    els.audioBar.classList.add("hidden");
  }

  renderChapterTimeline(day);
  if (sampleSeg && (!state.activeCode || !state.activeCode.startsWith(day.replace("Day", "D") + "-"))) {
    state.activeCode = sampleSeg.code;
  }
  updateActiveContextBar();
}

function seekAudioToTime(timeStr, autoPlay = true) {
  const sec = parseTimeToSeconds(timeStr);
  const lec = state.lectures[state.currentDay];
  if (sec === null || !lec || !lec.audio_url || !els.lectureAudio) return;
  try {
    els.lectureAudio.currentTime = sec;
    if (autoPlay) {
      els.lectureAudio.play().catch(() => {});
    }
  } catch (e) {}
}

let pendingSeek = null;

function applyIframeSeek(day, targetSec, fallbackSlide, timeLabel, code, autoPlay) {
  const trySeek = (attempt = 0) => {
    try {
      const win = els.lectureFrame.contentWindow;
      if (!win || !win.location || !win.location.pathname.includes(`/lectures/${day}/`)) {
        if (attempt < 25) setTimeout(() => trySeek(attempt + 1), 120);
        return;
      }
      const T = win.VinTutor;
      const D = win.VinDeck;
      if (T && Array.isArray(T.cues) && T.cues.length > 0 && targetSec !== null) {
        const targetMs = targetSec * 1000;
        let best = 0;
        for (let i = 0; i < T.cues.length; i++) {
          if (T.cues[i].start <= targetMs) best = i;
          else break;
        }
        if (!win.document.documentElement.classList.contains("tutor")) {
          T.on(true);
        }
        const startOverlay = win.document.querySelector(".tt-start");
        if (startOverlay) startOverlay.classList.remove("is-on");
        if (typeof win.__3mienStopAllAudio === "function") {
          win.__3mienStopAllAudio();
        }
        if (T.index !== best || !T.playing) {
          T.pause();
          T.cue(best);
        }
        if (autoPlay) T.play();
        const slideNum = T.cues[best].slide + 1;
        const timePart = timeLabel ? ` · ${timeLabel}` : "";
        const codePart = code ? ` (${code})` : "";
        els.playerJumpBadge.textContent = `Đang mở: ${day} Slide ${String(slideNum).padStart(2, "0")}${timePart}${codePart}`;
        return;
      }
      if (D && D.ready && typeof D.go === "function") {
        const sNum = Math.max(1, Number(fallbackSlide) || 1);
        D.go(sNum - 1);
        const timePart = timeLabel ? ` · ${timeLabel}` : "";
        const codePart = code ? ` (${code})` : "";
        els.playerJumpBadge.textContent = `Đang mở: ${day} Slide ${String(sNum).padStart(2, "0")}${timePart}${codePart}`;
        return;
      }
      if (attempt < 30) {
        setTimeout(() => trySeek(attempt + 1), 120);
      }
    } catch (e) {}
  };
  trySeek(0);
}

function jumpLectureToSlide(day, slideNum, timeLabel = "", code = "") {
  const lec = state.lectures[day];
  if (!lec || !lec.html_url) return;

  const targetSec = parseTimeToSeconds(timeLabel);
  const num = Math.max(1, Number(slideNum) || 1);

  if (state.currentDay !== day || !els.lectureFrame.getAttribute("src")) {
    pendingSeek = { day, targetSec, slideNum: num, timeLabel, code, autoPlay: true };
    selectLectureDay(day, num);
  } else {
    applyIframeSeek(day, targetSec, num, timeLabel, code, true);
  }

  seekAudioToTime(timeLabel, true);

  document.querySelectorAll(".chapter-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.code === code);
  });
}

els.lectureFrame.addEventListener("load", () => {
  if (pendingSeek) {
    const p = pendingSeek;
    pendingSeek = null;
    applyIframeSeek(p.day, p.targetSec, p.slideNum, p.timeLabel, p.code, p.autoPlay);
  }
});

async function loadInfo() {
  try {
    const res = await fetch("/api/info");
    const info = await res.json();
    const label = `${info.provider} · ${info.model || "fake"}`;
    if (info.provider === "fake") {
      els.modelStatus.className = "status-pill warn";
      els.modelStatusText.textContent = "Chế độ giả (fake)";
    } else if (!info.has_api_key && info.provider !== "ollama") {
      els.modelStatus.className = "status-pill warn";
      els.modelStatusText.textContent = `${label} (thiếu key)`;
    } else {
      els.modelStatus.className = "status-pill ready";
      els.modelStatusText.textContent = label;
    }
    els.lessonStats.textContent = `${info.days_count} ngày học · ${info.segments_count} đoạn có mã`;
    state.lectures = info.lectures || {};
    if (info.default_lecture_day) {
      state.currentDay = info.default_lecture_day;
    }
    renderLectureSelect();
    selectLectureDay(state.currentDay, 1);
  } catch (err) {
    els.modelStatus.className = "status-pill warn";
    els.modelStatusText.textContent = "Mất kết nối server";
  }
}

async function loadLessons() {
  try {
    const res = await fetch("/api/lessons");
    const data = await res.json();
    state.segments = data.segments || [];
    state.segmentByCode.clear();
    for (const seg of state.segments) {
      state.segmentByCode.set(seg.code.toUpperCase(), seg);
    }
    renderLessons("");
    renderChapterTimeline(state.currentDay);
    const defaultCode = `${state.currentDay.replace("Day", "D")}-S01`;
    if (state.segmentByCode.has(defaultCode)) {
      inspectSegment(defaultCode, "", false);
    } else if (state.segmentByCode.has("D01-S01")) {
      inspectSegment("D01-S01", "", false);
    }
  } catch (err) {
    els.lessonList.innerHTML = `<p class="muted" style="padding:12px;">Không tải được data/lessons.json.</p>`;
  }
}

function renderLessons(filterText) {
  const q = stripAccents((filterText || "").trim());
  const grouped = new Map();

  for (const seg of state.segments) {
    if (q) {
      const hay = stripAccents(
        `${seg.code} ${seg.day} ${seg.lesson_title} ${seg.title || seg.topic} ${(seg.keywords || []).join(" ")}`
      );
      if (!hay.includes(q)) continue;
    }
    if (!grouped.has(seg.day)) {
      grouped.set(seg.day, { title: seg.lesson_title, items: [] });
    }
    grouped.get(seg.day).items.push(seg);
  }

  if (grouped.size === 0) {
    els.lessonList.innerHTML = `<p class="muted" style="padding:12px;">Không tìm thấy đoạn bài giảng phù hợp.</p>`;
    return;
  }

  els.lessonList.innerHTML = "";
  for (const [day, group] of grouped.entries()) {
    const card = document.createElement("div");
    const hasDeck = Boolean(state.lectures[day] && state.lectures[day].html_url);
    const shouldExpand = Boolean(q) || day === state.currentDay || group.items.some((s) => s.code === state.activeCode);
    card.className = "day-group" + (shouldExpand ? "" : " collapsed");
    card.dataset.day = day;

    const header = document.createElement("button");
    header.type = "button";
    header.className = "day-header";
    header.innerHTML = `
      <span class="day-title">${escapeHtml(group.title)}${hasDeck ? " 🎬" : ""}</span>
      <span class="day-header-right">
        <span class="day-count">${group.items.length}</span>
        <span class="day-chevron" aria-hidden="true">▾</span>
      </span>
    `;

    const segList = document.createElement("div");
    segList.className = "day-segments";

    for (const seg of group.items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "segment-item" + (state.activeCode === seg.code ? " active" : "");
      btn.dataset.code = seg.code;
      btn.innerHTML = `
        <div class="segment-top">
          <span class="code-chip">${escapeHtml(seg.code)}</span>
          <span class="segment-time">⏱ ${escapeHtml(seg.timestamp)}</span>
        </div>
        <div class="segment-topic">${escapeHtml(seg.title || seg.topic)}</div>
      `;
      btn.addEventListener("click", () => inspectSegment(seg.code, seg.timestamp, true));
      segList.appendChild(btn);
    }

    header.addEventListener("click", () => {
      const wasCollapsed = card.classList.contains("collapsed");
      card.classList.toggle("collapsed");
      if (wasCollapsed && state.lectures[day] && state.currentDay !== day) {
        selectLectureDay(day, 1);
      }
    });
    card.appendChild(header);
    card.appendChild(segList);
    els.lessonList.appendChild(card);
  }
}

function resolveTargetSlide(seg, citedTime) {
  const day = seg.day || seg.lesson;
  if (!state.lectures[day] || !state.lectures[day].html_url) return null;
  const cleanTime = (citedTime || "").trim();
  // Ưu tiên khớp chính xác slide con trong sub_slides (áp dụng cho cả 15 ngày)
  if (cleanTime && Array.isArray(seg.sub_slides)) {
    const sub = seg.sub_slides.find((s) => s.timestamp === cleanTime);
    if (sub) {
      return { day, slide: sub.slide, time: cleanTime };
    }
  }
  if (day === "Day08" && cleanTime && DAY8_TIME_TO_SLIDE[cleanTime]) {
    return { day, slide: DAY8_TIME_TO_SLIDE[cleanTime], time: cleanTime };
  }
  return { day, slide: Number(seg.slide) || 1, time: cleanTime || seg.timestamp };
}

function inspectSegment(code, citedTime = "", shouldJumpPlayer = true) {
  const seg = state.segmentByCode.get(String(code).toUpperCase());
  if (!seg) return;

  state.activeCode = seg.code;
  const dayKey = seg.day || seg.lesson;
  const dayGroup = document.querySelector(`.day-group[data-day="${dayKey}"]`);
  if (dayGroup) {
    dayGroup.classList.remove("collapsed");
  }

  document.querySelectorAll(".segment-item").forEach((el) => {
    const isMatch = el.dataset.code === seg.code;
    el.classList.toggle("active", isMatch);
    if (isMatch && shouldJumpPlayer) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  const displayTime = citedTime || seg.timestamp;
  els.citationCode.textContent = `${seg.code} · ${displayTime}`;
  els.citationMeta.textContent = `${seg.lesson_title} · ${seg.video_title || ""}`;
  els.citationTopic.textContent = seg.title || seg.topic;
  els.citationText.textContent = seg.text;
  updateActiveContextBar();

  const target = resolveTargetSlide(seg, citedTime);
  if (target) {
    els.btnJumpSlide.classList.remove("hidden");
    els.btnJumpSlide.onclick = () => jumpLectureToSlide(target.day, target.slide, target.time, seg.code);
    if (shouldJumpPlayer) {
      jumpLectureToSlide(target.day, target.slide, target.time, seg.code);
    }
  } else {
    els.btnJumpSlide.classList.add("hidden");
  }
}

function renderFormattedText(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/\[?(D\d{2}-S\d{2})(?:\s*·\s*(\d{2}:\d{2}))?\]?/gi, (match, code, timeStr) => {
    const upper = code.toUpperCase();
    if (state.segmentByCode.has(upper)) {
      const label = timeStr ? `[${upper} · ${timeStr}]` : `[${upper}]`;
      const tAttr = timeStr ? ` data-time="${timeStr}"` : "";
      return `<button type="button" class="cite-link" data-cite="${upper}"${tAttr} title="Bấm để mở căn cứ & nhảy tới mốc bài giảng">${label}</button>`;
    }
    return match;
  });
}

function appendUserMessage(text) {
  if (els.welcomeCard) els.welcomeCard.style.display = "none";
  const row = document.createElement("div");
  row.className = "msg-row user";
  row.innerHTML = `<div class="msg-bubble"><div class="msg-body">${escapeHtml(text)}</div></div>`;
  els.chatMessages.appendChild(row);
  scrollToBottom();
}

function appendTypingIndicator() {
  const row = document.createElement("div");
  row.className = "msg-row assistant";
  row.innerHTML = `
    <div class="msg-bubble">
      <div class="msg-head"><span class="msg-sender">Trợ giảng 3mien</span></div>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  els.chatMessages.appendChild(row);
  scrollToBottom();
  return row;
}

function appendAssistantMessage(data, isError = false, lastUserQuestion = "") {
  const row = document.createElement("div");
  row.className = "msg-row assistant" + (isError ? " error" : "");

  if (isError) {
    row.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-head"><span class="msg-sender">Lỗi kết nối model</span></div>
        <div class="msg-body">${escapeHtml(data.error || "Đã xảy ra lỗi.")}</div>
      </div>
    `;
    els.chatMessages.appendChild(row);
    scrollToBottom();
    return;
  }

  const branchInfo = BRANCH_LABELS[data.branch] || BRANCH_LABELS.grounded;
  const s = data.summary || {};
  const modelText = s.models && s.models.length ? s.models.join(", ") : "không gọi model";

  row.innerHTML = `
    <div class="msg-bubble">
      <div class="msg-head">
        <span class="msg-sender">Trợ giảng 3mien</span>
        <span class="branch-badge ${branchInfo.cls}">${branchInfo.text}</span>
      </div>
      <div class="msg-body">${renderFormattedText(data.output || "")}</div>
      <div class="action-chips"></div>
      <div class="ta-draft-slot"></div>
      <div class="trace-bar">
        <span>Model: <strong>${escapeHtml(modelText)}</strong></span>
        <span>Tool: <strong>${s.tool_calls ?? 0}</strong></span>
        <span>Token: <strong>${s.tokens_in ?? 0}/${s.tokens_out ?? 0}</strong></span>
        <span><strong>${data.elapsed_s ?? 0}s</strong></span>
      </div>
    </div>
  `;

  const citeButtons = row.querySelectorAll(".cite-link");
  citeButtons.forEach((btn) => {
    btn.addEventListener("click", () => inspectSegment(btn.dataset.cite, btn.dataset.time || "", true));
  });

  // Tính năng 2 & 3: Chip gợi ý bấm 1 chạm (HAX G9) + Nút tạo bản nháp gửi TA Discord (HITL)
  const chipsWrap = row.querySelector(".action-chips");
  const draftSlot = row.querySelector(".ta-draft-slot");

  if (data.branch === "clarify") {
    const suggestedCodes = [];
    citeButtons.forEach((b) => {
      if (!suggestedCodes.includes(b.dataset.cite)) suggestedCodes.push(b.dataset.cite);
    });
    suggestedCodes.slice(0, 3).forEach((code) => {
      const seg = state.segmentByCode.get(code);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "action-chip";
      chip.textContent = seg ? `→ Hỏi về ${code}: ${(seg.title || "").slice(0, 26)}` : `→ Hỏi về ${code}`;
      chip.addEventListener("click", () => sendMessage(`Giải thích giúp mình nội dung đoạn ${code}.`));
      chipsWrap.appendChild(chip);
    });
    const curSeg = state.segmentByCode.get(String(state.activeCode || "").toUpperCase());
    if (curSeg && !suggestedCodes.includes(curSeg.code)) {
      const curChip = document.createElement("button");
      curChip.type = "button";
      curChip.className = "action-chip";
      curChip.textContent = `📌 Đoạn đang xem (${curSeg.code})`;
      curChip.addEventListener("click", () => sendMessage(`Giải thích giúp mình nội dung đoạn ${curSeg.code}.`));
      chipsWrap.appendChild(curChip);
    }
  } else if (data.branch === "grounded" && citeButtons.length > 0) {
    const firstCode = citeButtons[0].dataset.cite;
    const simplerBtn = document.createElement("button");
    simplerBtn.type = "button";
    simplerBtn.className = "action-chip";
    simplerBtn.textContent = "💡 Giải thích dễ hiểu hơn";
    simplerBtn.addEventListener("click", () =>
      sendMessage(`Giải thích lại đoạn ${firstCode} thật ngắn gọn, dễ hiểu hơn bằng gạch đầu dòng theo căn cứ bài học.`)
    );
    chipsWrap.appendChild(simplerBtn);
  }

  // Nút Tạo bản nháp gửi TA Discord (chỉ tạo bản nháp chờ người duyệt, KHÔNG tự gửi)
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
      const draftText = buildTaDraftText(lastUserQuestion, data.output || "");
      draftSlot.innerHTML = `
        <div class="ta-draft-box">
          <div class="ta-draft-head">
            <span>Bản nháp gửi TA (chỉ copy, không tự gửi)</span>
            <button type="button" class="btn-copy-draft">📋 Sao chép</button>
          </div>
          <textarea>${escapeHtml(draftText)}</textarea>
        </div>
      `;
      const copyBtn = draftSlot.querySelector(".btn-copy-draft");
      const taArea = draftSlot.querySelector("textarea");
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(taArea.value).then(() => {
          copyBtn.textContent = "✓ Đã sao chép!";
          setTimeout(() => { copyBtn.textContent = "📋 Sao chép"; }, 2000);
        }).catch(() => {
          taArea.select();
          document.execCommand("copy");
          copyBtn.textContent = "✓ Đã sao chép!";
        });
      });
      scrollToBottom();
    });
    chipsWrap.appendChild(taBtn);
  }

  if (citeButtons.length > 0 && data.branch === "grounded") {
    const first = citeButtons[0];
    inspectSegment(first.dataset.cite, first.dataset.time || "", true);
  }

  els.chatMessages.appendChild(row);
  scrollToBottom();
}

function scrollToBottom() {
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || state.isSending) return;

  state.isSending = true;
  els.btnSend.disabled = true;
  els.chatInput.value = "";
  updateCharCount();
  autoResizeTextarea();

  appendUserMessage(trimmed);
  const typingRow = appendTypingIndicator();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
      signal: controller.signal,
    });
    const data = await res.json();
    typingRow.remove();
    appendAssistantMessage(data, !res.ok, trimmed);
  } catch (err) {
    typingRow.remove();
    const msg =
      err && err.name === "AbortError"
        ? "Quá thời gian chờ (35 giây). Kiểm tra lại cửa sổ PowerShell chạy `python frontend/server.py` (nhấn Enter/Esc nếu cửa sổ bị tạm dừng bôi đen) hoặc kết nối mạng tới OpenRouter."
        : "Không thể kết nối server: " + err.message;
    appendAssistantMessage({ error: msg }, true);
  } finally {
    clearTimeout(timeoutId);
    state.isSending = false;
    els.btnSend.disabled = false;
    els.chatInput.focus();
  }
}

function updateCharCount() {
  els.charCount.textContent = `${els.chatInput.value.length} ký tự`;
}

function autoResizeTextarea() {
  els.chatInput.style.height = "auto";
  els.chatInput.style.height = Math.min(els.chatInput.scrollHeight, 110) + "px";
}

// Event listeners
els.chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(els.chatInput.value);
});

els.chatInput.addEventListener("input", () => {
  updateCharCount();
  autoResizeTextarea();
});

els.chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(els.chatInput.value);
  }
});

els.lessonSearchInput.addEventListener("input", (e) => renderLessons(e.target.value));

els.lectureSelect.addEventListener("change", (e) => {
  if (e.target.value) {
    selectLectureDay(e.target.value, 1);
  }
});

els.btnClearChat.addEventListener("click", () => {
  els.chatMessages.querySelectorAll(".msg-row").forEach((el) => el.remove());
  if (els.welcomeCard) els.welcomeCard.style.display = "block";
  els.chatInput.focus();
});

document.querySelectorAll(".quick-chip").forEach((btn) => {
  btn.addEventListener("click", () => sendMessage(btn.dataset.prompt));
});

els.btnToggleSidebar.addEventListener("click", () => {
  if (window.innerWidth <= 1180) {
    els.sidebar.classList.toggle("open");
  } else {
    els.workspace.classList.toggle("sidebar-collapsed");
  }
});

if (els.btnCloseSidebar) {
  els.btnCloseSidebar.addEventListener("click", () => els.sidebar.classList.remove("open"));
}

if (els.btnAskCurrent) {
  els.btnAskCurrent.addEventListener("click", () => {
    const seg = state.segmentByCode.get(String(state.activeCode || "").toUpperCase());
    if (seg) {
      sendMessage(`Giải thích ngắn gọn các ý chính của đoạn ${seg.code} (${seg.title || seg.topic}) giúp mình.`);
    } else {
      sendMessage(`Nội dung ${state.currentDay} gồm những phần nào?`);
    }
  });
}

// Init
loadInfo().then(loadLessons);
