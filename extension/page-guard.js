// Chạy ở MAIN world lúc document_start (trước script của preclass-online.com / vinuni-tutor.js).
// Bọc addEventListener cho sự kiện bàn phím trên window & document để khi người dùng đang gõ
// trong khung chat (#tm-3mien-root), các phím tắt Space/T/C/M/F/L/O/mũi tên của trang bài giảng
// sẽ bị bỏ qua hoàn toàn mà KHÔNG chặn sự kiện đi vào <textarea> (giữ nguyên dấu cách, Enter, bộ gõ tiếng Việt).
(() => {
  if (window.__tm3mienKeyGuard) return;
  window.__tm3mienKeyGuard = true;

  const KEY_EVENTS = new Set(["keydown", "keypress", "keyup"]);

  function isFrom3Mien(e) {
    const host = document.getElementById("tm-3mien-root");
    if (!host) return false;
    if (document.activeElement === host) return true;
    if (e && e.target === host) return true;
    if (e && e.target && host.contains && host.contains(e.target)) return true;
    if (e && typeof e.composedPath === "function") {
      try {
        if (e.composedPath().includes(host)) return true;
      } catch (err) {}
    }
    return false;
  }

  function isCapture(options) {
    if (typeof options === "boolean") return options;
    return Boolean(options && options.capture);
  }

  function patchTarget(target) {
    if (!target || typeof target.addEventListener !== "function") return;
    const origAdd = target.addEventListener;
    const origRemove = target.removeEventListener;
    const map = new WeakMap();

    target.addEventListener = function (type, listener, options) {
      if (!KEY_EVENTS.has(type) || !listener) {
        return origAdd.call(this, type, listener, options);
      }
      const cap = isCapture(options) ? "1" : "0";
      const key = `${type}:${cap}`;
      let perListener = map.get(listener);
      if (!perListener) {
        perListener = new Map();
        map.set(listener, perListener);
      }
      let wrapped = perListener.get(key);
      if (!wrapped) {
        wrapped = function (e) {
          if (isFrom3Mien(e)) return;
          if (typeof listener === "function") return listener.call(this, e);
          if (typeof listener.handleEvent === "function") return listener.handleEvent(e);
        };
        perListener.set(key, wrapped);
      }
      return origAdd.call(this, type, wrapped, options);
    };

    target.removeEventListener = function (type, listener, options) {
      if (!KEY_EVENTS.has(type) || !listener) {
        return origRemove.call(this, type, listener, options);
      }
      const cap = isCapture(options) ? "1" : "0";
      const key = `${type}:${cap}`;
      const perListener = map.get(listener);
      const wrapped = perListener && perListener.get(key);
      return origRemove.call(this, type, wrapped || listener, options);
    };
  }

  patchTarget(window);
  patchTarget(document);
})();
