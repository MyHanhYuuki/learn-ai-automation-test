# Spec Review — Login Form (practicetestautomation.com)

## Tóm tắt
Trang login demo công khai tại `https://practicetestautomation.com/practice-test-login/` cung cấp form đăng nhập cơ bản gồm username field, password field và submit button. Mục tiêu kiểm thử là xác nhận hành vi UI và functional theo các acceptance criteria đã liệt kê.

## Acceptance Criteria

| AC-ID | Mô tả | Testable? |
|-------|-------|-----------|
| AC-1 | Form hiển thị đầy đủ các thành phần UI: username field, password field, submit button, và label tương ứng | Yes |
| AC-2 | Login thành công với credentials hợp lệ (student / Password123) — hệ thống chuyển hướng sang trang success | Yes |
| AC-3 | Login thất bại khi username sai — hiển thị error message phù hợp | Yes |
| AC-4 | Login thất bại khi password sai — hiển thị error message phù hợp | Yes |
| AC-5 | Login thất bại khi bỏ trống một hoặc cả hai fields — hiển thị error hoặc validation message | Yes |

## Business Rules
- Chỉ duy nhất một bộ credentials hợp lệ: `student` / `Password123`
- Bất kỳ credentials nào khác đều dẫn đến login thất bại
- Login thành công phải chuyển hướng sang một trang khác (success page), không phải reload lại trang login
- Login thất bại phải hiển thị error message trên trang (không alert/popup)

## Dependencies
- Trang demo public: không cần tài khoản đặc biệt, luôn online tại URL trên
- Không có API backend cần mock hay stub
- Không phụ thuộc module/service nội bộ nào khác

## Phạm vi test
- **Trong phạm vi:**
  - Kiểm tra sự hiện diện và hiển thị của các thành phần UI
  - Luồng happy path: login thành công với credentials hợp lệ
  - Luồng negative: login thất bại (sai username, sai password, bỏ trống field)
  - Nội dung và vị trí error message khi login thất bại
  - Hành vi sau khi login thành công (URL/page redirect)
- **Ngoài phạm vi:**
  - Backend / API testing
  - Performance testing
  - Security testing (SQL injection, brute force, XSS)
  - Kiểm thử đa ngôn ngữ / localization
  - Kiểm thử trên nhiều browser / responsive design

## Review Checklist

| Hạng mục | Kết quả | Ghi chú |
|----------|---------|---------|
| Chức năng có được mô tả đầy đủ không? | Yes | Feature description rõ ràng, đủ để bắt đầu thiết kế test |
| Acceptance criteria có đo lường được, testable không? | Yes | Tất cả 5 AC đều có thể kiểm chứng tự động bằng Playwright |
| Validation rules và error handling có được đề cập không? | Partial | AC-3/4/5 đề cập error nhưng chưa nêu rõ nội dung exact text của error message |
| Ràng buộc kỹ thuật / business có rõ ràng không? | Yes | Credentials cứng được cung cấp, URL xác định |
| Dependency với module/service khác có được liệt kê không? | Yes | Không có dependency nội bộ, đây là trang demo độc lập |
| Edge cases, negative scenarios có được đề cập không? | Partial | Có đề cập username sai, password sai, bỏ trống — nhưng chưa rõ trường hợp bỏ trống từng field riêng lẻ vs cả hai |
| Có câu hỏi mở nào blocking test design không? | Minor | Xem internal-question.md — không có câu hỏi blocking nghiêm trọng |

## Assumptions / Risks
- **Assumption 1:** Trang demo luôn available và không thay đổi credentials trong quá trình test.
- **Assumption 2:** "Error message phù hợp" trong AC-3/4/5 sẽ được xác nhận dựa trên nội dung thực tế quan sát được trên trang.
- **Risk 1:** Trang demo của bên thứ ba có thể bị downtime hoặc thay đổi UI bất ngờ, ảnh hưởng đến kết quả test.
- **Risk 2:** AC-5 chưa làm rõ behavior khi chỉ bỏ trống username vs chỉ bỏ trống password — có thể cần thêm test case riêng.
