# Tổng hợp bằng chứng về vấn đề học pre-class

## Nguồn và phương pháp

Nguồn đạt ngưỡng là log hành vi pre-class của BTC từ 05–25/11/2026. Nhóm nối lượt chat, sự kiện và rubric theo mã lượt ẩn danh, lọc từng chỉ số theo tập có ghi trường tương ứng. Xem [cách đếm và mẫu số](data-mining.md) và [hướng dẫn lấy dữ liệu](../data/README.md). Chạy lại bằng `python3 evidence/count_preclass.py data-btc/preclass`.

## Số liệu chính

| Dấu hiệu | Kết quả |
|---|---:|
| Lượt chat trong khung 19:00–07:59 giờ Việt Nam | 493/1.260 (39,1%) |
| Câu hỏi dưới video bị gắn cờ thiếu ngữ cảnh | 100/1.108 (9,0%) |
| Lượt chat đã chấm có cả điểm bám bài và ngữ cảnh bằng 0 | 245/1.223 (20,0%) |
| Lượt có hỏi lại trong tập ghi số lần hỏi lại | 35/137 (25,5%) |
| Lượt thiếu mốc trích dẫn kể từ khi bắt đầu ghi trường này | 242/615 (39,3%) |

## Sáu ví dụ từ log đã ẩn danh

| Mã lượt chat | Quan sát |
|---|---|
| C00983 | Câu 29 ký tự dưới video Day01, bị gắn cờ thiếu ngữ cảnh và có điểm bám bài, ngữ cảnh đều bằng 0. |
| C00837 | Câu 15 ký tự lúc 00:37 giờ Việt Nam, bị gắn cờ thiếu ngữ cảnh và có điểm bám bài, ngữ cảnh đều bằng 0. |
| C00747 | Log ghi `ask_count=2` dưới video Day03. |
| C00846 | Log ghi `ask_count=2` và hai mốc `@42`, `@139`. |
| C01056 | Câu 2 ký tự, nhận phản hồi 171 ký tự và có điểm bám bài, ngữ cảnh đều bằng 0. |
| C00378 | Lượt sau ngày bật log trích dẫn, phản hồi 696 ký tự có danh sách mốc rỗng. |

Các ví dụ dùng trường quan sát được trong log. Bản BTC không có nguyên văn chat, nên chưa thể trích lời học viên. Phỏng vấn P1–P4 chưa có kết quả đã xác nhận trong repo.

## Kết luận

Log ủng hộ việc ưu tiên hai hành vi trong [giả thuyết](hypothesis.md) là hỏi lại khi thiếu ngữ cảnh và đưa mốc để học viên kiểm chứng. Log chưa cho biết vì sao người học hỏi lại, mất bao nhiêu phút để tìm đoạn, hay việc có mốc giúp học nhanh hơn bao nhiêu. Con số thời gian trong bảng impact vẫn là ước tính của nhóm. P3 sẽ giúp kiểm lại bằng một tình huống thực tế của học viên ngoài nhóm.
