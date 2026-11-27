# AI SPEC — Trợ giảng pre-class có căn cứ · Nhóm 3mien · Phòng [chờ cập nhật] · Zone [chờ cập nhật]

> Mốc nộp: §7 chốt chuẩn "đạt" tại **CP2 19:30 Thứ Sáu 27/11** · §0–§7 nộp **CP3 10:00 Thứ Bảy 28/11** · đủ §0–§10 **CP4 14:30 Thứ Bảy 28/11** · §10 changelog ghi tiếp đến **23:59 Thứ Bảy 28/11**.

Track: [x] A · [ ] B · [ ] C · [ ] D · [ ] E — bài toán: **A1 · Tutor cho LMS và trang pre-class** (trợ giảng có căn cứ, biết hỏi ngược khi thiếu ngữ cảnh và từ chối khi ngoài bài)
Data BTC cấp đã dùng (không commit nguyên file): `data/preclass/` (từ 05/11/2026 đến 25/11/2026, đã ẩn danh; script đếm tại `evidence/count_preclass.py`).

## §0. Hiện tại việc này diễn ra thế nào *(guide 1.1)*
- Luồng hiện tại của việc học pre-class trên `preclass-online.com`:
  1. Học viên mở bài giảng video và slide pre-class (37,3% lượt mở video diễn ra từ 19h–07h VN).
  2. Khi gặp chỗ khó hiểu hoặc muốn hỏi thêm, học viên bôi đen chữ trên slide hoặc gõ câu hỏi vào khung chat trợ giảng ngay dưới video (`video_question`: 1.108/1.260 lượt chat).
  3. Hệ thống trả lời trực tiếp vào khung chat (nhiều lượt câu ngắn/thiếu bối cảnh vẫn được trả lời ngay hoặc rơi vào `missing_context`, hoặc thiếu mốc trích dẫn để mở lại đoạn giảng).
  4. *(Ảnh chụp giao diện từ tài khoản học viên đã che thông tin: cập nhật bổ sung ở CP2).*
- Công cụ / AI đang được dùng cho việc này: Trợ giảng AI tích hợp sẵn dưới video trên `preclass-online.com` (nguồn: `data/preclass/README.md` và quan sát tài khoản học viên trong lớp).

## §1. Người dùng & bằng chứng *(guide 1.1, 1.2)*
- Người dùng chính (một vai cụ thể): Học viên L3 đi làm/học tối muộn (19h–01h) tự học bài pre-class trên `preclass-online.com` khi không có TA trực.
- Việc họ cố làm xong (`động từ + đối tượng + bối cảnh`, không có chữ AI): Hiểu đúng một khái niệm hoặc chỗ vướng trong bài pre-class ngay trong buổi tối tự học trước giờ lên lớp.
- Hôm nay họ giải bằng gì, hỏng ở đâu, vì sao chưa bỏ: Dùng trợ giảng có sẵn dưới video, tự tua lại video/slide, hoặc hỏi trên Discord; hỏng ở chỗ câu hỏi ngắn/thiếu bối cảnh thường nhận trả lời chung chung không kèm mốc bài để kiểm lại, phải hỏi lặp lại hoặc chờ sang ngày hôm sau mới có TA; chưa bỏ vì vẫn cần hoàn thành bài trước buổi học và không có người hướng dẫn trực lúc đêm muộn.
- Pain (KHÔNG chữ AI): Học viên L3 tự học pre-class buổi tối khi vướng khái niệm hoặc đặt câu hỏi ngắn/thiếu bối cảnh thường nhận được lời giải đáp chung chung không dẫn đúng mốc bài giảng hoặc phải hỏi lặp lại nhiều lần, khiến họ mất thời gian tự tua lại video hoặc bỏ dở bài trước buổi học.
- Bằng chứng — số chính + kết luận (chi tiết: `evidence/data-mining.md`, tổng hợp đầy đủ sau phỏng vấn ở `evidence/summary.md`):
  - **Đào `data/preclass/` (05/11–25/11/2026):** `436/721` tài khoản hoạt động; `493/1.260` (**39,1%**) lượt chat ngoài giờ 19h–07h VN; `150/1.260` (**11,9%**) câu hỏi `<= 15` ký tự; `100/1.108` (**9,0%**) lượt `video_question` bị `missing_context = True`; `245/1.223` (**20,0%**) câu chat có rubric `bam_bai=0` và `dung_ngu_canh=0`; `35/137` (**25,5%**) lượt có ghi `ask_count` là hỏi lại (`ask_count > 0`); `242/615` (**39,3%**) lượt từ `13/11` trở đi thiếu `moc_trich_dan`.
  - **Phỏng vấn đối chứng (`P1`–`P4`):** Đang thực hiện trong chiều 27/11, cập nhật vào `evidence/summary.md` trước CP3.

