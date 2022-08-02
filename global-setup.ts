import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();
  await page.goto(process.env.REDIRECT_URI);
  await page.locator('[placeholder="Email Address"]').fill(process.env.TEST_EMAIL);
  await page.locator('[placeholder="Password"]').fill(process.env.TEST_PASSWORD);
  await Promise.all([
    page.locator('button:has-text("Sign in")').click(),
    page.waitForTimeout(10000),
  ]);
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();

}

export default globalSetup;
