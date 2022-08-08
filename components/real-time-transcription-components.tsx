import { Box, BoxProps, Button, CloseButton, Flex, FlexProps, Grid, HStack, Menu, MenuButton, MenuItem, MenuList, Select, Spinner, StackProps, Switch, VStack } from '@chakra-ui/react';
import { SelectField, SliderField } from '../components/transcribe-form';
import { accountStore } from '../utils/account-store-context';
import { trackAction, trackEvent } from '../utils/analytics';
import { languagesData, separation, accuracyModels, LanguageShort, partialsData, Accuracy, Separation, languageDomains } from '../utils/transcribe-elements';
import { BiChevronDown, BiChevronRight, BiMicrophone } from 'react-icons/bi'
import { AiOutlineControl } from 'react-icons/ai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import realtimeStore, { LanguageDomain, MaxDelayMode } from '../utils/real-time-store-flow';
import { HeaderLabel, DescriptionLabel, Inline, ErrorBanner } from './common';
import { DownloadIcon } from './icons-library';
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { capitalizeFirstLetter, timeLeftFormat } from '../utils/string-utils';
import { timedoutUpdate } from '../utils/helper-utils';

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
            realtimeStore.configuration.seperation = val as Separation;

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
            realtimeStore.configuration.accuracy = val as Accuracy;
          }}
          disabled={isAccountStateUnpaid}
        />
      </Grid>

      <ToggleSection py={4} title='Advanced Transcription Options' openByDefault={false}>
        <Grid gridTemplateColumns='repeat(auto-fit, minmax(14em, 1fr))' width='100%' gap={6} alignItems='flex-end' pt={4}>
          <SelectField
            data-qa='select-partials'
            label='Partials'
            tooltip='Tooltip description missing.'
            data={partialsData}
            onSelect={(val) => {
              trackEvent('partials_enable_select_rt', 'Action', null, { value: val });
              realtimeStore.configuration.partialsEnabled = Boolean(val);
            }}
            disabled={isAccountStateUnpaid}
          />
          <SelectField
            data-qa='select-transcribe-accuracy'
            label='Max Delay Mode'
            tooltip='Tooltip description missing.'
            data={accuracyModels}
            onSelect={(val) => {
              trackEvent('max_delay_mode_select_rt', 'Action', null, { value: val });
              realtimeStore.configuration.maxDelayMode = val as MaxDelayMode;
            }}
            disabled={isAccountStateUnpaid}
          />

          <SliderField label='Max Delay'
            tooltip='Tooltip description missing.'
            onChange={(value: number) => {
              realtimeStore.configuration.maxDelay = value;
            }}
            defaultValue={5}
            min={2}
            max={10}
            step={0.1}
            valueFieldFormatter={(v) => `${v.toFixed(1)}s`}
          />

          <SelectField
            data-qa='select-transcribe-accuracy'
            label='Entities'
            tooltip='Tooltip description missing.'
            data={accuracyModels}
            onSelect={(val) => {
              trackEvent('entities_enable_select_rt', 'Action', null, { value: val });
              realtimeStore.configuration.entitiesEnabled = Boolean(val);
            }}
            disabled={isAccountStateUnpaid}
          />

          <SelectField
            data-qa='select-transcribe-accuracy'
            label='Domain Language Pack'
            tooltip='Tooltip description missing.'
            data={languageDomains}
            onSelect={(val) => {
              trackEvent('language_domain_select_rt', 'Action', null, { value: val });
              realtimeStore.configuration.languageDomain = val as LanguageDomain;
            }}
            disabled={isAccountStateUnpaid}
          />
        </Grid>
      </ToggleSection>

    </VStack>
  </>
}

export const AudioInputSection = ({ onChange, defaultValue }) => {

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>();

  useEffect(() => {
    realtimeStore.audioHandler.getAudioInputs().then(setAudioDevices)
  }, []);

  return <><HeaderLabel pt={4}>Select the device</HeaderLabel>
    <DescriptionLabel>
      Choose the input device you’ll use for Real-time Transcription.
    </DescriptionLabel>
    <Select width='15.5em'
      borderColor='smBlack.200'
      color='smBlack.300'
      // data-qa={dataQa}
      defaultValue={defaultValue}
      // disabled={disabled}
      borderRadius='2px'
      size='lg'
      onChange={(event) => { onChange(event.target.value) }}>
      {audioDevices?.map(({ deviceId, label }) => (
        <option key={deviceId} value={deviceId}>
          {label}
        </option>
      ))}
    </Select>
  </>
}

export const StartTranscriptionButton = ({ onClick, ...props }) => (
  <Box width='100%' pt={8} {...props}>
    <Button
      data-qa='button-get-transcription'
      variant='speechmatics'
      fontSize='18'
      width='100%'
      onClick={() => {
        trackEvent('rt_start_transcripion_click');
        onClick()
      }}
    >
      Start Real-time Transcription
    </Button>
  </Box>
)

