# Tóm tắt mô phỏng simulate-1@20261128-122624

Do `python run.py simulate` sinh ra — không sửa tay. Chép bảng sang `cost/cost-estimate.md`.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| dung_it | 21 | 1 | 1101 | 93 | 0.6 | 0.7 |
| dung_vua | 22 | 1 | 1042 | 88 | 0.6 | 0.8 |
| dung_nhieu | 7 | 1 | 1509 | 168 | 0.9 | 0.9 |

Tỉ lệ đạt dùng để tính: 19/21 (90%) — lượt run-2@20261128-080820

- Tỉ lệ đạt lấy từ lượt nhóm chọn: eval/run-2.csv (--rate-from).

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (145 người) | Chi phí / tháng — cơ sở (436 người) | Chi phí / tháng — cao (721 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gpt-6-luna (vào 0.1 · ra 0.5 $/1M) | $0.00016 | $0.00018 | $0.00018 | $0.3225 | $0.9697 | $1.60 | $0.0022 |
| gpt-6.2-sol (vào 2.0 · ra 10.0 $/1M) | $0.0033 | $0.0036 | $0.0036 | $6.45 | $19.39 | $32.07 | $0.0445 |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (1.0) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: gpt-6-luna. Giá tính theo từng model trong bảng — model khác bộ tách token thì số token thật có thể lệch; ghi rõ "đo trên model X, tính giá model Y" trong cost/cost-estimate.md.
- Phiên lỗi (không tính vào trung bình): 0/50.
