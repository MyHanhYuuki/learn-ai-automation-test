# Yêu cầu cho AI agent: dựng hệ thống test tự động có quy trình QA

> **Cách dùng:** điền các ô `[...]` ở mục 0, rồi đưa **nguyên file này** cho AI agent (Claude Code hoặc tương đương) và nói: *"Đọc kỹ file này và làm theo"*.
> AI sẽ dựng toàn bộ hệ thống như màn hình Login của SauceDemo trong repo này: phân tích yêu cầu → thiết kế test case → code Playwright → chạy và phân loại lỗi → evidence → bug report → RTM, có AI reviewer sau mỗi bước và người duyệt ở 3 điểm.
> File này **không dạy**, chỉ yêu cầu làm. Mọi lỗi AI từng mắc đã được đổi thành quy tắc ở mục 3.

---

## 0. Thông tin đầu vào (người dùng điền)
| Ô | Giá trị |
|---|---|
| Trang web cần test | `[Trang web bạn cần làm]` (URL môi trường test, không dùng production nếu có thể) |
| Chức năng / màn hình | `[Tên màn hình, vd: đăng nhập]` → tên feature dạng `[tenweb]-[man-hinh]`, vd `abc-login-screen` |
| Tài liệu yêu cầu | `[Link ticket / file spec / AC]`. Không có thì AI tự khám phá web rồi viết bản nháp, hỏi lại người duyệt |
| Tài khoản test | `[Danh sách user + vai trò]`. Mật khẩu **chỉ** để trong biến môi trường (`.env`), không ghi vào file nào |
| Repo đích | `[URL repo git của công ty]` (**private**). Tác giả commit: `[Tên] <[email công ty hoặc noreply]>` |
| Người duyệt (HITL) | `[Tên / vai trò: PO, BA, QC lead]` |
| Ngôn ngữ tài liệu | `[Tiếng Việt]` (README có thể tiếng Anh) |
| Trình duyệt | `[Chromium]` (thêm Firefox/WebKit nếu yêu cầu) |
| Phạm vi ngoài lề | `[Những gì KHÔNG test, vd: hiệu năng, bảo mật chuyên sâu]` |

---

## 1. Vai trò và mục tiêu
Bạn là **QC Lead kiêm Automation Engineer** (hơn 15 năm, nắm ISTQB). Nhiệm vụ: dựng và chạy hết pipeline cho chức năng ở mục 0, ra được:
1. Bộ tài liệu QA trong `qa-runs/<feature>/` (truy vết được từ AC tới bug).
2. Bộ test Playwright + TypeScript chạy ổn định, theo Page Object Model, có evidence (ảnh khoanh đỏ + video).
3. Bug report tái hiện được, RTM tự sinh, review cuối xác nhận dùng được làm mẫu cho màn hình sau.

**Cách làm việc:** tự làm hết những gì tự kiểm chứng được. Chỉ dừng lại hỏi người ở 3 điểm HITL và trước mỗi commit/push. Báo cáo **ngắn gọn**: vài dòng kết quả + 1 câu hỏi rõ ràng, chi tiết để trong file.

---

## 2. Cách nhanh nhất: dùng lại khung có sẵn
Nếu truy cập được repo mẫu `https://github.com/MyHanhYuuki/playwright-ai-qa-portfolio`, **copy khung, không viết lại từ đầu**:

| Copy nguyên | Chỉnh lại | Không copy |
|---|---|---|
| `playwright.config.ts`, `package.json` (scripts), `.mcp.json`, `.gitattributes`, `.gitignore`, `.env.example`, `.github/workflows/playwright.yml`, `scripts/*.mjs`, `tests/utils/evidence.ts`, `tests/fixtures/index.ts` (phần `evidence`), `.claude/agents/*.md`, `.claude/commands/qa-orchestrator.md` | `baseURL`, `testIdAttribute` (thuộc tính test id của web mới), `tests/data/*`, Page Object, fixture điều kiện trước, `CLAUDE.md` (bỏ phần học), README | `qa-runs/saucedemo-*`, `docs/learning/`, `tests/specs/saucedemo-*`, `tests/pages/*` của SauceDemo |

Không truy cập được thì dựng theo mục 4–7. Dù cách nào, phải chạy được **đúng các lệnh** ở mục 6.

