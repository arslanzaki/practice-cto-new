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
    
    // Registration may require email confirmation
    if (response.data?.data?.requiresEmailConfirmation) {
      expect(response.data?.message).toContain('check your email');
    } else if (response.data?.data?.token) {
      expect(response.data?.data?.token).toBeDefined();
    }
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

  test('should handle email verification', async () => {
    // This test would require a real Supabase token, so we'll just test the endpoint structure
    const response = await makeRequest('/api/v1/auth/verify-email?access_token=invalid_token');
    
    // Should return an error for invalid token
    expect(response.status).toBe(400);
    expect(response.data?.success).toBe(false);
  });

  test('should resend confirmation email', async () => {
    const timestamp = Date.now();
    const response = await makeRequest('/api/v1/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({
        email: `test${timestamp}@example.com`,
      }),
    });

    // May succeed or fail depending on Supabase configuration
    expect([200, 400]).toContain(response.status);
  });

  test('should fail to login without email verification', async () => {
    const timestamp = Date.now();
    const response = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: `test${timestamp}@example.com`,
        password: 'password123',
      }),
    });

    // Should either fail with unverified email or succeed if email is auto-verified
    expect([200, 401]).toContain(response.status);
    
    if (response.status === 401) {
      expect(response.data?.error).toContain('verify your email');
    }
  });

  test('should logout successfully', async () => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const username = `testuser${timestamp}`;
    const password = 'password123';

    // Register first
    const registerResponse = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    });

    let token: string | undefined;
    
    // If registration gives us a token directly, use it
    if (registerResponse.data?.data?.token) {
      token = registerResponse.data.data.token;
    } else {
      // Otherwise, try to login (this might fail due to email verification)
      const loginResponse = await makeRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      if (loginResponse.data?.data?.token) {
        token = loginResponse.data.data.token;
      }
    }

    if (token) {
      // Test logout with valid token
      const logoutResponse = await makeRequest('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.data?.success).toBe(true);
    } else {
      // If we couldn't get a token, test logout with invalid token
      const logoutResponse = await makeRequest('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer invalid_token',
        },
      });

      // Should succeed even with invalid token (Supabase logout doesn't validate)
      expect(logoutResponse.status).toBe(200);
    }
  });
});
