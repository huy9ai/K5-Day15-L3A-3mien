# 3mien — Dàn thuyết trình 4 slide, 5 phút

**Sản phẩm:** Trợ giảng pre-class có căn cứ · Track A1 · L3A.

Thông điệp xuyên suốt: Học viên cần hiểu bài và kiểm lại được câu trả lời; trợ giảng trả lời có nguồn, hỏi lại khi mơ hồ và từ chối khi thiếu căn cứ.

## Nhịp trình bày

| Phần | Thời gian | Mốc kết thúc |
|---|---:|---:|
| Slide 1 — Nhóm, người dùng và pain | 45 giây | 0:45 |
| Slide 2 — Vì sao chọn và giải pháp | 60 giây | 1:45 |
| Demo trực tiếp, không có slide riêng | 60 giây | 2:45 |
| Slide 3 — Đánh giá | 65 giây | 3:50 |
| Slide 4 — Chi phí và kết luận | 60 giây | 4:50 |
| Dự phòng chuyển màn hình | 10 giây | 5:00 |

## Slide 1 — 3mien: Hiểu bài, kiểm được nguồn

### Nội dung trên slide

- **Nhóm 3mien · Track A1 · L3A.**
- **Người dùng:** Học viên L3 tự học pre-class buổi tối, vướng khái niệm khi không có người hướng dẫn ngay.
- **Pain:** Khó tìm lại căn cứ trong bài; phải đổi kênh hỏi hoặc dừng học.
- **23/34** người khảo sát mất ít nhất 5 phút mỗi lần vướng.
- **242/615** lượt chat thiếu mốc trích dẫn trong tập log đã bắt đầu ghi trường này.

Chân slide: Nguồn `evidence/summary.md`; khảo sát 34 học viên ngoài nhóm và log pre-class 05–25/11/2026. Hai số thuộc hai tập dữ liệu khác nhau.

### Lời nói gợi ý — 45 giây

“Nhóm 3mien làm trợ giảng cho học viên L3 tự học pre-class buổi tối. Khi chưa hiểu một ý, người học cần lời giải thích và một chỗ để kiểm lại. Khảo sát 34 học viên cho thấy 23 người mất ít nhất 5 phút mỗi lần vướng. Trong log có ghi trường trích dẫn, 242 trên 615 lượt thiếu mốc xem lại. Nhóm chọn giải quyết việc hỏi một câu và nhận câu trả lời có căn cứ trong bài.”

## Slide 2 — Chọn một lát cắt nhỏ, làm trọn luồng

### Nội dung trên slide

**Vì sao chọn A1?**

| Hướng | Quyết định |
|---|---|
| Trợ giảng có căn cứ | Chọn: có bằng chứng, gặp được người dùng, dễ kiểm đúng/sai |
| Gỡ kẹt mini-lab | Chưa chọn: cần ngữ cảnh và kiểm thử riêng cho từng bài |
| Điều phối bạn học AI | Chưa chọn: khó đo hiệu quả học trong thời gian hackathon |

**Quy mô việc đang tốn thời gian:** 145 người × 10,9 lượt/tháng × 5 phút ≈ **132 giờ/tháng**. Đây là lượng thời gian quy đổi theo mô hình impact, chưa phải thời gian sản phẩm đã tiết kiệm được.

**Giải pháp:** Câu hỏi → kiểm phạm vi → tra đoạn bài → model → kiểm mã/mốc → trả kết quả.

Ba đường ra: **Trả lời có nguồn · Hỏi lại một câu · Từ chối và chỉ hướng hỗ trợ**.

Chân slide: `spec.md` §2, §4. Workflow cố định; công cụ chỉ đọc; không gửi tin, chấm điểm hoặc làm hộ bài.

### Lời nói gợi ý — 60 giây

“Nhóm so sánh ba hướng. Hỗ trợ lab đòi hỏi nhiều ngữ cảnh riêng; điều phối bạn học AI cần thêm phép đo học tập. Trợ giảng có căn cứ phù hợp để hoàn thành và đánh giá trong hackathon. Mô hình impact quy đổi khoảng 132 giờ mỗi tháng trên nhóm từng hỏi, nhưng nhóm chưa coi đó là thời gian đã tiết kiệm. Giải pháp dùng workflow cố định: kiểm câu hỏi, tra bài, gọi model rồi kiểm mã và mốc nguồn. Có căn cứ thì trả lời; mơ hồ thì hỏi lại; ngoài phạm vi thì từ chối. Sau đây là hai tình huống thực tế.”

## Demo trực tiếp — 60 giây, không đưa vào slide

- **5 giây:** Chuyển sang sản phẩm đã mở sẵn.
- **25 giây — câu thường:** “Giải thích sự khác nhau giữa zero-shot và few-shot prompting theo bài pre-class.” Chỉ ra câu trả lời và mã/mốc nguồn; mở nguồn nếu giao diện hỗ trợ.
- **20 giây — câu khó:** “Phần này trong video nói gì vậy?” Chỉ ra việc hỏi lại thay vì đoán đoạn người dùng đang xem.
- **10 giây:** Chuyển về slide 3: “Hai ví dụ chưa đủ chứng minh chất lượng, nên nhóm chạy cả bộ câu thử.”