---

## 3. Quy tắc bắt buộc (rút từ lỗi đã gặp)
Mỗi quy tắc có nguồn gốc là một lỗi thật. **Không được bỏ qua.**

### 3.1 Kiểm chứng
| # | Quy tắc | Lỗi đã gặp |
|---|---|---|
| R1 | Chạy thử mọi lệnh, mọi hướng dẫn mình viết ra trước khi dùng. Không giả định công cụ có sẵn | Gọi `npx tsc` khi chưa cài TypeScript, npx tải nhầm package lạ. Dùng `npx playwright test --list` để kiểm tra biên dịch |
| R2 | Khám phá web: **mỗi tình huống một phiên trình duyệt sạch** (context mới), chờ theo điều kiện, không chờ cứng | Dùng chung phiên + chờ 300 ms → báo nhầm 3 bug |
| R3 | Mỗi test phải **fail được**: cố tình làm sai (đổi URL, đổi expected, bỏ `test.fail()`) và thấy test fail đúng chỗ | Test seed rỗng vẫn pass, CI xanh giả |
| R4 | Số liệu hiệu năng / thời gian: đo **≥3 lần**, đo **đúng bước** mà ngưỡng áp vào, không lấy thời gian cả test | Kết luận "nhanh 18 lần" từ 1 lần đo; kết luận "sát ngưỡng 10 giây" khi bước thật chỉ mất 5 giây |
| R5 | Sau mỗi lần chạy: **đối chiếu số test đã chạy với số dự kiến** (chọn 2 TC phải thấy "2 passed") | Lệnh lọc `-g "A\|B"` bị shell Windows cắt ở dấu `\|`, 0 test chạy mà không ai để ý |
| R6 | Gọi Playwright từ script Node bằng `process.execPath` + `@playwright/test/cli`, **không qua shell** | Như R5 |
| R7 | Thấy bug: **thử biến thể** trước khi viết (chiều ngược lại, dữ liệu khác, trang khác, quan sát mọi ô chứ không chỉ ô đang thao tác). TC bắt bug phải phủ mọi biến thể (`expect.soft`) | BUG-01 chỉ ghi một chiều; chiều ngược lại do reviewer phát hiện |
| R8 | Báo cáo tổng hợp (RTM, mục lục) cũng phải "fail được": thử làm sai đầu vào (skip 1 TC, xóa 1 TC) xem có cảnh báo không | RTM từng tính TC bị skip là AC "Đạt" |
| R9 | Kết quả trong báo cáo phải lấy từ **lần chạy khớp phiên bản code hiện tại**. Sửa test xong thì chạy lại rồi mới tạo RTM | RTM lấy kết quả của phiên bản TC-028 cũ |
| R10 | Kết quả ghi theo QC: **Passed / Failed so với expected của test case**. Test bug đã biết (`test.fail()`) là **Failed**, không phải "đúng như mong đợi" | Ghi "đúng như mong đợi" cho test có bug |
| R11 | Fix theo review xong: chỉ đánh ✅ cho việc đã làm **hết**. Làm một phần thì ghi "một phần" + lý do | Đánh ✅ cho mục mới làm một phần |
| R12 | Đọc **toàn bộ** file review, tự kiểm chứng từng điểm (reviewer cũng có thể sai), không chỉ đọc tóm tắt | Một ý của reviewer về bộ lọc Playwright là sai |

### 3.2 Giao tiếp với người
| # | Quy tắc | Lỗi đã gặp |
|---|---|---|
| R13 | Câu trả lời ngắn ("ok", "theo đề xuất") phải **xác nhận nó trả lời cho câu nào** trước khi đánh dấu HITL xong. Không bao giờ tự điền câu trả lời HITL thay người | Hiểu "theo đề xuất" là trả lời HITL #1, thực ra là duyệt sửa tài liệu |
| R14 | Câu hỏi cho người: một phiếu duy nhất, **gom hết một lần**, mỗi câu có context, đề xuất, ảnh hưởng. Trả lời dạng `### Qn.` + `**Trả lời:**`, không nhét câu trả lời dài vào ô bảng | 2 file câu hỏi trùng nhau; câu trả lời trong ô bảng khó đọc |
| R15 | Mã và tên phải **đọc là hiểu**: `BUG-01` chứ không `KI-01`; thư mục theo màn hình | `KI-xx` (Known Issue) người đọc không hiểu |
| R16 | Vấn đề phụ không chặn việc (CI chậm, giao diện đẹp hơn): ghi backlog, đi tiếp. Review nhiều điểm: sửa cái **chặn việc** và **sai sự thật**, còn lại backlog | Kẹt lâu ở tối ưu CI |
| R17 | Trả lời ngắn, ít chia mục. Chi tiết để trong file | Trả lời dài, nhiều mục, khó đọc |

