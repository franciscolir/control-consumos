import { test, expect } from '@playwright/test';

test('health endpoint', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/health');
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.ok).toBe(true);
});
