"""Script dem bang chung pain tu data/preclass/ (Track A - Nhom 3mien).

Chay lai:
    python evidence/count_preclass.py <duong-dan-toi-thu-muc-preclass>
"""

import csv
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path


def iter_csv(path: Path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        yield from csv.DictReader(f)


def main() -> None:
    if len(sys.argv) < 2:
        print("Cach dung: python evidence/count_preclass.py <thu-muc-preclass>")
        sys.exit(1)

    base = Path(sys.argv[1])
    if not base.is_dir():
        print(f"Khong tim thay thu muc: {base}")
        sys.exit(1)

    learners = list(iter_csv(base / "learners.csv"))
    chat_rows = list(iter_csv(base / "chat.csv"))
    chat_map = {r["id"]: r for r in chat_rows}
    answers_rows = list(iter_csv(base / "answers.csv"))

    active_hv = set()
    ev_counts = Counter()
    vn_hours_chat = Counter()
    vn_hours_video = Counter()

    miss_by_ch = defaultdict(lambda: [0, 0])  # [False, True]
    cit_by_date = defaultdict(lambda: [0, 0])  # [no_cit, has_cit]
    ask_count_total = 0
    ask_count_gt0 = 0
    reask_hv = set()

    lab_skipped = Counter()
    agent_msg_shown_hv = set()
    discussion_reply_hv = set()

    ev_sent = {}
    ev_rep = {}

    for r in iter_csv(base / "events.csv"):
        hv = r["hv"]
        if hv:
            active_hv.add(hv)
        t = r["type"]
        ev_counts[t] += 1
        d = json.loads(r["data"]) if r["data"] else {}
        ts = r["occurred_at"]
        dt_vn = datetime.fromisoformat(ts.replace("Z", "+00:00")) + timedelta(hours=7)

        if t == "video_opened":
            vn_hours_video[dt_vn.hour] += 1
        elif t == "chat_sent":
            vn_hours_chat[dt_vn.hour] += 1
            ev_sent[r["ref_id"]] = (r, d)
            ac = d.get("ask_count")
            if ac is not None:
                ask_count_total += 1
                if int(ac) > 0:
                    ask_count_gt0 += 1
                    reask_hv.add(hv)
            if d.get("channel") == "video_discussion_reply":
                discussion_reply_hv.add(hv)
        elif t == "agent_replied":
            ev_rep[r["ref_id"]] = (r, d)
            c = chat_map.get(r["ref_id"], {})
            ch = c.get("channel", "unknown")
            miss_by_ch[ch][1 if d.get("missing_context") else 0] += 1
            day = ts[:10]
            cit_by_date[day][1 if d.get("moc_trich_dan") else 0] += 1
        elif t == "lab_completed":
            lab_skipped[str(d.get("skipped"))] += 1
        elif t == "agent_message_shown":
            agent_msg_shown_hv.add(hv)

    # 1. Quy mo
    print("=== 1. QUY MO TAP DU LIEU ===")
    print(f"learners.csv: {len(learners)} tai khoan")
    print(f"events.csv: {sum(ev_counts.values())} su kien, {len(active_hv)} hoc vien co hoat dong")
    print(f"chat.csv: {len(chat_rows)} luot chat, {len({r['hv'] for r in chat_rows})} hoc vien tung hoi AI")

    # 2. Hoc ngoai gio (19h-07h VN)
    after_chat = sum(c for h, c in vn_hours_chat.items() if h >= 19 or h < 8)
    tot_chat = sum(vn_hours_chat.values())
    after_vid = sum(c for h, c in vn_hours_video.items() if h >= 19 or h < 8)
    tot_vid = sum(vn_hours_video.values())
    print("\n=== 2. HOC NGOAI GIO (19:00-07:59 GIO VN = UTC+7) ===")
    print(f"chat_sent ngoai gio: {after_chat}/{tot_chat} ({after_chat/tot_chat*100:.1f}%)")
    print(f"video_opened ngoai gio: {after_vid}/{tot_vid} ({after_vid/tot_vid*100:.1f}%)")

    # 3. Cau ngan, missing_context, rubric 0, hoi lap
    short_q = sum(1 for r in chat_rows if int(r["do_dai_cau_hoi"] or 0) <= 15)
    vq_f, vq_t = miss_by_ch["video_question"]

    chat_graded = 0
    rubric_zero_both = 0
    ans_chat = {}
    pre_post_ok = 0
    pre_post_tot = 0
    lan_thu_ge2 = 0
    for r in answers_rows:
        if r["nguon"] == "chat":
            ans_chat[r["ref"]] = r
            if r["trang_thai_cham"] == "da_cham":
                chat_graded += 1
                if r["rubric_bam_bai"] == "0" and r["rubric_dung_ngu_canh"] == "0":
                    rubric_zero_both += 1
        if r["nguon"] == "pre_post_post" and r["lan_thu"] == "1" and r["was_correct"] in ("True", "False"):
            pre_post_tot += 1
            if r["was_correct"] == "True":
                pre_post_ok += 1
        if r["lan_thu"] and int(r["lan_thu"]) >= 2:
            lan_thu_ge2 += 1

    print("\n=== 3. CHAT LUONG CAU HOI & NGU CANH ===")
    print(f"Cau hoi ngan <= 15 ky tu: {short_q}/{len(chat_rows)} ({short_q/len(chat_rows)*100:.1f}%)")
    print(f"missing_context=True o video_question: {vq_t}/{vq_f+vq_t} ({vq_t/(vq_f+vq_t)*100:.1f}%)")
    print(f"Chat rubric bam_bai=0 va dung_ngu_canh=0: {rubric_zero_both}/{chat_graded} ({rubric_zero_both/chat_graded*100:.1f}%)")
    print(f"Hoi lap ask_count > 0 (tren tap co ghi ask_count): {ask_count_gt0}/{ask_count_total} ({ask_count_gt0/ask_count_total*100:.1f}%), {len(reask_hv)} hoc vien")

    # 4. Thieu moc trich dan tu ngay bat dau log (2026-11-13)
    first_cit_date = min(d for d, (no, yes) in cit_by_date.items() if yes > 0)
    no_after = sum(no for d, (no, yes) in cit_by_date.items() if d >= first_cit_date)
    yes_after = sum(yes for d, (no, yes) in cit_by_date.items() if d >= first_cit_date)
    tot_after = no_after + yes_after
    print("\n=== 4. TRICH DAN MOC BAI (CHI DEM TU NGAY BAT DAU LOG) ===")
    print(f"Ngay bat dau log moc_trich_dan: {first_cit_date}")
    print(f"Thieu moc_trich_dan tu {first_cit_date} tro di: {no_after}/{tot_after} ({no_after/tot_after*100:.1f}%)")

    # 5. Phan bo tan suat video_question (21 ngay -> dung cho persona)
    vq_cnt = Counter(r["hv"] for r in chat_rows if r["channel"] == "video_question")
    vals = sorted(vq_cnt.values())
    n = len(vals)
    low = [v for v in vals if v <= 2]
    mid = [v for v in vals if 3 <= v <= 10]
    high = [v for v in vals if v > 10]
    print("\n=== 5. TAN SUAT HOI VIDEO_QUESTION (21 NGAY, n=145 HOC VIEN) ===")
    print(f"Tong luot: {sum(vals)}, TB={sum(vals)/n:.2f}, median={vals[n//2]}")
    print(f"  Nhom it (1-2 luot): {len(low)}/{n} ({len(low)/n*100:.1f}%), TB={sum(low)/len(low):.1f}")
    print(f"  Nhom vua (3-10 luot): {len(mid)}/{n} ({len(mid)/n*100:.1f}%), TB={sum(mid)/len(mid):.1f}")
    print(f"  Nhom nhieu (>10 luot): {len(high)}/{n} ({len(high)/n*100:.1f}%), TB={sum(high)/len(high):.1f}")

    # 6. Chi so doi chung Huong 2 & Huong 3
    lab_done = lab_skipped["False"]
    lab_skip = lab_skipped["True"]
    lab_tot = lab_done + lab_skip
    disc_replies = sum(1 for r in chat_rows if r["channel"] == "video_discussion_reply")
    shown = ev_counts["agent_message_shown"]
    print("\n=== 6. CHI SO DOI CHUNG HUONG 2 & HUONG 3 ===")
    print(f"Huong 2 - lab_completed skipped=True: {lab_skip}/{lab_tot} ({lab_skip/lab_tot*100:.1f}%)")
    print(f"Huong 2 - pre_post_post lan 1 sai: {pre_post_tot - pre_post_ok}/{pre_post_tot} ({(pre_post_tot - pre_post_ok)/pre_post_tot*100:.1f}%), lan_thu>=2 toan bo answers: {lan_thu_ge2}/{len(answers_rows)}")
    print(f"Huong 3 - phan hoi ban hoc AI: {disc_replies}/{shown} ({disc_replies/shown*100:.2f}%), {len(discussion_reply_hv)}/{len(agent_msg_shown_hv)} ({len(discussion_reply_hv)/len(agent_msg_shown_hv)*100:.1f}%) hoc vien tra loi")

    # 7. 6 vi du cu the an danh
    target_ids = ["C00983", "C00837", "C00747", "C00846", "C01056", "C00378"]
    print("\n=== 7. VI DU CU THE (AN DANH) ===")
    for cid in target_ids:
        c = chat_map[cid]
        _, sd = ev_sent.get(cid, ({}, {}))
        _, rd = ev_rep.get(cid, ({}, {}))
        a = ans_chat.get(cid, {})
        dt_vn = datetime.fromisoformat(c["asked_at"].replace("Z", "+00:00")) + timedelta(hours=7)
        print(
            f"{cid} | hv={c['hv']} | {dt_vn.strftime('%Y-%m-%d %H:%M VN')} | {c['transcript']} | "
            f"q_len={c['do_dai_cau_hoi']} | a_len={c['do_dai_tra_loi']} | "
            f"miss={rd.get('missing_context')} | ask_count={sd.get('ask_count')} | "
            f"moc={rd.get('moc_trich_dan')} | rubric=({a.get('rubric_bam_bai')},{a.get('rubric_dung_ngu_canh')})"
        )


if __name__ == "__main__":
    main()