### 3.3 Code test
| # | Quy tắc |
|---|---|
| R18 | Locator: `getByRole` → `getByLabel`/`getByPlaceholder` → `getByTestId` → CSS. Không XPath, không `.nth()` cố định. Phần tử có hiệu ứng (menu trượt) thì chờ đúng trạng thái hoặc dùng test id |
| R19 | Web-first assertion. Không `waitForTimeout`, không `networkidle`, không tăng `retries` để che flaky |
| R20 | Assertion theo **expected trong test case**, không theo hành vi hiện tại. Bug đã biết: `test.fail(true, 'BUG-xx: …')` + tag `@BUG-xx`, kiểm tra test fail **đúng assertion của bug** (đọc lỗi, không tin chữ "passed") |
| R21 | Không bao giờ sửa expected, `test.skip`, `test.fixme` để che bug. Healer chỉ sửa script-issue |
| R22 | Ghi chú trên ảnh evidence phải trung tính hoặc chụp **sau** assertion, để khi bug được sửa ảnh không nói sai |
| R23 | `devices[...]` ghi đè `viewport` đặt ở cấp trên: đặt trong project hoặc trong option video. `testIdAttribute` đặt trong `use` của config, truyền vào `browser.newContext()` không có tác dụng |

### 3.4 Git và bảo mật
| # | Quy tắc |
|---|---|
| R24 | **Hỏi người trước mỗi `git commit` và `git push`**: liệt kê file, commit message, chờ đồng ý. Commit nhỏ, mỗi commit một việc. Message: loại tiếng Anh (Conventional Commits) + mô tả `[Ngôn ngữ tài liệu]` + thân "trước / sau / vì sao" |
| R25 | Không đổi cấu hình git toàn máy. Tác giả commit đúng như mục 0, không thêm dòng `Co-Authored-By` nếu người dùng không muốn |
| R26 | Không commit: mật khẩu, token, `.env`, cấu hình cá nhân (`.claude/settings.local.json`, `CLAUDE.local.md`), đường dẫn máy, tên người dùng máy, email thật. **Quét trước mỗi commit**, kể cả file do agent khác sinh ra |
| R27 | Khi nhờ agent khác quét rò rỉ: **không đưa nguyên văn** chuỗi nhạy cảm vào lời dặn, vì agent có thể chép lại vào báo cáo. Quét lại file báo cáo trước khi commit |
| R28 | Web của công ty: repo phải **private**. Không gửi dữ liệu thật của khách ra dịch vụ ngoài. Ảnh evidence có dữ liệu nhạy cảm thì che hoặc dùng tài khoản test |

---

## 4. Công nghệ và cấu trúc
- **Playwright Test** (bản ổn định mới nhất) + TypeScript, Node LTS. Chỉ cài trình duyệt cần dùng (`npx playwright install chromium`). Cài gì thêm phải hỏi người trước.
- Playwright MCP cho agent cần điều khiển trình duyệt (`.mcp.json`).
- CI: GitHub Actions (hoặc CI của công ty), chạy mọi push, chỉ cài trình duyệt cần dùng, có cache.

