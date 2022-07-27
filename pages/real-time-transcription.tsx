import { DescriptionLabel, HeaderLabel, PageHeader, SmPanel } from '../components/common';
import Dashboard from '../components/dashboard';
import { RealtimeForm } from '../components/real-time-transcription-components';

export default function RealTimeTranscription({ }) {
  return (
    <Dashboard>
      <PageHeader headerLabel='Real-time Transcription' introduction='Check out our Real-time transcription.' />
      <SmPanel width='100%' maxWidth='var(--panel-max-width)'>
        <HeaderLabel>Configure Real-time Transcription Options</HeaderLabel>
        <DescriptionLabel>
          Choose the best features to suit your transcription requirements.
        </DescriptionLabel>
        <RealtimeForm />


      </SmPanel>
    </Dashboard>
  );
}