## §2. Impact & quyết định chọn *(guide 1.3)*

| Hướng | Bao nhiêu người gặp | Bao nhiêu lần / tháng | Mỗi lần tốn gì | Impact / tháng | Làm kịp không | Chọn? |
|---|---|---|---|---|---|---|
| **1 · Trợ giảng pre-class có căn cứ & hỏi ngược khi thiếu ngữ cảnh (A1)** | `145` học viên từng hỏi (`436` người hoạt động trong `data/preclass/`) | `~10,9` lượt hỏi/tháng (quy đổi từ `7,64` lượt/21 ngày; tổng `~1.583` lượt/tháng toàn tập hỏi) | `~5` phút tự tua tìm/hỏi lại *(tự ước tính, kiểm lại qua P1–P4)* | `~7.915` phút (**~132 giờ/tháng** toàn tập; riêng nhóm ~20–25% lượt hỏi lỗi/lặp tốn ~26–33 giờ/tháng) | Kịp (workflow cố định + 2 công cụ đọc) | **Chọn** |
| **2 · Gỡ kẹt mini-lab & vá lỗi sai bài ôn tập (A1/A6)** | `147` học viên mở lab / `77` học viên làm `pre_post_post` | `~5,9` lượt mở lab & làm sai/người/tháng (21 ngày: `102/453 = 22,5%` skip lab, `399` câu sai) | `~10` phút tự mò lỗi/làm lại *(tự ước tính)* | `~5.700` phút (**~95 giờ/tháng** quy mô hẹp hơn Hướng 1) | Khó kịp (dữ liệu từng bước lab đa dạng, khó dựng đủ ngữ cảnh) | **Loại** |
| **3 · Bộ điều phối bạn học AI chống nhiễu (A4)** | `286` học viên thấy bạn học AI xen vào | `~69,8` lượt hiển thị/người/tháng (`13.975` lượt/21 ngày nhưng chỉ `151` phản hồi = `1,08%`) | Gây xao nhãng khi xem video (~0,5 phút/lượt *(tự ước tính)*) | Khó quy đổi thành thời gian tiết kiệm rõ ràng nếu chưa đo được điểm học tập | Rủi ro không kịp (A4 bắt buộc ≥1 chỉ số đo hiệu quả học) | **Loại** |

- **Impact / tháng** của hướng chọn = `145` người × `10,9` lần/tháng × `5` phút = **~7.915 phút (~132 giờ/tháng)** trên nhóm học viên thường xuyên hỏi (trong đó ~20–25% lượt hỏi bị lạc ngữ cảnh/hỏi lặp gây tốn trực tiếp ~26–33 giờ/tháng).
  - *Nguồn từng thừa số:* `145` người và `7,64` lượt/21 ngày (quy đổi `7,64 × 30/21 ≈ 10,9` lượt/tháng) lấy trực tiếp từ `data/preclass/` (`evidence/count_preclass.py`); `5` phút/lần là *(tự ước tính — sẽ hiệu chỉnh bằng con số thực từ phỏng vấn P1–P4 trước CP3)*.
