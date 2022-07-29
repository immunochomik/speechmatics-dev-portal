import { Box, BoxProps, Button, Flex, FlexProps, Grid, HStack, Select, VStack } from '@chakra-ui/react';
import { SelectField, SliderField } from '../components/transcribe-form';
import { accountStore } from '../utils/account-store-context';
import { trackEvent } from '../utils/analytics';
import { languagesData, separation, accuracyModels, LanguageShort } from '../utils/transcribe-elements';
import { BiChevronDown, BiChevronRight, BiMicrophone } from 'react-icons/bi'
import { useCallback, useState } from 'react';
import realtimeStore from '../utils/real-time-store';
import { HeaderLabel, DescriptionLabel, Inline } from './common';

export const RealtimeForm = ({ }) => {

  const isAccountStateUnpaid = accountStore.accountState === 'unpaid';


  return <>
    <HeaderLabel>Configure Real-time Transcription Options</HeaderLabel>
    <DescriptionLabel>
      Choose the best features to suit your transcription requirements.
    </DescriptionLabel><VStack width='100%'>
      <Grid gridTemplateColumns='repeat(auto-fit, minmax(14em, 1fr))' width='100%' gap={6} alignItems='flex-end' pt={4}>
        <SelectField
          data-qa='select-transcribe-language'
          label='Language'
          tooltip='Select the language of your audio file‘s spoken content to get the best transcription accuracy'
          data={languagesData}
          onSelect={(val: LanguageShort) => {
            trackEvent('language_select_rt', 'Action', 'Changed the language', { value: val });
            realtimeStore.configuration.language = val;
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
            realtimeStore.configuration.seperation = val;

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
            realtimeStore.configuration.accuracy = val;
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

          <SliderField label='Max Delay'
            tooltip='Tooltip description missing.'
            onChange={() => { }}
            defaultValue={5}
            min={2}
            max={10}
            step={0.1}
            valueFieldFormatter={(v: number) => `${v.toFixed(1)}s`}
          />

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
  </>
}

export const AudioInputSection = ({ }) => {

  return <><HeaderLabel pt={4}>Select the device</HeaderLabel>
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
  </>
}

export const StartTranscriptionButton = ({ onClick }) => (
  <Box width='100%' pt={8}>
    <Button
      data-qa='button-get-transcription'
      variant='speechmatics'
      fontSize='18'
      width='100%'
      onClick={() => {
        trackEvent('rt_start_transcripion_click', 'Action', 'Started transcription');
        onClick()
      }}
      disabled={false
        // !store._file || !auth.isLoggedIn || accountStore.accountState === 'unpaid'
      }>
      Start Real-time Transcription
    </Button>
  </Box>
)

export const TranscriptionErrors = ({ }) => {
  return <></>
}


export const TranscriptionView = ({ }) => {
  return <VStack width='100%'>
    <Flex width='100%' justifyContent='space-between'>
      <Box flex='1'></Box>
      <TimeLeft flex='1' justifyContent='center' />
      <AudioInputIndicator flex='1' justifyContent='flex-end' />
    </Flex>
    <TranscriptionDisplay />
    <Flex>
      <TranscriptDisplayOptions />
      <Flex>
        <ShortCopyButton />
        <ShortDownloadMenu />
      </Flex>
    </Flex>
  </VStack>
}


export const TranscriptionSessionConfig = ({ }) => {
  return <></>
}

export const StopTranscriptionButton = ({ onClick }) => {
  return <Box width='100%' pt={8}>
    <Button
      data-qa='button-get-transcription'
      variant='speechmatics'
      bgColor='smRed.500'
      fontSize='18'
      width='100%'
      onClick={() => {
        trackEvent('rt_stop_transcripion_click', 'Action', 'Stopped transcription');
        onClick()
      }}
      disabled={false
        // !store._file || !auth.isLoggedIn || accountStore.accountState === 'unpaid'
      }>
      Stop Real-time Transcription
    </Button>
  </Box>
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

export const TimeLeft = ({ ...boxProps }: FlexProps) => {
  return <Flex color='smBlack.300' {...boxProps}>3m 34s left</Flex>
}

export const AudioInputIndicator = ({ ...boxProps }: BoxProps) => {
  return <Flex {...boxProps} color='smBlack.200'>
    <Box >Input USB Microphone 1</Box>
    <Box mt='2px' ml='2px'><BiMicrophone size='20px' /></Box>
  </Flex>
}

export const TranscriptionDisplay = ({ }) => {
  return <Box
    width='100%'
    height='300px'
    bgColor='smBlack.80'
    border='1px solid'
    borderColor='smBlack.150'
    p={4}
  >
    <Box width='100%' height='100%'
      fontFamily='Matter-Light'
      fontSize='1.2em'>
      <Inline>transcript transcript</Inline>
      <Inline color='smGreen.500'> partial</Inline>
    </Box>
  </Box>
}

export const TranscriptDisplayOptions = ({ }) => {
  return <></>
}

export const ShortCopyButton = ({ }) => {
  return <></>
}

export const ShortDownloadMenu = ({ }) => {
  return <></>
}