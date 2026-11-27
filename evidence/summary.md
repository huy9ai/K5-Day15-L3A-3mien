# Tổng hợp bằng chứng về vấn đề học pre-class

## 1. Nguồn đã dùng (đủ 2 nguồn vượt ngưỡng R1)

| Nguồn | Ngưỡng | Đạt | File |
|---|---|---|---|
| **Nguồn 1 · Đào data BTC** (`05–25/11/2026`) | x/N, %, cách đếm chạy lại được, ≥5 ví dụ | ☑ | [`evidence/data-mining.md`](data-mining.md) · [`count_preclass.py`](count_preclass.py) |
| **Nguồn 2 · Khảo sát học viên L3 ngoài nhóm** (`n = 28`) | ≥20 người ngoài nhóm, giữ đủ 9 câu & log từng phiếu đã ẩn danh | ☑ | [`evidence/survey/questions.md`](survey/questions.md) · [`results.csv`](survey/results.csv) · [`count_survey.py`](survey/count_survey.py) |

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

## 3. Số liệu chính từ Nguồn 2 (khảo sát `n = 28` học viên L3)

Chạy lại bằng `python evidence/survey/count_survey.py`:

| Chỉ số khảo sát | x / N | % | Ghi chú |
|---|---:|---:|---|
| Gặp vướng ≥1 lần trong tháng qua | 19 / 28 | 67,9% | `13/28` (46,4%) gặp ≥3 lần/tháng |
| Lần gần nhất vướng khi **Xem video** | 11 / 28 | 39,3% | Cao nhất trong các bối cảnh |
| Tìm trợ giúp bằng **Hỏi AI ngoài nền tảng** | 19 / 28 | 67,9% | Trong khi chỉ `10/28` (35,7%) dùng trợ giảng pre-class |
| Kết quả **chưa giải quyết trọn vẹn** | 17 / 28 | 60,7% | Chưa hiểu rõ (8), phải chuyển kênh khác (6), bỏ qua (2), chưa giải quyết (1) |
| Mất **≥5 phút** cho mỗi lần vướng | 19 / 28 | 67,9% | `5–15 phút`: 11/28 · `16–30 phút`: 6/28 · `31–60 phút`: 2/28 |
| Chọn **Chỉ đúng đoạn cần xem** hoặc **Được hỏi lại để làm rõ** giúp làm tiếp | 17 / 28 | 60,7% | `Chỉ đúng đoạn cần xem`: 12/28 (42,9%) · `Được hỏi lại để làm rõ`: 11/28 (39,3%) |
| Kiểm tra bằng **Đối chiếu bài học** | 13 / 28 | 46,4% | `10/28` (35,7%) hỏi nguồn khác · `5/28` (17,9%) không biết cách kiểm tra |

---

## 4. Đối chiếu khớp / lệch giữa hai nguồn

- **Khớp nhau rất rõ:**
  - Tỉ lệ học viên dùng trợ giảng pre-class tương đồng giữa log thật (`145/436 = 33,3%` học viên hoạt động từng chat) và khảo sát (`10/28 = 35,7%`).
  - Log BTC cho thấy `39,3%` lượt thiếu mốc trích dẫn và `25,5%` phải hỏi lại; khảo sát lý giải nguyên nhân trực tiếp: `67,9%` phải chuyển sang AI ngoài nền tảng, `60,7%` chưa giải quyết trọn vẹn ở kênh ban đầu, và `60,7%` cho biết việc **chỉ đúng đoạn cần xem** (`42,9%`) hoặc **được hỏi lại để làm rõ** (`39,3%`) là yếu tố giúp làm tiếp.
  - Khảo sát cũng cung cấp dữ liệu thật cho thời gian tốn mỗi lần vướng (`67,9%` mất `≥5 phút`, nhiều người mất `5–15 phút` hoặc `16–30 phút`), khớp với mức ước tính `~5 phút` ban đầu ở `spec.md` §2.
- **Giới hạn đã nhận diện:** `5/28` phiếu chọn `Chưa gặp` ở Q1 nhưng vẫn trả lời Q2–Q9 do form chưa chia nhánh; dữ liệu log BTC không có nội dung chữ còn khảo sát chủ yếu câu đóng nên nhóm giữ nguyên toàn bộ log ẩn danh `results.csv` để minh bạch.

## 5. Kết luận

Cả hai nguồn bằng chứng (đào data + khảo sát `n = 28`) đều xác nhận [giả thuyết](hypothesis.md) và khẳng định việc ưu tiên 3 hành vi thiết kế trong `spec.md` §4: **trích đúng mã đoạn bài giảng để đối chiếu, hỏi ngược 1 câu khi câu hỏi mơ hồ, và từ chối rõ khi thiếu căn cứ**.
