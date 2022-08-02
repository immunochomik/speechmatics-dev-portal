import { observer } from 'mobx-react-lite';
import { useCallback, useEffect } from 'react';
import { PageHeader, SmPanel, } from '../components/common';
import Dashboard from '../components/dashboard';
import {
  AudioInputSection, RealtimeForm, StartTranscriptionButton,
  StopTranscriptionButton, TranscriptionErrors,
  TranscriptionSessionConfig, TranscriptionView
} from '../components/real-time-transcription-components';
import realtimeStore from '../utils/real-time-store-flow';

export default observer(function RealTimeTranscription({ }) {

  const onStartClick = useCallback(() => {
    realtimeStore.startTranscription();
  }, []);

  const onStopClick = useCallback(() => {
    realtimeStore.stopTranscription();
  }, []);

  useEffect(() => {
    realtimeStore.reset();
  }, [])

  return (
    <Dashboard>
      <PageHeader headerLabel='Real-time Transcription' introduction='Check out our Real-time transcription.' />
      <SmPanel width='100%' maxWidth='var(--panel-max-width)'>

        {realtimeStore.stage == 'form' && <>
          <RealtimeForm />

          <AudioInputSection />

          <StartTranscriptionButton onClick={onStartClick} />
        </>}

        {realtimeStore.inTranscriptionStage && <>

          <TranscriptionErrors />

          <TranscriptionView />

          <TranscriptionSessionConfig />

          <StopTranscriptionButton onClick={onStopClick} />

        </>}

      </SmPanel>
    </Dashboard>
  );
})


