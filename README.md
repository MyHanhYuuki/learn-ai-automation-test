# Learn Automation Test — QA Agents Team

Dự án triển khai QA pipeline tự động hóa dùng **Claude Code subagents** và **Playwright**.

## Kiến trúc

Pipeline gồm 5 agent chạy tuần tự, phối hợp qua filesystem:

```
requirement → [1] test-design → HITL#1 → [2] test-impl → HITL#2
            → [3] script-gen  → [4] executor → [5] healer (nếu cần)
            → HITL#3 → bug-reporter → maintain-rtm → DONE
```

| Agent | Vai trò |
|-------|---------|
| `test-design` | Phân tích requirement, tạo spec-review và viewpoint |
| `test-impl` | Chi tiết hóa viewpoint thành test cases và test data |
| `script-gen` | Sinh Playwright scripts theo chuẩn Page Object Model |
| `executor` | Chạy scripts, phân loại kết quả: flaky / script-issue / real-bug |
| `healer` | Sửa script-issue, yêu cầu re-run qua executor |

Xem `QC-Agent-Teams.html` để xem sơ đồ tương tác đầy đủ.

## Dựng lại cho web khác (bản nâng cấp v2)

📄 [`yeu-cau-build-he-thong-qa.md`](yeu-cau-build-he-thong-qa.md): điền URL `[Trang web bạn cần làm]`, đưa nguyên file cho AI agent là dựng được toàn bộ pipeline v2 (thêm qa-reviewer, evidence, bug report, RTM tự sinh), kèm 28 quy tắc rút từ lỗi đã gặp. Bản chạy thật: [playwright-ai-qa-portfolio](https://github.com/MyHanhYuuki/playwright-ai-qa-portfolio).

📂 [`cau-truc-code-playwright.md`](cau-truc-code-playwright.md): code test Playwright của bản chạy thật nằm ở đâu, cấu trúc ra sao, một test chạy thế nào.

## Cách dùng

```bash
# Chạy toàn bộ pipeline từ requirement
/qa-orchestrator [đường dẫn issue folder]
```

### Chạy thủ công từng agent (khi debug)

Gọi từng agent qua Claude Code:
- `test-design` — phân tích requirement
- `test-impl` — viết test cases
- `script-gen` — sinh Playwright scripts
- `executor` — chạy và phân loại kết quả
- `healer` — sửa script-issue

## Cấu trúc thư mục

```
[issue-folder]/
  requirement/           ← input: Jira, Confluence, spec files
  qa/
    q-and-a.md           ← trả lời HITL #1
  spec-review.md         ← output test-design
  viewpoint.csv          ← output test-design
  internal-question.md   ← câu hỏi cho HITL #1
  test-cases.csv         ← output test-impl
  triage.md              ← output executor
  defects.md             ← output orchestrator (sau HITL #3)
  rtm-report.html        ← RTM cuối
  healing-log.md         ← output healer
  run-results/

auto-scripts/            ← Playwright scripts (dùng chung toàn dự án)
  tests/
    pages/               ← Page Object Models
    specs/               ← Test specs
    fixtures/
    data/

kb/
  q-and-a-archive.md     ← Q&A tích lũy từ các issue cũ
```

## Cài đặt

```bash
cd auto-scripts
npm install
npx playwright install
```

## Chạy tests

```bash
cd auto-scripts
npm test                        # toàn bộ
npm run test:login              # chỉ login spec
npx playwright test --ui        # chạy có giao diện
```

## Nguyên tắc

- **Chỉ orchestrator gọi subagent** — subagents không gọi nhau trực tiếp
- **Giao tiếp qua filesystem** — agents đọc/ghi artifact, không trao đổi trực tiếp
- **3 HITL checkpoint bắt buộc** (HITL #2 có thể skip với approve-all mode)
- **Phase status** suy từ sự tồn tại của artifact, không từ `.qa-state.json`
