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

## 3. Một lần cải tiến

- Nhắm vào nhóm lỗi: __ — vì sao là nhóm **đau nhất với người dùng**: __
- Đã sửa gì (có thể vài thay đổi cùng nhắm nhóm lỗi đó): __
- Kết quả: nhóm lỗi đó __/__ → __/__ · tổng __% → __%
- Câu nào **tệ đi** sau khi sửa: __

## 4. Còn lại

- Lỗi chưa sửa + nguy hiểm thế nào: __
- Nếu có thêm 1 tuần: __
