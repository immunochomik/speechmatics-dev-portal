import { DescriptionLabel, HeaderLabel, PageHeader, SmPanel } from '../components/common';
import Dashboard from '../components/dashboard';

export default function RealTimeTranscription() {
  return (
    <Dashboard>
      <PageHeader headerLabel='Real-time Transcription' introduction='Check out our Real-time transcription.' />
      <SmPanel width='100%' maxWidth='900px'>
        <HeaderLabel>Configure Real-time Transcription Options</HeaderLabel>
        <DescriptionLabel>
          Choose the best features to suit your transcription requirements.
        </DescriptionLabel>
      </SmPanel>
    </Dashboard>
  );
}
