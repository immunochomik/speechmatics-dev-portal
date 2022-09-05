import { test, expect, Page } from '@playwright/test';
import cfg from './testConfigs'
import provisioner, { TranscriberLanguage, TranscriberType } from './helpers/realtimeProvisioner'

function rtTest(postfix: string, func: (page: Page)=>Promise<void> ) {
  test(`RT Transcription Test: ${postfix}`, async ({page}) => {
    // Navigate to RT Demo page
    await page.goto('/real-time-demo');
    await page.waitForTimeout(cfg.msToWait)
    // Click [aria-label="Accept cookies"]
    await page.locator('[aria-label="Accept cookies"]').click();
    // Run test func
    await func(page);
  })
}

async function clickEl(page: Page, selector: string) {
  await page.locator(selector).click();
  await page.waitForTimeout(cfg.msToWait)
}

async function getNumTranscribers(lang: TranscriberLanguage, type: TranscriberType) {
  const p = provisioner();
  const nIdle = (await p.getNumTranscribers(lang, type, 'idle')).length;
  const nBusy = (await p.getNumTranscribers(lang, type, 'busy')).length;
  return {
    idle: nIdle,
    busy: nBusy
  }
}

rtTest("Test Start and Stop Transcription", async (page)=>{
    const p = provisioner();
    // Get/check starting state:
    const nTranscribersBefore = await getNumTranscribers("en", "realtime");
    let stage = await page.evaluate(async ()=>{
      const rtStore = require('../utils/real-time-utils/real-time-flow');
      return rtStore.stage;
    });
    expect(stage === "form", "RT Flow stage is not 'form'!");
    // expect(realtimeStore.stage === "form", "RT Flow stage is not 'form'!");
    // Trigger start:
    await clickEl(page, '[data-qa=button-get-transcription]'); // i.e. 'Start Real-time Transcription' button
    // expect(realtimeStore.stage === "starting", "RT Flow stage is not 'starting'!");
    await page.waitForTimeout(10000);
    // Get/check working state:
    // expect(realtimeStore.stage === "running", "RT Flow stage is not 'running'!");
    const nTranscribersDuring = await getNumTranscribers("en", "realtime");
    expect (nTranscribersDuring.idle === nTranscribersBefore.idle-1 && nTranscribersDuring.busy === nTranscribersBefore.busy+1, "");
    await page.waitForTimeout(10000);
    // Trigger stop:
    await clickEl(page, "[data-qa=button-get-transcription]") // i.e. 'Stop Real-time Transcription' button
    // expect(realtimeStore.stage === "stopping", "RT Flow stage is not 'stopping'!");
    // Get/check stopped state:
    // expect(realtimeStore.stage === "stopped", "RT Flow stage is not 'stopped'!");
    const nTranscribersAfter = await getNumTranscribers("en", "realtime");
    expect (nTranscribersAfter.idle === nTranscribersBefore.idle && nTranscribersAfter.busy === nTranscribersBefore.busy, "");
})