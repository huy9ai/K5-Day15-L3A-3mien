# Đào data — cách đếm và kết quả

> Điền ở guide bước 1.2. Ôn lại: ngày 2, ngày 6 · lab ngày 2, lab ngày 6.
> Script đếm tái lập được: [`evidence/count_preclass.py`](count_preclass.py). Repo nhóm chỉ chứa số đã tổng hợp và 6 dòng ví dụ ẩn danh — không chép lại file gốc của BTC.

## 1. Cách đếm — viết TRƯỚC khi chạy

- **Nguồn và cách tải về máy:** [Đề Track A và dữ liệu BTC](../data/README.md).
- **Data dùng:** Bộ `data/preclass/` do BTC cấp (`learners.csv`, `events.csv`, `chat.csv`, `answers.csv`), dữ liệu từ **05/11/2026 đến 25/11/2026** (21 ngày, Day01 → Day13).
- **Đếm gì · trên tập nào · lọc gì:**
  1. Quy mô thực tế: tổng tài khoản ở `learners.csv` vs số `hv` có ít nhất 1 dòng trong `events.csv`.
  2. Tỉ lệ học & hỏi ngoài giờ (19:00–07:59 giờ Việt Nam = `occurred_at + 7h`): lọc `type = chat_sent` và `type = video_opened` trong `events.csv`.
  3. Tỉ lệ câu hỏi ngắn (`do_dai_cau_hoi <= 15` ký tự trên `chat.csv`), tỉ lệ `missing_context = True` ở kênh `video_question` (nối `events.csv[type=agent_replied].ref_id = chat.csv.id`), tỉ lệ câu chat bị chấm `rubric_bam_bai = 0` và `rubric_dung_ngu_canh = 0` trên tập đã chấm (`answers.csv[nguon=chat, trang_thai_cham=da_cham]`).
  4. Tỉ lệ hỏi lặp (`ask_count > 0`) trên các lượt `chat_sent` có ghi trường `ask_count`.
  5. Tỉ lệ thiếu mốc trích dẫn (`moc_trich_dan` rỗng) **chỉ đếm từ ngày 2026-11-13 trở đi** (ngày trường này bắt đầu được ghi log trong `events.csv`), tránh đếm gộp giai đoạn trước khi tính năng log tồn tại.
  6. Tần suất hỏi theo học viên (`channel = video_question`) chia 3 nhóm (ít 1–2 · vừa 3–10 · nhiều >10) làm căn cứ cho bảng Impact và Persona chi phí.
- **Mẫu số là gì:** Ghi riêng rõ từng mẫu số ở bảng kết quả (436 học viên hoạt động / 1.260 lượt chat / 1.108 lượt `video_question` / 1.223 lượt chat đã chấm rubric / 137 lượt có ghi `ask_count` / 615 lượt `agent_replied` từ 13/11 trở đi / 145 học viên hỏi dưới video).
- **Script:**
  ```bash
  python3 evidence/count_preclass.py data-btc/preclass
  ```

## 2. Đọc trước, đếm sau

Đã đọc `data/preclass/README.md`, `column_dictionary.csv`, `event_types.csv` và kiểm tra các dòng mẫu trước khi viết script. Các kiểu hành vi và bẫy dữ liệu phát hiện được:
- Trong 721 tài khoản `learners.csv`, chỉ có **436 học viên** phát sinh sự kiện hoạt động thực tế.
- Trường `moc_trich_dan` hoàn toàn trống trước ngày `2026-11-13` (645 lượt đầu tiên), bắt đầu có dữ liệu từ `2026-11-13` (615 lượt sau); `learning_mode` và `prompt_version` chỉ bắt đầu ghi từ `25/11/2026` (9 dòng chat).
- Không có nội dung chữ câu hỏi/câu trả lời trong bản xuất (chỉ có độ dài ký tự, giờ hỏi, file transcript và các cờ trạng thái).

## 3. Kết quả

