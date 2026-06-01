# qa-orchestrator

Khởi chạy QA pipeline đầy đủ cho một issue/feature. Pipeline gồm 5 agent chạy tuần tự với 3 HITL checkpoint.

## Cách dùng
```
/qa-orchestrator [đường dẫn requirement hoặc Jira issue ID]
```

---

## Kiến trúc pipeline

```
requirement
    ↓
[1] test-design ──→ spec-review.md, viewpoint.csv, internal-question.md
    ↓
  HITL #1 — Stakeholder trả lời câu hỏi blocking (ghi vào q&a)
    ↓
[2] test-impl ────→ test-cases.csv
    ↓
  HITL #2 — Tester duyệt test design (viewpoint.csv + test-cases.csv)
    ↓
[3] script-gen ───→ auto-scripts/tests/specs/, auto-scripts/tests/pages/
    ↓
[4] Executor ─────→ run-results/, triage.md
    ↓
  ┌─ script-issue? → [5] Healer → sửa → re-run Executor (tối đa 2 vòng)
  ├─ real-bug?     → HITL #3 — Tester duyệt bug trước khi tạo ticket
  └─ all pass?     → cập nhật RTM
    ↓
orchestrator dùng skill bug-reporter → defects.md
orchestrator dùng skill maintain-rtm → rtm-report.html
```

**Nguyên tắc cốt lõi**: Chỉ orchestrator gọi subagent. Subagent KHÔNG gọi nhau trực tiếp — chỉ giao tiếp qua artifact trên filesystem.

---

## State tracking: `.qa-state.json`

Orchestrator duy trì file state nhẹ cho những thứ **không suy ra được từ artifact**:

```json
{
  "issue_id": "[issue id]",
  "pipeline_version": "1.0",
  "hitl_pending": null,
  "heal_counters": {},
  "last_run_id": null,
  "last_error": null
}
```

- `hitl_pending`: `"HITL #1"` | `"HITL #2"` | `"HITL #3"` | `null`
- `heal_counters`: `{ "TC-001": 1, "TC-002": 2 }` — số vòng heal đã dùng/test
- Phase status **không** ghi vào state — suy từ sự tồn tại + tính hợp lệ của artifact

---

## Bước 1 — Gọi test-design agent

```
Gọi agent: test-design
Input: [đường dẫn requirement]
```

Sau khi xong, kiểm tra:
- `spec-review.md` tồn tại và có nội dung
- `viewpoint.csv` có ít nhất 1 dòng data
- `internal-question.md` tồn tại

Cập nhật `.qa-state.json`: `hitl_pending = "HITL #1"`

---

## HITL #1 — Stakeholder trả lời câu hỏi

**Dừng pipeline.** Thông báo cho người dùng:

```
⏸ HITL #1: test-design đã hoàn tất.

📋 Câu hỏi cần trả lời: [đọc internal-question.md và liệt kê]

Vui lòng trả lời các câu hỏi blocking, ghi vào file qa/q-and-a.md.
Sau khi xong, gõ: "HITL #1 done" để tiếp tục pipeline.
```

Khi người dùng xác nhận, kiểm tra `qa/q-and-a.md` có tồn tại.
Cập nhật `.qa-state.json`: `hitl_pending = null`

---

## Bước 2 — Gọi test-impl agent

```
Gọi agent: test-impl
Input: viewpoint.csv, qa/q-and-a.md, spec-review.md
```

Sau khi xong, kiểm tra:
- `test-cases.csv` tồn tại và có ≥1 dòng TC
- Mỗi TC có `linked_ac` không rỗng

Cập nhật `.qa-state.json`: `hitl_pending = "HITL #2"`

---

## HITL #2 — Tester duyệt test design

**Dừng pipeline.** Thông báo:

```
⏸ HITL #2: test-impl đã hoàn tất.

📄 Cần duyệt:
  - viewpoint.csv ([X] viewpoints)
  - test-cases.csv ([X] test cases)

Kiểm tra phạm vi test có đúng trước khi đầu tư automation.
Gõ "HITL #2 approved" để tiếp tục, hoặc "HITL #2 feedback: [ý kiến]" để yêu cầu chỉnh sửa.
```

Nếu có feedback, gọi lại test-impl với feedback. Nếu approved:
Cập nhật `.qa-state.json`: `hitl_pending = null`

---

## Bước 3 — Gọi script-gen agent

```
Gọi agent: script-gen
Input: test-cases.csv, spec-review.md, auto-scripts/ (existing codebase)
```