```
.claude/agents/        test-design, test-impl, script-gen, executor, healer, qa-reviewer
.claude/commands/      qa-orchestrator.md (điều phối)
qa-runs/<feature>/     tài liệu QA của từng chức năng (mục 5)
tests/
  pages/               1 Page Object / màn hình
  specs/<feature>.spec.ts   tên file = tên thư mục qa-runs/<feature>/
  data/                users.ts, messages.ts (thông báo nguyên văn), bugs.ts (BUG-xx → ticket)
  fixtures/index.ts    test/expect + fixture evidence (tự bật) + fixture điều kiện trước (vd đã đăng nhập)
  utils/evidence.ts    ảnh khoanh đỏ + ghi chú + video
  seed.spec.ts         smoke check (mở web, kiểm tra tiêu đề) + seed cho MCP
scripts/               run-tests.mjs, run-evidence.mjs, build-rtm.mjs
knowledge-base/        quy tắc rút ra từ Q&A, dùng lại cho chức năng sau
docs/ai-log.md         nhật ký: AI sai ở đâu, người kiểm soát thế nào
CLAUDE.md              quy ước (mục 3, 6, 8) để mọi phiên AI sau đọc lại
```

**Đánh số:** `TC-xxx`, `TVP-xxx`, `Qn`, `O-xx`, `IMP-xx` riêng từng feature. `BUG-xx` **chung cả repo** (nối tiếp số lớn nhất trong mọi `known-issues.md`).

---

## 5. Pipeline: các bước, đầu ra, điều kiện xong
Sau **mỗi** bước gọi `qa-reviewer` (vai QC Lead, ISTQB, chỉ báo cáo, không sửa) → `review-<bước>.md`, sửa theo review, rồi mới tới HITL hoặc bước sau.

### Bước 0: Dựng dự án (một lần cho cả repo)
Theo mục 2 hoặc 4. **Xong khi:** `npx playwright test` chạy seed pass, đổi `BASE_URL` sai thì seed fail (R3), CI xanh, `CLAUDE.md` có đủ quy ước.

### Bước 1: test-design (ISTQB: Test Analysis) → HITL #1
Đầu vào: `qa-runs/<feature>/requirement/requirement.md` (AC viết dạng `- **AC-n**: …`).
Khám phá web theo R2, rồi tạo:
| File | Nội dung |
|---|---|
| `spec-review.md` | Bảng AC (testable? ghi chú), Business Rules, bảng **quan sát** `O-xx` (thao tác, kết quả, ghi chú, quan sát mọi phần tử bị ảnh hưởng: R7), phạm vi |
| `viewpoint.csv` | `viewpoint_id,axis,description,priority,linked_ac,scope,source`. 4 trục: functional, data, flow, non-functional. Ghi cả viewpoint `scope=out` kèm nguồn quyết định |
| `q-and-a.md` | Phiếu duy nhất (R14): blocking / non-blocking, cột context, đề xuất, trả lời, trạng thái `Open/Answered`, ảnh hưởng tới test |
| `known-issues.md` | Bug thấy ngay khi phân tích: `BUG-xx`, mô tả, bằng chứng (O-xx), mức dự kiến, **TC phải bắt**, trạng thái. Kèm lưu ý cho các bước sau |
| `improvements.md` | Không phải bug theo AC nhưng nên cải thiện: `IMP-xx` |

Bắt buộc soát: luồng chuyển trạng thái (vào → thoát → vào lại, lỗi → thử lại, tải lại trang, nút Back), kiểm soát truy cập (mọi loại trang bên trong, **phiên giả mạo**: cookie, URL, token), dữ liệu biên, thông báo nguyên văn.
**⏸ HITL #1:** gửi người duyệt các câu `Open`. Chờ trả lời, ghi vào `q-and-a.md`, quy tắc dùng lại được thì ghi `knowledge-base/`.

### Bước 2: test-impl (ISTQB: Test Design + Implementation) → HITL #2
`test-cases.csv` (15 cột): `tc_id,viewpoint_id,title,preconditions,steps,expected_result,test_data_ref,priority,type,technique,automation_feasibility,linked_ac,tags,status,notes`.
- Mọi viewpoint `scope=in` có ≥1 TC. Mọi `BUG-xx` có TC bắt, ghi `BUG-xx` ở cột `notes` (RTM đọc cột này).
- Kỹ thuật ghi đúng: EP, BVA (chỉ khi có biên), Decision Table, State Transition, Error Guessing.
- Expected **đo được** (nguyên văn text, URL, trạng thái). Không có mật khẩu thật trong TC, tham chiếu `TD-xx`.

`test-data.md`: bảng `TD-xx` (dữ liệu) và `MSG-xx` (thông báo nguyên văn).
**⏸ HITL #2:** người duyệt duyệt test case → `status = approved`.

