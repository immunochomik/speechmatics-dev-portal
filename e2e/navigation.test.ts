import { test, expect } from '@playwright/test';
import genericHelpers from './helpers/generics';
import playwrightConfig from '../playwright.config';

const baseURL = playwrightConfig?.use?.baseURL;
const btn = (text: string): string => `button:has-text('${text}')`;
const mItem = (text: string): string => `.menu_elem:has-text('${text}')`;

function navTest(postfix: string, selector: string, URLtoAssert: string) {
  test(`Navigation Test: Home → ${postfix}`, async ({ page }) => {
    const g = genericHelpers(page);
    // Navigate to home page
    await g.goTo('/home');
    // Click [aria-label="Accept cookies"]
    await g.clickElement('[aria-label="Accept cookies"]');
    // Click nav button
    await g.clickElement(selector);
    // Assert URL
    await expect(page).toHaveURL(`${baseURL}${URLtoAssert}`);
  });
}

// From Dashboard / Home
navTest('RT Transcription', btn('Try Demo'), '/real-time-demo/');
navTest('Getting Started', btn('Get Started'), '/getting-started/');
navTest('Manage Access', btn('Create API Key'), '/manage-access/');
navTest('Track Your Usage', btn('View Usage'), '/usage/');
navTest('Learning Resources', btn('Learn'), '/learn/');

// From Side Nav
navTest('Home (Side Nav)', mItem('Home'), '/home/');
navTest('RT Transcription (Side Nav)', mItem('Real-time Demo'), '/real-time-demo/');
navTest('Upload & Transcribe (Side Nav)', mItem('Upload & Transcribe'), '/transcribe/');
navTest('Getting Started (Side Nav)', mItem('Start Using API'), '/getting-started/');
navTest('Manage Access (Side Nav)', mItem('Manage Access'), '/manage-access/');
navTest('View Jobs (Side Nav)', mItem('View Jobs'), '/view-jobs/');
navTest('Track Usage (Side Nav)', mItem('Track Usage'), '/usage/');
navTest('Manage Billing (Side Nav)', mItem('Manage Billing'), '/manage-billing/');
navTest('Learning Resources (Side Nav)', mItem('Learn'), '/learn/');
