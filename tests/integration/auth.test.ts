import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { closeConnection } from '../../src/config/database';

const BASE_URL = 'http://localhost:3000';

describe('Authentication Integration Tests', () => {
  afterAll(async () => {
    await closeConnection();
  });

  async function makeRequest(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  }

  test('should register a new user', async () => {
    const timestamp = Date.now();
    const response = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `test${timestamp}@example.com`,
        username: `testuser${timestamp}`,
        password: 'password123',
      }),
    });

    expect(response.status).toBe(200);
    expect(response.data?.success).toBe(true);
    expect(response.data?.data?.user).toBeDefined();
    expect(response.data?.data?.token).toBeDefined();
  });

  test('should fail to register with invalid email', async () => {
    const response = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      }),
    });

    expect(response.status).toBe(400);
    expect(response.data?.success).toBe(false);
  });

  test('should fail to register with short password', async () => {
    const timestamp = Date.now();
    const response = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `test${timestamp}@example.com`,
        username: `testuser${timestamp}`,
        password: 'short',
      }),
    });

    expect(response.status).toBe(400);
    expect(response.data?.success).toBe(false);
  });

  test('should login with valid credentials', async () => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const username = `testuser${timestamp}`;
    const password = 'password123';

    // First register
    await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    });

    // Then login
    const loginResponse = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data?.success).toBe(true);
    expect(loginResponse.data?.data?.user).toBeDefined();
    expect(loginResponse.data?.data?.token).toBeDefined();
  });

  test('should fail to login with invalid credentials', async () => {
    const response = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
    expect(response.data?.success).toBe(false);
  });

  test('should logout successfully', async () => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const username = `testuser${timestamp}`;
    const password = 'password123';

    // Register and login
    await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    });

    const loginResponse = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const token = loginResponse.data?.data?.token;

    // Logout with token
    const logoutResponse = await makeRequest('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.data?.success).toBe(true);
  });
});
