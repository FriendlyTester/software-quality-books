import { RegisterPage } from '../page-objects/register-page'
import type { TestUser } from '../data-builders/user-builder'

export class RegistrationHelper {
  private readonly registerPage: RegisterPage

  constructor(registerPage: RegisterPage) {
    this.registerPage = registerPage
  }

  async registerNewUser(testUser: TestUser) {
    await this.registerPage.goto()
    await this.registerPage.fillEmail(testUser.email)
    await this.registerPage.fillPassword(testUser.password)
    await this.registerPage.fillName(testUser.name)
    await this.registerPage.clickCreateAccountButton()
  }
}