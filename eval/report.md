# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

> Điền ở guide bước 4.1. Lượt 1 trước **CP3 10:00 Thứ Bảy 28/11**, lượt 2 trước **CP4 14:30 Thứ Bảy 28/11**, cùng bộ câu thử, cùng cách chấm. Chấm ở rubric R5.
> Số lấy từ `python run.py score eval/run-1.csv` (và `run-2.csv`) sau khi điền cột `pass`. **Kết quả thấp ghi thật vẫn đủ điểm.**
> Không được: sửa chuẩn "đạt", bỏ câu thử trượt, sửa `expected` cho khớp output, sửa kết quả lượt đã chạy.

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-172625` | 15/21 | 71,4% | 5/9 | 6/8 | 4/4 | Chưa đạt ngưỡng tổng ≥80%; 4/4 từ chối đạt, 0 câu bịa mã đoạn trong output |
| 2 | | __/__ | | __/__ | __/__ | __/__ | đạt / chưa |

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

## 3. Một lần cải tiến

- Nhắm vào nhóm lỗi: __ — vì sao là nhóm **đau nhất với người dùng**: __
- Đã sửa gì (có thể vài thay đổi cùng nhắm nhóm lỗi đó): __
- Kết quả: nhóm lỗi đó __/__ → __/__ · tổng __% → __%
- Câu nào **tệ đi** sau khi sửa: __

## 4. Còn lại

- Lỗi chưa sửa + nguy hiểm thế nào: __
- Nếu có thêm 1 tuần: __
