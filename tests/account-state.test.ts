import { test, expect, selectors } from '@playwright/test';

test('test account state is past_due', async ({ page, request }) => {
  await page.goto('/login');
  // Fill [placeholder="Email Address"]
  await page.locator('[placeholder="Email Address"]').fill(process.env.TEST_EMAIL);
  // Fill [placeholder="Password"]
  await page.locator('[placeholder="Password"]').fill(process.env.TEST_PASSWORD);
  // Click button:has-text("Sign in")
  await Promise.all([
    request.post(process.env.ENDPOINT_API_URL + '/mock/accounts?state=past_due'),
    page.locator('button:has-text("Sign in")').click()
  ]);
  const warnText = await page.locator('[data-qa="header-banner-payment-warning"]').textContent();
  expect(warnText).toMatch("We’ve had trouble taking payment. Please update your card details to avoid disruptions to your account.");
  // Click text=update your card details
  await page.locator('text=update your card details').click();
  await expect(page).toHaveURL('/manage-billing/#update_card');
});

// test('test account state is unpaid', async ({ page, request }) => {
//   await page.goto('/login');
//   // Fill [placeholder="Email Address"]
//   await page.locator('[placeholder="Email Address"]').fill(process.env.TEST_EMAIL);
//   // Fill [placeholder="Password"]
//   await page.locator('[placeholder="Password"]').fill(process.env.TEST_PASSWORD);
//   // Click button:has-text("Sign in")
//   await Promise.all([
//     request.post(process.env.ENDPOINT_API_URL + '/mock/accounts?state=unpaid'),
//     page.locator('button:has-text("Sign in")').click()
//   ]);
//   let warnText = await page.locator('[data-qa="header-banner-payment-warning"]').textContent();
//   expect(warnText).toMatch("We’ve had trouble taking payment. Please update your card details to transcribe more files.");
//   // Click text=update your card details
//   await page.locator('text=update your card details').click();
//   await expect(page).toHaveURL('/manage-billing/#update_card');

//   warnText = await page.locator('[data-qa="billing-banner-payment-warning"]').textContent()
//   expect(warnText).toMatch('Please update your card details to transcribe more files. If you have recently made a payment, it may take a few minutes to update your account.')
// });