# Khảo sát hành vi học pre-class và tìm kiếm trợ giúp (`n = 28`)

- **Link form:** https://docs.google.com/forms/d/e/1FAIpQLSdCZIAaqJtqArv20jqQbgisDLoXamIfIeTDpiRGQ4X8hu_82A/viewform
- **Đối tượng & kênh gửi:** Học viên AI20K khoá 5 (ngoài nhóm 3mien), gửi qua kênh học viên lớp L3.
- **Thời gian thu đợt 1:** `27/11/2026 16:24` → `18:58` (giờ Việt Nam).
- **Tổng số phiếu:** `n = 28` (không thu tên, email, MSSV, SĐT; bản xuất đã ẩn danh lưu tại [`results.csv`](results.csv)).
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

## Kết quả chính (`n = 28`)

| Chỉ số | x / N | % | Ghi chú |
|---|---:|---:|---|
| Gặp vướng ≥1 lần trong tháng qua (loại `Chưa gặp` / `Không nhớ`) | 19 / 28 | 67,9% | `13/28` (46,4%) gặp ≥3 lần/tháng |
| Bối cảnh gần nhất là lúc **Xem video** | 11 / 28 | 39,3% | Cao nhất trong các bối cảnh |
| Dùng **Hỏi AI ngoài nền tảng** khi vướng | 19 / 28 | 67,9% | Cao gần gấp đôi trợ giảng pre-class |
| Dùng **Hỏi trợ giảng AI trên pre-class** | 10 / 28 | 35,7% | Khớp sát tỉ lệ hỏi trong log BTC (`145/436 = 33,3%`) |
| Kiểm tra bằng **Đối chiếu bài học** | 13 / 28 | 46,4% | `10/28` (35,7%) phải hỏi nguồn khác; `5/28` (17,9%) không biết cách kiểm tra |
| Kết quả **chưa giải quyết trọn vẹn** | 17 / 28 | 60,7% | Gồm: làm tiếp chưa hiểu rõ (8), chuyển cách khác (6), bỏ qua/dừng (2), chưa giải quyết (1) |
| Mất **≥5 phút** từ lúc vướng đến khi làm tiếp/dừng | 19 / 28 | 67,9% | `5–15 phút`: 11/28 · `16–30 phút`: 6/28 · `31–60 phút`: 2/28 |
| Cần **Chỉ đúng đoạn cần xem** hoặc **Được hỏi lại để làm rõ** (Q9) | 17 / 28 | 60,7% | `Chỉ đúng đoạn cần xem`: 12/28 (42,9%) · `Được hỏi lại để làm rõ`: 11/28 (39,3%) |

*(Trên tập con `19` học viên báo gặp ≥1 lần ở Q1: `13/19` = 68,4% chưa giải quyết trọn vẹn, `15/19` = 78,9% mất ≥5 phút/lần, và `13/19` = 68,4% chọn chỉ đúng đoạn xem hoặc hỏi lại để làm rõ).*

## Lưu ý trung thực về dữ liệu

- Form chưa cài rẽ nhánh bắt buộc bỏ qua Q2–Q9 với người chọn `Chưa gặp` ở Q1 (`5/28` phiếu), nên `5` phiếu đó vẫn có câu trả lời cho các câu sau. Nhóm giữ nguyên toàn bộ `28` dòng trong [`results.csv`](results.csv) và công bố cả số toàn tập (`n = 28`) lẫn tập con gặp ≥1 lần (`n = 19`) để kiểm chứng minh bạch.
- Một phản hồi tự do ở Q6 (dòng `18:27:46`) ghi `"k hiểu câu hỏi"` cho thấy cần giữ câu hỏi khảo sát ngắn hơn nếu làm vòng sau.
