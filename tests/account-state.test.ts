import { test, expect } from '@playwright/test';

test('test account state is past_due', async ({ page, request }) => {
  await page.goto('/home');
  request.post(process.env.ENDPOINT_API_URL + '/mock/accounts?state=past_due');
  const warnText = await page.locator('[data-qa="header-banner-payment-warning"]').textContent();
  expect(warnText).toMatch("We’ve had trouble taking payment. Please update your card details to avoid disruptions to your account.");
  // Click text=update your card details
  await page.locator('text=update your card details').click();
  await expect(page).toHaveURL('/manage-billing/#update_card');
});

test('test account state is unpaid', async ({ page, request }) => {
  await page.goto('/home');
  request.post(process.env.ENDPOINT_API_URL + '/mock/accounts?state=unpaid');
  let warnText = await page.locator('[data-qa="header-banner-payment-warning"]').textContent();
  expect(warnText).toMatch("We’ve had trouble taking payment. Please update your card details to transcribe more files.");
  // Click text=update your card details
  await page.locator('text=update your card details').click();
  await expect(page).toHaveURL('/manage-billing/#update_card');

  warnText = await page.locator('[data-qa="billing-banner-payment-warning"]').textContent()
  expect(warnText).toMatch('Please update your card details to transcribe more files. If you have recently made a payment, it may take a few minutes to update your account.')
});