| Đếm gì | x / N | % | Ghi chú |
|---|---|---|---|
| Tài khoản có hoạt động trên pre-class | 436 / 721 | 60,5% | Toàn bộ `events.csv` |
| Lượt hỏi AI (`chat_sent`) ngoài giờ 19h–07h VN | 493 / 1.260 | 39,1% | Đỉnh điểm 22h–00h VN (342 lượt) |
| Lượt mở video (`video_opened`) ngoài giờ 19h–07h VN | 2.707 / 7.254 | 37,3% | Thời điểm không có TA trực |
| Câu hỏi quá ngắn (`do_dai_cau_hoi <= 15` ký tự) | 150 / 1.260 | 11,9% | Dễ thiếu bối cảnh câu hỏi |
| Lượt `video_question` bị `missing_context = True` | 100 / 1.108 | 9,0% | Nối `agent_replied` với `chat.csv` |
| Câu chat rubric `bam_bai = 0` và `dung_ngu_canh = 0` | 245 / 1.223 | 20,0% | Tập `nguon=chat, trang_thai_cham=da_cham` |
| Lượt hỏi lại (`ask_count > 0`) | 35 / 137 | 25,5% | Tập có ghi `ask_count` (19 học viên) |
| Lượt trả lời thiếu `moc_trich_dan` (từ 13/11–25/11) | 242 / 615 | 39,3% | Chỉ tính từ ngày bắt đầu log `13/11` |
| *(Đối chứng Hướng 2)* Mini-lab bấm bỏ qua (`skipped=True`) | 102 / 453 | 22,5% | Trên các lượt `lab_completed` |
| *(Đối chứng Hướng 2)* Câu `pre_post_post` lần đầu sai | 399 / 1.968 | 20,3% | Chỉ `18/3.776` lượt trong `answers.csv` làm lần 2 |
| *(Đối chứng Hướng 3)* Tỉ lệ phản hồi bạn học AI xen vào | 151 / 13.975 | 1,08% | `34/286` (11,9%) học viên từng trả lời |

**Phân bố tần suất hỏi `video_question` (21 ngày, n = 145 học viên từng hỏi, tổng 1.108 lượt, TB 7,64 lượt/người):**
- Nhóm hỏi ít (1–2 lượt): `56/145` (**38,6%**), trung bình `1,3` lượt/21 ngày.
- Nhóm hỏi vừa (3–10 lượt): `61/145` (**42,1%**), trung bình `6,2` lượt/21 ngày.
- Nhóm hỏi nhiều (>10 lượt): `28/145` (**19,3%**), trung bình `23,6` lượt/21 ngày.

## 4. ≥5 ví dụ cụ thể (mã đã ẩn danh, không đoán ai là ai)

1. **`C00983` (`L0213`, `2026-11-05 19:56 VN`, `Day01/d01-r1-v05.txt`):** Học ngoài giờ tối, câu hỏi dài `29` ký tự, AI trả lời `182` ký tự nhưng bị gắn `missing_context = True`, thiếu `moc_trich_dan`, rubric `(bam_bai=0, dung_ngu_canh=0)`.
2. **`C00837` (`L0689`, `2026-11-09 00:37 VN`, `Day02/d02-r2-v01.txt`):** Học lúc 0h37 sáng, câu hỏi rất ngắn `15` ký tự, bị `missing_context = True`, rubric `(bam_bai=0, dung_ngu_canh=0)`.
3. **`C00747` (`L0708`, `2026-11-11 11:13 VN`, `Day03/d03-r2-v06.txt`):** Câu hỏi dài `37` ký tự, ghi nhận `ask_count = 2` (phải hỏi lặp lại cùng một chỗ nhiều lần), không có `moc_trich_dan`, rubric `(bam_bai=1, dung_ngu_canh=1)`.
4. **`C00846` (`L0400`, `2026-11-13 11:36 VN`, `Day05/d05-r2-v06.txt`):** Câu hỏi ngắn `17` ký tự, `ask_count = 2` (hỏi lại dù đã có `moc_trich_dan = ['@42', '@139']`), cho thấy trả lời lần đầu chưa giải quyết dứt điểm vướng mắc.
5. **`C01056` (`L0057`, `2026-11-05 23:29 VN`, `Day01/d01-r1-v01.txt`):** Học lúc 23h29, gửi câu hỏi chỉ dài `2` ký tự, hệ thống không hỏi lại mà vẫn sinh câu trả lời `171` ký tự, rubric `(bam_bai=0, dung_ngu_canh=0)`.
6. **`C00378` (`L0059`, `2026-11-15 09:49 VN`, `Day01/d01-r1-v03.txt`):** Phát sinh sau khi tính năng log mốc trích dẫn đã bật (`13/11`), câu hỏi `123` ký tự được trả lời dài `696` ký tự nhưng `moc_trich_dan = []` (không có mốc để người học mở kiểm lại nhanh).

## 5. Giới hạn của data

- Data chỉ ghi hành vi và độ dài ký tự, **không có nội dung chữ** học viên đã viết và AI đã trả lời, nên chưa biết chính xác *vì sao* học viên gõ câu ngắn/lạc đề hay phải hỏi lặp lại, và mỗi lần vướng tốn bao nhiêu phút tự tua lại video.
- → **Kiểm lại bằng phỏng vấn:** 4 thành viên nhóm trực tiếp phỏng vấn 4 học viên L3 ngoài nhóm (`evidence/interviews/P1.md` → `P4.md`) trong chiều 27/11 và tổng hợp vào `evidence/summary.md` trước CP3.