Nếu mạng lỗi, dùng video dự phòng của cùng hai tình huống. Không dành thời gian đăng nhập, nhập key hay giải thích cách cài đặt.

## Slide 3 — Đánh giá bằng bộ cố định, giữ cả câu trượt

### Nội dung trên slide

- **21 câu:** 9 thường · 8 khó · 4 từ chối; **7/21** tình huống tái dựng từ log thật.
- **Chuẩn khóa từ CP2:** ≥80% tổng câu, 100% câu từ chối đạt, 0 mã nguồn bịa.

| Lượt | Model | Tổng đạt | Từ chối |
|---|---|---:|---:|
| 1 | Qwen qua Ollama | 15/21 — 71,4% | 4/4 |
| 2 | GPT-6 Luna qua OpenAI | **19/21 — 90,5%** | **4/4** |

**Hai lỗi còn lại:** B14 báo ngoài bài dù có nội dung Context Window; B16 hỏi lại thay vì phân biệt chatbot và workflow.

Chân slide: `eval/report.md`, `eval/run-1.csv`, `eval/run-2.csv`; run ID `run-1@20261127-172625` / `run-2@20261128-080820`. Lượt 2 đổi cả model và kho bài; không tách được tác động từng yếu tố. Không có mã nguồn bịa dùng làm căn cứ.

### Lời nói gợi ý — 65 giây

“Nhóm dùng 21 câu, gồm câu thường, câu khó và câu từ chối; một phần ba tình huống xuất phát từ log thật. Chuẩn đạt được khóa ở CP2: tối thiểu 80%, toàn bộ câu từ chối phải qua và không được bịa mã nguồn. Lượt đầu đạt 15 câu, lượt hai đạt 19 câu, tương đương 90,5%, với cả bốn câu từ chối đạt. Lượt hai đổi cả model và kho bài nên nhóm không quy mức tăng cho riêng model. Hai câu vẫn trượt: truy xuất thiếu nội dung Context Window và hỏi lại khi yêu cầu đã rõ. Nhóm giữ nguyên các lỗi này trong báo cáo.”

## Slide 4 — Chi phí khi dùng thật và kết luận

### Nội dung trên slide

**Bảng từ 50 phiên chạy thật (`seed = 42`, 0/50 lỗi), token đo trên GPT-6 Luna (`simulate-1@20261128-122624`):**

| Đơn giá OpenAI (bảng BTC 25/11) | Chi phí/task thành công | Chi phí/tháng, 436 người |
|---|---:|---:|
| GPT-6 Luna (Nhỏ: 0,10 / 0,50 $/1M) | 0,00018 USD | 0,97 USD |
| GPT-6.2 Sol (Lớn: 2,00 / 10,00 $/1M) | 0,0036 USD | 19,39 USD |

- Tỷ lệ đạt dùng tính: **19/21 (90,5%)** cùng model; ba kịch bản người dùng: **145 / 436 / 721** (`0,32 / 0,97 / 1,60 USD` với GPT-6 Luna).
- **So với impact (§2):** chỉ **0,0022 USD/người/tháng** (GPT-6 Luna) so với **~54,5 phút/người/tháng** tự tìm/hỏi lại; chưa gồm hosting và công TA xử lý câu chuyển tiếp.
- **Kết luận đề xuất:** Tiếp tục thử nghiệm có kiểm soát; ưu tiên sửa truy xuất và giảm hỏi lại không cần thiết, đo thời gian học viên thực sự tiết kiệm được.

Chân slide: `cost/cost-estimate.md`, `cost/simulate-1.csv`, `cost/personas.yaml`, `eval/run-2.csv` · run ID `simulate-1@20261128-122624`.

### Lời nói gợi ý — 60 giây

“Nhóm mô phỏng 50 phiên thật theo tần suất ba nhóm người dùng và tỷ lệ đạt 19 trên 21 của GPT-6 Luna, không coi mọi câu trả lời đều thành công. Tính theo bảng giá OpenAI của BTC, chi phí khoảng 0,00018 đô mỗi task thành công. Ở quy mô cơ sở 436 người, hết gần 1 đô mỗi tháng — tức chỉ 0,0022 đô mỗi người so với hơn 50 phút tự tìm kiếm. Nhóm đề xuất tiếp tục thử nghiệm có kiểm soát: sửa hai lỗi còn lại và đo thời gian tiết kiệm thực tế. Giá trị cần chứng minh là học viên hiểu bài và tự kiểm lại được nguồn.”

### Trạng thái PDF CP4

Đã cập nhật bảng 50 phiên và xuất đủ **4 trang** thành `demo-slides.pdf` tại thư mục gốc repo (và đồng bộ trong `slides/demo-slides.pdf`).
