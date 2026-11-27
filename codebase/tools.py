"""Công cụ của bài toán — NHÓM VIẾT (Ngô Đức Thịnh), khớp spec.md §4.

Gồm đúng 2 công cụ CHỈ ĐỌC (không tác động ra ngoài), đọc từ `data/lessons.json`:
  1. search_lesson(query: str, top_k: int = 3) -> list
  2. get_passage(code: str) -> dict | None

Mỗi công cụ đều gắn @tool để khung tracing tự ghi tên, input, output rút gọn, thời gian và lỗi.
Chỉ dùng thư viện chuẩn của Python.
"""
import json
import math
import os
import re
import unicodedata
from collections import Counter

from tracing import tool, TOOLS  # noqa: F401

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS_PATH = os.path.join(ROOT, "data", "lessons.json")

_LESSONS_CACHE = None
_LESSONS_MTIME = None

# Từ hư / từ hỏi phổ biến trong tiếng Việt
STOPWORDS = {
    "a", "ai", "anh", "ba", "ban", "bao", "bi", "bo", "cac", "cai", "can", "chi",
    "cho", "chu", "chua", "co", "con", "cua", "cung", "da", "dang", "day", "de",
    "den", "di", "do", "duoc", "em", "giai", "gi", "giup", "hay", "het", "hieu",
    "hoi", "hon", "it", "khac", "khi", "khong", "ko", "k", "la", "lai", "lam",
    "len", "luc", "ma", "may", "minh", "mot", "muon", "nao", "nay", "nen", "neu",
    "ngay", "nguoi", "nha", "nhe", "nhieu", "nhu", "nhung", "noi", "o", "phai",
    "qua", "ra", "rat", "roi", "sao", "se", "so", "tai", "tao", "ten", "the",
    "thi", "thich", "them", "thu", "to", "toi", "trong", "tren", "tu", "va", "vao",
    "vay", "ve", "vi", "viec", "voi", "vua", "xem", "xin",
}

# Thuật ngữ chuyên ngành đơn từ trong 13 ngày học L3 (đứng 1 mình vẫn mang nghĩa rõ)
DOMAIN_UNIGRAMS = {
    "llm", "hallucination", "token", "temperature", "transformer", "gpu", "autoregressive",
    "chatbot", "discovery", "baseline", "target", "hypothesis", "slice", "react", "trace",
    "thought", "action", "observation", "agentic", "prompt", "cot", "antipattern", "mcp",
    "schema", "docstring", "autonomy", "fallback", "prd", "uncertainty", "ingestion",
    "stale", "extraction", "cascade", "rag", "retrieval", "chunk", "chunking", "indexing",
    "recall", "grounding", "workflow", "agent", "max_steps", "idempotent", "eval",
    "evaluation", "taxonomy", "calibration", "grader", "metric", "benchmark", "poc",
    "pilot", "trifecta", "guardrail", "guardrails", "injection", "exfiltration", "hitl",
    "deterministic", "asr", "utility", "harness", "sdlc", "oracle", "mutation",
    "economics", "retry", "simulate", "persona", "usage", "adoption", "outcome",
    "pii", "synthetic", "seed", "bias", "rubric", "g10", "preclass", "api",
}

OVERVIEW_PHRASES = {
    "noi dung", "hoc gi", "hoc j", "tom tat", "gom nhung gi", "gom nhung j", "co gi", "co j",
    "chu de", "tong quan", "muc luc", "cac muc", "cac phan", "nhung phan nao",
    "mo bai", "mo day", "chuyen sang", "chuyen den", "sang bai", "sang day", "xem bai", "xem day", "den bai", "den day",
}


OVERVIEW_NOISE_TOKENS = {
    "day", "ngay", "bai", "noi", "dung", "hoc", "gi", "tom", "tat", "gom", "nhung",
    "chu", "de", "tong", "quan", "muc", "luc", "cac", "phan", "mo", "chuyen", "sang",
    "den", "xem", "nay", "ve", "la", "co", "nao", "giai", "thich", "cho", "minh", "giup",
    "bat", "dau", "tu", "phut", "thu", "may", "gio", "giay", "moc", "thoi", "gian",
}


