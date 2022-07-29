import { test, expect, Page } from '@playwright/test';


test('login page test', async ({ page }) => {
  await page.goto('/login');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on login page: "${exception}"`);
  });
  
});

test('getting-started page test', async ({ page }) => {
  await page.goto('/getting-started');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on getting-started page: "${exception}"`);
  });
  
});

test('signup page test', async ({ page }) => {
  await page.goto('/signup');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on signup page: "${exception}"`);
  });
  
});

test('home page test', async ({ page }) => {
  await page.goto('/home');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on home page: "${exception}"`);
  });
  
});

test('manage-billing page test', async ({ page }) => {
  await page.goto('/manage-billing');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on manage-billing page: "${exception}"`);
  });
  
});

test('subscribe page test', async ({ page }) => {
  await page.goto('/subscribe');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on subscribe page: "${exception}"`);
  });
  
});

test('usage page test', async ({ page }) => {
  await page.goto('/usage');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on usage page: "${exception}"`);
  });
  
});

test('manage-access page test', async ({ page }) => {
  await page.goto('/manage-access');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on manage-access page: "${exception}"`);
  });
  
});

test('learn page test', async ({ page }) => {
  await page.goto('/learn');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on learn page: "${exception}"`);
  });
  
});

test('account page test', async ({ page }) => {
  await page.goto('/account');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on account page: "${exception}"`);
  });
  
});

test('transcribe page test', async ({ page }) => {
  await page.goto('/transcribe');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on transcribe page: "${exception}"`);
  });
  
});

test('view-jobs page test', async ({ page }) => {
  await page.goto('/view-jobs');
  page.on('pageerror', exception => {
    console.log(`Uncaught exception on view-jobs page: "${exception}"`);
  });
  
});








