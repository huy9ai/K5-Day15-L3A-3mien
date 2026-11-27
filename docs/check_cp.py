"""Script ra soat tien do va bao mat repo nhom 3mien truoc moi checkpoint.

Chi doc, KHONG sua bat ky file nao trong repo.

Cach chay:
    python docs/check_cp.py cp2
    python docs/check_cp.py cp3
    python docs/check_cp.py cp4
    python docs/check_cp.py final
"""

import csv
import os
import re
import subprocess
import sys
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent

VALID_STAGES = ("cp2", "cp3", "cp4", "final")
RAW_BTC_FILES = {
    "events.csv",
    "learners.csv",
    "chat.csv",
    "answers.csv",
    "completed_items.csv",
    "class_events.csv",
    "rewards.csv",
}

# Ghep chuoi de tranh false positive khi chinh file nay duoc doc boi bo quet
KEY_PATTERNS = [
    ("OpenAI-style key", re.compile("sk" + "-[A-Za-z0-9]{20,}")),
    ("Google/Gemini key", re.compile("AI" + "za[0-9A-Za-z\\-_]{30,}")),
    ("Groq key", re.compile("gsk" + "_[A-Za-z0-9]{20,}")),
]

TEXT_EXTS = {
    ".py", ".md", ".txt", ".csv", ".yaml", ".yml", ".json", ".toml", ".env", ".sh", ".ps1",
}


