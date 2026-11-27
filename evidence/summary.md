# Tổng hợp bằng chứng về vấn đề học pre-class

## 1. Nguồn đã dùng (đủ 2 nguồn vượt ngưỡng R1)

| Nguồn | Ngưỡng | Đạt | File |
|---|---|---|---|
| **Nguồn 1 · Đào data BTC** (`05–25/11/2026`) | x/N, %, cách đếm chạy lại được, ≥5 ví dụ | ☑ | [`evidence/data-mining.md`](data-mining.md) · [`count_preclass.py`](count_preclass.py) |
| **Nguồn 2 · Khảo sát học viên L3 ngoài nhóm** (`n = 34`) | ≥20 người ngoài nhóm, giữ đủ 9 câu & log từng phiếu đã ẩn danh | ☑ | [`evidence/survey/questions.md`](survey/questions.md) · [`results.csv`](survey/results.csv) · [`count_survey.py`](survey/count_survey.py) |

---

## 2. Số liệu chính từ Nguồn 1 (đào log `data/preclass/`)

Chạy lại bằng `python evidence/count_preclass.py <thu-muc-preclass>` (chi tiết mẫu số tại [data-mining.md](data-mining.md)):

| Dấu hiệu | Kết quả |
|---|---:|
| Lượt chat trong khung 19:00–07:59 giờ Việt Nam | 493/1.260 (39,1%) |
| Câu hỏi dưới video bị gắn cờ thiếu ngữ cảnh | 100/1.108 (9,0%) |
| Lượt chat đã chấm có cả điểm bám bài và ngữ cảnh bằng 0 | 245/1.223 (20,0%) |
| Lượt có hỏi lại trong tập ghi số lần hỏi lại (`ask_count > 0`) | 35/137 (25,5%) |
| Lượt thiếu mốc trích dẫn kể từ khi bắt đầu ghi trường này (`13/11`) | 242/615 (39,3%) |

### Sáu ví dụ từ log đã ẩn danh

| Mã lượt chat | Quan sát |
|---|---|
| `C00983` | Câu 29 ký tự dưới video Day01, bị gắn cờ thiếu ngữ cảnh và có điểm bám bài, ngữ cảnh đều bằng 0. |
| `C00837` | Câu 15 ký tự lúc 00:37 giờ Việt Nam, bị gắn cờ thiếu ngữ cảnh và có điểm bám bài, ngữ cảnh đều bằng 0. |
| `C00747` | Log ghi `ask_count=2` dưới video Day03. |
| `C00846` | Log ghi `ask_count=2` và hai mốc `@42`, `@139`. |
| `C01056` | Câu 2 ký tự, nhận phản hồi 171 ký tự và có điểm bám bài, ngữ cảnh đều bằng 0. |
| `C00378` | Lượt sau ngày bật log trích dẫn, phản hồi 696 ký tự có danh sách mốc rỗng. |

---

## 3. Số liệu chính từ Nguồn 2 (khảo sát `n = 34` học viên L3)

Chạy lại bằng `python evidence/survey/count_survey.py`:

| Chỉ số khảo sát | x / N | % | Ghi chú |
|---|---:|---:|---|
| Gặp vướng ≥1 lần trong tháng qua | 22 / 34 | 64,7% | `13/34` (38,2%) gặp ≥3 lần/tháng |
| Lần gần nhất vướng khi **Xem video** | 14 / 34 | 41,2% | Cao nhất trong các bối cảnh (`Trả lời câu hỏi`: `6/34 = 17,6%`) |
| Tìm trợ giúp bằng **Hỏi AI ngoài nền tảng** | 21 / 34 | 61,8% | Trong khi chỉ `12/34` (35,3%) dùng trợ giảng pre-class |
| Kết quả **chưa giải quyết trọn vẹn** | 19 / 34 | 55,9% | Chưa hiểu rõ (8), phải chuyển kênh khác (6), bỏ qua (4), chưa giải quyết (1) |
| Mất **≥5 phút** cho mỗi lần vướng | 23 / 34 | 67,6% | `5–15 phút`: 15/34 · `16–30 phút`: 6/34 · `31–60 phút`: 2/34 |
| Chọn **Chỉ đúng đoạn cần xem** hoặc **Được hỏi lại để làm rõ** giúp làm tiếp | 19 / 34 | 55,9% | `Chỉ đúng đoạn cần xem`: 14/34 (41,2%) · `Được hỏi lại để làm rõ`: 13/34 (38,2%) |
| Kiểm tra bằng **Đối chiếu bài học** | 15 / 34 | 44,1% | `11/34` (32,4%) hỏi nguồn khác · `9/34` (26,5%) chưa kiểm tra · `5/34` (14,7%) không biết cách kiểm tra |

