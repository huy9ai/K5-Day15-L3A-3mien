"""Nối model — chỗ DUY NHẤT trong bản chạy thử gọi model AI. NHÓM VIẾT (Ngô Đức Thịnh).

Hợp đồng (giữ nguyên để khung đo được token):
    call_model(system: str, user: str) -> dict với 4 khoá
        "text":       str   chữ model trả về
        "model":      str   tên model đã gọi (để tra giá ở bảng giá model)
        "tokens_in":  int   số token vào, lấy từ trường usage trong phản hồi API — KHÔNG ước lượng
        "tokens_out": int   số token ra, gồm cả token suy luận / suy nghĩ nếu API tính riêng
    @model_call (từ tracing.py) tự ghi mỗi lần gọi vào trace; agent.py gọi call_model bao nhiêu lần
    cũng được, khung tự cộng token.
    Lỗi gọi model (hết lượt, sai key, mất mạng): cứ để exception bay ra — khung ghi lỗi vào cột error.

Hỗ trợ: openrouter (mặc định dùng cho GPT-6 Luna: openai/gpt-6-luna), openai, anthropic, ollama, và fake.
Chỉ dùng thư viện chuẩn của Python (urllib). Không dán API key vào file này.
"""
import json
import os
import urllib.error
import urllib.request

from tracing import model_call

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOW_RAW = False  # đổi thành True để in nguyên phản hồi JSON của API khi cần kiểm tra trường

URL_OPENROUTER = "https://openrouter.ai/api/v1/chat/completions"
URL_OPENAI = "https://api.openai.com/v1/chat/completions"
URL_CLAUDE = "https://api.anthropic.com/v1/messages"
URL_OLLAMA = "http://localhost:11434/api/chat"


def load_env(path=os.path.join(ROOT, ".env")):
    """Đọc file .env (KEY=VALUE mỗi dòng) vào biến môi trường, không ghi đè biến đã có. Khung — không cần sửa."""
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env()
MODEL_PROVIDER = (os.environ.get("MODEL_PROVIDER") or "fake").strip().lower()
MODEL_NAME = (os.environ.get("MODEL_NAME") or "").strip()
API_KEY = (os.environ.get("API_KEY") or "").strip()


def post_json(url: str, headers: dict, body: dict, timeout: int = 90) -> dict:
    """Gửi POST JSON, trả về JSON phản hồi. Chỉ dùng thư viện chuẩn (urllib)."""
    all_headers = {"Content-Type": "application/json", "User-Agent": "ai20k-3mien-tutor/1.0"}
    all_headers.update(headers)
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers=all_headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", "replace")[:400]
        raise RuntimeError("HTTP %d từ %s: %s" % (e.code, url, err_body))
    except urllib.error.URLError as e:
        raise RuntimeError("Lỗi kết nối tới %s: %s" % (url, e.reason))
    if SHOW_RAW:
        print(json.dumps(data, ensure_ascii=False, indent=2)[:3000])
    return data


def _extract_message_text(content) -> str:
    """Rút chữ từ trường message.content (hỗ trợ cả str và list các block text)."""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and item.get("type") == "text":
                parts.append(str(item.get("text", "")))
        return "".join(parts).strip()
    return str(content or "").strip()


def _require_key_and_model(provider: str, model_name: str) -> None:
    if not API_KEY or API_KEY.startswith("<"):
        raise RuntimeError(
            "Thiếu API_KEY cho %s. Mở file .env ở thư mục gốc repo và dán key vào dòng API_KEY=..." % provider
        )
    if not model_name:
        raise RuntimeError("Thiếu MODEL_NAME trong .env (vd: MODEL_NAME=openai/gpt-6-luna).")


