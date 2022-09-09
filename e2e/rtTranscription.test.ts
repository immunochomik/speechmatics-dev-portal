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
import rtProvisioner, { RTProvisioner } from './helpers/realtimeProvisioner'
import virtualMic from "./helpers/virtualMic";
import generics from "./helpers/generics";

interface TranscribeOptions {
    language: "ar" | "bg" | "yue" | "ca" | "hr" | "cs" | "da" | "nl" | "en" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lv" | "lt" | "ms" | "cmn" | "no" | "pl" | "pt" | "ro" | "ru" | "sk" | "sl" | "es" | "sv" | "tr" | "uk",
    accuracy: "enhanced" | "standard",
    separation: "none" | "speaker"
};

interface RTProvisionerContext {
    p?: RTProvisioner,
    nTranscribersBefore?: {idle:number, busy:number},
    nTranscribersDuring?: {idle:number, busy:number},
    nTranscribersAfter?: {idle:number, busy:number},
}

function rtTest(options: TranscribeOptions, sampleAudioFile: string) {
  const testName = `RT Transcription Test: ( Lang: '${options.language}', Acc: '${options.accuracy}', Sep: '${options.separation}' )`;
  const testOutputPostfix = `${options.language}_${options.accuracy}_${options.separation}`;
  // the test routine:
  test(testName, async ({page}) => {
    // create interface to RT Provisioner API, if required.
    let provisionerCtxt: RTProvisionerContext | undefined = testCfg.transcriptionTests.checkTranscriberState ? {
        p: undefined,
        nTranscribersBefore: undefined,
        nTranscribersDuring: undefined,
        nTranscribersAfter: undefined
    } : undefined;
    if (provisionerCtxt) {
        provisionerCtxt.p = rtProvisioner();
    }

    // Navigate to RT Demo page.
    const g = generics(page);
    await g.goTo('/real-time-demo');

    // Click [aria-label="Accept cookies"].
    await g.clickElement('[aria-label="Accept cookies"]');
    
    // Set transcription params.
    {
        await page.selectOption('[data-qa="select-transcribe-language"]', options.language);
        await page.selectOption('[data-qa="select-transcribe-separation"]', options.separation);
        await page.selectOption('[data-qa="select-transcribe-accuracy"]', options.accuracy);
    }

    // Start transcription.
    {
        // get initial provisioner state
        if (provisionerCtxt) {
            provisionerCtxt.nTranscribersBefore = await provisionerCtxt.p.getNumTranscribers("en", "realtime");
        }
        // take a before screenshot
        await g.takeScreenshot(`before_transcription_${testOutputPostfix}`);
        // press the start button i.e. 'Start Real-time Transcription' button
        await g.clickElement('[data-qa=button-get-transcription]');
        // play sample audio file through mic, wait until finished to move onto next stage
        await virtualMic.playSample(testName,  false, sampleAudioFile);
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
        await g.takeScreenshot(`after_transcription_${testOutputPostfix}`);
        // get (and check) after-transcription provisioner state
        if (provisionerCtxt) {
            provisionerCtxt.nTranscribersAfter = await provisionerCtxt.p.getNumTranscribers("en", "realtime");
            expect (provisionerCtxt.nTranscribersAfter.idle === provisionerCtxt.nTranscribersBefore.idle && provisionerCtxt.nTranscribersAfter.busy === provisionerCtxt.nTranscribersBefore.busy, "");
        }
    }
  })
}


// tests to execute:
rtTest({language: "en", accuracy: "standard", separation: "none"}, "en_2spkrs_36s.mp3");
rtTest({language: "en", accuracy: "standard", separation: "speaker"}, "en_2spkrs_36s.mp3");
rtTest({language: "en", accuracy: "enhanced", separation: "none"}, "en_2spkrs_36s.mp3");
rtTest({language: "en", accuracy: "enhanced", separation: "speaker"}, "en_2spkrs_36s.mp3");



