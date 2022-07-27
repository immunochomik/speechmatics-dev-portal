import { Box, Button, Select } from '@chakra-ui/react';
import { flow } from 'mobx';
import { DescriptionLabel, HeaderLabel, PageHeader, SmPanel, } from '../components/common';
import Dashboard from '../components/dashboard';
import { RealtimeForm } from '../components/real-time-transcription-components';
import { SelectField } from '../components/transcribe-form';
import { accountStore } from '../utils/account-store-context';
import { trackEvent } from '../utils/analytics';
import { accuracyModels } from '../utils/transcribe-elements';

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

        <HeaderLabel pt={4}>Select the device</HeaderLabel>
        <DescriptionLabel>
          Choose the input device you’ll use for Real-time Transcription.
        </DescriptionLabel>
        <Select width='15.5em'
          borderColor='smBlack.200'
          color='smBlack.300'
          // data-qa={dataQa}
          // defaultValue={}
          // disabled={disabled}
          borderRadius='2px'
          size='lg'
          onChange={(event) => { }}>
          {[{ value: 1, label: 'Default Microphone' }].map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Box width='100%' pt={8}>
          <Button
            data-qa='button-get-transcription'
            variant='speechmatics'
            fontSize='18'
            width='100%'
            onClick={() => {
              // trackEvent('get_transcripion_click', 'Action', 'Submitted transcription');
            }}
            disabled={false
              // !store._file || !auth.isLoggedIn || accountStore.accountState === 'unpaid'
            }>
            Start Real-time Transcription
          </Button>
        </Box>
      </SmPanel>
    </Dashboard>
  );
}