def call_openrouter(system: str, user: str, model_name: str) -> dict:
    """Gọi OpenRouter Chat Completions API (tương thích OpenAI, lấy token thật từ usage)."""
    _require_key_and_model("openrouter", model_name)
    messages = ([{"role": "system", "content": system}] if system else []) + [
        {"role": "user", "content": user}
    ]
    headers = {
        "Authorization": "Bearer " + API_KEY,
        "HTTP-Referer": "https://github.com/huy9ai/K5-Day15-L3A-3mien",
        "X-Title": "3mien Grounded Pre-class Tutor",
    }
    body = {
        "model": model_name,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 500,
        "reasoning": {"effort": "minimal"},
    }
    data = post_json(URL_OPENROUTER, headers, body)
    if "error" in data:
        raise RuntimeError("OpenRouter lỗi: %s" % data["error"])
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("OpenRouter không trả về choices: %s" % str(data)[:300])
    usage = data.get("usage")
    if not isinstance(usage, dict) or "prompt_tokens" not in usage or "completion_tokens" not in usage:
        raise RuntimeError(
            "Phản hồi OpenRouter thiếu trường usage.prompt_tokens/completion_tokens (bật SHOW_RAW=True để xem)."
        )
    text = _extract_message_text(choices[0].get("message", {}).get("content", ""))
    return {
        "text": text,
        "tokens_in": int(usage["prompt_tokens"]),
        "tokens_out": int(usage["completion_tokens"]),
    }


def call_openai(system: str, user: str, model_name: str) -> dict:
    """Gọi OpenAI Chat Completions API."""
    _require_key_and_model("openai", model_name)
    messages = ([{"role": "system", "content": system}] if system else []) + [
        {"role": "user", "content": user}
    ]
    data = post_json(
        URL_OPENAI,
        {"Authorization": "Bearer " + API_KEY},
        {"model": model_name, "messages": messages, "temperature": 0.2},
    )
    usage = data["usage"]
    return {
        "text": _extract_message_text(data["choices"][0]["message"]["content"]),
        "tokens_in": int(usage["prompt_tokens"]),
        "tokens_out": int(usage["completion_tokens"]),
    }


def call_claude(system: str, user: str, model_name: str) -> dict:
    """Gọi Anthropic Claude Messages API."""
    _require_key_and_model("anthropic", model_name)
    data = post_json(
        URL_CLAUDE,
        {"x-api-key": API_KEY, "anthropic-version": "2023-06-01"},
        {
            "model": model_name,
            "max_tokens": 1024,
            "system": system or "",
            "messages": [{"role": "user", "content": user}],
        },
    )
    text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
    usage = data["usage"]
    return {
        "text": text.strip(),
        "tokens_in": int(usage["input_tokens"]),
        "tokens_out": int(usage["output_tokens"]),
    }


def call_ollama(system: str, user: str, model_name: str) -> dict:
    """Gọi model chạy cục bộ qua Ollama."""
    if not model_name:
        raise RuntimeError("Thiếu MODEL_NAME cho ollama trong .env.")
    messages = ([{"role": "system", "content": system}] if system else []) + [
        {"role": "user", "content": user}
    ]
    data = post_json(
        URL_OLLAMA,
        {},
        {"model": model_name, "messages": messages, "stream": False},
        timeout=300,
    )
    return {
        "text": _extract_message_text(data["message"]["content"]),
        "tokens_in": int(data.get("prompt_eval_count", 0)),
        "tokens_out": int(data.get("eval_count", 0)),
    }


@model_call
def call_model(system: str, user: str, model: str = "") -> dict:
    if MODEL_PROVIDER == "fake":
        last = (user.strip().splitlines() or [""])[-1]
        return {
            "text": "[câu trả lời giả — chưa nối model] " + last[:60],
            "model": "fake",
            "tokens_in": 0,
            "tokens_out": 0,
        }

    chosen_model = (model or MODEL_NAME).strip()
    if MODEL_PROVIDER == "openrouter":
        r = call_openrouter(system, user, chosen_model)
    elif MODEL_PROVIDER == "openai":
        r = call_openai(system, user, chosen_model)
    elif MODEL_PROVIDER == "anthropic":
        r = call_claude(system, user, chosen_model)
    elif MODEL_PROVIDER == "ollama":
        r = call_ollama(system, user, chosen_model)
    else:
        raise NotImplementedError(
            "Chưa hỗ trợ MODEL_PROVIDER=%s trong codebase/ai.py (hỗ trợ: openrouter, openai, anthropic, ollama, fake)."
            % MODEL_PROVIDER
        )

    return {
        "text": r["text"],
        "model": chosen_model,
        "tokens_in": int(r["tokens_in"]),
        "tokens_out": int(r["tokens_out"]),
    }
