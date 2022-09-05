import {
  Box,
  BoxProps,
  Button,
  CloseButton,
  Flex,
  FlexProps,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Select,
  Spinner,
  StackProps,
  Switch,
  useOutsideClick,
  VStack,
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalOverlay,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { SelectField, SliderField } from './transcribe-form';
import { accountStore } from '../utils/account-store-context';
import { trackAction } from '../utils/analytics';
import {
  languagesData,
  separation,
  accuracyModels,
  LanguageShort,
  partialsData,
  Accuracy,
  Separation,
  languageDomains,
  getFullLanguageName
} from '../utils/transcribe-elements';
import { BiChevronDown, BiChevronRight, BiMicrophone } from 'react-icons/bi';
import { AiOutlineControl } from 'react-icons/ai';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import realtimeStore, {
  LanguageDomain,
  MaxDelayMode
} from '../utils/real-time-utils/real-time-flow';
import { HeaderLabel, DescriptionLabel, Inline, ErrorBanner } from './common';
import { DownloadIcon } from './icons-library';
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { capitalizeFirstLetter, timeLeftFormat } from '../utils/string-utils';
import { timedoutUpdate } from '../utils/helper-utils';
import { useIsAuthenticated } from '@azure/msal-react';

export const RealtimeForm = ({ disabled = false }) => {
  const isAccountStateUnpaid = accountStore.accountState === 'unpaid';

  return (
    <>
      <HeaderLabel>Configure Your Real-Time Transcription Options</HeaderLabel>
      <DescriptionLabel>
        Choose the features to suit your transcription requirements.
      </DescriptionLabel>
      <VStack width='100%'>
        <Grid
          gridTemplateColumns='repeat(auto-fit, minmax(14em, 1fr))'
          width='100%'
          gap={6}
          alignItems='flex-end'
          pt={4}>
          <SelectField
            data-qa='select-transcribe-language'
            label='Language'
            tooltip='Select the language you want to transcribe in real-time'
            data={languagesData}
            sortData={true}
            onSelect={(val: LanguageShort) => {
              trackAction('language_select_rt', { value: val });
              realtimeStore.config.language = val;
            }}
            disabled={isAccountStateUnpaid || disabled}
            initVal={realtimeStore.config.language}
          />

          <SelectField
            data-qa='select-transcribe-separation'
            label='Separation'
            tooltip='Speaker - detects and labels individual speakers within a single audio channel. Channel - labels each audio channel and aggregates into a single transcription output.'
            data={separation}
            onSelect={(val) => {
              trackAction('separation_select_rt', { value: val });
              realtimeStore.config.seperation = val as Separation;
            }}
            disabled={isAccountStateUnpaid || disabled}
            initVal={realtimeStore.config.seperation}
          />

          <SelectField
            data-qa='select-transcribe-accuracy'
            label='Accuracy'
            tooltip='Enhanced - highest transcription accuracy. Standard - faster transcription with high accuracy.'
            data={accuracyModels}
            onSelect={(val) => {
              trackAction('accuracy_select_rt', { value: val });
              realtimeStore.config.accuracy = val as Accuracy;
            }}
            disabled={isAccountStateUnpaid || disabled}
            initVal={realtimeStore.config.accuracy}
          />
        </Grid>

        {process.env.RT_ADVANCED_FEATURES && (
          <ToggleSection py={4} title='Advanced Transcription Options' openByDefault={false}>
            <Grid
              gridTemplateColumns='repeat(auto-fit, minmax(14em, 1fr))'
              width='100%'
              gap={6}
              alignItems='flex-end'
              pt={4}>
              <SelectField
                data-qa='select-partials'
                label='Partials'
                tooltip='Tooltip description missing.'
                data={partialsData}
                onSelect={(val) => {
                  trackAction('partials_enable_select_rt', { value: val });
                  realtimeStore.config.partialsEnabled = Boolean(val);
                }}
                disabled={isAccountStateUnpaid || disabled}
              />
              <SelectField
                data-qa='select-transcribe-accuracy'
                label='Max Delay Mode'
                tooltip='Tooltip description missing.'
                data={accuracyModels}
                onSelect={(val) => {
                  trackAction('max_delay_mode_select_rt', { value: val });
                  realtimeStore.config.maxDelayMode = val as MaxDelayMode;
                }}
                disabled={isAccountStateUnpaid || disabled}
              />

              <SliderField
                label='Max Delay'
                tooltip='Tooltip description missing.'
                pb={2}
                onChangeValue={(value: number) => {
                  realtimeStore.config.maxDelay = value;
                }}
                defaultValue={5}
                min={2}
                max={10}
                step={0.1}
                valueFieldFormatter={(v) => `${v.toFixed(1)}s`}
                disabled={isAccountStateUnpaid || disabled}
              />

              <SelectField
                data-qa='select-transcribe-accuracy'
                label='Entities'
                tooltip='Tooltip description missing.'
                data={accuracyModels}
                onSelect={(val) => {
                  trackAction('entities_enable_select_rt', { value: val });
                  realtimeStore.config.entitiesEnabled = Boolean(val);
                }}
                disabled={isAccountStateUnpaid || disabled}
              />

              <SelectField
                data-qa='select-transcribe-accuracy'
                label='Domain Language Pack'
                tooltip='Tooltip description missing.'
                data={languageDomains}
                onSelect={(val) => {
                  trackAction('language_domain_select_rt', { value: val });
                  realtimeStore.config.languageDomain = val as LanguageDomain;
                }}
                disabled={isAccountStateUnpaid || disabled}
              />
            </Grid>
          </ToggleSection>
        )}
      </VStack>
    </>
  );
};

export const PermissionsModal = observer(function ({ flowProp, title, text }: any) {
  return (
    <>
      <Modal
        isCentered
        isOpen={realtimeStore[flowProp]}
        onClose={() => {
          realtimeStore[flowProp] = false;
        }}>
        <ModalOverlay rounded='none' />
        <ModalContent>
          <ModalCloseButton />

          <ModalBody>
            <Box fontFamily='RMNeue-Light' textAlign='left' px='2em' color='smBlack.400' mt='1em'>
              <Box fontFamily='RMNeue-Bold'>{title}</Box>
              <DescriptionLabel>{text}</DescriptionLabel>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

export const AudioInputSection = observer(function ({ onChange, defaultValue, disabled }: any) {
  const [placeholder, setPlaceholder] = useState<string>('Default Input Device');
  const isAuthenticated = useIsAuthenticated();
  const audioDevices = [...realtimeStore.audioHandler.devices];
  let isMounted = false;

  useEffect(() => {
    isMounted = true;
    if (isAuthenticated) {
      realtimeStore.audioHandler
        .getPermissions()
        .then((res) => {
          if (!isMounted) return;
          if (res === 'granted') {
            realtimeStore.audioHandler.getAudioInputs().then((d) => {
              if (!!d) {
                const nm = realtimeStore.audioHandler.getAudioInputName();
                if (!!nm) setPlaceholder('');
                else setPlaceholder(placeholder);
              } else setPlaceholder(placeholder);
            });
          }
          if (res === 'denied') {
            realtimeStore.permissionsDenied = true;
          }
        })
        .catch((err) => {
          realtimeStore.showPermissionsModal = false;
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    isMounted = true;
    if (isAuthenticated) {
      const nm = realtimeStore.audioHandler.getAudioInputName();
      if (!isMounted) return;
      if (!!nm) setPlaceholder('');
      else setPlaceholder(placeholder);
    }
    return () => {
      isMounted = false;
    };
  }, [audioDevices]);

  const clickCallback = () => {
    if (audioDevices.length) return;
    realtimeStore.showBlockedModal = false;
    realtimeStore.audioHandler
      .getAudioInputs()
      .then((d) => {
        if (!isMounted) return;
        if (!!d) {
          setPlaceholder('');
        } else setPlaceholder(placeholder);
      })
      .catch((err) => err);
  };

  return (
    <>
      <HeaderLabel pt={4}>Select the Device</HeaderLabel>
      <DescriptionLabel>
        Choose the input device you’ll use for real-time transcription.
      </DescriptionLabel>
      <Select
        width='15.5em'
        borderColor='smBlack.200'
        color='smBlack.300'
        // data-qa={dataQa}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        borderRadius='2px'
        size='lg'
        onChange={(event) => {
          realtimeStore.showBlockedModal = false;
          onChange(event.target.value);
        }}
        onClick={clickCallback}
        onMouseDown={clickCallback}>
        {audioDevices
          ? audioDevices.map(({ deviceId, label }) => (
              <option key={deviceId} value={deviceId}>
                {label || `(name hidden) id: ${deviceId.substring(0, 4)}...`}
              </option>
            ))
          : []}
      </Select>
    </>
  );
});

export const StartTranscriptionButton = ({
  onClick,
  disabled = false,
  intermediateState,
  ...props
}) => (
  <Box width='100%' pt={8} {...props}>
    <Button
      data-qa='button-get-transcription'
      variant='speechmatics'
      fontSize='18'
      width='100%'
      onClick={() => {
        trackAction('rt_start_transcripion_click');
        onClick();
      }}
      whiteSpace='normal'
      disabled={disabled || intermediateState}>
      Start Transcribing{intermediateState && <Spinner size='sm' ml={3} />}
    </Button>
  </Box>
);

export const StartOverButton = ({ onClick, ...props }) => (
  <Box width='100%' pt={8} {...props}>
    <Button
      data-qa='button-get-transcription'
      variant='speechmatics'
      fontSize='18'
      width='100%'
      onClick={() => {
        trackAction('rt_start_over_transcripion_click');
        onClick();
      }}
      whiteSpace='normal'>
      Back to Settings
    </Button>
  </Box>
);

export const TranscriptionErrors = ({}) => {
  //the system supposed to handle all types of errors,
  //but due to websocket implementation limitations it just shows the generic error now
  if (realtimeStore.errors.length == 0) return <></>;

  const [{ code }] = realtimeStore.errors;
  return (
    <Box pt={2}>
      <ErrorBanner
        text={
          code == 404
            ? `Real-time transcription demo in ${getFullLanguageName(
                realtimeStore.config.language
              )} \
      is not available right now. Please try again later, or try another language.`
            : code == 1001
            ? `Microphone access denied`
            : `Error occured. Please try again later.`
        }
      />
    </Box>
  );
};

type TranscriptionViewProps = { disabled: boolean } & StackProps;

export const TranscriptionView = ({ disabled, ...props }: TranscriptionViewProps) => {
  return (
    <VStack width='100%' {...props}>
      <Flex width='100%' justifyContent='space-between' pb={2}>
        <TimeLeftStatus flex='1' justifyContent='flex-start' />
        {!disabled && <AudioInputIndicator flex='1' justifyContent='flex-end' />}
      </Flex>
      <TranscriptionDisplay />
      <Flex width='100%' justifyContent='space-between' pt={2}>
        {process.env.RT_ADVANCED_FEATURES ? (
          <TranscriptDisplayOptions mt={2} disabled={disabled} />
        ) : (
          <Box></Box>
        )}
        <Flex gap={2}>
          <ShortCopyButton
            disabled={disabled}
            onClick={realtimeStore.transcription.onCopyCallback}
          />
          <ShortDownloadMenu disabled={disabled} />
        </Flex>
      </Flex>
    </VStack>
  );
};

export const TranscriptionSessionConfig = ({ ...props }) => {
  return (
    <Box pt='2em' width='100%' {...props}>
      <DescriptionLabel>
        You can change the following transcription options during the real-time transcription
        session:
      </DescriptionLabel>
      <Grid
        gridTemplateColumns='repeat(auto-fit, minmax(13em, 1fr))'
        width='100%'
        gap={6}
        alignItems='flex-end'
        pt={4}>
        <SelectField
          data-qa='select-transcribe-accuracy'
          label='Partials'
          tooltip='Tooltip description missing.'
          data={accuracyModels}
          onSelect={(val) => {
            trackAction('partials_live_update', { value: val });
            realtimeStore.socketHandler.updateLiveConfig({ enablePartials: val });
          }}
        />

        <SelectField
          data-qa='select-transcribe-accuracy'
          label='Max Delay Mode'
          tooltip='Tooltip description missing.'
          data={accuracyModels}
          onSelect={(val) => {
            trackAction('max_delay_mode_live_update', { value: val });
            realtimeStore.socketHandler.updateLiveConfig({ maxDelayMode: val });
          }}
        />

        <SliderField
          label='Max Delay'
          tooltip='Tooltip description missing.'
          onChangeValue={(val) => {
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
  );
};

export const StopTranscriptionButton = ({
  onClick,
  disabled = false,
  intermediateState,
  ...props
}) => {
  return (
    <Box width='100%' pt={8} {...props}>
      <Button
        data-qa='button-get-transcription'
        variant='speechmatics'
        bgColor='smRed.600'
        _hover={{ bgColor: 'smRed.500', _disabled: { bgColor: 'smRedGray.400' } }}
        _disabled={{ bgColor: 'smRedGray.500' }}
        fontSize='18'
        width='100%'
        onClick={() => {
          trackAction('rt_stop_transcripion_click');
          onClick();
        }}
        disabled={disabled || intermediateState}
        whiteSpace='normal'>
        Stop Transcribing{intermediateState && <Spinner size='sm' ml={3} />}
      </Button>
    </Box>
  );
};

const ToggleSection = ({
  toggleCallback = null,
  openByDefault = false,
  title,
  children,
  ...boxProps
}) => {
  const [open, setOpen] = useState(openByDefault);

  const toggle = useCallback(() => setOpen((open) => (toggleCallback?.(!open), !open)), []);

  return (
    <VStack width='100%' {...boxProps}>
      <Flex width='100%' alignItems='center' gap={3}>
        <Box height='1px' flex='1' bgColor='var(--chakra-colors-smBlack-150)'></Box>
        <Flex
          flex='0'
          whiteSpace='nowrap'
          alignItems='center'
          gap={1}
          color='smBlue.400'
          onClick={toggle}
          cursor='pointer'>
          {open ? <BiChevronDown /> : <BiChevronRight />}
          <Box>{title}</Box>
        </Flex>
        <Box height='1px' flex='1' bgColor='var(--chakra-colors-smBlack-150)'></Box>
      </Flex>
      {open && children}
    </VStack>
  );
};

export const TimeLeftStatus = observer(({ ...boxProps }: FlexProps) => {
  const { stage, timeLeft } = realtimeStore;

  return (
    <Flex color='smBlack.300' {...boxProps}>
      {stage == 'starting' && <Inline>Connecting...</Inline>}
      {stage == 'running' && <Inline>Demo time remaining: {timeLeftFormat(timeLeft)}</Inline>}
      {stage == 'stopped' && <Inline>Session ended</Inline>}
    </Flex>
  );
});

export const AudioInputIndicator = observer(({ ...boxProps }: BoxProps) => {
  return (
    <Flex {...boxProps} color='smBlack.150' alignItems='flex-end'>
      <Box fontSize='0.8em'>{realtimeStore.audioHandler.getAudioInputName()}</Box>
      <Box mt='2px' ml='2px'>
        <BiMicrophone size='20px' />
      </Box>
    </Flex>
  );
});

export const TranscriptionDisplay = observer(({}) => {
  const box = useRef<HTMLDivElement>();

  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const { config, transcriptDisplayOptions: tdo } = realtimeStore;

  useEffect(() => {
    if (autoScroll) box.current.scrollTo({ behavior: 'smooth', top: box.current.scrollHeight });
  }, [
    box.current,
    realtimeStore.transcription.html,
    realtimeStore.transcription.partialTranscript
  ]);

  if (box.current) {
    if (box.current.scrollHeight - box.current.offsetHeight - box.current.scrollTop < 40) {
      if (!autoScroll) setAutoScroll(true);
    } else {
      if (autoScroll) setAutoScroll(false);
    }
  }

  const displayFlags = useMemo(() => {
    return [
      tdo.isDisplayingConfidence && 'display-confidence',
      tdo.isMarkingCustomDictionaryWords && 'display-custom-dict',
      tdo.isFilteringProfanities && 'filter-profanities',
      tdo.isShowingDisfluencies && 'showing-disfluencies',
      config.entitiesEnabled && tdo.entitiesForm == 'written' && 'showing-entities-written',
      config.entitiesEnabled && tdo.entitiesForm == 'spoken' && 'showing-entities-spoken'
    ]
      .filter(Boolean)
      .join(' ');
  }, [...tdo.getDepArray()]);

  return (
    <Box width='100%' bgColor='smBlack.80' border='1px solid' borderColor='smBlack.150' p={4}>
      <Box
        width='100%'
        minHeight='150px'
        maxHeight='300px'
        overflow='auto'
        fontFamily='Matter-Light'
        className={`scrollBarStyle ${displayFlags}`}
        fontSize='1.2em'
        ref={box}>
        {/* <Inline dangerouslySetInnerHTML={{ __html: realtimeStore.transcription.html }}></Inline> */}
        {realtimeStore.transcription.jsxArray}
        <Inline color='smGreen.500'> {realtimeStore.transcription.partialTranscript}</Inline>
      </Box>
    </Box>
  );
});

type TranscriptDisplayOptionsProps = { disabled: boolean } & FlexProps;

export const TranscriptDisplayOptions = ({
  disabled,
  ...flexProps
}: TranscriptDisplayOptionsProps) => {
  const ref = useRef<HTMLDivElement>();
  const labelRef = useRef<HTMLDivElement>();
  const [isShowingModal, setShowingModal] = useState<boolean>();
  const [[modalTop, modalLeft], setModalPos] = useState<[number, number]>([0, 0]);

  useOutsideClick({
    ref,
    handler: () => setShowingModal(false)
  });

  const calculatePos = useCallback(() => {
    if (labelRef.current) {
      const { top, left } = labelRef.current.getBoundingClientRect();
      setModalPos([top, left]);
    }
  }, [labelRef.current]);

  useLayoutEffect(() => {
    calculatePos();
  }, [labelRef.current]);

  return (
    <>
      <Flex
        color='smBlack.300'
        {...flexProps}
        ref={labelRef}
        _hover={{ color: 'smBlack.400' }}
        cursor='pointer'
        onClick={() => (calculatePos(), setShowingModal(true))}>
        <Box mt='5px' mr='7px'>
          <AiOutlineControl />
        </Box>
        <Box>Show transcript options</Box>
      </Flex>
      {isShowingModal && (
        <Portal>
          <RtDisplayOptions
            ref={ref}
            zIndex={500}
            boxShadow='3px 3px 5px #0001'
            position='absolute'
            top={modalTop}
            left={modalLeft}
            onClose={() => setShowingModal(false)}
          />
        </Portal>
      )}
    </>
  );
};

export const RtDisplayOptions = observer(
  forwardRef<HTMLDivElement, { onClose: () => void } & BoxProps>(
    ({ onClose, ...boxProps }, ref) => {
      const { transcriptDisplayOptions: tdo } = realtimeStore;

      return (
        <Box
          width='360px'
          border='1px solid'
          borderColor='smBlack.150'
          bgColor='smBlack.100'
          height='400px'
          p={4}
          ref={ref}
          {...boxProps}>
          <Flex width='100%' justifyContent='space-between' alignItems='center'>
            <Box fontSize='lg' pl={2} color='smBlack.400'>
              Transcript display options
            </Box>
            <CloseButton
              size='lg'
              color='smBlack.300'
              _hover={{ color: 'smBlack.500' }}
              onClick={onClose}
            />
          </Flex>

          <VStack overflow='auto' className='scrollBarStyle' height='330px' pt={4} px={2}>
            <OptionWithDescription
              descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
              optionTitle='Show Confidence Scores'
              onChange={tdo.setDisplayingConfidence}
              value={tdo.isDisplayingConfidence}
            />

            <OptionWithDescription
              descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
              optionTitle='Filter Profanities'
              onChange={tdo.setFilteringProfanities}
              value={tdo.isFilteringProfanities}
            />

            <OptionWithDescription
              descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
              optionTitle='Show Disfluencies'
              onChange={tdo.setShowingDisfluencies}
              value={tdo.isShowingDisfluencies}
            />

            <OptionWithDescription
              descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
              optionTitle='Underline Custom Dictionary Entries'
              onChange={tdo.setMarkingCustomDictionaryWords}
              value={tdo.isMarkingCustomDictionaryWords}
            />

            <DropdownWithDescription
              descr='In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate.'
              optionTitle='Entities'
              onChange={tdo.setEntitiesForm}
              values={['written', 'spoken']}
              selectedValue={tdo.entitiesForm}
            />
          </VStack>
        </Box>
      );
    }
  )
);

const OptionWithDescription = ({ descr, optionTitle, onChange, value }) => {
  const onClickChange = useCallback((event) => onChange(event.target.checked), []);

  return (
    <Box pt={4}>
      <Box color='smBlack.300'>{descr}</Box>
      <Flex pt={2} alignItems='center' gap={3}>
        <Box color='smGreen.500'>{optionTitle}</Box>
        <Switch
          colorScheme='smGreen'
          _focus={{ boxShadow: 'none' }}
          isChecked={value}
          onChange={onClickChange}
        />
      </Flex>
    </Box>
  );
};

const DropdownWithDescription = ({ descr, optionTitle, onChange, values, selectedValue }) => {
  const [currentLabel, setCurrentLabel] = useState<string>(selectedValue);

  return (
    <Box pt={4}>
      <Box color='smBlack.300'>{descr}</Box>
      <Flex pt={2} alignItems='center' gap={3}>
        <Box color='smGreen.500'>{optionTitle}</Box>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            color='smBlack.300'
            bgColor='smWhite.500'
            border='1px solid'
            borderColor='smBlack.150'
            _active={{ bgColor: 'smBlack.100' }}
            _hover={{ bgColor: 'smBlack.100' }}
            borderRadius='sm'
            fontFamily='RMNeue-Light'>
            {capitalizeFirstLetter(currentLabel)}
          </MenuButton>
          <MenuList>
            {values.map((el) => (
              <MenuItem
                fontFamily='RMNeue-Light'
                key={el}
                onClick={() => (onChange(el), setCurrentLabel(el))}>
                {capitalizeFirstLetter(el)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export const ShortDownloadMenu = ({ disabled }) => (
  <Menu>
    <MenuButton
      as={Button}
      height='2.5em'
      borderRadius='sm'
      px='1.5em'
      disabled={disabled}
      bgColor='smGreen.500'
      _hover={{ bgColor: 'smGreen.400' }}>
      <DownloadIcon />
    </MenuButton>
    <MenuList>
      <MenuItem onClick={realtimeStore.transcription.onDownloadAsText}>Download as txt</MenuItem>
      <MenuItem onClick={realtimeStore.transcription.onDownloadAsJson}>Download as JSON</MenuItem>
      {/* <MenuItem onClick={realtimeStore.config.onDownloadConfig}>Download configuration</MenuItem> */}
    </MenuList>
  </Menu>
);

export const ShortCopyButton = ({ disabled, onClick }) => {
  return (
    <Button
      height='2.5em'
      borderRadius='sm'
      disabled={disabled}
      onClick={onClick}
      bgColor='smBlue.500'
      _hover={{ bgColor: 'smBlue.400' }}
      px='1.5em'>
      <CopyIcon color='#fff' />
    </Button>
  );
};
