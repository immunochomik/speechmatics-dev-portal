import { chromium, FullConfig, firefox, webkit } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();
  await page.goto('http://localhost:3000/login/');
  await page.locator('input[name="Email Address"]').fill('meghnathk+test1@speechmatics.com');
  await page.locator('input[name="Password"]').fill('hihrom-zIkxi2-xacpit');
  await page.locator('button[id="next"]').click();
  await page.waitForTimeout(3000);//sleep
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();

}

export default globalSetup;
