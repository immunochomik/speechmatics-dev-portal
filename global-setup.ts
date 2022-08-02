import { chromium, FullConfig, firefox, webkit } from '@playwright/test';

<<<<<<< HEAD
const baseURL = 'https://portal.speechmatics.com';

async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();
  await page.goto(baseURL+'/login');
  await page.locator('input[name="Email Address"]').fill('meghnathpillay@gmail.com');
  await page.locator('input[name="Password"]').fill('pRth!bmSjVzi9Gn');
  await page.locator('button[id="next"]').click();
  await page.waitForTimeout(5000);//sleep
=======
async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();
  await page.goto('https://staging-portal.internal.speechmatics.com/login');
  await page.locator('input[name="Email Address"]').fill(process.env.TEST_EMAIL);
  await page.locator('input[name="Password"]').fill(process.env.TEST_PASSWORD);
  await page.locator('button[id="next"]').click();
  await page.waitForTimeout(10000);//sleep
>>>>>>> c0c752979ac80693eeaaca66c48d9e5e2f48ffb0
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();

}

<<<<<<< HEAD
export default globalSetup;
=======
export default globalSetup;
>>>>>>> c0c752979ac80693eeaaca66c48d9e5e2f48ffb0