- **Hướng ĐÃ LOẠI + vì sao (giữ lại, đừng xoá):**
  - *Hướng 2 (Gỡ kẹt mini-lab):* Tỉ lệ bỏ qua lab khá cao (`22,5%`) nhưng số người chạm tới hẹp hơn (`147` người mở lab; `77` người làm `pre_post_post`) và mỗi bài mini-lab đòi hỏi dựng code/test case thực hành riêng nên khó phủ tốt trong 10 giờ.
  - *Hướng 3 (Bộ điều phối bạn học AI - A4):* Tỉ lệ tương tác rất thấp (`1,08%`), tuy nhiên theo rubric hướng A4 bắt buộc phải có chỉ số đo lường việc học thực tế (học viên hiểu bài hơn sau can thiệp), rất khó kiểm chứng định lượng trung thực trong 2 ngày.
- **Số lần / tháng của từng kiểu người dùng (quy đổi 21 ngày → 30 ngày từ `data/preclass/`, dùng cho persona ở §8):**
  - Dùng ít (1–2 lượt/21 ngày · **38,6%**): TB `1,3 × 30/21 ≈ 2` lượt/tháng.
  - Dùng vừa (3–10 lượt/21 ngày · **42,1%**): TB `6,2 × 30/21 ≈ 9` lượt/tháng.
  - Dùng nhiều (>10 lượt/21 ngày · **19,3%**): TB `23,6 × 30/21 ≈ 34` lượt/tháng.

## §3. Giải pháp tương tự *(guide 2.1)*
- [sản phẩm / tính năng gần giống]: một điều đáng học · một điều đáng né · mình khác gì

## §4. Thiết kế *(guide 2.2, 3.2)*
- **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả):
- Không làm (≥3 điều):
- **Sơ đồ** (ảnh / Mermaid / draw.io): [chèn ở đây]
- **Hình dạng:** [ ] workflow cố định · [ ] một agent · [ ] nhiều agent — 2 dòng lý do, và vì sao **không** chọn hình dạng phức tạp hơn:
- **AI dựa vào đâu** — mỗi công cụ (khớp `codebase/tools.py`):

  | Công cụ | Input | Output | Tác động ra ngoài? |
  |---|---|---|---|
  |  |  |  |  |

- **Mức tự động:** [ ] AI gợi ý, người quyết · [ ] AI tự làm khi chắc, chuyển người khi không · [ ] AI tự làm — lý do (sai thì ai chịu gì, sửa đắt hay rẻ):
- **Chỗ chặn rủi ro** (rủi ro lớn nhất của lát cắt bị chặn ở đâu, bằng gì):
- **Chỗ người duyệt** (việc AI không được tự làm):
- **Nguyên tắc thiết kế** (≥3, bắt buộc G10):

  | Nguyên tắc | Chỗ cụ thể trên sơ đồ / trong bản chạy thử |
  |---|---|
  | G10 — thu hẹp phạm vi khi không chắc |  |
  |  |  |
  |  |  |

- Phần nào còn giả (công cụ trả dữ liệu giả, model chế độ giả…) — ghi rõ, không giả làm thật:

## §5. Chỗ khó — 4 lớp + ≥6 kịch bản + 2 tấn công *(guide 2.3)*

| Kịch bản | Lớp (1–4) | Hành vi mong muốn (nói gì, hiện gì, cho làm gì tiếp) | Câu thử |
|---|---|---|---|
|  |  |  |  |
| *(tấn công)* |  |  |  |
| *(tấn công)* |  |  |  |

(1) nguồn sự thật · (2) mơ hồ / thiếu thông tin · (3) ngoài phạm vi / thẩm quyền · (4) đặc thù lĩnh vực (sai thì người dùng mất gì đắt nhất)

## §6. Bốn đường đi của trải nghiệm
- Mọi thứ suôn sẻ: · Không chắc (lớp 2): · Không có căn cứ (lớp 1): · Người dùng sửa:
- Bị đòi ngoài phạm vi (lớp 3): · Trường hợp đặc thù lĩnh vực (lớp 4):