### Bước 3: script-gen
- Kiểm tra từng locator trên web thật (MCP) trước khi viết.
- Spec **import từ `../fixtures`**. Tên test bắt đầu bằng TC id, tag `@AC-x` (+ `@smoke`, `@BUG-xx`). Một `test()` = một TC.
- `evidence.shot(tên bước, { highlight, note })` ở **mỗi bước quan trọng**: `highlight` = phần tử khoanh đỏ, `note` = người xem phải kiểm tra gì.
- Bug đã biết: theo R20. Biến thể: `expect.soft` trong cùng TC.

**Xong khi:** `npx playwright test --list tests/specs/<feature>.spec.ts` chạy được, số test = số TC `automatable`.

### Bước 4: executor (chạy + phân loại) → healer nếu cần → HITL #3
```bash
npm run test:run -- <feature>
npx playwright test tests/specs/<feature>.spec.ts --repeat-each=2   # độ ổn định
```
`triage.md`: mỗi test Failed gán **flaky** / **script-issue** / **real-bug**, có bằng chứng (lỗi, trace, ảnh). Báo cáo theo QC: "N Passed + M Failed (bug đã biết)", không ghi "100% pass" (R10). Kiểm tra mỗi `test.fail()` fail **đúng assertion của bug** (R20).
- `script-issue` → **healer** (chỉ sửa code test, tối đa 2 vòng / TC, sau đó `needs-manual-fix`), chạy lại subset: `npm run test:run -- <feature> -g "TC-001|TC-004" --triggered-by healer-round-1`.
- Không còn script-issue → `npm run test:evidence -- <feature>`.
- **Tái hiện độc lập bằng tay** mỗi real-bug (phiên sạch, locator khác code test), lưu ảnh vào `evidence/bugs/<ticket>_BUG-xx/manual/` + README.

**⏸ HITL #3:** người duyệt xác nhận bug thật, chốt Severity.

### Bước 5: bug report → `defects.md`
- Bảng tổng hợp: `| Bug | Ticket | TC | Tiêu đề | Severity | Priority (đề xuất) | Trạng thái |`.
- Mỗi bug: tiêu đề `[Chức năng] hành vi sai cụ thể`; Severity (QC) và Priority (đề xuất, PO chốt), **mỗi cái có lý do riêng**; môi trường; tần suất **trích được file trong `run-results/`**; điều kiện trước (cách có trình duyệt sạch); các bước đánh số, dữ liệu cụ thể, người mới làm theo được trong 2 phút; mong đợi **trích AC / Q&A**; thực tế; bảng biến thể nếu có (R7); evidence (tự động + `manual/`); test tự động bắt bug.
- Tự làm lại các bước tái hiện **đúng như đã viết** trên trình duyệt sạch trước khi chốt.
- Cuối file: các `BUG-xx` không đưa vào report + lý do; mục "Khi log ticket thật" (thay `[id_bug_n]` ở `bugs.ts`, đổi tên thư mục evidence, sửa link, tìm `[id_bug_` phải ra 0 kết quả).

### Bước 6: RTM → `npm run rtm -- <feature>`
Tự sinh `rtm.md` (xem trên Git) + `rtm-report.html`. Không làm tay.

### Bước 7: review cuối (baseline)
`qa-reviewer` soát **toàn bộ** chức năng + khả năng dùng làm mẫu → `review-final.md` (có dòng `> Tiến độ:` cập nhật sau mỗi phần). Sửa nhóm chặn việc + sai sự thật, còn lại backlog (R16). Chạy lại toàn bộ, RTM, quét bảo mật, commit.

---

## 6. Script và lệnh (bắt buộc có, chạy được trên Windows / macOS / Linux)
```bash
npm test                               # toàn bộ test
npm run test:smoke                     # @smoke
npm run test:run -- <feature> [-g "TC-001|TC-004"] [--triggered-by healer-round-1]
npm run test:evidence -- <feature> [-g "..."] [--index-only]
npm run rtm -- <feature>
npm run report
```
Mọi lệnh có `<feature>` truyền **đường dẫn spec + `-g`** cho Playwright (2 bộ lọc áp cùng lúc), nên chỉ đụng tới feature đó.

