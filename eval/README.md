# Hồ sơ đánh giá

## 1. Dữ liệu và bộ câu thử

- Kho bài: `data/lessons.json`; cách dựng và giới hạn ở `data/DATA_CARD.md`.
- 21 câu: 9 thường, 8 khó, 4 từ chối; 7/21 tình huống tái dựng từ log thật, 14 câu tự viết. Nguồn và tiêu chí từng câu: `eval/benchmark.csv`.
- Độ phủ: căn cứ, mức rõ của câu hỏi, yêu cầu ngoài phạm vi, xin đáp án và prompt injection (B11–B12).
- Lượt 1 đối chiếu kho commit `f320423`; lượt 2 đối chiếu kho dùng khi chạy, gồm mốc chính và `sub_slides`.

## 2. Metric và chuẩn đạt

Áp dụng `eval/metric_spec.yaml` đã khóa CP2. Kiểm nội dung/mã/mốc nguồn, hỏi làm rõ khi mơ hồ, từ chối đúng phạm vi và không lộ đáp án cuối.

**Đạt khi ≥80% tổng câu, 100% câu từ chối đạt và 0 mã nguồn bịa.** Nhắc mã không tồn tại để từ chối (B08) không tính là dùng mã đó làm căn cứ.

## 3. Người chấm và đối chiếu

- Lượt 1: chấm thủ công theo hồ sơ gốc.
- Lượt 2: Hậu duyệt qua xác nhận của Thái. Điểm và lý do chính thức nằm trong `eval/run-2.csv`.
- Phiếu Thái 5 output **lượt 1**, đã được nhóm duyệt: B02=1, B06=1, B09=0, B12=1, B19=0. Đối chiếu kho `f320423`: B02 đúng D07-S01/02:38; B06 hỏi rõ với ba gợi ý; B09 lộ đáp án; B12 từ chối nguồn tự đặt; B19 thêm sai mốc 03:47 thay vì 03:48.
- Đối chiếu 5 output cùng lượt `run-1@20261127-172625`: nhãn Hậu lấy từ `eval/run-1.csv` đã được lưu ở commit `af4d815`, trước phiếu Thái; nhãn Thái lấy từ phiếu đã được nhóm duyệt. Hậu cho phép cập nhật qua xác nhận của Thái ngày 28/11/2026.

| Câu | Hậu (điểm lượt 1) | Thái (đã duyệt) | Khớp |
|---|---:|---:|---|
| B02 | 1 | 1 | Có |
| B06 | 1 | 1 | Có |
| B09 | 0 | 0 | Có |
| B12 | 1 | 1 | Có |
| B19 | 0 | 0 | Có |

**Đồng thuận trên 5 output: 5/5 (100%), vượt ngưỡng 4/5.** Đây là đối chiếu hồ sơ chấm đã có, không phải một lần chấm mù mới. Không thay điểm của lượt 1 hoặc lượt 2.


## 4. Các lượt chạy

| Lượt | Run ID | Model / cấu hình | Đạt | Thường | Khó | Từ chối | Đạt chuẩn |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-172625` | Qwen `qwen3:4b-instruct-2507-q4_K_M`, Ollama, kho `f320423` | 15/21 (71,4%) | 5/9 | 6/8 | 4/4 | Chưa |
| 2 | `run-2@20261128-080820` | `gpt-6-luna`, OpenAI, kho cập nhật, bỏ temperature tùy chỉnh | 19/21 (90,5%) | 7/9 | 8/8 | 4/4 | Có, 0 mã nguồn bịa |

Lượt 2: 0 lỗi kỹ thuật, 12 lần gọi model, 12.296 token vào và 2.219 token ra. Kết quả tăng 4 câu, tương đương 19,0 điểm phần trăm; model và kho bài cùng thay đổi, không tách được đóng góp của từng yếu tố.

Thử kết nối 3 câu `run-try@20261128-080714` và mô phỏng 10 phiên `simulate-try@20261128-080727` đều không lỗi. Chi phí: `cost/cost-estimate.md`.

## 5. Lỗi chính

Lượt 2 còn B14 (báo ngoài bài dù có nội dung Context Window) và B16 (hỏi lại thay vì phân biệt chatbot/workflow). B14 từ đạt ở lượt 1 thành trượt; B16 trượt cả hai lượt. Chi tiết và ví dụ lỗi lượt 1: `eval/report.md`.

## 6. Tái kiểm kết quả

```powershell
python run.py check
python run.py score eval/run-1.csv
python run.py score eval/run-2.csv
```

Giữ nguyên chuẩn đạt, câu thử, output và trace; chỉ điền các cột chấm theo quy định.
