const DEFAULT_API_BASE = "http://127.0.0.1:8000";

async function getApiBase() {
  try {
    const res = await Promise.race([
      chrome.storage.local.get(["apiBase"]),
      new Promise((resolve) => setTimeout(() => resolve({}), 1000)),
    ]);
    const raw = (res.apiBase || DEFAULT_API_BASE).replace(/\/+$/, "");
    // Trên Windows, "localhost" thử IPv6 (::1) mất ~2 giây trước khi rơi về 127.0.0.1
    return raw.replace(/^http:\/\/localhost(?=[:/]|$)/i, "http://127.0.0.1");
  } catch (e) {
    return DEFAULT_API_BASE;
  }
}

async function callBackend(path, options = {}, timeoutMs = 35000) {
  const base = await getApiBase();
  const url = `${base}${path}`;
  const controller = new AbortController();
  const isLoopback = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?\//i.test(url);

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      try {
        controller.abort();
      } catch (e) {}
      const err = new Error(
        `Quá thời gian chờ (${Math.round(timeoutMs / 1000)} giây) khi gọi ${url}. Nếu dùng Edge/Chrome bản mới, bấm biểu tượng 3m trên thanh extension → "Lưu & Kiểm tra" để cấp quyền Local Network Access, hoặc kiểm tra cửa sổ chạy python frontend/server.py.`
      );
      err.name = "TimeoutError";
      reject(err);
    }, timeoutMs);
  });

  const fetchOpts = { ...options, signal: controller.signal, cache: "no-store" };
  if (isLoopback) {
    fetchOpts.targetAddressSpace = "loopback";
  }

  try {
    const doFetch = async () => {
      let resp;
      try {
        resp = await fetch(url, fetchOpts);
      } catch (e) {
        // Fallback nếu trình duyệt từ chối thuộc tính targetAddressSpace
        if (isLoopback && fetchOpts.targetAddressSpace && e && e.name === "TypeError") {
          const fallbackOpts = { ...fetchOpts };
          delete fallbackOpts.targetAddressSpace;
          resp = await fetch(url, fallbackOpts);
        } else {
          throw e;
        }
      }
      const text = await resp.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: text || `HTTP ${resp.status}` };
      }
      return { ok: resp.ok, status: resp.status, data };
    };

    return await Promise.race([doFetch(), timeoutPromise]);
  } catch (err) {
    if (err && (err.name === "AbortError" || err.name === "TimeoutError")) {
      throw new Error(
        err.message && err.message.includes("Quá thời gian chờ")
          ? err.message
          : `Quá thời gian chờ (${Math.round(timeoutMs / 1000)} giây). Kiểm tra quyền Local Network Access (bấm icon extension 3m → Lưu & Kiểm tra) hoặc cửa sổ python frontend/server.py.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Chạy trong MAIN world của từng frame thuộc tab (allFrames: true) để tua thẳng tới mốc thời gian / slide.
// Chỉ tác động lên frame ĐANG HIỂN THỊ và khớp đúng ngày học (targetDay) nếu có chỉ định.
function seekInPageMain(seconds, slide, targetDay, viewerOnly) {
  function parseTimeLabel(str) {
    if (!str) return null;
    const m = String(str).trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    if (m[3] !== undefined) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function extractDayKey(str) {
    const s = String(str || "");
    const m = s.match(/(?:^|[^a-z0-9])day[\s_-]*0?(\d{1,2})(?:[^0-9]|$)/i);
    if (!m) return "";
    const n = parseInt(m[1], 10);
    if (isNaN(n) || n < 1 || n > 15) return "";
    return `Day${String(n).padStart(2, "0")}`;
  }

  function isFrameVisible(win) {
    try {
      if (win.innerWidth < 120 || win.innerHeight < 80) return false;
      const fe = win.frameElement;
      if (fe) {
        const r = fe.getBoundingClientRect();
        if (!r || r.width < 120 || r.height < 80) return false;
        const st =
          fe.ownerDocument && fe.ownerDocument.defaultView
            ? fe.ownerDocument.defaultView.getComputedStyle(fe)
            : null;
        if (st && (st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) === 0)) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return win.innerWidth >= 120 && win.innerHeight >= 80;
    }
  }

  function queryAllDeep(root, selector) {
    const found = [];
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      if (!node || !node.querySelectorAll) continue;
      try {
        found.push(...node.querySelectorAll(selector));
        const all = node.querySelectorAll("*");
        for (const el of all) {
          if (el.shadowRoot) stack.push(el.shadowRoot);
        }
      } catch (e) {}
    }
    return found;
  }

  function pickBestMedia(doc) {
    const direct = Array.from(doc.querySelectorAll("video, audio"));
    const list = direct.length ? direct : queryAllDeep(doc, "video, audio");
    if (!list.length) return null;
    const scored = list.map((el) => {
      let score = el.tagName === "VIDEO" ? 10 : 5;
      if (el.readyState > 0) score += 5;
      if (isFinite(el.duration) && el.duration > 0) score += 4;
      if (el.offsetWidth > 0 && el.offsetHeight > 0) score += 3;
      if (!el.paused) score += 2;
      return { el, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].el;
  }

  function clickAtRatio(el, ratio, win) {
    const r = el.getBoundingClientRect();
    if (!r || r.width <= 0) return false;
    const clamped = Math.max(0.002, Math.min(0.995, ratio));
    const clientX = r.left + clamped * r.width;
    const clientY = r.top + r.height / 2;
    const opts = { bubbles: true, cancelable: true, view: win, clientX, clientY, button: 0, buttons: 1 };
    try {
      el.dispatchEvent(new win.PointerEvent("pointerdown", opts));
    } catch (e) {}
    el.dispatchEvent(new win.MouseEvent("mousedown", opts));
    try {
      el.dispatchEvent(new win.PointerEvent("pointerup", opts));
    } catch (e) {}
    el.dispatchEvent(new win.MouseEvent("mouseup", opts));
    el.dispatchEvent(new win.MouseEvent("click", opts));
    return true;
  }

  function pauseAllMedia(doc) {
    doc.querySelectorAll("video, audio").forEach((m) => {
      try {
        m.pause();
      } catch (e) {}
    });
  }

  const win = window;
  const doc = document;
  if (!doc) return { ok: false };

  const isViewerFrame = win.name === "tm-3mien-viewer-frame";
  if (viewerOnly && !isViewerFrame) return { ok: false };
  if (!isFrameVisible(win)) return { ok: false, skippedHidden: true };

  const frameDay = extractDayKey(`${win.location.href} ${doc.title || ""}`);
  if (targetDay && frameDay && frameDay !== targetDay) {
    return { ok: false, skippedWrongDay: frameDay };
  }
  if (targetDay && !frameDay && !isViewerFrame) {
    return { ok: false, skippedNoDay: true };
  }

  const hasSeconds = typeof seconds === "number" && isFinite(seconds) && seconds >= 0;
  const hasSlide = typeof slide === "number" && isFinite(slide) && slide >= 1;
  const contexts = [{ win, doc }];

  const results = [];

  for (const { win, doc } of contexts) {
    const now = Date.now();
    if (win.__tm3mienLastSeekAt && now - win.__tm3mienLastSeekAt < 180) {
      continue;
    }

    // 1. Trình phát thuyết minh VinTutor (preclass-online.com/decks/...) — tua im lặng, không tự phát tiếng
    if (win.VinTutor && Array.isArray(win.VinTutor.cues) && win.VinTutor.cues.length > 0) {
      const cues = win.VinTutor.cues;
      let idx = 0;

      if (hasSeconds) {
        const targetMs = seconds * 1000;
        for (let i = 0; i < cues.length; i++) {
          if (typeof cues[i].start === "number" && cues[i].start <= targetMs + 1000) {
            idx = i;
          }
        }
      } else if (hasSlide) {
        const targetSlideIdx = Math.max(0, Math.floor(slide) - 1);
        const found = cues.findIndex((c) => c.slide === targetSlideIdx);
        if (found >= 0) idx = found;
      }

      try {
        win.__tm3mienLastSeekAt = now;
        if (!doc.documentElement.classList.contains("tutor")) {
          win.VinTutor.on(true);
        }
        if (typeof win.VinTutor.pause === "function") {
          win.VinTutor.pause();
        }
        // keepPlaying = false để chỉ nhảy slide/mốc thời gian, KHÔNG tự phát tiếng
        win.VinTutor.cue(idx, false);
        if (typeof win.VinTutor.pause === "function") {
          win.VinTutor.pause();
        }
        // Ẩn lớp phủ mở đầu nếu còn che slide mà không kích hoạt nút Play
        doc.querySelectorAll(".tt-start.is-on").forEach((ov) => ov.classList.remove("is-on"));
        pauseAllMedia(doc);

        const chosen = cues[idx] || {};
        results.push({
          ok: true,
          rank: isViewerFrame ? 6 : 5,
          isViewer: isViewerFrame,
          day: frameDay,
          mode: "VinTutor",
          cueIndex: idx,
          slide: typeof chosen.slide === "number" ? chosen.slide + 1 : null,
          seconds: Math.round((chosen.start || 0) / 1000),
          totalSeconds: Math.round((win.VinTutor.total || 0) / 1000),
        });
        continue;
      } catch (e) {}
    }

    // 2. Video / Audio HTML5 trực tiếp (kể cả trong Shadow DOM) — tua và giữ trạng thái dừng (không phát tiếng)
    const media = pickBestMedia(doc);
    if (media && hasSeconds) {
      try {
        win.__tm3mienLastSeekAt = now;
        const target =
          isFinite(media.duration) && media.duration > 1
            ? Math.min(seconds, Math.max(0, media.duration - 0.5))
            : seconds;
        media.pause();
        media.currentTime = target;
        media.pause();
        results.push({
          ok: true,
          rank: 4,
          mode: media.tagName === "VIDEO" ? "HTML5 Video" : "HTML5 Audio",
          seconds: Math.floor(target),
          totalSeconds: isFinite(media.duration) ? Math.floor(media.duration) : 0,
        });
        continue;
      } catch (e) {}
    }

    // 3. Thanh tua DOM của VinTutor (.tt-track + .tt-total) — ẩn overlay và tua không phát tiếng
    const ttTrack = queryAllDeep(doc, ".tt-track")[0];
    const ttTotalEl = queryAllDeep(doc, ".tt-total")[0];
    if (ttTrack && hasSeconds) {
      const totalSec = parseTimeLabel(ttTotalEl ? ttTotalEl.textContent : "");
      if (totalSec && totalSec > 0) {
        win.__tm3mienLastSeekAt = now;
        doc.querySelectorAll(".tt-start.is-on").forEach((ov) => ov.classList.remove("is-on"));
        const ratio = Math.max(0, Math.min(0.995, seconds / totalSec));
        if (clickAtRatio(ttTrack, ratio, win)) {
          if (doc.documentElement.classList.contains("tt-playing")) {
            const playBtn = doc.querySelector('.tt-bar [data-tt="play"]');
            if (playBtn) {
              try {
                playBtn.click();
              } catch (e) {}
            }
          }
          pauseAllMedia(doc);
          results.push({
            ok: true,
            rank: 3,
            mode: "VinTutor Track",
            seconds: Math.min(seconds, totalSec),
            totalSeconds: totalSec,
          });
          continue;
        }
      }
    }

    // 4. Thanh tua custom (<input type="range"> hoặc [role="slider"]) của trình phát Preclass
    if (hasSeconds) {
      const sliders = queryAllDeep(doc, 'input[type="range"], [role="slider"]');
      for (const sl of sliders) {
        const rect = sl.getBoundingClientRect();
        if (!rect || rect.width < 80) continue;
        if (sl.tagName === "INPUT") {
          const maxVal = parseFloat(sl.max);
          if (isFinite(maxVal) && maxVal >= 30) {
            win.__tm3mienLastSeekAt = now;
            const target = Math.min(maxVal, Math.max(parseFloat(sl.min) || 0, seconds));
            const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")?.set;
            if (setter) setter.call(sl, String(target));
            else sl.value = String(target);
            sl.dispatchEvent(new win.Event("input", { bubbles: true }));
            sl.dispatchEvent(new win.Event("change", { bubbles: true }));
            pauseAllMedia(doc);
            results.push({
              ok: true,
              rank: 3,
              mode: "Player Slider",
              seconds: Math.floor(target),
              totalSeconds: Math.floor(maxVal),
            });
            break;
          }
        } else {
          const maxVal = parseFloat(sl.getAttribute("aria-valuemax"));
          if (isFinite(maxVal) && maxVal >= 30) {
            win.__tm3mienLastSeekAt = now;
            const ratio = Math.max(0, Math.min(0.995, seconds / maxVal));
            if (clickAtRatio(sl, ratio, win)) {
              pauseAllMedia(doc);
              results.push({
                ok: true,
                rank: 3,
                mode: "Player Slider",
                seconds: Math.min(seconds, Math.floor(maxVal)),
                totalSeconds: Math.floor(maxVal),
              });
              break;
            }
          }
        }
      }
    }

    // 5. Slide VinDeck (khi chưa có VinTutor)
    if (win.VinDeck && typeof win.VinDeck.go === "function" && hasSlide) {
      try {
        win.__tm3mienLastSeekAt = now;
        const targetSlide = Math.max(1, Math.min(win.VinDeck.count || slide, Math.floor(slide)));
        win.VinDeck.go(targetSlide - 1);
        pauseAllMedia(doc);
        results.push({
          ok: true,
          rank: 2,
          mode: "VinDeck",
          slide: targetSlide,
        });
        continue;
      } catch (e) {}
    }

    // 6. Fallback: postMessage tới iframe YouTube / Vimeo (chỉ tua + dừng, không tự phát tiếng)
    if (hasSeconds) {
      const iframes = Array.from(doc.querySelectorAll("iframe[src]"));
      for (const frame of iframes) {
        const src = frame.getAttribute("src") || "";
        try {
          if (/youtube\.com\/embed|youtube-nocookie\.com\/embed/i.test(src) && frame.contentWindow) {
            win.__tm3mienLastSeekAt = now;
            frame.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
              "*"
            );
            frame.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
              "*"
            );
            results.push({ ok: true, rank: 1, mode: "YouTube Embed", seconds: Math.floor(seconds) });
            break;
          }
          if (/player\.vimeo\.com/i.test(src) && frame.contentWindow) {
            win.__tm3mienLastSeekAt = now;
            frame.contentWindow.postMessage(JSON.stringify({ method: "setCurrentTime", value: seconds }), "*");
            frame.contentWindow.postMessage(JSON.stringify({ method: "pause" }), "*");
            results.push({ ok: true, rank: 1, mode: "Vimeo Embed", seconds: Math.floor(seconds) });
            break;
          }
        } catch (e) {}
      }
    }
  }

  if (results.length) {
    results.sort((a, b) => (b.rank || 0) - (a.rank || 0));
    return results[0];
  }

  return { ok: false };
}

// Dừng toàn bộ âm thanh trong khung chiếu nổi (Floating Viewer) trước khi đóng
function stopViewerMain() {
  if (window.name !== "tm-3mien-viewer-frame") return { ok: false };
  try {
    if (window.VinTutor && typeof window.VinTutor.pause === "function") {
      window.VinTutor.pause();
    }
  } catch (e) {}
  try {
    document.querySelectorAll("video, audio").forEach((m) => {
      try {
        m.pause();
      } catch (e) {}
    });
  } catch (e) {}
  return { ok: true };
}

// Đọc trạng thái player hiện tại (chỉ tính các frame đang HIỂN THỊ thật sự, bỏ qua iframe ẩn của SPA)
function inspectPlayerMain() {
  function parseTimeLabel(str) {
    if (!str) return null;
    const m = String(str).trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    if (m[3] !== undefined) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function isFrameVisible(win) {
    try {
      if (win.innerWidth < 120 || win.innerHeight < 80) return false;
      const fe = win.frameElement;
      if (fe) {
        const r = fe.getBoundingClientRect();
        if (!r || r.width < 120 || r.height < 80) return false;
        const st =
          fe.ownerDocument && fe.ownerDocument.defaultView
            ? fe.ownerDocument.defaultView.getComputedStyle(fe)
            : null;
        if (st && (st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) === 0)) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return win.innerWidth >= 120 && win.innerHeight >= 80;
    }
  }

  const win = window;
  const doc = document;
  if (!doc || !isFrameVisible(win)) return { found: false, frameUrl: location.href, iframes: [] };
  const isViewer = win.name === "tm-3mien-viewer-frame";

  // 1. Nhanh nhất (O(1)): VinTutor trực tiếp trên window
  if (win.VinTutor && Array.isArray(win.VinTutor.cues) && win.VinTutor.cues.length > 0) {
    const idx = Math.max(0, Math.min(win.VinTutor.cues.length - 1, win.VinTutor.index || 0));
    const cue = win.VinTutor.cues[idx] || {};
    const timeEl = doc.querySelector(".tt-time");
    let seconds = Math.round((cue.start || 0) / 1000);
    const parsed = parseTimeLabel(timeEl ? timeEl.textContent : "");
    if (parsed !== null) seconds = parsed;
    return {
      found: true,
      rank: isViewer ? 6 : 5,
      isViewer,
      mode: "VinTutor",
      seconds,
      totalSeconds: Math.round((win.VinTutor.total || 0) / 1000),
      slide: typeof cue.slide === "number" ? cue.slide + 1 : (win.VinDeck ? win.VinDeck.index + 1 : null),
      totalSlides: win.VinDeck ? win.VinDeck.count : null,
      playing: !!win.VinTutor.playing,
      title: doc.title || "",
      href: win.location.href,
    };
  }

  // 2. HTML5 video / audio trực tiếp trên DOM (không quét toàn bộ "*" trừ khi cần)
  const media = doc.querySelector("video") || doc.querySelector("audio");
  if (media) {
    return {
      found: true,
      rank: 4,
      mode: media.tagName === "VIDEO" ? "HTML5 Video" : "HTML5 Audio",
      seconds: Math.floor(media.currentTime || 0),
      totalSeconds: isFinite(media.duration) ? Math.floor(media.duration) : 0,
      slide: null,
      playing: !media.paused,
      title: doc.title || "",
      href: win.location.href,
    };
  }

  // 3. Thanh tua DOM VinTutor
  const ttTrack = doc.querySelector(".tt-track");
  if (ttTrack) {
    const timeEl = doc.querySelector(".tt-time");
    const totalEl = doc.querySelector(".tt-total");
    const titleEl = doc.querySelector(".tt-start b, h1, h2");
    return {
      found: true,
      rank: 3,
      mode: "VinTutor Track",
      seconds: parseTimeLabel(timeEl ? timeEl.textContent : ""),
      totalSeconds: parseTimeLabel(totalEl ? totalEl.textContent : "") || 0,
      slide: null,
      playing: doc.documentElement.classList.contains("tt-playing"),
      title: (titleEl && titleEl.textContent.trim()) || doc.title || "",
      href: win.location.href,
    };
  }

  // 4. Slider custom trên DOM
  const sliders = doc.querySelectorAll('input[type="range"], [role="slider"]');
  for (const sl of sliders) {
    const rect = sl.getBoundingClientRect();
    if (!rect || rect.width < 80) continue;
    const maxVal = sl.tagName === "INPUT" ? parseFloat(sl.max) : parseFloat(sl.getAttribute("aria-valuemax"));
    const curVal = sl.tagName === "INPUT" ? parseFloat(sl.value) : parseFloat(sl.getAttribute("aria-valuenow"));
    if (isFinite(maxVal) && maxVal >= 30) {
      return {
        found: true,
        rank: 3,
        mode: "Player Slider",
        seconds: isFinite(curVal) ? Math.floor(curVal) : 0,
        totalSeconds: Math.floor(maxVal),
        slide: null,
        playing: false,
        title: doc.title || "",
        href: win.location.href,
      };
    }
  }

  // 5. VinDeck slide thuần
  if (win.VinDeck) {
    return {
      found: true,
      rank: 2,
      mode: "VinDeck",
      seconds: null,
      slide: (win.VinDeck.index || 0) + 1,
      totalSlides: win.VinDeck.count || null,
      playing: false,
      title: doc.title || "",
      href: win.location.href,
    };
  }

  // 6. Embed YouTube / Vimeo
  const yt = doc.querySelector('iframe[src*="youtube.com/embed"], iframe[src*="youtube-nocookie.com/embed"]');
  if (yt) {
    return { found: true, rank: 1, mode: "YouTube Embed", seconds: null, title: doc.title || "", href: win.location.href };
  }
  const vm = doc.querySelector('iframe[src*="player.vimeo.com"]');
  if (vm) {
    return { found: true, rank: 1, mode: "Vimeo Embed", seconds: null, title: doc.title || "", href: win.location.href };
  }

  const iframeHints = [];
  try {
    const iframes = Array.from(doc.querySelectorAll("iframe"));
    for (const f of iframes.slice(0, 3)) {
      const src = f.getAttribute("src") || (f.hasAttribute("srcdoc") ? "[srcdoc]" : "[no-src]");
      const sandbox = f.getAttribute("sandbox") || "";
      iframeHints.push({ src: src.slice(0, 120), sandbox });
    }
  } catch (e) {}

  return { found: false, frameUrl: location.href, iframes: iframeHints };
}

async function resolveTargetTabId(msg, sender) {
  if (sender && sender.tab && sender.tab.id) return sender.tab.id;
  if (msg && msg.tabId) return msg.tabId;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ? tab.id : null;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;

  if (msg.type === "GET_INFO") {
    callBackend("/api/info", {}, 8000)
      .then((r) => sendResponse(r))
      .catch((e) => sendResponse({ ok: false, error: `Chưa bật server cục bộ (${e.message}). Hãy chạy: python frontend/server.py` }));
    return true;
  }

  if (msg.type === "GET_LESSONS") {
    callBackend("/api/lessons", {}, 10000)
      .then((r) => sendResponse(r))
      .catch((e) => sendResponse({ ok: false, error: e.message }));
    return true;
  }

  if (msg.type === "CHAT") {
    callBackend(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg.message || "" }),
      },
      35000
    )
      .then((r) => sendResponse(r))
      .catch((e) =>
        sendResponse({
          ok: false,
          error: e.message.includes("Quá thời gian chờ")
            ? e.message
            : `Không kết nối được tới server cục bộ (${e.message}). Kiểm tra đã chạy python frontend/server.py chưa.`,
        })
      );
    return true;
  }

// Điều hướng trực tiếp tới mục bài học (Day XX / Ngày XX) ngay bên trong trang web preclass-online.com (không mở tab mới)
function navigateInPreclassMain(targetDay, dayNum, lessonTitle, allowStep) {
  function strip(str) {
    return String(str || "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    if (el.closest && el.closest("#tm-3mien-root")) return false;
    const r = el.getBoundingClientRect();
    if (!r || r.width < 12 || r.height < 12) return false;
    const st = window.getComputedStyle(el);
    if (st && (st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) === 0)) return false;
    return true;
  }

  function clickableTarget(el) {
    return (
      el.closest('a, button, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [onclick]') ||
      el.closest("li") ||
      el
    );
  }

  function clickEl(el) {
    try {
      el.scrollIntoView({ behavior: "instant", block: "center" });
    } catch (e) {}
    try {
      el.click();
      return true;
    } catch (e) {
      try {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  const num = Number(dayNum);
  const pad2 = String(num).padStart(2, "0");
  const dayUrlRe = new RegExp(`(?:^|[^a-z0-9])(?:day|ngay|buoi|d)[-_]?0?${num}(?:[^0-9]|$)`, "i");
  const dayTextRe = new RegExp(`(?:^|[^a-z0-9])(?:day|ngay|buoi)\\s*0?${num}(?:[^0-9]|$)`, "i");
  const anyOtherDayRe = /(?:^|[^a-z0-9])(?:day|ngay|buoi)\s*0?(\d{1,2})(?:[^0-9]|$)/i;

  // Rút cụm từ khoá đặc trưng từ tiêu đề bài (vd "ai sdlc", "evaluation", "workflow")
  const cleanTitle = strip(lessonTitle || "")
    .replace(/^day\s*\d+\s*[-–—:.·]*/i, "")
    .replace(/^ngay\s*\d+\s*[-–—:.·]*/i, "")
    .trim();
  const titleWords = cleanTitle
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !["cho", "cac", "nhung", "trong", "agent", "bai"].includes(w));

  const maxArea = window.innerWidth * window.innerHeight * 0.42;
  const candidates = [];
  const seen = new Set();

  const selectors = 'a[href], button, [role="button"], [role="link"], [role="tab"], [role="menuitem"], li, [class*="lesson"], [class*="day"], [class*="module"], [class*="chapter"], [class*="item"], [class*="card"]';
  document.querySelectorAll(selectors).forEach((rawEl) => {
    if (!isVisible(rawEl)) return;
    const el = clickableTarget(rawEl);
    if (!el || seen.has(el) || !isVisible(el)) return;
    seen.add(el);

    const rect = el.getBoundingClientRect();
    if (rect.width * rect.height > maxArea) return;

    const href = el.getAttribute("href") || "";
    const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    const norm = strip(text);
    if (!href && (!norm || norm.length > 180)) return;

    let score = 0;
    if (href && dayUrlRe.test(href)) score += 12;
    if (norm && norm.length <= 150 && dayTextRe.test(norm)) score += 10;

    // Tránh nhầm sang bài ngày khác nếu text chứa số ngày khác
    const otherMatch = norm.match(anyOtherDayRe);
    if (otherMatch && parseInt(otherMatch[1], 10) !== num) {
      return;
    }

    if (titleWords.length > 0 && norm.length <= 150) {
      let kwHits = 0;
      for (const w of titleWords.slice(0, 4)) {
        if (norm.includes(w)) kwHits += 1;
      }
      if (kwHits >= 2) score += 6 + kwHits;
      else if (kwHits === 1 && score > 0) score += 3;
    }

    if (score >= 8) {
      // Ưu tiên link/button nhỏ gọn, nằm trong danh sách/sidebar hơn khung lớn
      const tagBonus = el.tagName === "A" || el.tagName === "BUTTON" ? 2 : 0;
      const lenBonus = norm.length <= 80 ? 1 : 0;
      candidates.push({ el, score: score + tagBonus + lenBonus, label: text.slice(0, 70) || href });
    }
  });

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (clickEl(best.el)) {
      return { ok: true, status: "clicked_day", label: best.label, targetDay };
    }
  }

  // Bước phụ: nếu đang ở Trang chủ hoặc sidebar bài học đang đóng, mở mục Khoá học / Mục lục để lộ danh sách ngày
  if (allowStep) {
    const stepCandidates = [];
    document.querySelectorAll('a, button, [role="button"], [role="link"], [class*="card"], [class*="course"]').forEach((rawEl) => {
      if (!isVisible(rawEl)) return;
      const el = clickableTarget(rawEl);
      if (!el || !isVisible(el)) return;
      const rect = el.getBoundingClientRect();
      if (rect.width * rect.height > maxArea) return;
      const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
      const norm = strip(text);
      const aria = strip(el.getAttribute("aria-label") || el.getAttribute("title") || "");
      let score = 0;
      if (norm.includes("nen tang ai") || norm.includes("context engineering") || (norm.includes("dang hoc") && norm.length < 140)) {
        score = 10;
      } else if (norm === "khoa hoc cua toi" || norm.startsWith("khoa hoc cua toi")) {
        score = 8;
      } else if (
        (aria.includes("menu") || aria.includes("sidebar") || aria.includes("muc luc") || aria.includes("danh sach") || norm === "muc luc") &&
        rect.width <= 180 &&
        rect.height <= 60
      ) {
        score = 7;
      }
      if (score > 0) {
        stepCandidates.push({ el, score, label: text.slice(0, 50) || aria || "menu" });
      }
    });

    if (stepCandidates.length > 0) {
      stepCandidates.sort((a, b) => b.score - a.score);
      if (clickEl(stepCandidates[0].el)) {
        return { ok: true, status: "opened_step", label: stepCandidates[0].label, targetDay };
      }
    }
  }

  return { ok: false, status: "not_found", targetDay };
}

  if (msg.type === "REMEMBER_DAY_URL") {
    const day = typeof msg.day === "string" ? msg.day : "";
    const url = typeof msg.url === "string" ? msg.url : "";
    if (day && /^https:\/\/[^/]*preclass(?:-online)?\.com\/.+/i.test(url) && !/\/decks\//i.test(url)) {
      chrome.storage.local.get(["learnedDayUrls"], (res) => {
        const map = (res && res.learnedDayUrls && typeof res.learnedDayUrls === "object") ? res.learnedDayUrls : {};
        if (map[day] !== url) {
          map[day] = url;
          chrome.storage.local.set({ learnedDayUrls: map });
        }
        sendResponse({ ok: true });
      });
      return true;
    }
    sendResponse({ ok: false });
    return;
  }

  if (msg.type === "NAVIGATE_TO_DAY") {
    resolveTargetTabId(msg, sender)
      .then(async (tabId) => {
        if (!tabId) {
          sendResponse({ ok: false, status: "no_tab" });
          return;
        }
        const targetDay = typeof msg.targetDay === "string" ? msg.targetDay : "";
        const dayMatch = targetDay.match(/(\d{1,2})/);
        const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : 0;
        if (!targetDay || !dayNum) {
          sendResponse({ ok: false, status: "invalid_day" });
          return;
        }

        // Ưu tiên 1: Thử bấm trực tiếp vào mục Day XX trong DOM trang web hiện tại (SPA mượt, không reload)
        const results = await chrome.scripting.executeScript({
          target: { tabId, allFrames: false },
          world: "MAIN",
          func: navigateInPreclassMain,
          args: [targetDay, dayNum, String(msg.lessonTitle || ""), Boolean(msg.allowStep)],
        });
        const r0 = results && results[0] && results[0].result;
        if (r0 && r0.ok && r0.status === "clicked_day") {
          sendResponse(r0);
          return;
        }

        // Ưu tiên 2: Nếu đã học được URL thật trong web cho ngày này -> chuyển cùng tab tới đúng URL đó
        const stored = await chrome.storage.local.get(["learnedDayUrls"]);
        const learnedUrl = stored && stored.learnedDayUrls && stored.learnedDayUrls[targetDay];
        const tab = await chrome.tabs.get(tabId).catch(() => null);
        if (learnedUrl && (!tab || tab.url !== learnedUrl)) {
          await chrome.tabs.update(tabId, { url: learnedUrl });
          sendResponse({ ok: true, status: "navigated_url", url: learnedUrl, targetDay });
          return;
        }

        // Ưu tiên 3: Nếu bước 1 vừa mở được trang Khoá học / sidebar -> báo lại để content.js thử bấm Day XX sau khi DOM render
        if (r0 && r0.ok && r0.status === "opened_step") {
          sendResponse(r0);
          return;
        }

        sendResponse({ ok: false, status: "not_found", targetDay });
      })
      .catch((e) => sendResponse({ ok: false, status: "error", error: e.message }));
    return true;
  }

  if (msg.type === "STOP_VIEWER") {
    resolveTargetTabId(msg, sender)
      .then(async (tabId) => {
        if (!tabId) {
          sendResponse({ ok: false });
          return;
        }
        await chrome.scripting.executeScript({
          target: { tabId, allFrames: true },
          world: "MAIN",
          func: stopViewerMain,
        });
        sendResponse({ ok: true });
      })
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (msg.type === "SEEK_VIDEO") {
    resolveTargetTabId(msg, sender)
      .then(async (tabId) => {
        if (!tabId) {
          sendResponse({ ok: false, error: "Không xác định được tab đang mở." });
          return;
        }
        const results = await chrome.scripting.executeScript({
          target: { tabId, allFrames: true },
          world: "MAIN",
          func: seekInPageMain,
          args: [
            typeof msg.seconds === "number" ? msg.seconds : null,
            typeof msg.slide === "number" ? msg.slide : null,
            typeof msg.targetDay === "string" ? msg.targetDay : "",
            Boolean(msg.viewerOnly),
          ],
        });
        const hits = results
          .map((r) => r && r.result)
          .filter((r) => r && r.ok)
          .sort((a, b) => (b.rank || 0) - (a.rank || 0));
        if (hits.length > 0) {
          sendResponse(hits[0]);
        } else {
          sendResponse({
            ok: false,
            error: "Chưa tìm thấy player video/slide trên trang này (hãy mở bài giảng có video hoặc VinTutor trên preclass-online.com).",
          });
        }
      })
      .catch((e) => sendResponse({ ok: false, error: `Không thể trỏ vào video: ${e.message}` }));
    return true;
  }

  if (msg.type === "GET_PLAYER_STATE") {
    resolveTargetTabId(msg, sender)
      .then(async (tabId) => {
        if (!tabId) {
          sendResponse({ ok: false, found: false });
          return;
        }
        const results = await chrome.scripting.executeScript({
          target: { tabId, allFrames: true },
          world: "MAIN",
          func: inspectPlayerMain,
        });
        const hits = results
          .map((r) => r && r.result)
          .filter((r) => r && r.found)
          .sort((a, b) => (b.rank || 0) - (a.rank || 0));
        if (hits.length > 0) {
          sendResponse({ ok: true, ...hits[0] });
        } else {
          const debugIframes = [];
          for (const r of results) {
            if (r && r.result && Array.isArray(r.result.iframes)) {
              debugIframes.push(...r.result.iframes);
            }
          }
          sendResponse({ ok: true, found: false, iframes: debugIframes.slice(0, 3) });
        }
      })
      .catch((e) => sendResponse({ ok: false, found: false, error: e.message }));
    return true;
  }
});