export const StartOverButton = ({ onClick, ...props }) => (
  <Box width='100%' pt={8} {...props}>
    <Button
      data-qa='button-get-transcription'
      variant='speechmatics'
      fontSize='18'
      width='100%'
      onClick={() => {
        trackAction('rt_start_over_transcripion_click');
        onClick()
      }}
    >
      Configure new Real-time Transcription Session
    </Button>
  </Box>
)

export const TranscriptionErrors = ({ }) => {
  return <>{(realtimeStore.errors.length > 0) &&
    <ErrorBanner text="Couldn't connect to the Real-time service. Please try again later." />}</>
}

type TranscriptionViewProps = { disabled: boolean } & StackProps;

export const TranscriptionView = ({ disabled, ...props }: TranscriptionViewProps) => {

  return <VStack width='100%' {...props}>
    <Flex width='100%' justifyContent='space-between'>
      <Box flex='1'></Box>
      <TimeLeftStatus flex='1' justifyContent='center' />
      {!disabled && <AudioInputIndicator flex='1' justifyContent='flex-end' />}
    </Flex>
    <TranscriptionDisplay />
    <Flex width='100%' justifyContent='space-between' pt={2}>
      <TranscriptDisplayOptions mt={2} disabled={disabled} />
      <Flex gap={2}>
        <ShortCopyButton disabled={disabled} onClick={realtimeStore.transcription.onCopyCallback} />
        <ShortDownloadMenu disabled={disabled} />
      </Flex>
    </Flex>
  </VStack>
}


export const TranscriptionSessionConfig = ({ ...props }) => {
  return <Box pt='2em' width='100%' {...props}>
    <DescriptionLabel>
      You can change the following transcription options during the Real-time transcription session:
    </DescriptionLabel>
    <Grid gridTemplateColumns='repeat(auto-fit, minmax(13em, 1fr))' width='100%'
      gap={6} alignItems='flex-end' pt={4}>
      <SelectField
        data-qa='select-transcribe-accuracy'
        label='Partials'
        tooltip='Tooltip description missing.'
        data={accuracyModels}
        onSelect={(val) => {
          trackAction('partials_live_update', { value: val });
          realtimeStore.socketHandler.updateLiveConfig({ enablePartials: val })
        }}
      />

      <SelectField
        data-qa='select-transcribe-accuracy'
        label='Max Delay Mode'
        tooltip='Tooltip description missing.'
        data={accuracyModels}
        onSelect={(val) => {
          trackAction('max_delay_mode_live_update', { value: val });
          realtimeStore.socketHandler.updateLiveConfig({ maxDelayMode: val })

        }}
      />

      <SliderField label='Max Delay'
        tooltip='Tooltip description missing.'
        onChange={(val) => {
          timedoutUpdate(() => realtimeStore.socketHandler.updateLiveConfig({ maxDelay: val }));
          trackAction('max_delay_live_update', { value: val });

        }}
        defaultValue={5}
        min={2}
        max={10}
        step={0.1}
        valueFieldFormatter={(v: number) => `${v.toFixed(1)}s`}
      />

    </Grid>
  </Box>
}

export const StopTranscriptionButton = ({ onClick, disabled, hasSpinner, ...props }) => {
  return <Box width='100%' pt={8} {...props}>
    <Button
      data-qa='button-get-transcription'
      variant='speechmatics'
      bgColor='smRed.600'
      _hover={{ bgColor: 'smRed.500', _disabled: { bgColor: 'smRedGray.400' } }}
      _disabled={{ bgColor: 'smRedGray.500' }}
      fontSize='18'
      width='100%'
      onClick={() => {
        trackEvent('rt_stop_transcripion_click', 'Action', 'Stopped transcription');
        onClick()
      }}
      disabled={disabled}>
      Stop Real-time Transcription{hasSpinner && <Spinner size='sm' ml={3} />}
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

export const TimeLeftStatus = observer(({ ...boxProps }: FlexProps) => {

  const { stage, timeLeft } = realtimeStore;

  return <Flex color='smBlack.300' {...boxProps}>
    {stage == 'starting' && <Inline>Connecting...</Inline>}
    {stage == 'running' && <Inline>Demo time remaining: {timeLeftFormat(timeLeft)}</Inline>}
    {stage == 'stopped' && <Inline>Session ended</Inline>}
  </Flex>
})

export const AudioInputIndicator = observer(({ ...boxProps }: BoxProps) => {
  return <Flex {...boxProps} color='smBlack.150' alignItems='flex-end'>
    <Box fontSize='0.8em'>{realtimeStore.audioHandler.getAudioInputName()}</Box>
    <Box mt='2px' ml='2px'><BiMicrophone size='20px' /></Box>
  </Flex>
});

export const TranscriptionDisplay = observer(({ }) => {

  const box = useRef<HTMLDivElement>();

  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {

    if (autoScroll) box.current.scrollTo({ behavior: 'smooth', top: box.current.scrollHeight });

  }, [box.current, realtimeStore.transcription.html, realtimeStore.transcription.partialTranscript]);

  if (box.current) {
    if ((box.current.scrollHeight - box.current.offsetHeight - box.current.scrollTop) < 40) {
      if (!autoScroll) setAutoScroll(true)
    }
    else {
      if (autoScroll) setAutoScroll(false)
    }
  }

  return <Box
    width='100%'
    bgColor='smBlack.80'
    border='1px solid'
    borderColor='smBlack.150'
    p={4}
  >
    <Box width='100%' height='300px' overflow='auto'
      fontFamily='Matter-Light' className='scrollBarStyle'
      fontSize='1.2em' ref={box}>
      <Inline>{realtimeStore.transcription.html}</Inline>
      <Inline color='smGreen.500'> {realtimeStore.transcription.partialTranscript}</Inline>
    </Box>
  </Box>
});

