import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object cho trang Practice Test Login.
 * Encapsulate selectors và actions của login page.
 * URL: /practice-test-login/
 */
export class LoginPage {
  readonly page: Page

  // Selectors
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly successHeading: Locator
  readonly successContent: Locator

  constructor(page: Page) {
    this.page = page
    this.usernameInput = page.locator('#username')
    this.passwordInput = page.locator('#password')
    this.submitButton = page.locator('#submit')
    // Trang dùng id="error"; dùng cả .error-message để phòng trường hợp markup khác
    this.errorMessage = page.locator('#error, .error-message')
    // Success page heading + nội dung
    this.successHeading = page.locator('h1.post-title, h1')
    this.successContent = page.locator('.post-content, p.has-text-align-center')
  }

  async navigate(): Promise<void> {
    await this.page.goto('/practice-test-login/')
    await expect(this.usernameInput).toBeVisible()
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username)
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  /** Điền credentials rồi submit. */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username)
    await this.fillPassword(password)
    await this.submit()
  }

  // ---- Getters ----

  /** Lấy text của error message hiện tại. */
  async getErrorText(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? ''
  }

  /** URL hiện tại của trang. */
  currentUrl(): string {
    return this.page.url()
  }

  /** Tiêu đề trang (document title). */
  async pageTitle(): Promise<string> {
    return this.page.title()
  }

  /** Lấy attribute type của password field. */
  async passwordFieldType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type')
  }
}