*(Trên tập con `22` học viên báo gặp ≥1 lần ở Q1: `14/22 = 63,6%` chưa giải quyết trọn vẹn, `18/22 = 81,8%` mất `≥5 phút/lần`, `14/22 = 63,6%` cần chỉ đúng đoạn xem hoặc hỏi lại để làm rõ).*

### Năm phản hồi nguyên văn điển hình từ khảo sát (ẩn danh)

1. **Phiếu #1 (`27/11 16:24:04`, gặp `6–10 lần`, `5–15 phút`):** Chọn nguyên văn *"Phải chuyển sang cách hỗ trợ khác mới giải quyết được"*, kiểm tra bằng *"Hỏi nguồn khác / Không biết cách kiểm tra"*, và nêu điều giúp làm tiếp là *"Giải thích dễ hiểu, Chỉ đúng đoạn cần xem, Được hỏi lại để làm rõ"*.
2. **Phiếu #5 (`27/11 16:40:59`, gặp `Trên 10 lần`, `5–15 phút`):** Tìm kiếm ở cả 6 kênh nhưng kết quả là *"Bỏ qua hoặc dừng học"*; chọn đầy đủ *"Chỉ đúng đoạn cần xem, Gợi ý từng bước, Được hỏi lại để làm rõ"*.
3. **Phiếu #13 (`27/11 18:01:59`, gặp `6–10 lần`, `5–15 phút`):** Xảy ra khi *"Trao đổi với trợ giảng AI"*, *"Chưa kiểm tra"*, kết quả *"Phải chuyển sang cách hỗ trợ khác mới giải quyết được"*, cần *"Giải thích dễ hiểu, Có ví dụ sát bài, Được hỏi lại để làm rõ"*.
4. **Phiếu #15 (`27/11 18:27:46`, gặp `1–2 lần`, `16–30 phút`):** Đang *"Xem video"*, điền câu trả lời tự do nguyên văn ở Q6 là `"k hiểu câu hỏi"`.
5. **Phiếu #29 (`27/11 18:58:49`, gặp `1–2 lần`, `5–15 phút`):** Đang *"Trả lời câu hỏi"*, kết quả cuối cùng là *"Bỏ qua hoặc dừng học"*.

---

## 4. Đối chiếu khớp / lệch giữa hai nguồn

- **Khớp nhau rất rõ:**
  - Tỉ lệ học viên dùng trợ giảng pre-class tương đồng giữa log thật (`145/436 = 33,3%` học viên hoạt động từng chat) và khảo sát (`12/34 = 35,3%`).
  - Log BTC cho thấy `39,3%` lượt thiếu mốc trích dẫn và `25,5%` phải hỏi lại; khảo sát lý giải nguyên nhân trực tiếp: `61,8%` phải chuyển sang AI ngoài nền tảng, `55,9%` chưa giải quyết trọn vẹn ở kênh ban đầu, và `55,9%` cho biết việc **chỉ đúng đoạn cần xem** (`41,2%`) hoặc **được hỏi lại để làm rõ** (`38,2%`) là yếu tố giúp làm tiếp.
  - Khảo sát cũng cung cấp dữ liệu thật cho thời gian tốn mỗi lần vướng (`67,6%` mất `≥5 phút`, trong đó `15/34` mất `5–15 phút` và `8/34` mất `16–60 phút`), khẳng định mức ước tính thận trọng `5 phút/lần` ở `spec.md` §2.
- **Giới hạn đã nhận diện:** `6/34` phiếu chọn `Chưa gặp` ở Q1 nhưng vẫn trả lời Q2–Q9 do form chưa chia nhánh; dữ liệu log BTC không có nội dung chữ còn khảo sát chủ yếu câu đóng nên nhóm giữ nguyên toàn bộ log ẩn danh `results.csv` để minh bạch.

## 5. Kết luận

Cả hai nguồn bằng chứng (đào data + khảo sát `n = 34`) đều xác nhận [giả thuyết](hypothesis.md) và khẳng định việc ưu tiên 3 hành vi thiết kế trong `spec.md` §4: **trích đúng mã đoạn bài giảng để đối chiếu, hỏi ngược 1 câu khi câu hỏi mơ hồ, và từ chối rõ khi thiếu căn cứ**.
