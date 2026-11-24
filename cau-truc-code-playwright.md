# Cấu trúc code test tự động Playwright

> Giải thích cấu trúc code của bản chạy thật: [playwright-ai-qa-portfolio](https://github.com/MyHanhYuuki/playwright-ai-qa-portfolio) (màn hình Login của SauceDemo).
> Dựng hệ thống tương tự cho web khác: xem [`yeu-cau-build-he-thong-qa.md`](yeu-cau-build-he-thong-qa.md).

## Code nằm ở đâu
Toàn bộ code test nằm trong thư mục **`tests/`**, cộng thêm file cấu hình và vài script chạy:

```
playwright-ai-qa-portfolio/
├── playwright.config.ts      ⚙️ cấu hình: URL web, trình duyệt, chụp ảnh / quay video
├── tests/
│   ├── specs/
│   │   └── saucedemo-login-screen.spec.ts   🧪 33 test case (TC-001 → TC-033), chia nhóm theo AC
│   ├── pages/                📄 Page Object: mỗi màn hình 1 file
│   │   ├── LoginPage.ts         ô Username, Password, nút Login, thông báo lỗi
│   │   └── InventoryPage.ts     trang sản phẩm, menu, nút Logout
│   ├── data/                 📦 dữ liệu test
│   │   ├── users.ts             6 tài khoản, mật khẩu đọc từ biến môi trường
│   │   ├── messages.ts          thông báo lỗi nguyên văn
│   │   └── bugs.ts              BUG-01 → mã ticket
│   ├── fixtures/
│   │   └── index.ts          🔧 chuẩn bị sẵn: trang Login đã mở, đã đăng nhập, bật evidence
│   ├── utils/
│   │   └── evidence.ts       📸 chụp ảnh khoanh đỏ + ghi chú + video
│   └── seed.spec.ts          ✅ test smoke: web còn sống không
└── scripts/                  ▶️ lệnh chạy (npm run …)
    ├── run-tests.mjs            chạy test 1 màn hình, lưu kết quả JSON
    ├── run-evidence.mjs         chạy kèm chụp evidence
    └── build-rtm.mjs            tạo RTM
```

## Một test chạy như thế nào
Ví dụ TC-003 (đăng nhập thành công):
1. **Fixture** (`fixtures/index.ts`) mở sẵn trang Login.
2. **Spec** gọi `loginPage.login(...)` và lấy tài khoản từ **data** (`users.ts`).
3. **Page Object** (`LoginPage.ts`) biết ô nào ở đâu và bấm, gõ giúp.
4. **Spec** kiểm tra kết quả (`expect`: phải vào được trang sản phẩm).
5. Nếu bật evidence, **utils** chụp ảnh từng bước và quay video.

## Vì sao tách như vậy
**Mỗi thứ chỉ sửa ở một chỗ**: web đổi nút Login thì chỉ sửa `LoginPage.ts`, đổi mật khẩu thì chỉ sửa `.env`, còn 33 test giữ nguyên. Đây chính là lý do dùng **Page Object Model (POM)**.

## Xem tận mắt
- Mở `tests/specs/saucedemo-login-screen.spec.ts` để đọc code test.
- Chạy `npm run test:ui`: từng test hiện ra kèm từng bước.