**`scripts/run-tests.mjs`**: chạy spec của feature với reporter `line,json,html` (JSON thô vào `run-results/raw-*.json`, xóa sau khi tóm tắt), ghi `qa-runs/<feature>/run-results/run-YYYYMMDD-HHMMSS.json`:
```json
{ "run_id": "...", "triggered_by": "orchestrator", "scope": "full | subset:TC-001|TC-004", "browser": "chromium",
  "summary": { "total": 0, "passed": 0, "failed": 0, "flaky": 0, "skipped": 0, "expected_fail": 0 },
  "total_duration_ms": 0,
  "tests": [ { "tc_id": "TC-001", "title": "...", "status": "passed|failed|timedOut|skipped",
               "expected_status": "passed|failed", "outcome": "expected|unexpected|flaky|skipped",
               "duration_ms": 0, "retry_count": 0, "error": "lỗi đầu tiên", "errors": ["mọi lỗi, kể cả expect.soft"] } ] }
```
`summary.passed` theo Playwright (gồm bug đã biết fail đúng dự kiến). Theo test case: Passed = `passed − expected_fail`, Failed = `failed + expected_fail`. In dòng này ra cuối log.

**`scripts/run-evidence.mjs`**: bắt buộc có `<feature>`, đặt `EVIDENCE=1`, chạy spec của feature, rồi tạo `evidence/README.md` (bảng bug theo ticket, gồm dòng "Tái hiện bằng tay"; bảng mọi TC + kết quả). Exit code khác 0 thì in cảnh báo "có test Failed hoặc không có test nào chạy".

**`tests/utils/evidence.ts` + fixture `evidence` (auto)**: chỉ hoạt động khi `EVIDENCE=1`. `shot()` chèn lớp phủ (nhãn `TC-xxx · Bước n: tên`, khung đỏ quanh `highlight`, dòng vàng "🔍 Cần xem: note"), chụp JPEG chất lượng 70, gắn vào report. Video 1280×720 cho mọi test. Lưu `evidence/all-cases/TC-xxx/` (ảnh, `video.webm`, README: kết quả Passed/Failed theo R10, tags, thời điểm, bảng các bước). Test có tag `@BUG-xx` copy thêm vào `evidence/bugs/<ticket>_BUG-xx/TC-xxx/` (ticket lấy từ `tests/data/bugs.ts`, chưa có thì `[id_bug_n]`). Thư mục feature = tên file spec.

**`scripts/build-rtm.mjs`**: đọc `requirement.md` (AC), `viewpoint.csv`, `test-cases.csv`, file `run-results` mới nhất, `defects.md` (tiêu đề + trạng thái bug). Xuất:
- Tóm tắt: % AC có TC, % AC đạt (**mọi** TC liên quan Passed; Skipped / Flaky / Not run / "bug có vẻ đã sửa" → "⚠️ Cần xem lại"), số Passed / Failed / Skipped / Flaky / Not run, số TC cần làm tay, viewpoint trong / ngoài phạm vi (viewpoint `in` chưa có TC → ⛔), bug đang mở (link anchor tới `defects.md`).
- Bảng theo AC, bảng chi tiết (AC, viewpoint, TC + link evidence, kỹ thuật, tự động, kết quả, bug), bảng viewpoint ngoài phạm vi.
- Ghi chú: test `test.fail()` Playwright ghi passed, RTM ghi Failed.
- **Cảnh báo** khi lần chạy không phải full, số TC lệch `summary.total`, TC có trong run mà không có trong CSV, TC chưa có kết quả, bug trong notes chưa có trong `defects.md`.
- Escape `|` trong ô bảng, slug anchor theo quy tắc GitHub (giữ chữ có dấu, `_`, `-`).

---

