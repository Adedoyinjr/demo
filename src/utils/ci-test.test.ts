import { test, expect } from 'vitest';

test('intentional failing assertion for CI verification', () => {
  expect(true).toBe(false);
});
