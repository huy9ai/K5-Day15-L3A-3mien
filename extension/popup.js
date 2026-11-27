const DEFAULT_API_BASE = "http://127.0.0.1:8000";
const statusEl = document.getElementById("status");
const playerStatusEl = document.getElementById("playerStatus");
const apiInput = document.getElementById("apiBase");
const btnSave = document.getElementById("btnSave");
const btnToggle = document.getElementById("btnToggle");

function fmtSec(sec) {
  if (typeof sec !== "number" || !isFinite(sec) || sec < 0) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function checkPlayer() {
  if (!playerStatusEl) return;
  chrome.runtime.sendMessage({ type: "GET_PLAYER_STATE" }, (res) => {
    if (chrome.runtime.lastError || !res || !res.ok || !res.found) {
      if (res && Array.isArray(res.iframes) && res.iframes.length) {
        const first = res.iframes[0];
        const sb = first.sandbox ? ` [sandbox="${first.sandbox}"]` : "";
        playerStatusEl.textContent = `Video: thấy iframe (${first.src}${sb}) nhưng chưa đọc được player.`;
      } else if (res && res.error) {
        playerStatusEl.textContent = `Video: ${res.error}`;
      } else {
        playerStatusEl.textContent = "Video: chưa phát hiện player trên tab đang mở.";
      }
      return;
    }
    const parts = [`Đã gắn: ${res.mode}`];
    if (res.slide) parts.push(`Slide ${res.slide}`);
    if (typeof res.seconds === "number") parts.push(fmtSec(res.seconds));
    playerStatusEl.textContent = `🎬 ${parts.join(" · ")}`;
  });
}

function normalizeBase(url) {
  return (url || DEFAULT_API_BASE).trim().replace(/\/+$/, "").replace(/^http:\/\/localhost(?=[:/]|$)/i, "http://127.0.0.1");
}

async function checkServer() {
  statusEl.textContent = "Đang kiểm tra…";
  statusEl.className = "status";
  const base = normalizeBase(apiInput.value);

  // Thử gọi trực tiếp từ cửa sổ popup (có UI để Edge/Chrome bản mới hiện hộp thoại cấp quyền Local Network Access nếu cần)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let resp;
    try {
      resp = await fetch(`${base}/api/info`, {
        signal: controller.signal,
        cache: "no-store",
        targetAddressSpace: "loopback",
      });
    } catch (e) {
      if (e && e.name === "TypeError") {
        resp = await fetch(`${base}/api/info`, { signal: controller.signal, cache: "no-store" });
      } else {
        throw e;
      }
    } finally {
      clearTimeout(timer);
    }
    if (resp.ok) {
      const d = await resp.json();
      const daysPart = d.days_count ? `${d.days_count} ngày · ` : "";
      statusEl.textContent = `Đã kết nối: ${d.provider} · ${d.model || "fake"} (${daysPart}${d.segments_count} đoạn)`;
      statusEl.className = "status ok";
      checkPlayer();
      return;
    }
  } catch (e) {
    // Rơi về kiểm tra qua service worker để hiển thị lỗi chi tiết
  }

  chrome.runtime.sendMessage({ type: "GET_INFO" }, (res) => {
    if (chrome.runtime.lastError || !res || !res.ok) {
      const detail = (res && res.error) || "Chưa kết nối được server (chạy: python frontend/server.py)";
      statusEl.textContent = detail;
      statusEl.className = "status err";
      return;
    }
    const d = res.data;
    const daysPart = d.days_count ? `${d.days_count} ngày · ` : "";
    statusEl.textContent = `Đã kết nối: ${d.provider} · ${d.model || "fake"} (${daysPart}${d.segments_count} đoạn)`;
    statusEl.className = "status ok";
  });
  checkPlayer();
}

chrome.storage.local.get(["apiBase"], (res) => {
  apiInput.value = normalizeBase(res.apiBase || DEFAULT_API_BASE);
  checkServer();
});

btnSave.addEventListener("click", () => {
  const val = normalizeBase(apiInput.value);
  apiInput.value = val;
  chrome.storage.local.set({ apiBase: val }, () => checkServer());
});

btnToggle.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_DRAWER" }, () => {
      if (chrome.runtime.lastError) {
        statusEl.textContent = "Hãy mở trang preclass-online.com rồi bấm lại.";
        statusEl.className = "status err";
      } else {
        window.close();
      }
    });
  }
});
