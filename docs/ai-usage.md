# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Code bản chạy thử | | | | Ngô Đức Thịnh |
| Prompt / thiết kế lời gọi mô hình | | | | Ngô Đức Thịnh, Bùi Gia Huy |
| Đào data (viết script đếm, gợi ý nhãn) | Coding agent | Hỗ trợ viết `evidence/count_preclass.py` và kiểm tra mẫu số từ điển cột `data/preclass/` | Chạy lại script đối chiếu 6 ví dụ thực tế và xác minh từng mẫu số trong `evidence/data-mining.md` | Phan Trọng Hậu, Bùi Gia Huy |
| Rà câu hỏi phỏng vấn / khảo sát | Coding agent | Gợi ý 5 câu hỏi Mom Test, rà loại bỏ câu dẫn dắt | Tự phỏng vấn trực tiếp 4 học viên ngoài nhóm (`P1`–`P4`), không dùng AI bịa transcript | Cả 4 thành viên |
| Viết câu thử (benchmark) | | | Mỗi câu thử có `source`; câu thử AI viết được ghi rõ | Phan Trọng Hậu |
| Sinh data `synthetic` (nếu có) | | | Seed __ · kiểm tay __ dòng | Ngô Đức Thịnh |
| Chấm cột `pass` bằng LLM (nếu có) | | | Kiểm tra thủ công __ câu thử, khớp __/__ | Phan Trọng Hậu |
| Slide, văn bản | Coding agent | Hỗ trợ chuẩn hoá bố cục `canvas.md`, `spec.md` §0–§2 và `README.md` | Rà nội dung bám đúng kết quả data thật và phân công nhóm | Bùi Gia Huy, Vũ Quang Thái |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).
