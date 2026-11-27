"""Script dem ket qua khao sat hanh vi hoc pre-class (Nhom 3mien - Track A).

Chay lai:
    python evidence/survey/count_survey.py
"""

import csv
import sys
from collections import Counter
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

CSV_PATH = Path(__file__).resolve().parent / "results.csv"


def print_single(rows: list, col: str, title: str):
    n = len(rows)
    c = Counter((r.get(col) or "").strip() for r in rows)
    print(f"\n=== {title} (n={n}) ===")
    for k, v in c.most_common():
        label = k or "(bo trong)"
        print(f"  {label}: {v}/{n} ({v / n * 100:.1f}%)")


def print_contains(rows: list, col: str, title: str, targets: list):
    n = len(rows)
    print(f"\n=== {title} (n={n}, chon nhieu) ===")
    for t in targets:
        v = sum(1 for r in rows if t in (r.get(col) or ""))
        print(f"  {t}: {v}/{n} ({v / n * 100:.1f}%)")


def print_summary(rows: list, label: str):
    n = len(rows)
    cols = list(rows[0].keys())
    n_ever = sum(1 for r in rows if r[cols[1]].strip() not in ("Chưa gặp", "Không nhớ", ""))
    n_ge3 = sum(1 for r in rows if r[cols[1]].strip() in ("3–5 lần", "6–10 lần", "Trên 10 lần"))
    n_not_resolved = sum(
        1 for r in rows
        if r[cols[7]].strip() in (
            "Làm tiếp được nhưng chưa hiểu rõ",
            "Phải chuyển sang cách hỗ trợ khác mới giải quyết được",
            "Bỏ qua hoặc dừng học",
            "Vẫn chưa giải quyết được",
        )
    )
    n_ge5m = sum(1 for r in rows if r[cols[8]].strip() in ("5–15 phút", "16–30 phút", "31–60 phút"))
    n_ge16m = sum(1 for r in rows if r[cols[8]].strip() in ("16–30 phút", "31–60 phút"))
    n_need = sum(
        1 for r in rows
        if ("Chỉ đúng đoạn cần xem" in r[cols[9]] or "Được hỏi lại để làm rõ" in r[cols[9]])
    )
    n_ai_ext = sum(1 for r in rows if "Hỏi AI ngoài nền tảng" in r[cols[4]])
    n_ta_pre = sum(1 for r in rows if "Hỏi trợ giảng AI trên pre-class" in r[cols[4]])
    n_video = sum(1 for r in rows if r[cols[2]].strip() == "Xem video")

    print(f"\n=== TONG HOP CHI SO CHINH · {label} (n={n}) ===")
    print(f"  Gap >=1 lan trong thang qua: {n_ever}/{n} ({n_ever / n * 100:.1f}%)")
    print(f"  Gap >=3 lan trong thang qua: {n_ge3}/{n} ({n_ge3 / n * 100:.1f}%)")
    print(f"  Vuong khi 'Xem video': {n_video}/{n} ({n_video / n * 100:.1f}%)")
    print(f"  Tim tro giup 'Hoi AI ngoai nen tang': {n_ai_ext}/{n} ({n_ai_ext / n * 100:.1f}%)")
    print(f"  Tim tro giup 'Hoi tro giang AI tren pre-class': {n_ta_pre}/{n} ({n_ta_pre / n * 100:.1f}%)")
    print(f"  Ket qua CHUA giai quyet tron ven: {n_not_resolved}/{n} ({n_not_resolved / n * 100:.1f}%)")
    print(f"  Mat >=5 phut/lan: {n_ge5m}/{n} ({n_ge5m / n * 100:.1f}%) | >=16 phut/lan: {n_ge16m}/{n} ({n_ge16m / n * 100:.1f}%)")
    print(f"  Chon 'Chi dung doan can xem' hoac 'Duoc hoi lai de lam ro': {n_need}/{n} ({n_need / n * 100:.1f}%)")


def main():
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        print("Khong co dong du lieu nao trong results.csv")
        sys.exit(1)

    cols = list(rows[0].keys())
    print(f"Tong so phieu hop le da an danh: {len(rows)}")

    print_single(rows, cols[1], "Q1. Tan suat gap tinh huong vuong/thang")
    print_single(rows, cols[2], "Q2. Boi canh lan gan nhat")
    print_contains(rows, cols[3], "Q3. Can giai quyet dieu gi", [
        "Hiểu khái niệm", "Hiểu ví dụ", "Biết cách áp dụng",
        "Hiểu vì sao trả lời sai", "Sửa lỗi thực hành", "Tìm lại đoạn bài",
    ])
    print_contains(rows, cols[4], "Q4. Kenh tim tro giup", [
        "Hỏi AI ngoài nền tảng", "Xem lại bài", "Hỏi trợ giảng AI trên pre-class",
        "Hỏi bạn học", "Hỏi coach", "Tự tìm trên mạng", "Group preclass ở zalo",
    ])
    print_contains(rows, cols[5], "Q5. Ly do chon kenh", [
        "Có sẵn, dễ dùng", "Mong nhận phản hồi nhanh", "Tin nguồn đó",
        "Có thể hỏi tiếp", "Cách trước chưa giải quyết được",
    ])
    print_contains(rows, cols[6], "Q6. Cach kiem tra cau tra loi", [
        "Đối chiếu bài học", "Thử làm lại", "Hỏi nguồn khác",
        "Chưa kiểm tra", "Không biết cách kiểm tra", "Chưa nhận được hướng dẫn",
    ])
    print_single(rows, cols[7], "Q7. Ket qua cuoi cung")
    print_single(rows, cols[8], "Q8. Thoi gian ton moi lan")
    print_contains(rows, cols[9], "Q9. Yeu to giup lam tiep hieu qua", [
        "Giải thích dễ hiểu", "Có ví dụ sát bài", "Chỉ đúng đoạn cần xem",
        "Gợi ý từng bước", "Được hỏi lại để làm rõ", "Chưa có lần hỗ trợ hiệu quả",
    ])

    print_summary(rows, "TOAN BO 28 PHIEU")
    sub_ever = [r for r in rows if r[cols[1]].strip() not in ("Chưa gặp", "Không nhớ", "")]
    print_summary(sub_ever, "TAP CON GAP >=1 LAN")


if __name__ == "__main__":
    main()
