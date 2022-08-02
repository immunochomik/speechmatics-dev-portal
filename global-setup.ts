import { chromium, FullConfig, firefox, webkit } from '@playwright/test';

const baseURL = 'https://portal.speechmatics.com';

async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();
  await page.goto(baseURL+'/login');
  await page.locator('input[name="Email Address"]').fill('meghnathpillay@gmail.com');
  await page.locator('input[name="Password"]').fill('pRth!bmSjVzi9Gn');
  await page.locator('button[id="next"]').click();
  await page.waitForTimeout(5000);//sleep
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();

}

export default globalSetup;
