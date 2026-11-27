# Đề Track A và dữ liệu BTC

Nhóm 3mien chọn **Track A · A1 — Tutor cho LMS và trang pre-class**. Lát cắt của nhóm là trợ giảng cho học viên L3 tự học buổi tối. Với mỗi câu hỏi dưới video, trợ giảng trả lời kèm mã đoạn nếu có căn cứ, hỏi lại nếu thiếu ngữ cảnh, hoặc báo không tìm thấy trong bài. Xem [canvas](../canvas.md) và [spec](../spec.md) của nhóm.

| Nguồn chính thức | Nội dung và cách nhóm dùng |
|---|---|
| [Đề Track A — EdTech][track] | Bối cảnh, các hướng A1–A6, tình huống khó và yêu cầu an toàn. Bản đề gốc trong bản sao local nằm ở `data-btc/track-a-edtech.md`. |
| [Bộ pre-class][preclass] | Log hành vi đã ẩn danh từ 05–25/11/2026. Nhóm dùng để đo câu hỏi thiếu ngữ cảnh và lượt thiếu mốc trích dẫn. Bộ log không chứa nguyên văn câu hỏi hay nội dung bài giảng. |
| [Bộ training-ops][ops] | Hai bảng tính lịch giảng và phân công lab coach, giả lập theo cấu trúc thật. Dùng tham khảo cho hướng vận hành đào tạo A5. |
| [Hướng dẫn đánh giá][guide] | Yêu cầu về bộ câu thử, nguồn câu hỏi và tiêu chí chấm. |

## Lấy bản dữ liệu để chạy lại

Các file gốc nằm ở `data-btc/`, thư mục đã được Git bỏ qua theo quy định của repo. Trên máy khác, tải đúng phiên bản nguồn về thư mục tạm rồi chép hai bộ dữ liệu và đề:

```bash
git clone https://github.com/VinUni-AI20k/K5-L3-Day15-AI-Product-Hackathon.git /tmp/ai20k-k5-day15
git -C /tmp/ai20k-k5-day15 checkout b568b951dfc0342e84c357bd09405d8e7040ebb6
mkdir -p data-btc
cp -R /tmp/ai20k-k5-day15/data/preclass /tmp/ai20k-k5-day15/data/training-ops data-btc/
cp /tmp/ai20k-k5-day15/tracks/track-a-edtech.md data-btc/
python3 evidence/count_preclass.py data-btc/preclass
```

Xem [kết quả đào log](../evidence/data-mining.md) và [data card của bản chạy thử](DATA_CARD.md). Bản chạy thử cần dữ liệu bài mẫu có mã đoạn do nhóm chuẩn bị riêng.

[track]: https://github.com/VinUni-AI20k/K5-L3-Day15-AI-Product-Hackathon/blob/b568b951dfc0342e84c357bd09405d8e7040ebb6/tracks/track-a-edtech.md
[preclass]: https://github.com/VinUni-AI20k/K5-L3-Day15-AI-Product-Hackathon/tree/b568b951dfc0342e84c357bd09405d8e7040ebb6/data/preclass
[ops]: https://github.com/VinUni-AI20k/K5-L3-Day15-AI-Product-Hackathon/tree/b568b951dfc0342e84c357bd09405d8e7040ebb6/data/training-ops
[guide]: https://github.com/VinUni-AI20k/K5-L3-Day15-AI-Product-Hackathon/blob/b568b951dfc0342e84c357bd09405d8e7040ebb6/02-guide.md#b2-4
