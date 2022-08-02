import { chromium, FullConfig, firefox, webkit } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();
  await page.goto('https://staging-portal.internal.speechmatics.com/login');
  await page.locator('input[name="Email Address"]').fill(process.env.TEST_EMAIL);
  await page.locator('input[name="Password"]').fill(process.env.TEST_PASSWORD);
  await page.locator('button[id="next"]').click();
  await page.waitForTimeout(10000);//sleep
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();

}

export default globalSetup;
