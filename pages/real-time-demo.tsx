import { Box, useDisclosure } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { PageHeader, SmPanel, GetInTouchCalendlyBox } from '../components/common';
import Dashboard from '../components/dashboard';
import { TalkBubblesIcon } from '../components/icons-library';
import {
  AudioInputSection,
  RealtimeForm,
  StartOverButton,
  StartTranscriptionButton,
  StopTranscriptionButton,
  TranscriptionErrors,
  TranscriptionSessionConfig,
  TranscriptionView,
  PermissionsModal
} from '../components/real-time-components';
import rtFlow from '../utils/real-time-utils/real-time-flow';
import { accountStore } from '../utils/account-store-context';

export default observer(function RealTimeTranscription({}) {
  useEffect(() => {
    rtFlow.reset();
    return () => {
      rtFlow.cleanUp();
    };
  }, []);

  return (
    <Dashboard>
      <PageHeader
        headerLabel='Real-Time Transcription Demo'
        introduction='Check Out our Real-Time Transcription Demo.'
      />
      <SmPanel width='100%' maxWidth='var(--panel-max-width)'>
        {rtFlow.inStages('form', 'starting', 'error') && (
          <>
            <RealtimeForm disabled={rtFlow.inStages('starting')} />
            <AudioInputSection
              onChange={rtFlow.audioDeviceSelected}
              defaultValue={rtFlow.audioHandler.audioDeviceId}
              disabled={rtFlow.inStages('starting')}
            />

            <TranscriptionErrors />

            <StartTranscriptionButton
              onClick={rtFlow.startTranscription}
              intermediateState={rtFlow.inStages('starting')}
            />
          </>
        )}

        {rtFlow.inStages('running', 'stopping', 'stopped') && (
          <>
            {rtFlow.errors.length == 0 && (
              <TranscriptionView className='fadeIn' disabled={rtFlow.inStages('error')} />
            )}
            {rtFlow.inStages('stopping', 'running') && (
              <StopTranscriptionButton
                onClick={rtFlow.stopTranscription}
                intermediateState={rtFlow.inStages('stopping')}
                className='fadeIn'
              />
            )}
            {rtFlow.inStages('running') && process.env.RT_ADVANCED_FEATURES && (
              <TranscriptionSessionConfig className='fadeIn' />
            )}
            {rtFlow.inStages('stopped', 'error') && (
              <StartOverButton onClick={(e) => rtFlow.startOver(false)} className='fadeIn' />
            )}
          </>
        )}
        <PermissionsModal
          title='Allow Speechmatics to Use Your Microphone'
          text='Speechmatics needs to access your microphone so you can transcribe your voice.'
          flowProp='showPermissionsModal'
        />
        <PermissionsModal
          title='Your Microphone is Blocked'
          text='Speechmatics needs to access your microphone so you can transcribe your voice. Click the microphone blocked icon in your browser’s address bar to update your browser settings.'
          flowProp='permissionsBlocked'
        />
        <Box pt={4} width='100%'>
          <GetInTouchCalendlyBox
            icon={<TalkBubblesIcon width='3em' height='3em' />}
            title='Ready to Use Real-Time?'
            ctaText='Request Access to the Speechmatics Real-Time SaaS.'
            url={process.env.CALENDLY_REALTIME_FORM_URL}
            utm={{
              utm_contract_id: accountStore.getContractId(),
              utm_source: 'direct',
              utm_medium: 'portal',
              utm_content: 'rtdemo-banner-realtimesaas'
            }}
            buttonLabel='Request Access'
          />
        </Box>
      </SmPanel>
    </Dashboard>
  );
});
