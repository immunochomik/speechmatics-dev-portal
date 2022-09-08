import { chromium, FullConfig, firefox, webkit } from '@playwright/test';



async function globalSetup(config: FullConfig) {
  // let browser = await chromium.launchPersistentContext("userData");

  let browser = await chromium.launch();
  const context = await browser.newContext();
  await context.grantPermissions(["microphone"]);
  let page = await context.newPage();

  await page.goto(process.env.REDIRECT_URI);

  // if (await page.locator('[placeholder="Email Address"]').isVisible()) {
    await page.locator('[placeholder="Email Address"]').fill(process.env.TEST_EMAIL);
    await page.locator('[placeholder="Password"]').fill(process.env.TEST_PASSWORD);
    await Promise.all([
      page.locator('button:has-text("Sign in")').click(),
      page.waitForTimeout(10000),
    ]);

    // Save signed-in state to 'storageState.json'.
    await page.context().storageState({path: 'e2e/testOutput/storageState.json'});
  // }

  await browser.close();
}

export default globalSetup;
