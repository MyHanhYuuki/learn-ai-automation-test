# MyHanhThem: phần MyHanhYuuki bổ sung

Thư mục này gom **mọi file mình tự thêm** vào repo, tách riêng khỏi bộ pipeline mẫu gốc (thư mục gốc của repo) cho dễ kiểm soát.
Bản chạy thật của các tài liệu này: [playwright-ai-qa-portfolio](https://github.com/MyHanhYuuki/playwright-ai-qa-portfolio).

| File | Nội dung |
|---|---|
| [`yeu-cau-build-he-thong-qa.md`](yeu-cau-build-he-thong-qa.md) | Yêu cầu cho AI agent: dựng hệ thống test tự động có quy trình QA. Điền URL `[Trang web bạn cần làm]`, đưa nguyên file cho AI agent là dựng được toàn bộ pipeline v2 (thêm qa-reviewer, evidence, bug report, RTM tự sinh), kèm các quy tắc rút từ lỗi đã gặp |
| [`cau-truc-code-playwright.md`](cau-truc-code-playwright.md) | Code test Playwright của bản chạy thật nằm ở đâu, cấu trúc ra sao, một test chạy thế nào, cách đặt tên thư mục so với chuẩn thị trường |
| [`qa-reviewer.md`](qa-reviewer.md) | Agent **qa-reviewer** bản dùng chung cho mọi dự án: vai QC Lead, nguyên tắc làm việc, quy trình review theo ISTQB, kiến thức ISTQB áp dụng khi review, góc nhìn QA thực chiến, checklist theo từng bước, mẫu báo cáo. Mục 8 để trống cho bài học riêng của từng dự án |

## Cách dùng `qa-reviewer.md`
1. Chép vào `.claude/agents/qa-reviewer.md` của dự án.
2. Sửa đường dẫn thư mục tài liệu ở mục "Đầu vào" và "Mẫu báo cáo" cho khớp dự án.
3. Mỗi lần review bỏ sót một lỗi, thêm một dòng vào mục 8.
