import { test, expect } from '@playwright/test';

const baseURL = "http://localhost:3000"

test('check empty jobs list shows the message and button to user', async ({ page }) => {
  await page.goto(baseUrl + '/view-jobs/');

  const jobItem = page.locator('data-qa=list-job-item');

  await expect(jobItem).toHaveCount(0);
  await expect(page.locator("text=No jobs found.")).toBeVisible();
  await page.locator("data-qa=no-jobs-transcribe-button").click();

});

test('jobs list is rendering jobs correctly', async ({ page }) => {
  await page.goto(baseUrl + '/view-jobs/');

  const jobItem = page.locator('data-qa=list-job-item');

  // assert list of items is > 0 in length
  await expect(jobItem).not.toHaveCount(0);
});

test('transcripts in jobs list are viewable', async ({ page }) => {
  await page.goto(baseUrl + '/view-jobs/');

  const jobItem = page.locator('data-qa=list-job-item');
  await expect(jobItem).not.toHaveCount(0);
  await page.locator('data-qa=list-job-view-transcript-button').click();

  const transcriptModal = page.locator('data-qa=transcript-modal');
  await expect(transcriptModal).toHaveCount(1);

});

test('transcripts in jobs list are deletable', async ({ page }) => {
  await page.goto(baseUrl + '/view-jobs/');

  const jobItem = page.locator('data-qa=list-job-item');
  await expect(jobItem).not.toHaveCount(0);
  await page.locator('data-qa=list-job-delete-button').click();

  const confirmButton = page.locator('data-qa=button-confirm');
  const cancelButton = page.locator('data-qa=button-cancel');
  await expect(confirmButton).toBeVisible();
  await expect(cancelButton).toBeVisible();

  confirmButton.click();

  const deletedJob = page.locator('data-qa=list-job-deleted');
  await expect(deletedJob).toBeVisible();
});

test('show deleted button in jobs list toggles visiblity of deleted jobs', async ({ page }) => {
  await page.goto(baseUrl + '/view-jobs/');

  const deletedItems = page.locator('data-qa=list-job-deleted');
  await expect(deletedItems).not.toHaveCount(0);
  await page.locator('data-qa=show-deleted-jobs-button').click();
  const hiddenDeletedItems = page.locator('data-qa=list-job-deleted');
  await expect(hiddenDeletedItems).toHaveCount(0);

});