/***
 * This file implements the Playwright test function used to test
 * realtime transcription functionality on SaaS (RT Demo).
 *
 * Expect this test to fail locally, because it requires the tooling and virtual speaker+microphone interfaces
 * created by the '_initContainer.sh' script during Docker container startup (before any tests are run).
 *
 ***/
import { test, expect, Page } from '@playwright/test';
import testCfg from './testConfigs'
import rtProvisioner from './helpers/realtimeProvisioner'
import virtualMic from "./helpers/virtualMic";
import generics from "./helpers/generics";


function rtTest(postfix: string, func: (page: Page)=>Promise<void> ) {
  test(`RT Transcription Test: ${postfix}`, async ({page}) => {
    const g = generics(page);
    // Navigate to RT Demo page
    await g.goTo('/real-time-demo');
    // Click [aria-label="Accept cookies"]
    await g.clickElement('[aria-label="Accept cookies"]');
    // Run test func
    await func(page);
  })
}


// The test function.
// TODO: This can be parameterized/wrapped to test alternative options
rtTest("EN, default options", async (page)=>{
    // Create interface to RT Provisioner API, if required.
    const g = generics(page);
    let provisionerCtxt = testCfg.transcriptionTests.checkTranscriberState ? {
        p: undefined,
        nTranscribersBefore: undefined,
        nTranscribersDuring: undefined,
        nTranscribersAfter: undefined
    } : undefined;
    if (provisionerCtxt) {
        provisionerCtxt.p = rtProvisioner();
    }


    // Start transcription.
    {
        // get initial provisioner state
        if (provisionerCtxt) {
            provisionerCtxt.nTranscribersBefore = await provisionerCtxt.p.getNumTranscribers("en", "realtime");
        }
        // take a before screenshot
        await g.takeScreenshot("transcription-before");
        // press the start button i.e. 'Start Real-time Transcription' button
        await g.clickElement('[data-qa=button-get-transcription]');
        // play sample audio file through mic, wait until finished to move onto next stage
        await virtualMic.playSample(`RT Transcription Test: EN, default options`,  false,"en_2spkrs_36s.mp3");
    }


    // During transcription. TODO: This could be truly concurrent with playFileToMic
    // This works for now only because transcribers take a while to get back into 'idle' state.
    {
        // get (and check) during-transcription provisioner state
        if (provisionerCtxt) {
            provisionerCtxt.nTranscribersDuring = await provisionerCtxt.p.getNumTranscribers("en", "realtime");
            expect (provisionerCtxt.nTranscribersDuring.idle === provisionerCtxt.nTranscribersBefore.idle-1 && provisionerCtxt.nTranscribersDuring.busy === provisionerCtxt.nTranscribersBefore.busy+1, "");
        }
    }


    // Stop transcription.
    {
        // press the stop button i.e. 'Stop Real-time Transcription' button
        await g.clickElement('[data-qa=button-get-transcription]');
        // take an after screenshot
        await g.takeScreenshot("transcription-after");
        // get (and check) after-transcription provisioner state
        if (provisionerCtxt) {
            provisionerCtxt.nTranscribersAfter = await provisionerCtxt.p.getNumTranscribers("en", "realtime");
            expect (provisionerCtxt.nTranscribersAfter.idle === provisionerCtxt.nTranscribersBefore.idle && provisionerCtxt.nTranscribersAfter.busy === provisionerCtxt.nTranscribersBefore.busy, "");
        }
    }
})

