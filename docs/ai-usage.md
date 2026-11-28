# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Code bản chạy thử | Coding agent | Hỗ trợ cấu trúc luồng 4 bước (`codebase/agent.py`), hàm tra cứu `search_lesson`/`get_passage` (`tools.py`), kết nối API (`ai.py`), giao diện web (`frontend/`) và extension (`extension/`) | Rà soát từng hàm, sửa lỗi `temperature` với `gpt-6-luna` và kiểm thử chéo 12/12 câu benchmark + test live trên web/extension | Ngô Đức Thịnh, Bùi Gia Huy |
| Prompt / thiết kế lời gọi mô hình | Coding agent | Gợi ý `SYSTEM` prompt và mẫu chặn injection / chống lộ đáp án | Đối chiếu với sơ đồ `spec.md` §4 và kết quả trace lượt 1–2 (`traces/run-1.jsonl`, `traces/run-2.jsonl`) | Ngô Đức Thịnh, Bùi Gia Huy |
| Đào data (viết script đếm, gợi ý nhãn) | Coding agent | Hỗ trợ viết `evidence/count_preclass.py`, `evidence/survey/count_survey.py` và kiểm tra từ điển cột `data/preclass/` | Chạy lại script đối chiếu 6 ví dụ thực tế, xác minh 34 phiếu khảo sát và từng mẫu số trong `evidence/` | Phan Trọng Hậu, Bùi Gia Huy |
| Rà câu hỏi phỏng vấn / khảo sát | Coding agent | Rà câu hỏi khảo sát 9 câu và tổng hợp số liệu `evidence/survey/questions.md` | Thu 34 phiếu khảo sát thật từ học viên L3 ngoài nhóm (không thu thông tin cá nhân) | Cả 4 thành viên |
| Viết câu thử (benchmark) | Coding agent | Gợi ý chuẩn hoá cấu trúc tiêu chí chấm và rà độ phủ 4 lớp khó | Tự biên soạn 21 câu (`B01`–`B21`) kèm `7/21` tình huống từ `data_that` và kiểm `python run.py check` | Phan Trọng Hậu |
| Sinh data `synthetic` (nếu có) | Coding agent | Hỗ trợ tóm tắt khung `data/lessons.json` bám `kc_code`, mục lục & mốc thời gian | Tự biên soạn thủ công, không dùng seed; kiểm tay `86/86` đoạn phủ 15 ngày (`data/DATA_CARD.md`) | Ngô Đức Thịnh |
| Chấm & đối chiếu / tính chi phí | Coding agent | Hỗ trợ đối chiếu 21 output `gpt-6-luna`, kiểm chéo 5 câu Hậu–Thái và lập bảng quy đổi `cost/cost-estimate.md` | Hậu duyệt 21/21 điểm lượt 1–2; Thái duyệt 5/5 câu đối chiếu và cấu hình `cost/personas.yaml` | Phan Trọng Hậu, Vũ Quang Thái |
| Slide, văn bản | Coding agent | Hỗ trợ chuẩn hoá bố cục `canvas.md`, `README.md`, `spec.md` §0–§10 và viết script kiểm tra tiến độ `docs/check_cp.py` | Rà nội dung bám đúng kết quả data thật, kiểm tra hợp đồng công cụ/metric và đối chiếu với thành viên | Bùi Gia Huy, Vũ Quang Thái |

**Không dùng AI để:** tạo người phỏng vấn, trích dẫn hay phiếu khảo sát; sửa input/expected/output/token/trace của lượt đã chạy hoặc đổi chuẩn đạt sau CP2.
