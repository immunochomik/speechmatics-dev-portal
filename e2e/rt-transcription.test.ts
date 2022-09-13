/***
 * This file implements the Playwright test function used to test
 * realtime transcription functionality on SaaS (RT Demo).
 *
 * Expect this test to fail locally, because it requires the tooling and virtual speaker+microphone interfaces
 * created by the '_init-container.sh' script during Docker container startup (before any tests are run).
 *
 ***/
import { test, expect } from '@playwright/test';
import testCfg from './test-configs';
import newRuntimeProvisioner, { RuntimeProvisioner } from './helpers/runtime-provisioner';
import virtualMic from './helpers/virtual-mic';
import generics from './helpers/generics';
import {
  TranscriptionAccuracy,
  TranscriptionLanguage,
  TranscriptionSeparation
} from './helpers/types';

interface TranscribeOptions {
  language: TranscriptionLanguage;
  accuracy: TranscriptionAccuracy;
  separation: TranscriptionSeparation;
}

interface RuntimeProvisionerContext {
  p?: RuntimeProvisioner;
  nTranscribersBefore?: { idle: number; busy: number };
  nTranscribersDuring?: { idle: number; busy: number };
  nTranscribersAfter?: { idle: number; busy: number };
}

function realtimeTranscriptionTest(options: TranscribeOptions, sampleAudioFile: string) {
  const testName = `RT Transcription Test: ( Lang: '${options.language}', Acc: '${options.accuracy}', Sep: '${options.separation}' )`;
  const testOutputPostfix = `${options.language}_${options.accuracy}_${options.separation}`;
  // the test routine:
  test(testName, async ({ page }) => {
    // create interface to RT Provisioner API, if required.
    let provisionerCtxt: RuntimeProvisionerContext | undefined = testCfg.transcriptionTests
      .checkTranscriberState
      ? {
          p: undefined,
          nTranscribersBefore: undefined,
          nTranscribersDuring: undefined,
          nTranscribersAfter: undefined
        }
      : undefined;
    if (provisionerCtxt) {
      provisionerCtxt.p = newRuntimeProvisioner();
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
        provisionerCtxt.nTranscribersBefore = await provisionerCtxt.p.getNumTranscribers(
          options.language,
          'realtime'
        );
      }
      // take a before screenshot
      await g.takeScreenshot(`${testOutputPostfix}_before_transcription`);
      // press the start button i.e. 'Start Real-time Transcription' button
      await g.clickElement('[data-qa=button-get-transcription]', 3000);
      // set timeout to check transcriber state while it is busy
      setTimeout(async () => {
        if (provisionerCtxt) {
          provisionerCtxt.nTranscribersDuring = await provisionerCtxt.p.getNumTranscribers(
            options.language,
            'realtime'
          );
          expect(provisionerCtxt.nTranscribersDuring.idle).toBe(
            provisionerCtxt.nTranscribersBefore.idle - 1
          );
          expect(provisionerCtxt.nTranscribersDuring.busy).toBe(
            provisionerCtxt.nTranscribersBefore.busy + 1
          );
        }
      }, 1000);
      // play sample audio file through mic, wait until finished to move onto next stage
      await virtualMic.playSample(testName, false, sampleAudioFile);
    }

    // Stop transcription.
    {
      // press the stop button i.e. 'Stop Real-time Transcription' button
      await g.clickElement('[data-qa=button-get-transcription]', 3000);
      // take an after screenshot
      await g.takeScreenshot(`${testOutputPostfix}_after_transcription`);
      // get (and check) after-transcription provisioner state
      if (provisionerCtxt) {
        provisionerCtxt.nTranscribersAfter = await provisionerCtxt.p.getNumTranscribers(
          options.language,
          'realtime'
        );
        expect(provisionerCtxt.nTranscribersAfter.idle).toBe(
          provisionerCtxt.nTranscribersBefore.idle
        );
        expect(provisionerCtxt.nTranscribersAfter.busy).toBe(
          provisionerCtxt.nTranscribersBefore.busy
        );
      }
      // make sure transcription output area actually has some text (crude way)
      const transcriptionOutputWords = (
        await page.locator('.showing-entities-written').allTextContents()
      )
        .join(' ') // join all entries to a single string
        .split(' ') // split string to array of words
        .filter((el) => el.length > 0); // filter out empty entries i.e. ''
      expect(transcriptionOutputWords.length).toBeGreaterThan(0);
    }
  });
}

// tests to execute:
realtimeTranscriptionTest(
  { language: 'en', accuracy: 'standard', separation: 'none' },
  'en_2spkrs_36s.mp3'
);
realtimeTranscriptionTest(
  { language: 'en', accuracy: 'standard', separation: 'speaker' },
  'en_2spkrs_36s.mp3'
);
realtimeTranscriptionTest(
  { language: 'en', accuracy: 'enhanced', separation: 'none' },
  'en_2spkrs_36s.mp3'
);
realtimeTranscriptionTest(
  { language: 'en', accuracy: 'enhanced', separation: 'speaker' },
  'en_2spkrs_36s.mp3'
);
