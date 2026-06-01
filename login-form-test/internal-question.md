# Internal Questions — Login Form (practicetestautomation.com)

Danh sách câu hỏi cần stakeholder trả lời trước khi viết test cases chi tiết.

## Câu hỏi blocking (bắt buộc trả lời trước khi tiếp tục)

Không có câu hỏi blocking. Requirement đủ rõ để bắt đầu thiết kế test cases với credentials đã biết và URL cụ thể.

## Câu hỏi non-blocking (có thể tiếp tục nhưng cần làm rõ)

### Q1: Nội dung exact text của error message là gì?
**Context**: AC-3, AC-4, AC-5 đề cập "error message phù hợp" nhưng không chỉ định text cụ thể. Trang demo có thể hiển thị các message khác nhau tùy loại lỗi (sai username vs sai password vs bỏ trống).
**Impact nếu không có**: Test case sẽ phải dùng partial match (contains) thay vì exact match cho assertion, hoặc cần thực hiện exploratory session trước để ghi lại text thực tế. Điều này ảnh hưởng đến độ chính xác của assertion trong script Playwright.

### Q2: AC-5 áp dụng cho trường hợp nào — chỉ bỏ trống cả hai, hay bỏ trống từng field riêng lẻ?
**Context**: Requirement viết "bỏ trống fields" dùng số nhiều nhưng không rõ ràng. Hành vi khi chỉ bỏ trống username vs chỉ bỏ trống password có thể khác nhau.
**Impact nếu không có**: Có thể thiếu test case cho trường hợp bỏ trống từng field riêng lẻ. Hiện tại đã tạo TVP-007 và TVP-008 để bao phủ, nhưng cần xác nhận có trong scope không.

### Q3: Sau khi login thất bại, form có bị reset (clear) hay giữ nguyên giá trị đã nhập?
**Context**: Requirement không đề cập hành vi của form sau khi submit thất bại. Đây là một behavior cần kiểm tra nếu nằm trong scope.
**Impact nếu không có**: Nếu không xác nhận, sẽ không tạo test case cho behavior này. Ảnh hưởng đến TVP-004, TVP-005, TVP-006.

### Q4: Có yêu cầu kiểm tra password field có mask ký tự (type=password) không?
**Context**: AC-1 đề cập "form hiển thị đầy đủ các thành phần UI" nhưng không rõ có bao gồm kiểm tra thuộc tính của field (ví dụ: password field phải che ký tự) hay không.
**Impact nếu không có**: Nếu cần, sẽ bổ sung thêm một viewpoint kiểm tra attribute `type="password"` trên password field.