## 7. Agent và orchestrator
| Agent | Việc | Không được |
|---|---|---|
| `test-design` | Bước 1. Có công cụ trình duyệt | Đoán câu trả lời HITL |
| `test-impl` | Bước 2 | Bỏ viewpoint `in` hay `BUG-xx` không có TC |
| `script-gen` | Bước 3. Có công cụ trình duyệt | Chạy test (việc của executor), import từ `@playwright/test` trong spec |
| `executor` | Bước 4: `test:run`, triage, evidence | Sửa code, viết bug report |
| `healer` | Sửa script-issue, tối đa 2 vòng / TC | Sửa expected, `skip`/`fixme`, "sửa" test bug cho pass |
| `qa-reviewer` | Soát sau mỗi bước theo checklist ISTQB của bước đó, kiểm chứng phát hiện mới trên web, ghi `review-<bước>.md` (mục A Phát hiện mới · B Thiếu sót · C Không nhất quán · D Sai kỹ thuật · E Quy trình, mỗi mục là bảng `# · Vấn đề · Bằng chứng · Mức 🔴/🟠/🟡 · Đề xuất`) | Sửa file của bước khác |

Nội dung đầy đủ của `qa-reviewer` (nguyên tắc, kiến thức ISTQB, checklist từng bước): chép từ [`qa-reviewer.md`](qa-reviewer.md).

`/qa-orchestrator <feature>`: gọi agent theo thứ tự mục 5, gọi `qa-reviewer` sau mỗi bước, dừng ở 3 HITL (lưu trạng thái vào `qa-runs/<feature>/.qa-state.json`, không commit), đếm vòng healer, cuối cùng in tóm tắt (số TC, Passed/Failed, số bug, % AC đạt) và đề xuất commit.

---

## 8. Tối ưu thời gian (làm đủ, test kỹ, nhanh hơn)
1. **Dùng lại khung** (mục 2) thay vì viết lại. Phần dựng dự án chỉ còn chỉnh `baseURL`, test id, data.
2. **Khám phá một lần, rộng**: một script khám phá chạy mọi tình huống (mỗi tình huống một context sạch) và ghi hết quan sát `O-xx`, quan sát **mọi phần tử** bị ảnh hưởng, thử biến thể ngay (R7). Tránh phải quay lại khám phá.
3. **Gom câu hỏi** vào một phiếu, có đề xuất sẵn, để người duyệt trả lời một lần (HITL #1).
4. **Reviewer dùng checklist ở mục 5** ngay từ đầu, không đợi review mới bổ sung luồng bảo mật / chuyển trạng thái.
5. **Chạy theo lô**: `test:run` toàn feature một lần + `--repeat-each=2` một lần; evidence chụp **một lần cho cả feature** sau khi hết script-issue. Chỉ chụp lại TC nào thay đổi (`-g`).
6. **Chỉ dùng script** cho file kết quả, mục lục evidence, RTM. Không viết tay, không phải soát số liệu bằng mắt.
7. **Song song**: trong lúc chờ người duyệt HITL, chuẩn bị Page Object / dữ liệu không phụ thuộc câu trả lời; reviewer chạy nền, ghi tiến độ vào file.
8. **Sửa một lượt** sau review: chặn việc + sai sự thật; backlog phần còn lại (R16).
9. **Commit theo nhóm việc** (mỗi bước pipeline 1–2 commit), hỏi một lần cho cả nhóm.

---

## 9. Định nghĩa "xong" cho một chức năng
- [ ] `qa-runs/<feature>/` đủ: requirement, spec-review, viewpoint.csv, q-and-a.md (Open 0), known-issues, improvements, test-cases.csv (approved), test-data, triage, defects, rtm.md + rtm-report.html, evidence/, run-results/, review-test-design / test-impl / script-gen / executor / defects / final.
- [ ] Mọi AC có TC; mọi viewpoint `in` có TC; mọi `BUG-xx` có TC bắt và fail đúng assertion.
- [ ] Toàn bộ test chạy pass (bug đã biết dùng `test.fail()`), chạy lặp không flaky, CI xanh.
- [ ] Mọi TC có evidence (ảnh khoanh đỏ + ghi chú + video); mọi bug có thư mục `bugs/` + `manual/`.
- [ ] RTM tạo từ lần chạy khớp code hiện tại (R9), không có cảnh báo.
- [ ] Số liệu giữa các file khớp nhau; mọi link tương đối mở được; không còn tên cũ sau khi đổi tên.
- [ ] Quét bảo mật sạch (R26, R27). Đã hỏi người trước mọi commit / push.
- [ ] `docs/ai-log.md` ghi các lỗi AI mắc trong lần này + quy tắc mới. **Quy tắc mới thì bổ sung vào mục 3 của file này** để lần sau không lặp lại.
