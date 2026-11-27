const DEFAULT_API_BASE = "http://127.0.0.1:8000";

async function getApiBase() {
  const res = await chrome.storage.local.get(["apiBase"]);
  return (res.apiBase || DEFAULT_API_BASE).replace(/\/+$/, "");
}

async function callBackend(path, options = {}) {
  const base = await getApiBase();
  const url = `${base}${path}`;
  const resp = await fetch(url, options);
  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { error: text || `HTTP ${resp.status}` };
  }
  return { ok: resp.ok, status: resp.status, data };
}

// Chạy trong MAIN world của mọi frame thuộc tab bài giảng để tua thẳng tới mốc thời gian / slide.
function seekInPageMain(seconds, slide) {
  function parseTimeLabel(str) {
    if (!str) return null;
    const m = String(str).trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    if (m[3] !== undefined) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function collectContexts(win, out, seen) {
    if (!win || seen.has(win)) return;
    seen.add(win);
    let doc;
    try {
      doc = win.document;
    } catch (e) {
      return;
    }
    if (!doc) return;
    out.push({ win, doc });
    let frames = [];
    try {
      frames = Array.from(doc.querySelectorAll("iframe"));
    } catch (e) {}
    for (const f of frames) {
      try {
        if (f.contentWindow && f.contentDocument) {
          collectContexts(f.contentWindow, out, seen);
        }
      } catch (e) {}
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
    const list = queryAllDeep(doc, "video, audio");
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

  const hasSeconds = typeof seconds === "number" && isFinite(seconds) && seconds >= 0;
  const hasSlide = typeof slide === "number" && isFinite(slide) && slide >= 1;
  const contexts = [];
  collectContexts(window, contexts, new Set());

  function pauseAllMedia(doc) {
    queryAllDeep(doc, "video, audio").forEach((m) => {
      try {
        m.pause();
      } catch (e) {}
    });
  }

  const results = [];

  for (const { win, doc } of contexts) {
    // Chống chạy trùng 2 lần trên cùng 1 frame khi vừa quét đệ quy vừa chạy allFrames
    const now = Date.now();
    if (win.__tm3mienLastSeekAt && now - win.__tm3mienLastSeekAt < 250) {
      continue;
    }

    // 1. Trình phát thuyết minh VinTutor (preclass-online.com/decks/...) — tua im lặng, không tự phát tiếng
    if (win.VinTutor && Array.isArray(win.VinTutor.cues) && win.VinTutor.cues.length > 0) {
      const cues = win.VinTutor.cues;
      let idx = 0;

      if (hasSeconds) {
        const targetMs = seconds * 1000;
        for (let i = 0; i < cues.length; i++) {
          if (typeof cues[i].start === "number" && cues[i].start <= targetMs) {
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
          rank: 5,
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

// Đọc trạng thái player hiện tại (mốc giây, slide, tiêu đề bài giảng) trên mọi frame của tab.
function inspectPlayerMain() {
  function parseTimeLabel(str) {
    if (!str) return null;
    const m = String(str).trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    if (m[3] !== undefined) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function collectContexts(win, out, seen) {
    if (!win || seen.has(win)) return;
    seen.add(win);
    let doc;
    try {
      doc = win.document;
    } catch (e) {
      return;
    }
    if (!doc) return;
    out.push({ win, doc });
    let frames = [];
    try {
      frames = Array.from(doc.querySelectorAll("iframe"));
    } catch (e) {}
    for (const f of frames) {
      try {
        if (f.contentWindow && f.contentDocument) {
          collectContexts(f.contentWindow, out, seen);
        }
      } catch (e) {}
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

  const contexts = [];
  collectContexts(window, contexts, new Set());
  const hits = [];
  const iframeHints = [];

  for (const { win, doc } of contexts) {
    if (win.VinTutor && Array.isArray(win.VinTutor.cues) && win.VinTutor.cues.length > 0) {
      const idx = Math.max(0, Math.min(win.VinTutor.cues.length - 1, win.VinTutor.index || 0));
      const cue = win.VinTutor.cues[idx] || {};
      const timeEl = doc.querySelector(".tt-time");
      let seconds = Math.round((cue.start || 0) / 1000);
      const parsed = parseTimeLabel(timeEl ? timeEl.textContent : "");
      if (parsed !== null) seconds = parsed;
      hits.push({
        found: true,
        rank: 5,
        mode: "VinTutor",
        seconds,
        totalSeconds: Math.round((win.VinTutor.total || 0) / 1000),
        slide: typeof cue.slide === "number" ? cue.slide + 1 : (win.VinDeck ? win.VinDeck.index + 1 : null),
        totalSlides: win.VinDeck ? win.VinDeck.count : null,
        playing: !!win.VinTutor.playing,
        title: doc.title || "",
        href: win.location.href,
      });
      continue;
    }

    const media = queryAllDeep(doc, "video")[0] || queryAllDeep(doc, "audio")[0];
    if (media) {
      hits.push({
        found: true,
        rank: 4,
        mode: media.tagName === "VIDEO" ? "HTML5 Video" : "HTML5 Audio",
        seconds: Math.floor(media.currentTime || 0),
        totalSeconds: isFinite(media.duration) ? Math.floor(media.duration) : 0,
        slide: null,
        playing: !media.paused,
        title: doc.title || "",
        href: win.location.href,
      });
      continue;
    }

    const ttTrack = queryAllDeep(doc, ".tt-track")[0];
    if (ttTrack) {
      const timeEl = queryAllDeep(doc, ".tt-time")[0];
      const totalEl = queryAllDeep(doc, ".tt-total")[0];
      const titleEl = queryAllDeep(doc, ".tt-start b, h1, h2")[0];
      hits.push({
        found: true,
        rank: 3,
        mode: "VinTutor Track",
        seconds: parseTimeLabel(timeEl ? timeEl.textContent : ""),
        totalSeconds: parseTimeLabel(totalEl ? totalEl.textContent : "") || 0,
        slide: null,
        playing: doc.documentElement.classList.contains("tt-playing"),
        title: (titleEl && titleEl.textContent.trim()) || doc.title || "",
        href: win.location.href,
      });
      continue;
    }

    const sliders = queryAllDeep(doc, 'input[type="range"], [role="slider"]');
    for (const sl of sliders) {
      const rect = sl.getBoundingClientRect();
      if (!rect || rect.width < 80) continue;
      const maxVal = sl.tagName === "INPUT" ? parseFloat(sl.max) : parseFloat(sl.getAttribute("aria-valuemax"));
      const curVal = sl.tagName === "INPUT" ? parseFloat(sl.value) : parseFloat(sl.getAttribute("aria-valuenow"));
      if (isFinite(maxVal) && maxVal >= 30) {
        hits.push({
          found: true,
          rank: 3,
          mode: "Player Slider",
          seconds: isFinite(curVal) ? Math.floor(curVal) : 0,
          totalSeconds: Math.floor(maxVal),
          slide: null,
          playing: false,
          title: doc.title || "",
          href: win.location.href,
        });
        break;
      }
    }

    if (win.VinDeck) {
      hits.push({
        found: true,
        rank: 2,
        mode: "VinDeck",
        seconds: null,
        slide: (win.VinDeck.index || 0) + 1,
        totalSlides: win.VinDeck.count || null,
        playing: false,
        title: doc.title || "",
        href: win.location.href,
      });
      continue;
    }

    const yt = doc.querySelector('iframe[src*="youtube.com/embed"], iframe[src*="youtube-nocookie.com/embed"]');
    if (yt) {
      hits.push({ found: true, rank: 1, mode: "YouTube Embed", seconds: null, title: doc.title || "", href: win.location.href });
      continue;
    }
    const vm = doc.querySelector('iframe[src*="player.vimeo.com"]');
    if (vm) {
      hits.push({ found: true, rank: 1, mode: "Vimeo Embed", seconds: null, title: doc.title || "", href: win.location.href });
      continue;
    }

    try {
      const iframes = Array.from(doc.querySelectorAll("iframe"));
      for (const f of iframes.slice(0, 3)) {
        const src = f.getAttribute("src") || (f.hasAttribute("srcdoc") ? "[srcdoc]" : "[no-src]");
        const sandbox = f.getAttribute("sandbox") || "";
        iframeHints.push({ src: src.slice(0, 120), sandbox });
      }
    } catch (e) {}
  }

  if (hits.length) {
    hits.sort((a, b) => (b.rank || 0) - (a.rank || 0));
    return hits[0];
  }

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
    callBackend("/api/info")
      .then((r) => sendResponse(r))
      .catch((e) => sendResponse({ ok: false, error: `Chưa bật server cục bộ (${e.message}). Hãy chạy: python frontend/server.py` }));
    return true;
  }

  if (msg.type === "GET_LESSONS") {
    callBackend("/api/lessons")
      .then((r) => sendResponse(r))
      .catch((e) => sendResponse({ ok: false, error: e.message }));
    return true;
  }

  if (msg.type === "CHAT") {
    callBackend("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg.message || "" }),
    })
      .then((r) => sendResponse(r))
      .catch((e) =>
        sendResponse({
          ok: false,
          error: `Không kết nối được tới server cục bộ (${e.message}). Kiểm tra đã chạy python frontend/server.py chưa.`,
        })
      );
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
