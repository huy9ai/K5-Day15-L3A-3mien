# Khảo sát hành vi học pre-class và tìm kiếm trợ giúp (`n = 34`)

- **Link form:** https://docs.google.com/forms/d/e/1FAIpQLSdCZIAaqJtqArv20jqQbgisDLoXamIfIeTDpiRGQ4X8hu_82A/viewform
- **Đối tượng & kênh gửi:** Học viên AI20K khoá 5 (ngoài nhóm 3mien), gửi qua kênh học viên lớp L3.
- **Thời gian thu:** `27/11/2026 16:24` → `19:02` (giờ Việt Nam).
- **Tổng số phiếu:** `n = 34` (không thu tên, email, MSSV, SĐT; bản xuất đã ẩn danh lưu tại [`results.csv`](results.csv)).
- **Script chạy lại số liệu:**
  ```bash
  python evidence/survey/count_survey.py
  ```

## Bộ 9 câu hỏi nguyên văn

| # | Câu hỏi |
|---|---|
| 1 | Trong tháng qua, bạn gặp tình huống chưa hiểu hoặc chưa làm tiếp được khi học pre-class bao nhiêu lần? |
| 2 | Lần gần nhất đó xảy ra khi bạn đang làm gì |
| 3 | Khi đó bạn cần giải quyết điều gì? |
| 4 | Bạn đã tìm trợ giúp bằng cách nào? |
| 5 | Vì sao bạn chọn cách tìm trợ giúp đó? |
| 6 | Bạn đã kiểm tra câu trả lời hoặc hướng dẫn nhận được thế nào? |
| 7 | Kết quả cuối cùng của lần đó là gì? |
| 8 | Từ lúc vướng đến khi làm tiếp hoặc dừng lại, bạn mất khoảng bao lâu? |
| 9 | Ở những lần được hỗ trợ hiệu quả trong tháng qua, điều gì giúp bạn làm tiếp? |

## Kết quả chính (`n = 34`)

| Chỉ số | x / N | % | Ghi chú |
|---|---:|---:|---|
| Gặp vướng ≥1 lần trong tháng qua (loại `Chưa gặp` / `Không nhớ`) | 22 / 34 | 64,7% | `13/34` (38,2%) gặp ≥3 lần/tháng |
| Bối cảnh gần nhất là lúc **Xem video** | 14 / 34 | 41,2% | Cao nhất trong các bối cảnh (`Trả lời câu hỏi`: `6/34 = 17,6%`) |
| Dùng **Hỏi AI ngoài nền tảng** khi vướng | 21 / 34 | 61,8% | Cao gần gấp đôi trợ giảng pre-class |
| Dùng **Hỏi trợ giảng AI trên pre-class** | 12 / 34 | 35,3% | Khớp sát tỉ lệ hỏi trong log BTC (`145/436 = 33,3%`) |
| Kiểm tra bằng **Đối chiếu bài học** | 15 / 34 | 44,1% | `11/34` (32,4%) hỏi nguồn khác; `9/34` (26,5%) chưa kiểm tra; `5/34` (14,7%) không biết cách kiểm tra |
| Kết quả **chưa giải quyết trọn vẹn** | 19 / 34 | 55,9% | Gồm: làm tiếp chưa hiểu rõ (8), chuyển cách khác (6), bỏ qua/dừng (4), chưa giải quyết (1) |
| Mất **≥5 phút** từ lúc vướng đến khi làm tiếp/dừng | 23 / 34 | 67,6% | `5–15 phút`: 15/34 (44,1%) · `16–30 phút`: 6/34 (17,6%) · `31–60 phút`: 2/34 (5,9%) |
| Cần **Chỉ đúng đoạn cần xem** hoặc **Được hỏi lại để làm rõ** (Q9) | 19 / 34 | 55,9% | `Chỉ đúng đoạn cần xem`: 14/34 (41,2%) · `Được hỏi lại để làm rõ`: 13/34 (38,2%) |

*(Trên tập con `22` học viên báo gặp ≥1 lần ở Q1: `14/22` = 63,6% chưa giải quyết trọn vẹn, `18/22` = 81,8% mất ≥5 phút/lần, và `14/22` = 63,6% chọn chỉ đúng đoạn xem hoặc hỏi lại để làm rõ).*

## Lưu ý trung thực về dữ liệu

- Form chưa cài rẽ nhánh bắt buộc bỏ qua Q2–Q9 với người chọn `Chưa gặp` ở Q1 (`6/34` phiếu), nên `6` phiếu đó vẫn có câu trả lời cho các câu sau. Nhóm giữ nguyên toàn bộ `34` dòng trong [`results.csv`](results.csv) và công bố cả số toàn tập (`n = 34`) lẫn tập con gặp ≥1 lần (`n = 22`) để kiểm chứng minh bạch.
- Một phản hồi tự do ở Q6 (dòng `18:27:46`) ghi nguyên văn `"k hiểu câu hỏi"` cho thấy cần giữ câu hỏi khảo sát ngắn gọn hơn nếu làm vòng sau.