def _is_day_overview_query(norm_q: str, q_tokens: list) -> bool:
    """Chỉ xem là câu hỏi tổng quan cả ngày khi KHÔNG chứa từ khoá khái niệm cụ thể (vd '5 khuôn workflow')."""
    non_overview_tokens = [
        t for t in q_tokens
        if t not in OVERVIEW_NOISE_TOKENS and not re.match(r"^(?:day|ngay|bai|d)?0?\d{1,2}$", t)
    ]
    if non_overview_tokens:
        return False
    return any(p in norm_q for p in OVERVIEW_PHRASES) or len(q_tokens) <= 2


def _strip_accents(text: str) -> str:
    """Bỏ dấu tiếng Việt và chuyển về chữ thường."""
    text = text.replace("đ", "d").replace("Đ", "D")
    nfd = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in nfd if unicodedata.category(ch) != "Mn").lower()


def _tokenize(text: str, drop_stopwords: bool = True) -> list:
    """Tách từ không dấu gồm chữ cái, chữ số, gạch dưới và dấu gạch nối."""
    norm = _strip_accents(text)
    raw_tokens = re.findall(r"[a-z0-9@][a-z0-9_@-]*", norm)
    if not drop_stopwords:
        return raw_tokens
    return [t for t in raw_tokens if t not in STOPWORDS and len(t) >= 2]


def _bigrams(tokens: list) -> set:
    return {"%s %s" % (tokens[i], tokens[i + 1]) for i in range(len(tokens) - 1)}


def _extract_day_hint(text: str) -> str:
    """Nhận diện gợi ý ngày học trong câu hỏi, vd 'Day01', 'day 5', 'ngày 9'."""
    norm = _strip_accents(text)
    m = re.search(r"\b(?:day|ngay|bai)\s*0?(\d{1,2})\b", norm)
    if not m:
        m = re.search(r"\bd0?(\d{1,2})(?:[-_ ]r\d+[-_ ]v\d+|[-_ ]s\d+)\b", norm)
    if m:
        return "Day%02d" % int(m.group(1))
    return ""


