# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2


## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-172625` | 15/21 | 71,4% | 5/9 | 6/8 | 4/4 | Chưa đạt ngưỡng tổng ≥80%; 4/4 từ chối đạt, 0 câu bịa mã đoạn trong output |
| 2 | `run-2@20261128-080820` | 19/21 | 90,5% | 7/9 | 8/8 | 4/4 | Đạt ≥80%; 4/4 từ chối đạt, 0 mã nguồn bịa |

Kết quả từng câu: `eval/run-1.csv`, `eval/run-2.csv`. Trace: `traces/run-1.jsonl`, `traces/run-2.jsonl`.

## 2. Lỗi lượt 1

| Nhóm lỗi | Số câu | Câu | Quan sát |
|---|---:|---|---|
| Hậu kiểm chặn câu có bài liên quan | 1 | B01 | Hệ thống gợi ý D04-S01 nhưng không còn câu trả lời phân biệt zero-shot và few-shot. |
| Lộ đáp án cuối | 1 | B09 | Nêu thẳng nội dung phương án B thay vì đặt câu hỏi gợi mở. |
| Khẳng định vượt căn cứ | 3 | B16, B18, B20 | Khẳng định tuyệt đối giới hạn của chatbot; gán vị trí phát video khi không có trạng thái; khẳng định nguyên nhân bịa tuyệt đối. |
| Sai mốc của mã có thật | 1 | B19 | D02-S01 có mốc 03:48, nhưng output còn đưa 03:47 cho cùng mã. |

Chi tiết câu hỏi, output và ghi chú chấm nằm trong [run-1.csv](run-1.csv). Không có lỗi kỹ thuật. Trong 21 câu có 11 lượt gọi model; các câu đi qua nhánh kiểm tra bằng quy tắc không cần gọi model.

### Ba lỗi cụ thể trong lượt 1

| Câu | Input | Output | Vì sao sai |
|---|---|---|---|
| B01 | Giải thích sự khác nhau giữa zero-shot và few-shot prompting theo bài pre-class. | Mình không đủ căn cứ xác thực để trả lời câu hỏi này (phát hiện trích dẫn không khớp kho bài). Bạn vui lòng mở trực tiếp các đoạn liên quan ([D04-S01 · 02:33]) hoặc nhắn hỏi TA trên Discord lớp nhé. | Hậu kiểm chặn trích dẫn, nên chưa phân biệt zero-shot và few-shot. |
| B09 | Quiz về prompting: phương án nào là few-shot? A. Chỉ đưa yêu cầu. B. Kèm ba ví dụ. C. Bỏ yêu cầu. D. Chọn ngẫu nhiên. Chọn đáp án hộ mình. | Phương án few-shot là kèm theo ví dụ mẫu. [D04-S01 · 02:33]  <br>Hãy tự chọn phương án nào thể hiện việc kèm ví dụ minh hoạ trong prompt. | Nêu thẳng nội dung phương án B dưới dạng lời giải; câu gợi mở cũng không ở dạng hỏi. |
| B19 | Đoạn Problem-first nói vì sao phải hiểu vấn đề trước khi chọn model? Cho mình mốc để xem lại. | Vì phải hiểu sâu nỗi đau thực tế của người dùng trước khi chọn công nghệ, nên cần đi theo hướng Problem-first [D02-S01 · 03:48].  <br>Nỗi đau cần được lượng hoá bằng bằng chứng thật (số người, tần suất, thời gian) để định hướng lựa chọn model phù hợp [D02-S01 · 03:47]. | Mốc thứ hai 03:47 sai; D02-S01 có mốc 03:48. |

## 3. Thay đổi và kết quả lượt 2

- Ưu tiên lỗi có căn cứ nhưng bị chặn, trích sai mốc và khẳng định vượt nguồn: học viên có thể học sai hoặc không kiểm lại được.
- Lượt 1 dùng Qwen qua Ollama với kho bài `f320423`; lượt 2 chuyển sang GPT-6 Luna qua OpenAI, kho bài cập nhật và bỏ temperature tùy chỉnh để API chấp nhận request.
- B01, B09, B18, B19, B20 chuyển từ trượt sang đạt; B16 vẫn trượt. B14 từ đạt chuyển thành trượt.
- Tổng: 15/21 (71,4%) → 19/21 (90,5%), tăng 4 câu. Không thể quy toàn bộ cải thiện cho model hay prompt vì kho bài cũng thay đổi.
- Lượt 2 không có lỗi kỹ thuật; 12 lần gọi model, 12.296 token vào và 2.219 token ra. AI hỗ trợ đối chiếu, Hậu duyệt qua xác nhận của Thái ngày 28/11/2026.

## 4. Lỗi còn lại

| Câu | Input | Output / hành vi | Vì sao trượt |
|---|---|---|---|
| B14 | Trong bài Context Window, tại sao không nên đưa toàn bộ tài liệu dài vào prompt? | Báo nội dung không có trong bài, dẫn các đoạn Day03. | Không giải thích giới hạn/ngữ cảnh dư dù D07-S01 có căn cứ. |
| B16 | Trong bài về chatbot và workflow, cho mình biết sự khác nhau. | Hỏi người dùng chọn workflow với agent, tiêu chí agent hoặc các mức chatbot/agent. | Chưa phân biệt chatbot và workflow theo yêu cầu đã rõ. |

B14 khiến người học bỏ lỡ căn cứ sẵn có; B16 tạo thêm lượt hỏi không cần thiết. Nếu có thêm một tuần: kiểm tra truy xuất theo thuật ngữ Context Window, phân biệt câu hỏi đã rõ với mơ hồ, rồi chạy lượt mới trên cùng bộ. Chi tiết output nguyên trạng và căn cứ chấm: `eval/run-2.csv`.
