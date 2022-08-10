import { chromium, FullConfig, firefox, webkit } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  let browser = await chromium.launch();
  let page = await browser.newPage();
<<<<<<< HEAD
  await page.goto('http://localhost:3000/login/');
  await page.locator('input[name="Email Address"]').fill('meghnathk+test1@speechmatics.com');
  await page.locator('input[name="Password"]').fill('hihrom-zIkxi2-xacpit');
  await page.locator('button[id="next"]').click();
  await page.waitForTimeout(3000);//sleep
=======

  await page.goto(process.env.REDIRECT_URI);
  await page.locator('[placeholder="Email Address"]').fill(process.env.TEST_EMAIL);
  await page.locator('[placeholder="Password"]').fill(process.env.TEST_PASSWORD);
  await Promise.all([
    page.locator('button:has-text("Sign in")').click(),
    page.waitForTimeout(10000),
  ]);
  
>>>>>>> c5d103bb73c19c9d564086c2328760ce625da23b
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();

}

export default globalSetup;