def run_cmd(args, cwd=ROOT, env=None):
    return subprocess.run(
        args,
        cwd=str(cwd),
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


def read_text(rel_path: str) -> str:
    p = ROOT / rel_path
    if not p.exists():
        return ""
    return p.read_text(encoding="utf-8-sig", errors="replace")


def read_csv_rows(rel_path: str):
    p = ROOT / rel_path
    if not p.exists():
        return [], []
    text = p.read_text(encoding="utf-8-sig", errors="replace")
    delim = ";" if text.split("\n", 1)[0].count(";") > text.split("\n", 1)[0].count(",") else ","
    reader = csv.DictReader(text.splitlines(), delimiter=delim)
    fields = [c.strip() for c in (reader.fieldnames or [])]
    rows = []
    for r in reader:
        if any((v or "").strip() for v in r.values() if v is not None):
            rows.append(r)
    return fields, rows


def print_row(status: str, owner: str, item: str, detail: str = ""):
    tag = f"[{status}]".ljust(10)
    own = f"[{owner}]".ljust(10)
    line = f"  {tag} {own} {item}"
    if detail:
        line += f" -> {detail}"
    print(line)


def check_security():
    print("\n=== 1. BAO MAT & LUAT CUNG (-10 DIEM NEU VI PHAM) ===")
    res = run_cmd(["git", "ls-files"])
    if res.returncode != 0:
        print_row("CANH BAO", "Ca nhom", "Khong doc duoc git ls-files", res.stderr.strip())
        return
    tracked = [line.strip() for line in res.stdout.splitlines() if line.strip()]

    env_tracked = [f for f in tracked if Path(f).name == ".env"]
    if env_tracked:
        print_row("CHUA DAT", "Thinh", "File .env dang bi commit tren Git!", ", ".join(env_tracked))
    else:
        print_row("OK", "Ca nhom", "Khong co file .env nao bi commit")

    btc_tracked = [f for f in tracked if Path(f).name in RAW_BTC_FILES]
    if btc_tracked:
        print_row("CHUA DAT", "Hau", "Co file CSV goc cua BTC trong repo!", ", ".join(btc_tracked))
    else:
        print_row("OK", "Ca nhom", "Khong co file CSV goc cua BTC trong repo")

    key_hits = []
    for rel_f in tracked:
        norm = rel_f.replace("\\", "/")
        if norm in ("docs/check_cp.py", ".env.example"):
            continue
        p = ROOT / rel_f
        if p.suffix.lower() not in TEXT_EXTS or not p.is_file():
            continue
        try:
            content = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for label, pat in KEY_PATTERNS:
            if pat.search(content):
                key_hits.append(f"{norm} ({label})")
    if key_hits:
        print_row("CHUA DAT", "Ca nhom", "Phat hien nghi van API key trong file tracked", "; ".join(key_hits))
    else:
        print_row("OK", "Ca nhom", "Khong phat hien API key trong cac file tracked")


def check_git_status():
    print("\n=== 2. TRANG THAI GIT & COMMIT GAN NHAT ===")
    branch = run_cmd(["git", "status", "-sb"])
    for line in branch.stdout.splitlines():
        print(" ", line)
    logs = run_cmd(["git", "log", "-n", "5", "--pretty=format:%h | %an | %ad | %s", "--date=format:%d/%m %H:%M"])
    print("  5 commit gan nhat:")
    for line in logs.stdout.splitlines():
        print("   ", line)


def check_run_py():
    print("\n=== 3. KET QUA `python run.py check` ===")
    res = run_cmd([sys.executable, "run.py", "check"])
    out = res.stdout.strip()
    if out:
        for line in out.splitlines():
            print(" ", line)
    if res.returncode != 0 and res.stderr.strip():
        print("  STDERR:", res.stderr.strip())


def smoke_test_agent():
    """Chay thu answer('LLM la gi?') trong subprocess sach de khong sua file."""
    code = (
        "import sys, os; "
        "sys.path.insert(0, os.path.join(os.getcwd(), 'codebase')); "
        "from agent import answer; "
        "r = answer('LLM la gi?'); "
        "assert isinstance(r, dict) and isinstance(r.get('output'), str) and len(r['output'].strip()) > 0, f'Bad return: {r}'; "
        "print(r['output'][:120].replace('\\n', ' '))"
    )
    env = dict(os.environ)
    env["PYTHONIOENCODING"] = "utf-8"
    return run_cmd([sys.executable, "-c", code], cwd=ROOT, env=env)


def check_second_evidence():
    # Kiem tra nguon bang chung thu hai: khao sat (>=20 phieu) HOAC phong van (>=3 file)
    survey_csv = ROOT / "evidence" / "survey" / "results.csv"
    survey_q = ROOT / "evidence" / "survey" / "questions.md"
    iv_dir = ROOT / "evidence" / "interviews"
    iv_files = sorted(p for p in iv_dir.glob("P*.md")) if iv_dir.is_dir() else []

    if survey_csv.exists():
        _, srows = read_csv_rows("evidence/survey/results.csv")
        has_q = survey_q.exists()
        if len(srows) >= 20 and has_q:
            print_row("OK", "Ca nhom", f"Khao sat dat nguong R1 ({len(srows)} phieu >= 20, co questions.md)")
            return
        print_row("CANH BAO", "Ca nhom", f"Khao sat hien co {len(srows)} phieu (can >=20 va questions.md)")
        return

    filled = []
    empty = []
    for p in iv_files:
        txt = p.read_text(encoding="utf-8-sig", errors="replace")
        has_quote = bool(re.search(r'-\s*"[^…"\n]{5,}"', txt))
        has_notes = "- __" not in txt and "Lần gần nhất: __" not in txt
        if has_quote or has_notes:
            filled.append(p.name)
        else:
            empty.append(p.name)
    if len(filled) >= 3:
        print_row("OK", "Ca nhom", f"Phong van dat nguong ({len(filled)} file co noi dung)", ", ".join(filled))
    else:
        detail = f"co file: {[p.name for p in iv_files]}; da dien: {filled or 'chua co'}; con trong: {empty or 'chua tao P2-P4'}"
        print_row("CANH BAO", "Ca nhom", "Nguon thu hai (can khao sat >=20 HOAC phong van >=3 truoc CP3)", detail)


def check_cp2():
    print("\n=== 4. KIEM TRA CHI TIET MOC CP2 (19:30 THU SAU 27/11) ===")
    # [Huy] canvas.md + spec.md
    canvas_txt = read_text("canvas.md")
    cp2_line = ""
    for line in canvas_txt.splitlines():
        if line.strip().startswith("|") and "Đã đổi gì so với CP1" in line:
            cp2_line = line
            break
    cp2_cells = [c.strip() for c in cp2_line.strip("|").split("|")] if cp2_line else []
    if len(cp2_cells) >= 3 and cp2_cells[2]:
        print_row("OK", "Huy", "canvas.md da co dong 'Da doi gi so voi CP1'")
    else:
        print_row("CHUA DAT", "Huy", "canvas.md thieu noi dung dong 'Da doi gi so voi CP1'")

    spec_txt = read_text("spec.md")
    has_mermaid = "```mermaid" in spec_txt
    if has_mermaid:
        print_row("OK", "Huy", "spec.md §4 da co so do Mermaid")
    else:
        print_row("CHUA DAT", "Huy", "spec.md §4 chua co so do Mermaid")

    sec7 = spec_txt.split("## §7.")[1].split("## §8.")[0] if "## §7." in spec_txt and "## §8." in spec_txt else ""
    if sec7 and "≥ __%" not in sec7:
        print_row("OK", "Huy", "spec.md §7 da chot chuan 'dat' bang so (khong sua sau CP2)")
    else:
        print_row("CHUA DAT", "Huy", "spec.md §7 chua chot chuan 'dat' bang so")

    # [Thinh] DATA_CARD.md + codebase/tools.py + smoke test
    dc_txt = read_text("data/DATA_CARD.md")
    if dc_txt and "__" not in dc_txt and "[tên]" not in dc_txt:
        print_row("OK", "Thinh", "data/DATA_CARD.md da dien ban dau")
    else:
        print_row("CHUA DAT", "Thinh", "data/DATA_CARD.md chua dien hoac con cho trong (__ / [tên])")

    tools_txt = read_text("codebase/tools.py")
    if "def search_lesson" in tools_txt:
        print_row("OK", "Thinh", "codebase/tools.py da co ham search_lesson")
    else:
        print_row("CHUA DAT", "Thinh", "codebase/tools.py chua co search_lesson (dang con mau search_example)")

    sm = smoke_test_agent()
    if sm.returncode == 0:
        print_row("OK", "Thinh", "Smoke test answer('LLM la gi?') chay thong", sm.stdout.strip())
    else:
        print_row("CHUA DAT", "Thinh", "Smoke test codebase/agent.py bi loi", sm.stderr.strip() or sm.stdout.strip())

    # [Hau] eval/benchmark.csv >=10 cau + eval/metric_spec.yaml >=3 metric
    _, bench_rows = read_csv_rows("eval/benchmark.csv")
    sample_cnt = sum(1 for r in bench_rows if "(ví dụ" in " ".join(str(v) for v in r.values()))
    if len(bench_rows) >= 10 and sample_cnt == 0:
        print_row("OK", "Hau", f"eval/benchmark.csv co {len(bench_rows)} cau (>=10) va da xoa dong mau")
    else:
        print_row("CHUA DAT", "Hau", f"eval/benchmark.csv dang co {len(bench_rows)} cau, {sample_cnt} dong mau (CP2 can >=10 cau, 0 mau)")

    ms_txt = read_text("eval/metric_spec.yaml")
    if "<metric_1>" not in ms_txt and "<định nghĩa" not in ms_txt and ms_txt.count("- name:") >= 3:
        print_row("OK", "Hau", "eval/metric_spec.yaml da dien >=3 metric")
    else:
        print_row("CHUA DAT", "Hau", "eval/metric_spec.yaml chua dien du >=3 metric (con mau <...>)")

    check_second_evidence()


def check_cp3():
    check_cp2()
    print("\n=== 5. KIEM TRA CHI TIET MOC CP3 (10:00 THU BAY 28/11) ===")
    # [Hau] evidence/summary.md + benchmark 20-30 + run-1.csv
    sum_txt = read_text("evidence/summary.md")
    if sum_txt and sum_txt.count("__") <= 1:
        print_row("OK", "Hau", "evidence/summary.md da tong hop")
    else:
        print_row("CHUA DAT", "Hau", "evidence/summary.md chua dien du (con __)")

    _, bench_rows = read_csv_rows("eval/benchmark.csv")
    types = [r.get("type", "").strip() for r in bench_rows]
    kho_n = types.count("kho")
    tc_n = types.count("tu_choi")
    real_n = sum(1 for r in bench_rows if re.match(r"\s*(nguoi_dung|data_that)\b", r.get("source", ""), re.I))
    if 20 <= len(bench_rows) <= 30 and kho_n >= 5 and tc_n >= 2 and real_n * 3 >= len(bench_rows):
        print_row("OK", "Hau", f"benchmark.csv dat chuan CP3 ({len(bench_rows)} cau: kho={kho_n}, tu_choi={tc_n}, nguon_that={real_n})")
    else:
        print_row("CHUA DAT", "Hau", f"benchmark.csv chua dat CP3 (so_cau={len(bench_rows)}/20-30, kho={kho_n}/>=5, tu_choi={tc_n}/>=2, nguon_that={real_n})")

    # run-1.csv & real AI check [Thinh + Hau]
    run1 = ROOT / "eval" / "run-1.csv"
    if not run1.exists():
        print_row("CHUA DAT", "Hau/Thinh", "Chua co eval/run-1.csv (chay `python run.py eval` voi model that)")
    else:
        _, r1_rows = read_csv_rows("eval/run-1.csv")
        ungraded = sum(1 for r in r1_rows if not (r.get("pass") or "").strip())
        models = { (r.get("model") or "").strip() for r in r1_rows }
        toks = sum(int(r.get("tokens_in") or 0) + int(r.get("tokens_out") or 0) for r in r1_rows)
        if ungraded == 0 and len(r1_rows) > 0:
            print_row("OK", "Hau", f"eval/run-1.csv da cham du {len(r1_rows)}/{len(r1_rows)} cau")
        else:
            print_row("CHUA DAT", "Hau", f"eval/run-1.csv con {ungraded} o pass de trong")
        if toks > 0 and not (models <= {"mock", "fake", ""}):
            print_row("OK", "Thinh", f"eval/run-1.csv da goi AI that (model={sorted(models)}, tong token={toks})")
        else:
            print_row("CHUA DAT", "Thinh", f"eval/run-1.csv chua co dau hieu goi AI that (model={sorted(models)}, token={toks})")

    # [Thai] personas.yaml + simulate-try.csv
    per_txt = read_text("cost/personas.yaml")
    if per_txt and "(ví dụ)" not in per_txt and "<" not in per_txt and "____" not in per_txt:
        print_row("OK", "Thai", "cost/personas.yaml da dien")
    else:
        print_row("CHUA DAT", "Thai", "cost/personas.yaml van con dong mau (vi du) / <...> / ____")

    sim_files = list((ROOT / "cost").glob("simulate-*.csv")) if (ROOT / "cost").is_dir() else []
    if sim_files:
        print_row("OK", "Thai", "Da co file mo phong chi phi", ", ".join(p.name for p in sorted(sim_files)))
    else:
        print_row("CANH BAO", "Thai", "Chua thay cost/simulate-try.csv (nen thu 10 phien truoc CP3)")

    # [Hau/Thai] Kiem tra doi chieu 2 nguoi cham (R4) & bang >=3 loi cu the (R5)
    eval_readme = read_text("eval/README.md")
    if "Đối chiếu giữa hai người chấm:** Chưa có" in eval_readme or "khớp __/5" in eval_readme:
        print_row("CANH BAO", "Hau/Thai", "eval/README.md chua ghi ket qua cham cheo 5 output giua 2 nguoi (can khop >=4/5 cho R4)")
    else:
        print_row("OK", "Hau/Thai", "eval/README.md da co ket qua doi chieu 2 nguoi cham")

    eval_rep = read_text("eval/report.md")
    if "| Input | Output |" in eval_rep or "| Câu | Input | Output |" in eval_rep:
        print_row("OK", "Hau", "eval/report.md da co bang chi tiet >=3 loi cu the (Input/Output/Vi sao sai)")
    else:
        print_row("CANH BAO", "Hau", "eval/report.md nen bo sung bang >=3 loi cu the (Cau | Input | Output | Vi sao sai) cho R5")


def check_cp4():
    check_cp3()
    print("\n=== 6. KIEM TRA CHI TIET MOC CP4 (14:30 THU BAY 28/11) ===")
    # [Hau] run-2.csv, eval/report.md, eval/README.md
    run2 = ROOT / "eval" / "run-2.csv"
    if run2.exists():
        _, r2_rows = read_csv_rows("eval/run-2.csv")
        ungraded2 = sum(1 for r in r2_rows if not (r.get("pass") or "").strip())
        if ungraded2 == 0 and r2_rows:
            print_row("OK", "Hau", f"eval/run-2.csv da cham du {len(r2_rows)} cau")
        else:
            print_row("CHUA DAT", "Hau", f"eval/run-2.csv con {ungraded2} o pass de trong")
    else:
        print_row("CHUA DAT", "Hau", "Chua co eval/run-2.csv")

    for doc in ("eval/report.md", "eval/README.md"):
        t = read_text(doc)
        if t and t.count("__") <= 1:
            print_row("OK", "Hau", f"{doc} da dien")
        else:
            print_row("CHUA DAT", "Hau", f"{doc} con cho trong __")

    # [Thai] simulate-N.csv >=50 phien, cost-estimate.md, slides, validation
    sim_n = sorted(p for p in (ROOT / "cost").glob("simulate-[0-9]*.csv")) if (ROOT / "cost").is_dir() else []
    if sim_n:
        _, srows = read_csv_rows(f"cost/{sim_n[-1].name}")
        if len(srows) >= 50:
            print_row("OK", "Thai", f"cost/{sim_n[-1].name} co {len(srows)} phien (>=50)")
        else:
            print_row("CHUA DAT", "Thai", f"cost/{sim_n[-1].name} moi co {len(srows)} phien (can >=50)")
    else:
        print_row("CHUA DAT", "Thai", "Chua co cost/simulate-N.csv")

    ce_txt = read_text("cost/cost-estimate.md")
    if ce_txt and ce_txt.count("__") <= 1:
        print_row("OK", "Thai", "cost/cost-estimate.md da dien")
    else:
        print_row("CHUA DAT", "Thai", "cost/cost-estimate.md con cho trong __")

    slide_files = [
        p.name for p in ROOT.iterdir()
        if p.is_file() and p.suffix.lower() in {".pdf", ".pptx", ".html", ".key"}
    ]
    if slide_files:
        print_row("OK", "Thai", "Da co file slide o thu muc goc", ", ".join(slide_files))
    else:
        print_row("CANH BAO", "Thai", "Chua thay file slide (.pdf/.pptx/.html) trong repo — nho nop link slide o form CP4 neu khong de file")

    val_txt = read_text("validation/log.md")
    if val_txt and "__" not in val_txt and "…" not in val_txt:
        print_row("OK", "Thai", "validation/log.md (Bonus +5d) da co ghi chep")
    else:
        print_row("CANH BAO", "Thai", "validation/log.md (Bonus +5d) chua hoan thien")

    # [Huy] spec.md §8
    spec_txt = read_text("spec.md")
    sec8 = spec_txt.split("## §8.")[1].split("## §9.")[0] if "## §8." in spec_txt and "## §9." in spec_txt else ""
    if sec8 and "__" not in sec8:
        print_row("OK", "Huy", "spec.md §8 da cap nhat so lieu chi phi")
    else:
        print_row("CHUA DAT", "Huy", "spec.md §8 chua dien xong so lieu chi phi")


def check_final():
    check_cp4()
    print("\n=== 7. KIEM TRA HAN CHOT 23:59 THU BAY 28/11 (REFLECTION) ===")
    ref_dir = ROOT / "reflection"
    refs = sorted(p for p in ref_dir.glob("*.md") if p.name != "TEMPLATE.md") if ref_dir.is_dir() else []
    incomplete = [p.name for p in refs if "____" in p.read_text(encoding="utf-8-sig", errors="replace")]
    if len(refs) >= 4 and not incomplete:
        print_row("OK", "Ca nhom", f"Da du {len(refs)} file reflection", ", ".join(p.name for p in refs))
    else:
        print_row("CHUA DAT", "Ca nhom", f"Reflection hien co {len(refs)}/4 file; chua xong: {incomplete or 'thieu file'}")


def main():
    stage = (sys.argv[1] if len(sys.argv) > 1 else "cp2").lower()
    if stage not in VALID_STAGES:
        print(f"Cach dung: python docs/check_cp.py [{'|'.join(VALID_STAGES)}]")
        sys.exit(2)

    print(f"=== RA SOAT REPO NHOM 3MIEN · MOC: {stage.upper()} ===")
    check_security()
    check_git_status()
    check_run_py()

    if stage == "cp2":
        check_cp2()
    elif stage == "cp3":
        check_cp3()
    elif stage == "cp4":
        check_cp4()
    else:
        check_final()


if __name__ == "__main__":
    main()
