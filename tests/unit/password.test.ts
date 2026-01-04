import { describe, test, expect } from 'bun:test';
import { hashPassword, comparePassword } from '../../src/utils/password';

describe('Password Utils', () => {
  test('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  test('should compare password correctly', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);

    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });

  test('should fail comparison with wrong password', async () => {
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword456';
    const hash = await hashPassword(password);

    const isValid = await comparePassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});
