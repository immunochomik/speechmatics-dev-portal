import { test, expect, Page } from '@playwright/test';

const baseURL = 'http://localhost:3000';

test('Home to transcribe now navigations test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto('/home');
  // Click text=Transcribe Now
  await page.waitForTimeout(5000)
  await page.locator('text=Transcribe Now').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/transcribe/');
});


test('Home get started button navigations test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Get Started
  await page.waitForTimeout(5000)
  await page.locator('text=Get Started').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/getting-started/');
  await page.screenshot({path:"scn.png"})
});


test('create api key button press test from home page', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click [aria-label="Accept cookies"]
  await page.locator('[aria-label="Accept cookies"]').click();
  // Click text=Create API Key
  await page.waitForTimeout(5000)
  await page.locator('text=Create API Key').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/manage-access/');
});

test('view usage button press test from home page', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click [aria-label="Accept cookies"]
  await page.locator('[aria-label="Accept cookies"]').click();
  
  // Click text=View Usage
  await page.waitForTimeout(5000)
  await page.locator('text=View Usage').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/usage/');
});

test('learn button press test from home page', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click [aria-label="Accept cookies"]
  await page.locator('[aria-label="Accept cookies"]').click();
  
  // Click text=View Usage
  await page.waitForTimeout(5000)
  await page.locator('button:has-text("Learn")').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/learn/');
});

test('Home side bar to transcribe navigations test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Upload & Transcribe
  await page.waitForTimeout(5000)
  await page.locator('text=Upload & Transcribe').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/transcribe/');
});

test('Home side bar start using api button test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Upload & Transcribe
  await page.waitForTimeout(5000)
  await page.locator('text=Start Using API').first().click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/getting-started/');
});

test('Home side bar manage-access button test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Upload & Transcribe
  await page.waitForTimeout(5000)
  await page.locator('text=Manage Access').first().click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/manage-access/');
});

test('Home side bar view jobs button test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Upload & Transcribe
  await page.waitForTimeout(5000)
  await page.locator('text=View Jobs').first().click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/view-jobs/');
});

test('Home side bar Track usage button test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Upload & Transcribe
  await page.waitForTimeout(5000)
  await page.locator('text=Track Usage').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/usage/');
});

test('Home side bar Manage billing button test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Upload & Transcribe
  await page.waitForTimeout(5000)
  await page.locator('text=Manage Billing').click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/manage-billing/');
});

test('Home side bar learn button test', async ({ page }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto(baseURL+'/home/');
  // Click text=Upload & Transcribe
  await page.waitForTimeout(5000)
  await page.locator('text=Learn').first().click();
  await page.waitForTimeout(5000)
  await expect(page).toHaveURL(baseURL+'/learn/');
});