## §7. Đánh giá & chuẩn "đạt" *(guide 2.4, 4.1)*
- Data card: `data/DATA_CARD.md` · bộ câu thử: `eval/benchmark.csv` — __ câu (thuong __ · kho __ · tu_choi __) · metric: `eval/metric_spec.yaml` (__ metric)
- **Chuẩn "đạt"** (chốt **trước 19:30 Thứ Sáu 27/11**, giữ nguyên đến 23:59 Thứ Bảy 28/11): "Đạt khi ≥ __% câu qua, và __"
- Kết quả: lượt 1 __/__ (__%) · lượt 2 __/__ (__%) — run ID: __ / __ → chi tiết `eval/report.md`, hồ sơ `eval/README.md`

## §8. Chi phí khi dùng thật *(guide 4.2)*
- Persona + giá: `cost/personas.yaml` · lượt mô phỏng: `cost/simulate-__.csv` (__ phiên)
- Chi phí / task thành công: __ (model __) · __ (model __)
- Chi phí / tháng ở quy mô thật: thấp __ · cơ sở __ · cao __ → chi tiết `cost/cost-estimate.md`
- So với impact / người / tháng (§2): đáng làm không, vì sao:

## §9. Rủi ro & an toàn
- Dữ liệu: đã ẩn danh gì, không thu gì, không đưa gì vào model gói miễn phí:
- AI **không được** làm gì kể cả khi người dùng yêu cầu:
- Ai có thể bị hại nếu AI sai, và nhóm chặn thế nào:

## §10. Phân công & changelog
- Phân công có tên (song song 4 mảng độc lập để không chờ nhau):
  - **Bùi Gia Huy** (`2A202603525` · Đội trưởng): Điều phối, Kiến trúc AI, Spec & Nộp checkpoint (`TEAMS.md`, `README.md`, `canvas.md`, `spec.md`, `docs/ai-usage.md`, phỏng vấn `P1.md`).
  - **Ngô Đức Thịnh** (`2A202603548` · Thành viên): Codebase, Dữ liệu bài mẫu, Nối model & Guardrails (`codebase/`, `data/lessons.json`, `data/DATA_CARD.md`, phỏng vấn `P2.md`).
  - **Phan Trọng Hậu** (`2A202603547` · Thành viên): Bằng chứng pain, Bộ câu thử & Đánh giá (`evidence/`, `eval/benchmark.csv`, `eval/metric_spec.yaml`, `eval/report.md`, `eval/README.md`, phỏng vấn `P3.md`).
  - **Vũ Quang Thái** (`2A202603545` · Thành viên): Mô phỏng chi phí, Người dùng thử Bonus & Slide/Demo (`cost/`, `validation/log.md`, `slides/`, `demo-slides.pdf`, phỏng vấn `P4.md`).
- Dùng AI vào việc gì (2–3 dòng; chi tiết `docs/ai-usage.md`): Nhóm dùng coding agent hỗ trợ viết script đếm `evidence/count_preclass.py`, chuẩn hoá tài liệu khung và sẽ hỗ trợ code/review bản chạy thử. Toàn bộ số liệu đếm, phỏng vấn người dùng và chấm đánh giá đều do thành viên kiểm chứng thủ công.
- Nhật ký thay đổi — **mọi thay đổi sau CP2 19:30 Thứ Sáu 27/11 phải có dòng ở đây**:

**CP2 → CP4** (vd thu hẹp lát cắt, hỏi thêm người dùng, lần cải tiến trước lượt 2)

| Thời điểm | Đổi gì | Vì sao (trỏ về câu thử / lỗi / bằng chứng nào) |
|---|---|---|
|  |  |  |

**Sau CP4 (đến 23:59 Thứ Bảy 28/11)** (sửa theo góp ý — không sửa chuẩn "đạt", câu thử, số bằng chứng, kết quả các lượt đã chạy)

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
|  |  |  |