type TranscriptDisplayOptionsProps = { disabled: boolean } & FlexProps;

export const TranscriptDisplayOptions = ({ disabled, ...flexProps }: TranscriptDisplayOptionsProps) => {
  return <Flex color='smBlack.300' {...flexProps}
    _hover={{ color: 'smBlack.400' }}
    cursor='pointer'>
    <Box mt='5px' mr='7px'><AiOutlineControl /></Box>
    <Box>Show transcript options</Box>
  </Flex>
}

export const ShortDownloadMenu = ({ disabled }) => (
  <Menu>
    <MenuButton as={Button} height='2.5em' borderRadius='sm' px='1.5em' disabled={disabled}
      bgColor='smGreen.500' _hover={{ bgColor: 'smGreen.400' }}>
      <DownloadIcon />
    </MenuButton>
    <MenuList>
      <MenuItem onClick={realtimeStore.transcription.onDownloadAsText}>Download as txt</MenuItem>
      <MenuItem onClick={realtimeStore.transcription.onDownloadAsJson}>Download as JSON</MenuItem>
      <MenuItem onClick={realtimeStore.configuration.onDownloadConfig}>Download configuration</MenuItem>
    </MenuList>
  </Menu>
)


export const ShortCopyButton = ({ disabled, onClick }) => {
  return <Button height='2.5em' borderRadius='sm' disabled={disabled} onClick={onClick}
    bgColor='smBlue.500' _hover={{ bgColor: 'smBlue.400' }} px='1.5em'>
    <CopyIcon color='#fff' />
  </Button>
}

export const RtDisplayOptions = observer(({ }) => {

  return <Box width='360px' border='1px solid' borderColor='smBlack.150' bgColor='smBlack.100' height='400px' p={4}>
    <Flex width='100%' justifyContent='space-between' alignItems='center'>
      <Box fontSize='lg' pl={2} color='smBlack.400'>Transcript display options</Box>
      <CloseButton size='lg' color='smBlack.300' _hover={{ color: 'smBlack.500' }} />
    </Flex>

    <VStack overflow='auto' className='scrollBarStyle' height='330px' pt={4} px={2}>
      <OptionWithDescription descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
        optionTitle='Show Confidence Scores' onChange={() => { }} value={false} />

      <OptionWithDescription descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
        optionTitle='Show Profanities' onChange={() => { }} value={false} />

      <OptionWithDescription descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
        optionTitle='Show Disfluencies' onChange={() => { }} value={false} />

      <OptionWithDescription descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
        optionTitle='Show Custom Dictionary Entries' onChange={() => { }} value={false} />

      <DropdownWithDescription
        descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
        optionTitle='Entities' onChange={() => { }} values={['written', 'spoken']} selectedValue='written' />
    </VStack>
  </Box>
})

const OptionWithDescription = ({ descr, optionTitle, onChange, value }) => {

  return <Box pt={4}>
    <Box color='smBlack.300'>{descr}</Box>
    <Flex pt={2} alignItems='center' gap={3}>
      <Box color='smGreen.500'>{optionTitle}</Box>
      <Switch colorScheme='smGreen' _focus={{ boxShadow: 'none' }} value={value} onChange={onChange} />
    </Flex>
  </Box>
}


const DropdownWithDescription = ({ descr, optionTitle, onChange, values, selectedValue }) => {

  const [currentLabel, setCurrentLabel] = useState<string>(selectedValue)


  return <Box pt={4}>
    <Box color='smBlack.300'>{descr}</Box>
    <Flex pt={2} alignItems='center' gap={3}>
      <Box color='smGreen.500'>{optionTitle}</Box>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}
          color='smBlack.300' bgColor='smWhite.500'
          border='1px solid' borderColor='smBlack.150'
          _active={{ bgColor: 'smBlack.100' }}
          _hover={{ bgColor: 'smBlack.100' }}
          borderRadius='sm' fontFamily='RMNeue-Light'>{capitalizeFirstLetter(currentLabel)}</MenuButton>
        <MenuList>
          {values.map(el => <MenuItem fontFamily='RMNeue-Light' key={el}
            onClick={() => (onChange(el), setCurrentLabel(el))}>
            {capitalizeFirstLetter(el)}
          </MenuItem>)}
        </MenuList>
      </Menu>
    </Flex>
  </Box>
}