import { Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { PageHeader, SmPanel, } from '../components/common';
import Dashboard from '../components/dashboard';
import { MenuGettingStartedIcon, TalkBubblesIcon } from '../components/icons-library';
import {
  AudioInputSection, RealtimeForm, StartOverButton, StartTranscriptionButton,
  StopTranscriptionButton, TranscriptionErrors,
  TranscriptionSessionConfig, TranscriptionView
} from '../components/real-time-transcription-components';
import { GetInTouchBox } from '../components/usage-elements';
import rtFlow from '../utils/real-time-utils/real-time-store-flow';

export default observer(function RealTimeTranscription({ }) {

  useEffect(() => {
    rtFlow.reset();
    return () => { rtFlow.cleanUp() };
  }, [])

  return (
    <Dashboard>
      <PageHeader headerLabel='Real-time Transcription' introduction='Check out our Real-time transcription.' />
      <SmPanel width='100%' maxWidth='var(--panel-max-width)'>

        {rtFlow.stage == 'form' && <>
          <RealtimeForm />

          <AudioInputSection onChange={rtFlow.audioDeviceSelected} defaultValue={rtFlow.audioHandler.audioDeviceId} />

          <StartTranscriptionButton onClick={rtFlow.startTranscription} />
        </>}

        {rtFlow.inTranscriptionStage && <>

          <TranscriptionErrors />

          {rtFlow.errors.length == 0 &&
            <TranscriptionView className='fadeIn' disabled={rtFlow.inStages('error')} />}

          {rtFlow.inStages('stopping', 'running') &&
            <StopTranscriptionButton
              onClick={rtFlow.stopTranscription} disabled={rtFlow.inStages('stopping')}
              hasSpinner={rtFlow.inStages('stopping')} className='fadeIn' />}

          {rtFlow.inStages('running') && process.env.RT_ADVANCED_FEATURES &&
            <TranscriptionSessionConfig className='fadeIn' />}

          {rtFlow.inStages('stopped', 'error') && <StartOverButton onClick={rtFlow.startOver} className='fadeIn' />}


        </>}

        <Box pt={4} width='100%'>
          <GetInTouchBox
            icon={<TalkBubblesIcon width='3em' height='3em' />}
            title='Ready to integrate?'
            ctaText='Contact our Sales Team for details.'
            hrefLink='https://page.speechmatics.com/speak-to-sales.html'
            buttonLabel='Get in touch'
          />
        </Box>

      </SmPanel>
    </Dashboard >
  );
})


