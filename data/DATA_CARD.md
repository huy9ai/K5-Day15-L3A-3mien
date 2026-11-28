# Data card — dữ liệu bản chạy thử dùng

> Điền ở guide bước 2.4 (bản đầu ở CP2, đủ ở CP3). Ôn lại: ngày 6 · lab ngày 6. Chấm ở rubric R4.
> Một trang. Mỗi dataset một mục. Dữ liệu chạy thử để trong thư mục `data/`.
> Không commit nguyên tài liệu khoá, dữ liệu cá nhân thật hay nguyên file data BTC cấp — chỉ đoạn trích ngắn, bản viết lại, hoặc số đã tổng hợp.

## Dataset 1 · `data/lessons.json` (Kho đoạn bài giảng pre-class có mã đoạn `Dxx-Syy` — đủ Day01 → Day15)

| | |
|---|---|
| Dùng để làm gì | Nguồn tri thức cục bộ cho 2 công cụ đọc `search_lesson(query, top_k=3)` và `get_passage(code)` trong `codebase/tools.py`, phục vụ bản chạy thử Trợ giảng pre-class có căn cứ (`codebase/agent.py`) |
| Từ đâu | **Khung mục lục, tiêu đề phần, ý chốt ngắn và mốc thời gian thực (`mm:ss`)** trích lược từ 15 bài giảng pre-class AI20K L3 (`Day01` → `Day15`), đối chiếu với log `data/preclass/` và `teaching-schedule.xlsx`. Không sao chép hay commit nguyên văn tài liệu/file HTML gốc của khoá |
| Xử lý những bước gì | Chuẩn hoá mã đoạn duy nhất dạng `Dxx-Syy` (`D01-S01` → `D15-S03`) theo đúng `spec.md` §4 · tổ chức cấu trúc 2 tầng Cha–Con (Parent–Child): mỗi đoạn cha gắn đầy đủ `code`, `lesson`, `slide`, `timestamp`, `end_timestamp`, `title`, `text`, `keywords`, kèm danh sách `sub_slides` chi tiết từng slide (`slide`, `timestamp`, `title`, `summary` rút gọn) · kiểm tra JSON hợp lệ và chạy kiểm thử tra cứu 15/15 ngày bằng `codebase/tools.py` |
| Số dòng / số đoạn | **86 đoạn cha** phủ đầy đủ **15 ngày học** (`Day01`: 5, `Day02`–`Day14`: 6 phần/ngày, `Day15`: 3) và **375 slide con (`sub_slides`)** có tóm tắt ý chính + mốc giây riêng |
| Phiên bản / ngày lấy | `v3.1-all-15-days-parent-child` · 28/11/2026 |
| Nhãn | `synthetic` (bản tóm tắt rút gọn) trên khung mục lục và mốc thời gian `thật` của 15 bài giảng |
| Giới hạn | Mỗi `sub_slide` chỉ tóm gọn ý chốt chính trên slide (~200–340 ký tự), không lưu nguyên văn lời thoại từng giây hay đáp án bài quiz/mini-lab |

**Data `synthetic` (phần văn bản tóm tắt):** Biên soạn/trích lược ngắn gọn theo từng phần chính bởi **Ngô Đức Thịnh**, không sinh ngẫu nhiên (không dùng seed); đã kiểm tra đủ **86/86 đoạn** về mã đoạn duy nhất `Dxx-Syy`, mốc thời gian và độ phủ tra cứu 15/15 ngày. Dữ liệu này chỉ phục vụ bản chạy thử và kiểm thử kỹ thuật, **không phải bằng chứng pain**.

---

## Dataset 2 · `data-btc/preclass/` (Log hành vi học pre-class của BTC — lưu cục bộ, không commit)

| | |
|---|---|
| Dùng để làm gì | Đào bằng chứng pain (`evidence/data-mining.md`), tính Impact (`spec.md` §2), phân bố tần suất cho Persona chi phí (`cost/personas.yaml`), và trích xuất siêu dữ liệu 13 bài học cho `data/lessons.json` |
| Từ đâu | Data BTC cấp (`learners.csv`, `events.csv`, `chat.csv`, `answers.csv`, `completed_items.csv`, `class_events.csv`, `rewards.csv`) |
| Xử lý những bước gì | Đọc `README.md`, `column_dictionary.csv` và dòng mẫu trước khi đếm · quy đổi giờ UTC sang giờ Việt Nam (`UTC+7`) · lọc tài khoản có hoạt động (`436/721`) · chỉ đếm tỉ lệ thiếu `moc_trich_dan` từ ngày `2026-11-13` (ngày bắt đầu ghi log trường này) · chạy tái lập bằng script `evidence/count_preclass.py` |
| Số dòng / số đoạn | `721` tài khoản (`436` hoạt động) · `107.709` sự kiện · `1.260` lượt chat (`1.108` `video_question`) · `3.776` lượt trả lời · `2.472` mục hoàn thành (`Day01` → `Day13`) |
| Phiên bản / ngày lấy | Dữ liệu từ `05/11/2026` đến `25/11/2026` (21 ngày) · lấy ngày `27/11/2026` |
| Nhãn | `thật` (đã ẩn danh bởi BTC: mã `L0001…`, `C00001…`, không có tên/email/SĐT) |
| Giới hạn | Không có nội dung chữ câu hỏi của học viên và câu trả lời của AI (chỉ có độ dài ký tự, giờ hỏi, đường dẫn transcript và cờ trạng thái); cần đối chiếu thêm bằng phỏng vấn `P1`–`P4` |

---

## Dataset 3 · `data-btc/training-ops/` (Lịch giảng dạy giả lập của BTC — chỉ tham chiếu tên chuyên đề, không commit)

| | |
|---|---|
| Dùng để làm gì | Đối chiếu tên chuyên đề chính thức của các ngày học L3 (sheet `Tong_hop` trong `teaching-schedule.xlsx`) khi đặt tiêu đề trong `data/lessons.json`. Các câu hỏi vận hành (lịch phòng, đổi ca lab coach, điểm danh) nằm ngoài lát cắt A1 nên không nạp vào công cụ tra cứu |
| Từ đâu | Data BTC cấp (`teaching-schedule.xlsx`, `lab-coach-schedule.xlsx`) |
| Xử lý những bước gì | Chỉ đọc cột `Chuyên đề` trong sheet `Tong_hop` để đối chiếu khớp với 13 `program-dayNN` của `preclass` |
| Số dòng / số đoạn | `111` buổi học (21 ngày học giả lập Khoá 9) |
| Phiên bản / ngày lấy | Bản xuất giả lập trong bộ đề · lấy ngày `27/11/2026` |
| Nhãn | `synthetic` (BTC giả lập người/ngày, giữ tên chuyên đề và cấu trúc khoá thật) |
| Giới hạn | Là dữ liệu giả lập vận hành lớp học, **không phải bằng chứng pain** |
