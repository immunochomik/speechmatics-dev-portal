import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Runs before each test and signs in each page.
  await page.goto('/login');
  // Fill [placeholder="Email Address"]
  await page.locator('[placeholder="Email Address"]').fill(process.env.TEST_EMAIL);
  // Fill [placeholder="Password"]
  await page.locator('[placeholder="Password"]').fill(process.env.TEST_PASSWORD);
  // Click button:has-text("Sign in")
  await Promise.all([
    page.locator('button:has-text("Sign in")').click()
  ]);
});

test('user does not have any recent jobs', async ({ page }) => {
  await page.locator('text=View Jobs').click()
  await expect(page).toHaveURL('/view-jobs/');

  expect(page.locator('text=No jobs found.')).toBeVisible()

  // Click text=Transcribe Now
  await Promise.all([
    page.waitForNavigation(),
    page.locator('text=Transcribe Now').click()
  ]);

  // Click p:has-text("Upload & Transcribe")
  await page.locator('p:has-text("Upload & Transcribe")').click();
});

// test('jobs list is rendering jobs correctly', async ({ page }) => {
//   await page.goto('/view-jobs/');

//   const jobItem = page.locator('data-qa=list-job-item');

//   // assert list of items is > 0 in length
//   await expect(jobItem).not.toHaveCount(0);
// });

// test('transcripts in jobs list are viewable', async ({ page }) => {
//   await page.goto('/view-jobs');

//   const jobItem = page.locator('data-qa=list-job-item');
//   await expect(jobItem).not.toHaveCount(0);
//   await page.locator('data-qa=list-job-view-transcript-button').click();

//   const transcriptModal = page.locator('data-qa=transcript-modal');
//   await expect(transcriptModal).toHaveCount(1);

// });

// test('transcripts in jobs list are deletable', async ({ page }) => {
//   await page.goto('/view-jobs/');

//   const jobItem = page.locator('data-qa=list-job-item');
//   await expect(jobItem).not.toHaveCount(0);
//   await page.locator('data-qa=list-job-delete-button').click();

//   const confirmButton = page.locator('data-qa=button-confirm');
//   const cancelButton = page.locator('data-qa=button-cancel');
//   await expect(confirmButton).toBeVisible();
//   await expect(cancelButton).toBeVisible();

//   confirmButton.click();

//   const deletedJob = page.locator('data-qa=list-job-deleted');
//   await expect(deletedJob).toBeVisible();
// });

// test('show deleted button in jobs list toggles visiblity of deleted jobs', async ({ page }) => {
//   await page.goto('/view-jobs/');

//   const deletedItems = page.locator('data-qa=list-job-deleted');
//   await expect(deletedItems).not.toHaveCount(0);
//   await page.locator('data-qa=show-deleted-jobs-button').click();
//   await expect(deletedItems).toHaveCount(0);
// });