def _load_index() -> tuple:
    """Đọc và cache chỉ mục đoạn bài giảng từ data/lessons.json (tự nạp lại khi file thay đổi)."""
    global _LESSONS_CACHE, _LESSONS_MTIME
    if not os.path.exists(LESSONS_PATH):
        raise FileNotFoundError("Không tìm thấy kho bài giảng mẫu tại: %s" % LESSONS_PATH)
    mtime = os.path.getmtime(LESSONS_PATH)
    if _LESSONS_CACHE is not None and _LESSONS_MTIME == mtime:
        return _LESSONS_CACHE
    with open(LESSONS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    segments = data.get("segments", [])

    doc_freq = Counter()
    indexed = []
    for seg in segments:
        kc_list = seg.get("kc_codes", [])
        kc_phrases = [k.replace("_", " ").lower() for k in kc_list]
        kw_phrases = [_strip_accents(k) for k in seg.get("keywords", []) if k.strip()] + kc_phrases
        kw_str = " ".join(kw_phrases)
        title_str = "%s %s %s" % (
            seg.get("lesson_title", ""),
            seg.get("title", seg.get("topic", "")),
            seg.get("video_title", ""),
        )
        body_str = seg.get("text", "")

        title_raw = _tokenize(title_str, drop_stopwords=False)
        body_raw = _tokenize(body_str, drop_stopwords=False)
        kw_tokens = set(_tokenize(kw_str, drop_stopwords=True)) | {k.lower() for k in kc_list}
        title_tokens = set(_tokenize(title_str, drop_stopwords=True))
        body_tokens = _tokenize(body_str, drop_stopwords=True)
        all_tokens = kw_tokens | title_tokens | set(body_tokens)

        title_bigrams = _bigrams(title_raw)
        body_bigrams = _bigrams(body_raw)
        kw_bigrams = set()
        for ph in kw_phrases:
            kw_bigrams |= _bigrams(_tokenize(ph, drop_stopwords=False))

        for tok in all_tokens:
            doc_freq[tok] += 1

        indexed.append({
            "raw": seg,
            "code_upper": seg.get("code", "").upper(),
            "transcript_ref_lower": seg.get("transcript_ref", "").lower(),
            "kc_lower": {k.lower() for k in kc_list},
            "lesson_norm": (seg.get("lesson") or seg.get("day") or "").strip(),
            "kw_phrases": kw_phrases,
            "kw_tokens": kw_tokens,
            "title_tokens": title_tokens,
            "body_tf": Counter(body_tokens),
            "title_bigrams": title_bigrams | kw_bigrams,
            "body_bigrams": body_bigrams,
        })

    n_docs = max(len(indexed), 1)
    idf = {tok: math.log((n_docs + 1) / (df + 1)) + 1.0 for tok, df in doc_freq.items()}
    _LESSONS_CACHE = (indexed, idf)
    _LESSONS_MTIME = mtime
    return _LESSONS_CACHE


def _format_passage(seg: dict, score: float | None = None) -> dict:
    item = {
        "code": seg["code"],
        "lesson": seg.get("lesson") or seg.get("day") or "",
        "timestamp": seg["timestamp"],
        "title": seg.get("title") or seg.get("topic") or "",
        "text": seg["text"],
    }
    if score is not None:
        item["score"] = round(score, 2)
    return item


def get_available_topics(limit: int = 3) -> list:
    """Hàm nội bộ (không phải @tool): lấy nhanh vài chủ đề tiêu biểu để gợi ý khi hỏi ngược (G10/G9)."""
    indexed, _ = _load_index()
    seen_days = set()
    picks = []
    for item in indexed:
        d = item["lesson_norm"]
        if d in seen_days:
            continue
        seen_days.add(d)
        raw = item["raw"]
        picks.append("%s: %s (%s)" % (d, raw.get("title", ""), raw["code"]))
        if len(picks) >= limit:
            break
    return picks


def get_available_lessons() -> list:
    """Hàm nội bộ (không phải @tool): trả danh sách tên các ngày học đang có trong data/lessons.json."""
    indexed, _ = _load_index()
    return sorted({item["lesson_norm"] for item in indexed if item["lesson_norm"]})


def get_valid_timestamps(code: str) -> set:
    """Hàm nội bộ (không phải @tool): trả tập các mốc mm:ss hợp lệ của một mã đoạn (gồm mốc chính và sub_slides)."""
    indexed, _ = _load_index()
    upper = (code or "").strip().strip("[]").upper()
    for item in indexed:
        if item["code_upper"] == upper:
            raw = item["raw"]
            ts = {str(raw.get("timestamp") or "").strip()}
            for sub in raw.get("sub_slides") or []:
                t = str(sub.get("timestamp") or "").strip()
                if t:
                    ts.add(t)
            return {t for t in ts if t}
    return set()


@tool
def search_lesson(query: str, top_k: int = 3) -> list:
    """Tên: search_lesson — Tra cứu các đoạn bài giảng pre-class khớp với câu hỏi từ data/lessons.json.
    Input: query (str — câu hỏi/từ khoá của học viên), top_k (int, mặc định 3).
    Output: list[dict] các đoạn khớp gồm {"code", "lesson", "timestamp", "title", "text", "score"}; trả [] nếu không khớp.
    Có tác động ra ngoài không: KHÔNG (chỉ đọc file cục bộ data/lessons.json)."""
    indexed, idf = _load_index()
    cleaned = (query or "").strip()
    if not cleaned:
        return []

    norm_q = _strip_accents(cleaned)
    q_raw_tokens = _tokenize(cleaned, drop_stopwords=False)
    q_tokens = _tokenize(cleaned, drop_stopwords=True)
    q_bigrams = _bigrams(q_raw_tokens)
    day_filter = _extract_day_hint(cleaned)

    # Nếu học viên nêu rõ cả ngày và số phần (vd "mở Day 7 phần 2", "xem phần 5 của Day 8") -> trả đúng đoạn Dxx-Syy
    if day_filter:
        part_m = re.search(r"\b(?:phan|muc|doan)\s*0?(\d{1,2})\b", norm_q)
        if part_m:
            day_num = int(day_filter.replace("Day", ""))
            target_code = "D%02d-S%02d" % (day_num, int(part_m.group(1)))
            for item in indexed:
                if item["code_upper"] == target_code:
                    return [_format_passage(item["raw"], 10.0)]

    # Nếu học viên hỏi tổng quan cả ngày (không kèm khái niệm cụ thể) -> trả đầy đủ tất cả các phần chính của ngày đó
    if day_filter and _is_day_overview_query(norm_q, q_tokens):
        day_segs = [item["raw"] for item in indexed if item["lesson_norm"].lower() == day_filter.lower()]
        return [_format_passage(seg, 5.0) for seg in day_segs]

    if not q_tokens:
        return []

    scored = []
    q_token_set = set(q_tokens)
    for item in indexed:
        if day_filter and item["lesson_norm"].lower() != day_filter.lower():
            continue

        score = 0.0
        strong_hits = 0

        if q_token_set & item["kc_lower"]:
            score += 8.0
            strong_hits += 1

        for phrase in item["kw_phrases"]:
            if len(phrase) >= 3 and re.search(r"(?<![a-z0-9])" + re.escape(phrase) + r"(?![a-z0-9])", norm_q):
                score += 6.0 if " " in phrase else 4.5
                strong_hits += 1

        for bg in q_bigrams:
            bg_parts = bg.split()
            if all(p in STOPWORDS for p in bg_parts):
                continue
            if bg in item["title_bigrams"]:
                score += 4.0
                strong_hits += 1
            elif bg in item["body_bigrams"]:
                score += 2.5
                strong_hits += 1

        for tok in q_token_set:
            w = idf.get(tok, 1.0)
            if tok in DOMAIN_UNIGRAMS:
                hit = False
                if tok in item["kw_tokens"]:
                    score += 3.0 * w
                    hit = True
                if tok in item["title_tokens"]:
                    score += 2.0 * w
                    hit = True
                if item["body_tf"].get(tok, 0) > 0:
                    score += 1.2 * w
                    hit = True
                if hit:
                    strong_hits += 1
            else:
                if tok in item["kw_tokens"] or tok in item["title_tokens"]:
                    score += 0.45
                elif item["body_tf"].get(tok, 0) > 0:
                    score += 0.25

        if strong_hits > 0 and score >= 3.0:
            scored.append((score, strong_hits, item["raw"]))

    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return [_format_passage(seg, sc) for sc, _, seg in scored[: max(1, int(top_k))]]


@tool
def get_passage(code: str) -> dict | None:
    """Tên: get_passage — Lấy nội dung đầy đủ và mốc giây của một đoạn bài giảng theo mã đoạn chuẩn (vd 'D01-S02').
    Input: code (str — mã đoạn dạng 'D01-S02', '[D01-S02]' hoặc đường dẫn transcript 'Day01/d01-r1-v02.txt@123').
    Output: dict gồm {"code", "lesson", "timestamp", "title", "text"} nếu tìm thấy, hoặc None nếu không tồn tại.
    Có tác động ra ngoài không: KHÔNG (chỉ đọc file cục bộ data/lessons.json)."""
    indexed, _ = _load_index()
    clean = (code or "").strip().strip("[]").strip()
    if not clean:
        return None
    upper = clean.upper()
    lower = clean.lower()
    for item in indexed:
        if item["code_upper"] == upper or item["transcript_ref_lower"] == lower:
            return _format_passage(item["raw"])
    return None
