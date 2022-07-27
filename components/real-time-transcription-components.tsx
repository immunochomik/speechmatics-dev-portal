import { Box, Flex, Grid, HStack, VStack } from '@chakra-ui/react';
import { SelectField, SliderField } from '../components/transcribe-form';
import { accountStore } from '../utils/account-store-context';
import { trackEvent } from '../utils/analytics';
import { languagesData, separation, accuracyModels } from '../utils/transcribe-elements';
import { BiChevronDown, BiChevronRight } from 'react-icons/bi'
import { useCallback, useState } from 'react';

export const RealtimeForm = ({ }) => {

  const isAccountStateUnpaid = accountStore.accountState === 'unpaid';


  return <VStack width='100%'>
    <Grid gridTemplateColumns='repeat(auto-fit, minmax(14em, 1fr))' width='100%' gap={6} alignItems='flex-end' pt={4}>
      <SelectField
        data-qa='select-transcribe-language'
        label='Language'
        tooltip='Select the language of your audio file‘s spoken content to get the best transcription accuracy'
        data={languagesData}
        onSelect={(val) => {
          trackEvent('language_select_rt', 'Action', 'Changed the language', { value: val });
          // store.language = val;
        }}
        disabled={isAccountStateUnpaid}
      />

      <SelectField
        data-qa='select-transcribe-separation'
        label='Separation'
        tooltip='Speaker - detects and labels individual speakers within a single audio channel. Channel - labels each audio channel and aggregates into a single transcription output.'
        data={separation}
        onSelect={(val) => {
          trackEvent('separation_select_rt', 'Action', 'Changed the separation', { value: val });
          // store.separation = val as any;
        }}
        disabled={isAccountStateUnpaid}
      />

      <SelectField
        data-qa='select-transcribe-accuracy'
        label='Accuracy'
        tooltip='Enhanced - highest transcription accuracy. Standard - faster transcription with high accuracy.'
        data={accuracyModels}
        onSelect={(val) => {
          trackEvent('accuracy_select_rt', 'Action', 'Changed the Accuracy', { value: val });
          // store.accuracy = val as any;
        }}
        disabled={isAccountStateUnpaid}
      />
    </Grid>

    <ToggleSection py={4} title='Advanced Transcription Options' openByDefault>
      <Grid gridTemplateColumns='repeat(auto-fit, minmax(14em, 1fr))' width='100%' gap={6} alignItems='flex-end' pt={4}>
        <SelectField
          data-qa='select-transcribe-accuracy'
          label='Partials'
          tooltip='Tooltip description missing.'
          data={accuracyModels}
          onSelect={(val) => {
            trackEvent('accuracy_select_rt', 'Action', 'Changed the Accuracy', { value: val });
            // store.accuracy = val as any;
          }}
          disabled={isAccountStateUnpaid}
        />
        <SelectField
          data-qa='select-transcribe-accuracy'
          label='Max Delay Mode'
          tooltip='Tooltip description missing.'
          data={accuracyModels}
          onSelect={(val) => {
            trackEvent('accuracy_select_rt', 'Action', 'Changed the Accuracy', { value: val });
            // store.accuracy = val as any;
          }}
          disabled={isAccountStateUnpaid}
        />

        <SliderField label='Max Delay' tooltip='Tooltip description missing.' />

        <SelectField
          data-qa='select-transcribe-accuracy'
          label='Entities'
          tooltip='Tooltip description missing.'
          data={accuracyModels}
          onSelect={(val) => {
            trackEvent('accuracy_select_rt', 'Action', 'Changed the Accuracy', { value: val });
            // store.accuracy = val as any;
          }}
          disabled={isAccountStateUnpaid}
        />

        <SelectField
          data-qa='select-transcribe-accuracy'
          label='Language Domain'
          tooltip='Tooltip description missing.'
          data={accuracyModels}
          onSelect={(val) => {
            trackEvent('accuracy_select_rt', 'Action', 'Changed the Accuracy', { value: val });
            // store.accuracy = val as any;
          }}
          disabled={isAccountStateUnpaid}
        />
      </Grid>
    </ToggleSection>


  </VStack>

}

const ToggleSection = ({ toggleCallback = null, openByDefault = false, title, children, ...boxProps }) => {

  const [open, setOpen] = useState(openByDefault);

  const toggle = useCallback(() => setOpen(open => (toggleCallback?.(!open), !open)), []);

  return <VStack width='100%' {...boxProps}>
    <Flex width='100%' alignItems='center' gap={3}>
      <Box height='1px' flex='1' bgColor='var(--chakra-colors-smBlack-150)'></Box>
      <Flex flex='0' whiteSpace='nowrap' alignItems='center' gap={1} color='smBlue.400' onClick={toggle} cursor='pointer'>
        {open ? <BiChevronDown /> : <BiChevronRight />}
        <Box>{title}</Box>
      </Flex>
      <Box height='1px' flex='1' bgColor='var(--chakra-colors-smBlack-150)'></Box>
    </Flex>
    {open && children}
  </VStack>
}