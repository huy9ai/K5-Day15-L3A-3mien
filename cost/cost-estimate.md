# Chi phí khi dùng thật

## Trạng thái CP3 ngày 28/11/2026

- Đã chạy thử kết nối 3 câu bằng OpenAI / `gpt-6-luna`: `eval/run-try.csv`, run ID `run-try@20261128-080714`, không lỗi.
- Đã chạy thật 10 phiên, seed 42: `cost/simulate-try.csv`, run ID `simulate-try@20261128-080727`; 6 lần gọi model, tổng 6.517 token vào và 885 token ra, lỗi 0/10.
- Đã chạy eval 21 câu bằng cùng model: `eval/run-2.csv`, run ID `run-2@20261128-080820`; đã chấm 19/21 (90,5%), Hậu duyệt ngày 28/11/2026; dùng tỷ lệ này để tính chi phí/task.

## 1. Đầu vào

- Persona: dùng ít / vừa / nhiều, tỷ lệ 38,6% / 42,1% / 19,3%, tần suất 2 / 9 / 34 phiên/người/tháng; 1 lượt hỏi = 1 phiên. Nguồn: Huy bàn giao, `spec.md` §2 và cấu hình nhóm duyệt trong `cost/personas.yaml`.
- Quy mô: thấp 145, cơ sở 436, cao 721 người; áp dụng cùng cơ cấu tần suất theo cấu hình nhóm đã chốt.
- Model thực đo: `gpt-6-luna` qua OpenAI; giá quy đổi: `gemini-3.1-flash-lite` và `gemini-4-hydrogen` theo bảng BTC tra ngày 25/11/2026, có nguồn trong `cost/personas.yaml`.
- Bảng dưới so sánh hai mức giá Gemini trên lượng token GPT-6 Luna; không phải số tiền OpenAI thu. Chưa có đơn giá GPT-6 Luna trong cấu hình mô phỏng này.
- Tỷ lệ đạt dùng tính: 19/21 của GPT-6 Luna (`run-2@20261128-080820`), không dùng tỷ lệ Qwen.

## 2. Kết quả chạy thử 10 phiên

Tổng hợp lại từ `cost/simulate-try.csv` và tỷ lệ đạt đã duyệt ở `eval/run-2.csv`, bằng hàm tính của khung. Giữ nguyên file kết quả và bản tóm tắt sinh tại thời điểm chạy.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| dung_it | 4 | 1 | 560 | 94 | 0.5 | 0.5 |
| dung_vua | 5 | 1 | 643 | 73 | 0.6 | 1.0 |
| dung_nhieu | 1 | 1 | 1062 | 143 | 1.0 | 1.0 |

Tỉ lệ đạt dùng để tính: 19/21 (90%) — lượt run-2@20261128-080820

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (145 người) | Chi phí / tháng — cơ sở (436 người) | Chi phí / tháng — cao (721 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gemini-3.1-flash-lite (vào 0.25 · ra 1.5 $/1M) | $0.00030 | $0.00033 | $0.00033 | $0.6367 | $1.91 | $3.17 | $0.0044 |
| gemini-4-hydrogen (vào 1.5 · ra 7.5 $/1M) | $0.0016 | $0.0018 | $0.0018 | $3.54 | $10.65 | $17.60 | $0.0244 |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (1.0) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: gpt-6-luna. Giá tính theo từng model trong bảng — model khác bộ tách token thì số token thật có thể lệch; ghi rõ "đo trên model X, tính giá model Y" trong cost/cost-estimate.md.
- Phiên lỗi (không tính vào trung bình): 0/10.

## 3. Việc còn lại cho CP4

1. Thống nhất đơn giá model triển khai; nếu tính chi phí OpenAI phải đưa giá GPT-6 Luna có nguồn vào `cost/personas.yaml`.
2. Trên cùng model GPT-6 Luna, chạy `python run.py simulate --rate-from eval/run-2.csv` để có ít nhất 50 phiên và chi phí/task thành công.
3. Chép kết quả mới vào đây, cập nhật `spec.md` §8, slide và đối chiếu chi phí/người/tháng với impact ở §2. Chưa dùng 10 phiên thử làm kết quả đủ 50 phiên CP4.
