"""Web server cục bộ phục vụ giao diện sáng 3 cột (frontend/) nối thẳng với codebase/agent.py
và tự động nạp nhiều bài giảng từ `data-btc/lectures/Day01` → `Day13` (hỗ trợ cả âm thanh MP3/MP4 có HTTP Range).

Chạy bằng:
    python frontend/server.py
Mặc định mở tại: http://127.0.0.1:8000 (đổi cổng bằng --port 8080).

Chỉ dùng thư viện chuẩn của Python (http.server), KHÔNG sửa run.py hay khung tracing.
"""
import argparse
import json
import mimetypes
import os
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, unquote, urlparse

FRONTEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(FRONTEND_DIR)
CODEBASE_DIR = os.path.join(ROOT_DIR, "codebase")
LESSONS_PATH = os.path.join(ROOT_DIR, "data", "lessons.json")
LECTURE_ROOTS = [
    os.path.join(ROOT_DIR, "data-btc", "lectures"),
    os.path.join(ROOT_DIR, "data", "lectures"),
]

if CODEBASE_DIR not in sys.path:
    sys.path.insert(0, CODEBASE_DIR)

import ai  # noqa: E402
import tracing  # noqa: E402
from agent import answer  # noqa: E402


def _read_lessons() -> dict:
    if not os.path.exists(LESSONS_PATH):
        return {"version": "", "segments": []}
    with open(LESSONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _discover_lectures() -> dict:
    """Quét tự động tất cả bài giảng trong data-btc/lectures/DayXX/ (và fallback data/lectures/DayXX/)."""
    found = {}
    for root in LECTURE_ROOTS:
        if not os.path.isdir(root):
            continue
        for entry in sorted(os.listdir(root)):
            day_dir = os.path.join(root, entry)
            if not os.path.isdir(day_dir) or entry in found:
                continue
            html_files = sorted(
                f for f in os.listdir(day_dir)
                if f.lower().endswith((".html", ".htm")) and os.path.isfile(os.path.join(day_dir, f))
            )
            voice_dir = os.path.join(day_dir, "voice")
            audio_file = ""
            sprite_count = 0
            if os.path.isdir(voice_dir):
                for vf in sorted(os.listdir(voice_dir)):
                    if not os.path.isfile(os.path.join(voice_dir, vf)):
                        continue
                    low = vf.lower()
                    if re.match(r"^s\d{3}\.(mp4|mp3|m4a)$", low):
                        sprite_count += 1
                    elif low.endswith((".mp3", ".m4a", ".wav", ".ogg")) and not audio_file:
                        audio_file = vf

            if html_files or audio_file:
                html_name = html_files[0] if html_files else ""
                found[entry] = {
                    "day": entry,
                    "dir": day_dir,
                    "title": os.path.splitext(html_name)[0] if html_name else entry,
                    "html_url": ("/lectures/%s/%s#1" % (quote(entry), quote(html_name))) if html_name else "",
                    "audio_url": ("/lectures/%s/voice/%s" % (quote(entry), quote(audio_file))) if audio_file else "",
                    "sprite_count": sprite_count,
                }
    return found


def _detect_branch(events: list) -> str:
    """Suy ra nhánh quyết định từ note() trong trace để hiển thị nhãn trực quan trên UI."""
    for ev in events:
        if ev.get("kind") == "note":
            t = (ev.get("text") or "").lower()
            if "guardrail" in t or "injection" in t or "mã đoạn bịa" in t:
                return "guardrail"
            if "ambiguous" in t or "hỏi ngược" in t or "mơ hồ" in t:
                return "clarify"
            if "not_found" in t or "ngoài phạm vi" in t or "ngoài bài" in t or "không tồn tại" in t:
                return "refuse"
    return "grounded"


def _guess_mime(full_path: str) -> str:
    lower = full_path.lower()
    if lower.endswith(".js.download") or lower.endswith(".js"):
        return "application/javascript; charset=utf-8"
    if lower.endswith(".css.download") or lower.endswith(".css"):
        return "text/css; charset=utf-8"
    if lower.endswith(".html") or lower.endswith(".htm"):
        return "text/html; charset=utf-8"
    if lower.endswith(".mp3"):
        return "audio/mpeg"
    if lower.endswith(".mp4"):
        return "video/mp4"
    if lower.endswith(".m4a"):
        return "audio/mp4"
    if lower.endswith(".wav"):
        return "audio/wav"
    ctype, _ = mimetypes.guess_type(full_path)
    if not ctype:
        ctype = "application/octet-stream"
    if ctype.startswith("text/") or ctype == "application/json":
        ctype += "; charset=utf-8"
    return ctype


AUDIO_GUARD_HEAD_SCRIPT = (
    "<script data-3mien-audio-guard>"
    "(function(){"
    "var OrigAudio=window.Audio;"
    "var pool=window.__3mienAudios=[];"
    "function stopAll(except){"
    "  for(var i=pool.length-1;i>=0;i--){"
    "    var x=pool[i];"
    "    if(!x||x===except) continue;"
    "    try{OrigAudio.prototype.pause.call(x);}catch(e){}"
    "  }"
    "}"
    "window.__3mienStopAllAudio=function(){stopAll(null);};"
    "var origPlay=OrigAudio.prototype.play;"
    "var origPause=OrigAudio.prototype.pause;"
    "OrigAudio.prototype.play=function(){"
    "  if(pool.indexOf(this)<0) pool.push(this);"
    "  stopAll(this);"
    "  return origPlay.apply(this,arguments);"
    "};"
    "OrigAudio.prototype.pause=function(){"
    "  var r=origPause.apply(this,arguments);"
    "  if(window.VinTutor&&!window.VinTutor.playing) stopAll(null);"
    "  return r;"
    "};"
    "window.Audio=function(src){"
    "  var a=src!==undefined?new OrigAudio(src):new OrigAudio();"
    "  pool.push(a);"
    "  if(pool.length>12) pool.shift();"
    "  return a;"
    "};"
    "window.Audio.prototype=OrigAudio.prototype;"
    "window.addEventListener('pagehide',function(){stopAll(null);});"
    "})();"
    "</script>"
)

PREBOOT_CLEANUP_SCRIPT = (
    "<script data-3mien-cleanup>"
    "(function(){"
    "document.querySelectorAll('.tt-bar,.tt-start,.tt-cap,.tt-think,.tt-spot,.vin-black,.vin-toast,.vin-help,.vin-overview,#mttContainer').forEach(function(e){e.remove();});"
    "document.documentElement.classList.remove('tutor','tt-playing','tt-idle','tt-rec');"
    "document.querySelectorAll('.slide.is-active').forEach(function(s){s.classList.remove('is-active','tt-enter');});"
    "document.querySelectorAll('.slide [data-step]').forEach(function(e){e.classList.remove('is-on','is-shown');});"
    "document.querySelectorAll('.slide .is-current,.slide .is-answered').forEach(function(e){e.classList.remove('is-current','is-answered');});"
    "document.querySelectorAll('.slide[data-step-now]').forEach(function(s){s.removeAttribute('data-step-now');});"
    "})();"
    "</script>"
)


def _sanitize_saved_lecture_html(raw_bytes: bytes) -> bytes:
    """Làm sạch trạng thái DOM đã đóng băng khi lưu trang HTML bằng Chrome Save Page As,
    và gắn lớp bảo vệ âm thanh (tránh 2 audio chạy song song hoặc dừng không tắt tiếng)."""
    text = raw_bytes.decode("utf-8", errors="replace")
    # Xoá các class runtime dính sẵn trên thẻ <html>
    text = re.sub(
        r"(<html\b[^>]*\bclass=\")([^\"]*)(\")",
        lambda m: m.group(1)
        + " ".join(c for c in m.group(2).split() if c not in ("tutor", "tt-playing", "tt-idle", "tt-rec"))
        + m.group(3),
        text,
        count=1,
        flags=re.IGNORECASE,
    )
    # Chèn audio guard ngay đầu <head> trước khi vinuni-tutor.js chạy
    text = re.sub(r"(<head\b[^>]*>)", lambda m: m.group(1) + AUDIO_GUARD_HEAD_SCRIPT, text, count=1, flags=re.IGNORECASE)
    # Chèn script dọn DOM chạy đồng bộ ngay trước </body> (trước khi DOMContentLoaded kích hoạt)
    if "</body>" in text:
        text = text.replace("</body>", PREBOOT_CLEANUP_SCRIPT + "</body>", 1)
    elif "</BODY>" in text:
        text = text.replace("</BODY>", PREBOOT_CLEANUP_SCRIPT + "</BODY>", 1)
    else:
        text += PREBOOT_CLEANUP_SCRIPT
    return text.encode("utf-8")


class TutorHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stdout.write("[frontend] %s - %s\n" % (self.address_string(), format % args))

    def _send_json(self, status: int, payload: dict) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _send_file(self, base_dir: str, rel_path: str, sanitize_lecture_html: bool = False) -> None:
        rel = unquote(rel_path).lstrip("/")
        if ".." in rel.replace("\\", "/").split("/"):
            self.send_error(403, "Forbidden")
            return
        full_path = os.path.abspath(os.path.join(base_dir, rel))
        if not full_path.startswith(os.path.abspath(base_dir)):
            self.send_error(403, "Forbidden")
            return
        # Chrome Save Page As luu anh logo phang trong ..._files/ thay vi ..._files/assets/
        if not os.path.isfile(full_path) and "/assets/" in rel.replace("\\", "/"):
            alt_rel = rel.replace("\\", "/").replace("/assets/", "/")
            alt_path = os.path.abspath(os.path.join(base_dir, alt_rel))
            if alt_path.startswith(os.path.abspath(base_dir)) and os.path.isfile(alt_path):
                full_path = alt_path
        if not os.path.isfile(full_path):
            # Bo qua anh nen/favicon tuy chon khong duoc luu kem trang HTML de khoi bao 404 nhieu log
            if rel.lower().endswith(("vinuni-campus.jpg", "favicon.ico")):
                self.send_response(204)
                self.end_headers()
                return
            self.send_error(404, "Not Found")
            return

        ctype = _guess_mime(full_path)

        if sanitize_lecture_html and full_path.lower().endswith((".html", ".htm")):
            with open(full_path, "rb") as f:
                content = _sanitize_saved_lecture_html(f.read())
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        file_size = os.path.getsize(full_path)
        range_hdr = self.headers.get("Range")

        # Hỗ trợ HTTP Range (206 Partial Content) để trình duyệt tua âm thanh MP3/MP4 mượt mà
        if range_hdr and range_hdr.startswith("bytes="):
            m = re.match(r"bytes=(\d*)-(\d*)", range_hdr)
            if m:
                start = int(m.group(1)) if m.group(1) else 0
                end = int(m.group(2)) if m.group(2) else file_size - 1
                end = min(end, file_size - 1)
                if start <= end < file_size:
                    length = end - start + 1
                    with open(full_path, "rb") as f:
                        f.seek(start)
                        chunk = f.read(length)
                    self.send_response(206)
                    self.send_header("Content-Type", ctype)
                    self.send_header("Accept-Ranges", "bytes")
                    self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, file_size))
                    self.send_header("Content-Length", str(length))
                    self.end_headers()
                    self.wfile.write(chunk)
                    return

        with open(full_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/info":
            data = _read_lessons()
            segs = data.get("segments", [])
            days = sorted({s.get("day", "") for s in segs if s.get("day")})
            lectures = _discover_lectures()
            public_lectures = {
                d: {
                    "day": v["day"],
                    "title": v["title"],
                    "html_url": v["html_url"],
                    "audio_url": v["audio_url"],
                    "sprite_count": v["sprite_count"],
                }
                for d, v in lectures.items()
            }
            default_day = "Day01" if "Day01" in public_lectures else (next(iter(public_lectures), ""))
            self._send_json(200, {
                "team": "3mien",
                "title": "Trợ giảng Pre-class có căn cứ",
                "provider": ai.MODEL_PROVIDER,
                "model": ai.MODEL_NAME or ("fake" if ai.MODEL_PROVIDER == "fake" else ""),
                "has_api_key": bool(ai.API_KEY and not ai.API_KEY.startswith("<")),
                "days_count": len(days),
                "segments_count": len(segs),
                "dataset_version": data.get("version", ""),
                "lectures": public_lectures,
                "default_lecture_day": default_day,
            })
            return

        if path == "/api/lessons":
            self._send_json(200, _read_lessons())
            return

        if path.startswith("/lectures/"):
            rest = path[len("/lectures/"):]
            parts = rest.split("/", 1)
            if len(parts) != 2:
                self.send_error(404, "Not Found")
                return
            day_key, rel = unquote(parts[0]), parts[1]
            lectures = _discover_lectures()
            if day_key not in lectures:
                self.send_error(404, "Lecture day not found")
                return
            self._send_file(lectures[day_key]["dir"], rel, sanitize_lecture_html=True)
            return

        rel = path.lstrip("/") or "index.html"
        self._send_file(FRONTEND_DIR, rel)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/chat":
            self._send_json(404, {"error": "Không tìm thấy endpoint."})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            body = json.loads(raw)
        except Exception as e:
            self._send_json(400, {"error": "JSON đầu vào không hợp lệ: %s" % e})
            return

        message = str(body.get("message") or "").strip()
        if not message:
            self._send_json(400, {"error": "Vui lòng nhập câu hỏi."})
            return

        t0 = time.perf_counter()
        tracing.begin("web")
        try:
            res = answer(message)
            summary, events = tracing.end()
            elapsed = round(time.perf_counter() - t0, 2)
            output = res.get("output", "") if isinstance(res, dict) else str(res)
            self._send_json(200, {
                "output": output,
                "branch": _detect_branch(events),
                "elapsed_s": elapsed,
                "summary": summary,
                "events": events,
            })
        except Exception as e:
            summary, events = tracing.end()
            self._send_json(500, {
                "error": "%s: %s" % (type(e).__name__, e),
                "summary": summary,
                "events": events,
            })


def main() -> int:
    parser = argparse.ArgumentParser(description="Chạy giao diện web sáng cho Trợ giảng Pre-class 3mien")
    parser.add_argument("--host", default="127.0.0.1", help="Địa chỉ host (mặc định 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Cổng chạy server (mặc định 8000)")
    args = parser.parse_args()

    lectures = _discover_lectures()
    server = ThreadingHTTPServer((args.host, args.port), TutorHandler)
    url = "http://%s:%d" % (args.host, args.port)
    print("Giao diện Trợ giảng Pre-class 3mien đang chạy tại: %s" % url)
    print("Model hiện tại: provider=%s · model=%s" % (ai.MODEL_PROVIDER, ai.MODEL_NAME or "fake"))
    print("Bài giảng đã nạp (%d): %s" % (len(lectures), ", ".join(sorted(lectures)) or "chưa có"))
    print("Nhấn Ctrl+C để dừng server.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng server.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
