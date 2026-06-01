import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

const VALID_USER = 'student'
const VALID_PASS = 'Password123'

test.describe('Login Form', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.navigate()
  })

  // ============================================================
  test.describe('UI Elements — AC-1', () => {
    // TC-001: Username field hiển thị trên trang
    test('TC-001 Username field hiển thị trên trang', async () => {
      await expect(loginPage.usernameInput).toBeVisible()
    })

    // TC-002: Password field hiển thị trên trang
    test('TC-002 Password field hiển thị trên trang', async () => {
      await expect(loginPage.passwordInput).toBeVisible()
    })

    // TC-003: Submit button hiển thị trên trang
    test('TC-003 Submit button hiển thị trên trang', async () => {
      await expect(loginPage.submitButton).toBeVisible()
    })

    // TC-004: Label cho username và password field hiển thị
    test('TC-004 Label username và password hiển thị', async ({ page }) => {
      await expect(page.getByText('Username', { exact: true })).toBeVisible()
      await expect(page.getByText('Password', { exact: true })).toBeVisible()
    })

    // TC-005: Password field có type=password (masking)
    test('TC-005 Password field có type=password', async () => {
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')
    })
  })

  // ============================================================
  test.describe('Happy Path — AC-2', () => {
    // TC-006: Login thành công với credentials hợp lệ
    test('TC-006 Login thành công với credentials hợp lệ', async () => {
      await loginPage.login(VALID_USER, VALID_PASS)
      await expect(loginPage.page).toHaveURL(/logged-in-successfully/)
    })

    // TC-007: URL thay đổi sau login thành công
    test('TC-007 URL thay đổi sau login thành công', async () => {
      await loginPage.login(VALID_USER, VALID_PASS)
      await expect(loginPage.page).not.toHaveURL(/practice-test-login/)
      await expect(loginPage.page).toHaveURL(/logged-in-successfully/)
    })

    // TC-008: Success page hiển thị thông báo đăng nhập thành công
    test('TC-008 Success page hiển thị thông báo thành công', async ({ page }) => {
      await loginPage.login(VALID_USER, VALID_PASS)
      await expect(page.getByRole('heading', { name: 'Logged In Successfully' })).toBeVisible()
      await expect(page.locator('body')).toContainText('Congratulations')
    })
  })

  // ============================================================
  test.describe('Negative - Wrong Credentials', () => {
    // TC-009: Login thất bại với username sai — password đúng
    test('TC-009 Username sai — password đúng', async () => {
      await loginPage.login('wronguser', VALID_PASS)
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-010: Error message khi username sai có nội dung phù hợp
    test('TC-010 Error message username sai có nội dung phù hợp', async () => {
      await loginPage.login('invalidUser', VALID_PASS)
      await expect(loginPage.errorMessage).toContainText('Your username is invalid')
    })

    // TC-011: Login thất bại với password sai — username đúng
    test('TC-011 Password sai — username đúng', async () => {
      await loginPage.login(VALID_USER, 'wrongpassword')
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-012: Error message khi password sai có nội dung phù hợp
    test('TC-012 Error message password sai có nội dung phù hợp', async () => {
      await loginPage.login(VALID_USER, 'badPass999')
      await expect(loginPage.errorMessage).toContainText('Your password is invalid')
    })

    // TC-018: Login thất bại khi cả username và password đều sai
    test('TC-018 Cả username và password đều sai', async () => {
      await loginPage.login('wronguser', 'wrongpass')
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-019: Password case-sensitive (sai hoa thường)
    test('TC-019 Password case-sensitive — sai hoa thường', async () => {
      await loginPage.login(VALID_USER, 'password123')
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.errorMessage).toContainText('Your password is invalid')
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })
  })

  // ============================================================
  test.describe('Negative - Empty Fields — AC-5', () => {
    // TC-013: Bỏ trống cả username và password
    test('TC-013 Bỏ trống cả username và password', async () => {
      await loginPage.submit()
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-014: Bỏ trống username — password đã điền
    test('TC-014 Bỏ trống username — password đã điền', async () => {
      await loginPage.fillPassword(VALID_PASS)
      await loginPage.submit()
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-015: Bỏ trống password — username đã điền
    test('TC-015 Bỏ trống password — username đã điền', async () => {
      await loginPage.fillUsername(VALID_USER)
      await loginPage.submit()
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })
  })

  // ============================================================
  test.describe('Input Interaction — AC-1', () => {
    // TC-016: Có thể nhập text vào username field
    test('TC-016 Nhập text vào username field', async () => {
      await loginPage.fillUsername('testuser123')
      await expect(loginPage.usernameInput).toHaveValue('testuser123')
    })

    // TC-017: Có thể nhập text vào password field
    test('TC-017 Nhập text vào password field', async () => {
      await loginPage.fillPassword('TestPass@1')
      await expect(loginPage.passwordInput).toHaveValue('TestPass@1')
      // Vẫn masked: type=password
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')
    })
  })

  // ============================================================
  test.describe('Edge Cases', () => {
    // TC-020: Username có khoảng trắng thừa dẫn đến login thất bại
    test('TC-020 Username có khoảng trắng thừa — login thất bại', async () => {
      await loginPage.login('student ', VALID_PASS)
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-021: Ký tự đặc biệt không gây crash form
    test('TC-021 Ký tự đặc biệt không gây crash form', async () => {
      await loginPage.login('!@#$%^&*()', '!@#$%^&*()')
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-022: Username rất dài (>100 ký tự) không gây crash form
    test('TC-022 Username rất dài (>100 ký tự) không gây crash', async () => {
      const longUsername = 'a'.repeat(105)
      await loginPage.login(longUsername, VALID_PASS)
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-023: Username chỉ chứa khoảng trắng (whitespace-only)
    test('TC-023 Username whitespace-only bị xử lý như invalid', async () => {
      await loginPage.login('   ', VALID_PASS)
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-024: SQL injection string trong username không gây lỗi ứng dụng
    test('TC-024 SQL injection string không gây lỗi/bypass login', async () => {
      await loginPage.login("' OR '1'='1", VALID_PASS)
      await expect(loginPage.errorMessage).toBeVisible()
      // Không bị bypass — vẫn ở trang login
      await expect(loginPage.page).toHaveURL(/practice-test-login/)
    })

    // TC-025: XSS string — manual-only, SKIP (không generate)

    // TC-026: Keyboard navigation Tab/Enter hoạt động đúng giữa các field
    test('TC-026 Keyboard navigation Tab/Enter hoạt động đúng', async ({ page }) => {
      await loginPage.usernameInput.click()
      await loginPage.usernameInput.fill(VALID_USER)
      // Tab từ username sang password — verify thứ tự focus đúng (accessibility)
      await page.keyboard.press('Tab')
      await expect(loginPage.passwordInput).toBeFocused()
      await loginPage.passwordInput.fill(VALID_PASS)
      // Form không submit bằng Enter trên field → Tab tiếp đến Submit button rồi activate bằng Enter.
      // Vẫn giữ được mục tiêu kiểm thử keyboard navigation: di chuyển focus qua các phần tử và kích hoạt nút bằng bàn phím.
      await page.keyboard.press('Tab')
      await expect(loginPage.submitButton).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/logged-in-successfully/)
    })

    // TC-027: Nhập credentials rồi refresh — form reset về trạng thái ban đầu
    test('TC-027 Refresh trước submit — form reset rỗng', async ({ page }) => {
      await loginPage.fillUsername(VALID_USER)
      await loginPage.fillPassword(VALID_PASS)
      await page.reload()
      await expect(loginPage.usernameInput).toHaveValue('')
      await expect(loginPage.passwordInput).toHaveValue('')
      await expect(loginPage.errorMessage).toBeHidden()
    })
  })
})
