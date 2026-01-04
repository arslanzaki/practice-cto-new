import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import type { App } from '../../src/index';
import app from '../../src/index';
import { closeConnection } from '../../src/config/database';

const api = treaty<App>('localhost:3000');

describe('Authentication Integration Tests', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('should register a new user', async () => {
    const timestamp = Date.now();
    const response = await api.api.v1.auth.register.post({
      email: `test${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      password: 'password123',
    });

    expect(response.status).toBe(201);
  });

  test('should fail to register with invalid email', async () => {
    const response = await api.api.v1.auth.register.post({
      email: 'invalid-email',
      username: 'testuser',
      password: 'password123',
    });

    expect(response.status).toBe(400);
  });

  test('should fail to register with short password', async () => {
    const timestamp = Date.now();
    const response = await api.api.v1.auth.register.post({
      email: `test${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      password: 'short',
    });

    expect(response.status).toBe(400);
  });
});
