import { describe, test, expect } from 'bun:test';
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeString,
} from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    test('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    test('should validate password with minimum length', () => {
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('longpassword123')).toBe(true);
    });

    test('should reject short password', () => {
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    test('should validate correct username', () => {
      expect(isValidUsername('user')).toBe(true);
      expect(isValidUsername('username123')).toBe(true);
    });

    test('should reject invalid username', () => {
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('a'.repeat(101))).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    test('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString('test')).toBe('test');
    });
  });
});
