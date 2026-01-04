import { describe, test, expect } from 'bun:test';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from '../../src/utils/response';

describe('Response Utils', () => {
  test('should create success response', () => {
    const data = { id: '1', name: 'Test' };
    const response = successResponse(data, 'Success message');

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.message).toBe('Success message');
  });

  test('should create error response', () => {
    const response = errorResponse('Error message');

    expect(response.success).toBe(false);
    expect(response.error).toBe('Error message');
  });

  test('should create paginated response', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const response = paginatedResponse(data, 1, 20, 100);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.pagination.page).toBe(1);
    expect(response.pagination.limit).toBe(20);
    expect(response.pagination.total).toBe(100);
    expect(response.pagination.totalPages).toBe(5);
  });
});
