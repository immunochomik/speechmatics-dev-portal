import { Flex } from '@chakra-ui/react';
import { DescriptionLabel, HeaderLabel, PageHeader, SmPanel } from '../components/common';
import Dashboard from '../components/dashboard';
import { SelectField } from '../components/transcribe-form';
import { accountStore } from '../utils/account-store-context';
import { trackEvent } from '../utils/analytics';
import { languagesData, separation, accuracyModels } from '../utils/transcribe-elements';

export default function RealTimeTranscription() {
  return (
    <Dashboard>
      <PageHeader headerLabel='Real-time Transcription' introduction='Check out our Real-time transcription.' />
      <SmPanel width='100%' maxWidth='var(--panel-max-width)'>
        <HeaderLabel>Configure Real-time Transcription Options</HeaderLabel>
        <DescriptionLabel>
          Choose the best features to suit your transcription requirements.
        </DescriptionLabel>
        <Flex width='100%' wrap='wrap' gap={6} pt={4}>
          <SelectField
            data-qa='select-transcribe-language'
            label='Language'
            tooltip='Select the language of your audio file‘s spoken content to get the best transcription accuracy'
            data={languagesData}
            onSelect={(val) => {
              trackEvent('language_select', 'Action', 'Changed the language', { value: val });
              // store.language = val;
            }}
            disabled={accountStore.accountState === 'unpaid'}
          />

          <SelectField
            data-qa='select-transcribe-separation'
            label='Separation'
            tooltip='Speaker - detects and labels individual speakers within a single audio channel. Channel - labels each audio channel and aggregates into a single transcription output.'
            data={separation}
            onSelect={(val) => {
              trackEvent('separation_select', 'Action', 'Changed the separation', { value: val });
              // store.separation = val as any;
            }}
            disabled={accountStore.accountState === 'unpaid'}
          />

          <SelectField
            data-qa='select-transcribe-accuracy'
            label='Accuracy'
            tooltip='Enhanced - highest transcription accuracy. Standard - faster transcription with high accuracy.'
            data={accuracyModels}
            onSelect={(val) => {
              trackEvent('accuracy_select', 'Action', 'Changed the Accuracy', { value: val });
              // store.accuracy = val as any;
            }}
            disabled={accountStore.accountState === 'unpaid'}
          />
        </Flex>
      </SmPanel>
    </Dashboard>
  );
}
