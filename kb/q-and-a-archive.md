# Q&A Archive — Knowledge Base tích lũy

File này lưu các câu hỏi & câu trả lời từ tất cả issues đã xử lý. Dùng để tham khảo khi bắt đầu issue mới có liên quan.

---

## login-form-test (2026-06-01)

### Q1: Error message exact text là gì?
**Context**: AC-3, AC-4, AC-5 cần assertion cho error text.
**Answer**: Trang practicetestautomation.com hiển thị:
- Username sai: `"Your username is invalid!"`
- Password sai: `"Your password is invalid!"`
- Cả hai trống: `"Your username is invalid!"` (kiểm tra username trước)

### Q2: AC-5 áp dụng cho trường hợp nào?
**Answer**: Bao gồm cả ba trường hợp: bỏ trống cả hai, bỏ trống username riêng, bỏ trống password riêng. TVP-006/007/008 đều trong scope.

### Q3: Form có reset sau login thất bại không?
**Answer**: Form giữ nguyên giá trị đã nhập sau khi login thất bại. Chỉ error message xuất hiện thêm.

### Q4: Cần kiểm tra password field có mask ký tự không?
**Answer**: Có. TC-005 đã được thêm vào kiểm tra `type="password"`.

---
