import { test, expect, Page } from '@playwright/test';


test('local host test',async ({ page }) => {
  await page.goto('/');
});

