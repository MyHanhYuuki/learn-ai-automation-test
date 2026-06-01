# Login Form Test Requirement

## Target URL
https://practicetestautomation.com/practice-test-login/

## Scope
Kiểm tra UI và chức năng của form login tại URL trên.

## Feature Description
Trang login cơ bản gồm:
- Username field
- Password field
- Submit button
- Kết quả login: success page hoặc error message

## Known Test Credentials (từ trang web public này)
- Valid: username = `student`, password = `Password123`
- Invalid: bất kỳ thông tin sai nào ngoài trên

## Acceptance Criteria (dự kiến)
- AC-1: Form hiển thị đầy đủ các thành phần UI (username field, password field, submit button, label)
- AC-2: Login thành công với credentials hợp lệ — chuyển sang trang success
- AC-3: Login thất bại với username sai — hiển thị error message phù hợp
- AC-4: Login thất bại với password sai — hiển thị error message phù hợp
- AC-5: Login thất bại khi bỏ trống fields — hiển thị error hoặc validation

## Out of scope
- Backend/API testing
- Performance testing
- Security testing (e.g. SQL injection, brute force)
