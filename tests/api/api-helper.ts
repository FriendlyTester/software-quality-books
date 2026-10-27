import { APIRequestContext } from '@playwright/test';

import { UserBuilder } from '../../src/lib/test-data';
import { PrismaUserCreator } from '../../src/lib/test-data/prisma';

export class ApiHelper {
  private readonly request: APIRequestContext

  constructor(request: APIRequestContext) {
    this.request = request
  }

  private async getCsrfToken() {
    const response = await this.request.get('/api/auth/csrf');
    const { csrfToken } = await response.json();
    return csrfToken;
  }

  async login(credentials: { email: string; password: string }) {
    // Get CSRF token
    const csrfToken = await this.getCsrfToken();

    // Perform login
  const response = await this.request.post('/api/auth/callback/credentials', {
      form: {
        ...credentials,
        csrfToken,
        redirect: 'false',
        callbackUrl: 'http://localhost:3000/login',
        json: 'true'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok()) {
      throw new Error('Authentication failed');
    }

    // Get session
  await this.request.get('/api/auth/session');
  }

  async createAuthenticatedUser() {
    const testUser = await new PrismaUserCreator().create(UserBuilder.aUser().build());
    await this.login({
      email: testUser.email,
      password: testUser.password
    });
    
    return testUser;
  }

  async createBook(bookData: { title: string; description: string }) {
  return this.request.post('/api/books', {
      data: bookData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getBooks() {
    return this.request.get('/api/books');
  }

  async createApiKey(name: string) {
    return this.request.post('/api/api-keys', {
      data: { name },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async listApiKeys() {
    return this.request.get('/api/api-keys');
  }

  async revokeApiKey(id: string) {
    return this.request.delete(`/api/api-keys/${id}`);
  }
}
