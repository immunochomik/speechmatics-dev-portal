import { chromium, FullConfig, firefox, webkit } from '@playwright/test';
import configs from './test-configs';


async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();

  await page.goto(<string>process.env.REDIRECT_URI);

  await page.locator('[placeholder="Email Address"]').fill(<string>process.env.TEST_EMAIL);
  await page.locator('[placeholder="Password"]').fill(<string>process.env.TEST_PASSWORD);
  await Promise.all([
    page.locator('button:has-text("Sign in")').click(),
    page.waitForTimeout(10000),
  ]);

  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({path: 'e2e/test-output/storageState.json'});

  await browser.close();
}


export default globalSetup;
