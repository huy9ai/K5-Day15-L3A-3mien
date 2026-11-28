# Chi phí khi dùng thật

## Trạng thái CP4 ngày 28/11/2026

- Đã chạy thật **50 phiên** theo `cost/personas.yaml` (`seed = 42`) trên model OpenAI **`gpt-6-luna`**: `cost/simulate-1.csv`, `cost/simulate-1-summary.md`, `traces/simulate-1.jsonl`, run ID **`simulate-1@20261128-122624`**.
- Tổng thực đo qua bản chạy thử hiện tại (`codebase/agent.py` + `tools.py`, kho bài `data/lessons.json` `v3.1-all-15-days-parent-child`): **31 lần gọi model**, **38 lần gọi công cụ**, **56.607 token vào** và **5.073 token ra**, lỗi **0/50**.
- Tỉ lệ đạt dùng để tính chi phí / task thành công: **19/21 (90,5%)** của cùng model `gpt-6-luna` từ `eval/run-2.csv` (`run-2@20261128-080820`, Hậu duyệt ngày 28/11/2026). *(Lưu ý minh bạch: sau `run-2`, Thịnh đã nâng cấp thêm `sub_slides` ở commit `b1765d2`, nên token mô phỏng được đo trực tiếp trên code và kho bài mới nhất này còn tỉ lệ đạt giữ nguyên bản `run-2` đã chấm hợp lệ trước đó.)*

## 1. Đầu vào

- **Persona:** dùng ít / vừa / nhiều, tỷ lệ **38,6% / 42,1% / 19,3%**, tần suất **2 / 9 / 34** phiên/người/tháng; 1 lượt hỏi = 1 phiên. Nguồn: `spec.md` §2 (`evidence/count_preclass.py`) và `cost/personas.yaml`.
- **Quy mô 3 kịch bản:** thấp **145** (nhóm từng hỏi), cơ sở **436** (nhóm hoạt động), cao **721** người (toàn bộ tài khoản trong `data/preclass/`); áp dụng cùng cơ cấu tần suất của nhóm từng hỏi.
- **2 mức model so sánh (cùng hệ OpenAI, bảng giá BTC `further-reading/model-prices.md` tra ngày 25/11/2026 tại `https://developers.openai.com/api/docs/pricing`):**
  1. `gpt-6-luna` (Tầng Nhỏ — **đúng model chạy thật**): **vào \$0.10 · ra \$0.50 / 1M token**.
  2. `gpt-6.2-sol` (Tầng Lớn — so sánh model mạnh gấp 20× cùng tokenizer OpenAI): **vào \$2.00 · ra \$10.00 / 1M token**.
- **Tỉ lệ đạt dùng tính:** 19/21 của `gpt-6-luna` (`run-2@20261128-080820`), không coi 100% câu trả lời đều thành công và không dùng tỉ lệ Qwen lượt 1.

## 2. Kết quả mô phỏng 50 phiên (`simulate-1@20261128-122624`)

Bảng giữ nguyên theo đầu ra chuẩn của `python run.py simulate --rate-from eval/run-2.csv` (`cost/simulate-1-summary.md`):

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| dung_it | 21 | 1 | 1101 | 93 | 0.6 | 0.7 |
| dung_vua | 22 | 1 | 1042 | 88 | 0.6 | 0.8 |
| dung_nhieu | 7 | 1 | 1509 | 168 | 0.9 | 0.9 |

Tỉ lệ đạt dùng để tính: 19/21 (90%) — lượt `run-2@20261128-080820`

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (145 người) | Chi phí / tháng — cơ sở (436 người) | Chi phí / tháng — cao (721 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gpt-6-luna (vào 0.1 · ra 0.5 $/1M) | $0.00016 | $0.00018 | $0.00018 | $0.3225 | $0.9697 | $1.60 | $0.0022 |
| gpt-6.2-sol (vào 2.0 · ra 10.0 $/1M) | $0.0033 | $0.0036 | $0.0036 | $6.45 | $19.39 | $32.07 | $0.0445 |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (1.0) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: `gpt-6-luna`. Cả hai mức giá đều dùng cùng họ model OpenAI nên không lệch bộ tách token (`measured on gpt-6-luna`, `priced on gpt-6-luna` và `gpt-6.2-sol`).
- Phiên lỗi (không tính vào trung bình): **0/50**.

## 3. So sánh chi phí với Impact (`spec.md` §2)

- **Impact / người / tháng (`spec.md` §2):** mỗi học viên từng hỏi tốn trung bình `~10,9 lượt/tháng × 5 phút/lượt ≈ 54,5 phút/người/tháng` tự tua tìm/hỏi lại (toàn tập 145 người là `~132 giờ/tháng`; riêng nhóm ~20–25% lượt hỏi lỗi/lặp tốn trực tiếp `~11–14 phút/người/tháng`).
- **Chi phí / người / tháng ở kịch bản cơ sở (436 người):** chỉ **$0.0022 / người / tháng** với `gpt-6-luna` (**$0.97/tháng** cho 436 người, hay **$0.00018 / task thành công**) và **$0.0445 / người / tháng** với `gpt-6.2-sol` (**$19.39/tháng** cho 436 người).
- **Kết luận:** Chi phí API của `gpt-6-luna` rất nhỏ so với `~54,5 phút/người/tháng` thời gian học viên tự tìm/hỏi lại (và chưa bằng 1/20 chi phí `gpt-6.2-sol`), nên **đáng triển khai thử nghiệm có kiểm soát**. Lưu ý phần chi phí ngoài model (hosting server và giờ công TA xử lý các câu bị từ chối/chuyển tiếp) chưa tính vào bảng API này.
