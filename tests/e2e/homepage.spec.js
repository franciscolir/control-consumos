import { test, expect } from '@playwright/test';

test('carga el panel y muestra el menú lateral', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('aside').getByText('Control Consumos')).toBeVisible();
  await expect(page.locator('.nav-item')).toHaveCount(11);
  await expect(page.locator('[data-view="dashboard"]')).toBeVisible();
});

test('el menú lateral navega entre vistas', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('.nav-item[data-route="establecimientos"]').click();
  await expect(page.locator('[data-view="establecimientos"]')).toBeVisible();
  await expect(page.locator('[data-view="dashboard"]')).toBeHidden();
  await page.locator('.nav-item[data-route="metricas"]').click();
  await expect(page.locator('[data-view="metricas"]')).toBeVisible();
});
