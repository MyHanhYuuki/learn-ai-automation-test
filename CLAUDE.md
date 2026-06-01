# QA Agents Team — Learn Automation Test

Project này triển khai một QA pipeline tự động hóa dùng Claude Code subagents.

## Kiến trúc tổng thể

Xem `QC-Agent-Teams.html` để xem sơ đồ tương tác đầy đủ (mở trong browser).

### Pipeline: 5 agent chạy tuần tự

```
requirement → [1]test-design → HITL#1 → [2]test-impl → HITL#2
            → [3]script-gen → [4]Executor → [5]Healer(nếu cần)
            → HITL#3 → bug-reporter → maintain-rtm → DONE
```

### Nguyên tắc cốt lõi
- **Chỉ orchestrator gọi subagent** — subagent không gọi nhau trực tiếp
- **Giao tiếp qua filesystem** — agents đọc/ghi artifact, không trao đổi trực tiếp
- **3 HITL checkpoint bắt buộc** (trừ HITL #2 có thể skip với approve-all mode)
- **Phase status** suy từ sự tồn tại của artifact, không từ `.qa-state.json`

## Cách dùng

```
/qa-orchestrator [đường dẫn requirement]
```

Hoặc gọi từng agent thủ công khi debug:
- `test-design`: phân tích requirement
- `test-impl`: viết test cases
- `script-gen`: sinh Playwright scripts
- `executor`: chạy và phân loại kết quả
- `healer`: sửa script-issue

## Cấu trúc file trong một QA run

```
[issue-folder]/
  requirement/         ← input: Jira text, Confluence, spec files
  qa/
    q-and-a.md         ← câu trả lời HITL #1
  spec-review.md       ← output test-design
  viewpoint.csv        ← output test-design
  internal-question.md ← output test-design (câu hỏi cho HITL #1)
  test-cases.csv       ← output test-impl
  triage.md            ← output executor
  defects.md           ← output orchestrator (sau HITL #3)
  rtm-report.html      ← output orchestrator (RTM cuối)
  healing-log.md       ← output healer
  .qa-state.json       ← state orchestrator (HITL pending, heal counters)
  run-results/
    run-[timestamp].json
auto-scripts/          ← dùng chung toàn dự án (không per-issue)
  tests/
    pages/             ← Page Objects
    specs/             ← Test specs
    fixtures/
    data/
kb/
  q-and-a-archive.md   ← Q&A tích lũy từ các issue cũ (persistent)
```

## Models được dùng

| Agent | Model | Lý do |
|-------|-------|-------|
| test-design | claude-sonnet-4-6 | Phân tích văn bản, đủ nhanh |
| test-impl | claude-sonnet-4-6 | Sinh test cases có cấu trúc |
| script-gen | claude-opus-4-8 | Code generation phức tạp, POM patterns |
| executor | claude-sonnet-4-6 | Chạy command + classify kết quả |
| healer | claude-opus-4-8 | Debug + sửa code phức tạp |
