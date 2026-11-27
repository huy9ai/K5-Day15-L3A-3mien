# Canvas — 3mien · Track A

> Điền ở guide bước 1.4. CP1 17:00 Thứ Sáu 27/11: nộp bản đầu, đủ 7 dòng (dòng 4 được ghi giả thuyết + nguồn sẽ kiểm).
> CP2 19:30 Thứ Sáu 27/11: cập nhật (số bằng chứng đầu, lát cắt đã chốt) và điền dòng "Đã đổi gì so với CP1".

| # | Dòng | Nhóm điền |
|---|---|---|
| 1 | Track + lát cắt dự kiến | Track A (EdTech) — Trợ giảng pre-class có căn cứ, biết hỏi ngược khi thiếu ngữ cảnh và từ chối khi ngoài bài. |
| 2 | Người dùng chính (một vai cụ thể — không phải "học viên nói chung") | Học viên L3 đi làm/học tối muộn (19h–01h) tự học bài pre-class trên preclass-online.com khi không có TA trực. |
| 3 | Pain một câu: ai — đang làm gì — vướng đâu — hậu quả | Học viên L3 tự học pre-class buổi tối khi vướng khái niệm hoặc đặt câu hỏi ngắn/thiếu bối cảnh thường nhận được lời giải đáp chung chung không dẫn đúng mốc bài giảng hoặc phải hỏi lặp lại nhiều lần, khiến họ mất thời gian tự tua lại video hoặc bỏ dở bài trước buổi học. |
| 4 | Bằng chứng đầu — CP1: giả thuyết + nguồn sẽ kiểm · CP2: số đầu tiên + 1 trích dẫn | Giả thuyết: học viên học ngoài giờ chiếm tỉ trọng lớn và thường bị kẹt do câu hỏi ngắn/thiếu ngữ cảnh hoặc thiếu trích dẫn mốc bài. Nguồn kiểm chứng: (1) đào log thật `data/preclass/` (436 học viên hoạt động, 1.260 lượt hỏi) — đã thấy 493/1.260 (39,1%) lượt hỏi lúc 19h–07h VN, 100/1.108 (9,0%) lỗi `missing_context`, 245/1.223 (20,0%) câu chat rubric bám bài=0 & ngữ cảnh=0, 35/137 (25,5%) phải hỏi lặp; (2) phỏng vấn 4 học viên L3 ngoài nhóm (`P1`–`P4`) trong chiều 27/11. |
| 5 | **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả) | Một học viên L3 tự học bài pre-class buổi tối · gửi một câu hỏi (kể cả câu ngắn/mơ hồ) dưới video · AI tra đoạn bài giảng có mã đoạn để quyết định trả lời kèm mã đoạn, hỏi ngược 1 câu làm rõ nếu thiếu ngữ cảnh, hoặc nói "không có trong bài" · học viên tự mở đúng đoạn bài kiểm chứng thay vì nhận câu trả lời bịa. |
| 6 | AI tự làm đến đâu + 1 dòng lý do: sai thì ai chịu gì | AI tự làm khi tìm thấy căn cứ rõ trong bài; tự hỏi lại 1 câu nếu mơ hồ; từ chối/chuyển TA nếu ngoài phạm vi bài học — vì kiến thức sai gây hiểu nhầm cho học viên (sửa đắt) nên không được đoán bừa. |
| 7 | Phân công có tên | Song song 4 mảng: Huy (Spec/Kiến trúc/Checkpoint) · Thịnh (Codebase/Nối model/Dữ liệu bài mẫu) · Hậu (Đào data/Benchmark/Eval) · Thái (Chi phí/Người dùng thử Bonus/Slide); mỗi người phỏng vấn 1 bạn ngoài nhóm (`P1`–`P4`). |
| — | *(CP2)* Đã đổi gì so với CP1 | Giữ nguyên lát cắt lõi từ CP1; chốt kiến trúc workflow cố định 4 bước với 2 công cụ đọc (`search_lesson`, `get_passage`), 2 lớp chặn rủi ro và chuẩn "đạt" ≥80% tổng câu + 100% câu `tu_choi` + 0 bịa mã nguồn trong `spec.md` §4 & §7. *(Lưu ý trước 19:30: bổ sung 1 trích dẫn phỏng vấn thật từ `P1`–`P4` vào dòng 4).* |