Sau khi xong, kiểm tra:
- `auto-scripts/tests/specs/` có file mới
- Số test() trong spec khớp với số TC có `automation_feasibility = automatable`

---

## Bước 4 — Gọi Executor agent

```
Gọi agent: executor
Input: auto-scripts/ (full suite hoặc subset)
```

Sau khi xong, đọc `triage.md`:

### Nếu có `script-issue`:
→ Đi đến **Vòng lặp Healer** (xem bên dưới)

### Nếu có `real-bug`:
Cập nhật `.qa-state.json`: `hitl_pending = "HITL #3"`, lưu `last_run_id`
→ Đi đến **HITL #3**

### Nếu tất cả pass:
→ Đi đến **Bước cuối: RTM**

---

## Vòng lặp Healer (chỉ khi có script-issue)

```
Gọi agent: healer
Input: triage.md, auto-scripts/, run-results/[last_run_id].json, heal_counters từ .qa-state.json
```

Healer sửa xong → Orchestrator cập nhật `heal_counters` trong `.qa-state.json` → Gọi Executor re-run subset.

**Giới hạn**: Mỗi TC tối đa 2 vòng (`heal_counters[tc_id] <= 2`).
- TC vượt giới hạn → ghi vào `healing-log.md` nhãn `needs-manual-fix`, loại khỏi re-run.
- Sau re-run: đọc lại `triage.md` → xử lý tiếp `real-bug` hoặc done.

---

## HITL #3 — Tester duyệt bug trước khi tạo ticket

**Dừng pipeline.** Đây là checkpoint **bắt buộc** — tạo ticket Jira là hành động ghi ra hệ thống ngoài.

```
⏸ HITL #3: Executor đã phân loại xong.

🐛 Danh sách real-bug cần duyệt:
[đọc triage.md section "Real Bugs" và liệt kê]

Duyệt xong, gõ:
  "HITL #3 approved" — tạo toàn bộ ticket
  "HITL #3 approved: TC-001, TC-003" — chỉ tạo ticket được liệt kê
  "HITL #3 rejected: TC-002 [lý do]" — loại bỏ false positive
```

---

## Bước cuối — Bug reporting & RTM

### Skill: bug-reporter

Với mỗi real-bug được duyệt, tạo Jira ticket theo template:

```markdown
**Title**: [Feature]: [Mô tả ngắn gọn hành vi sai]

**Steps to reproduce**:
1. [bước 1]
2. [bước 2]
3. [bước 3]

**Expected** (theo AC-X): [mô tả expected behavior từ spec-review.md]

**Actual**: [điều gì thực sự xảy ra]

**Evidence**: [link screenshot / trace / run-results path]

**Severity**: Critical / High / Medium / Low
**Priority**: P1 / P2 / P3
**Linked AC**: [AC-X từ spec-review.md]
**Linked TC**: [TC-XXX]
**Test run**: [run_id]
```

Ghi kết quả vào `defects.md`:
```markdown
# Defects — [Issue ID]

| TC ID | Bug Title | Jira Ticket | Severity | Status |
|-------|-----------|-------------|----------|--------|
| TC-001 | ... | [BUG-123](link) | High | Open |
```

### Skill: maintain-rtm

Build/cập nhật RTM — Requirement Traceability Matrix — vào `rtm-report.html`:

Ma trận liên kết: **requirement → AC → viewpoint → test case → test result → defect**

Columns trong RTM:
| Req ID | AC ID | TVP ID | TC ID | TC Title | Auto? | Status | Defect |
|--------|-------|--------|-------|----------|-------|--------|--------|

Tổng hợp thêm:
- **Coverage**: % AC có ít nhất 1 TC pass
- **Gap analysis**: AC nào chưa có TC
- **Defect density**: số bug / AC

---

## Resume sau gián đoạn

Nếu pipeline bị gián đoạn, đọc `.qa-state.json` để biết trạng thái:
- `hitl_pending != null` → đang chờ người dùng confirm HITL đó
- `last_run_id != null` → có thể đọc run-results để tiếp tục từ bước triage
- Sự tồn tại của artifact = phase tương ứng đã xong:
  - `spec-review.md` + `viewpoint.csv` → test-design done
  - `test-cases.csv` → test-impl done (sau HITL #2)
  - `auto-scripts/tests/specs/*.spec.ts` → script-gen done
  - `triage.md` → executor done
  - `defects.md` → bug-reporter done
  - `rtm-report.html` → pipeline complete
