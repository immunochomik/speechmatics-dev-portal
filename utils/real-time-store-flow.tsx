import { action, computed, makeAutoObservable, makeObservable, observable } from 'mobx';
import React from 'react';
import { clearInterval } from 'timers';
import { Inline } from '../components/common';
import { RealtimeTranscriptionResponse, TranscriptResult } from '../custom';
import audioRecorder, { AudioRecorder } from './audio-capture';
import { RealtimeSocketHandler } from './real-time-socket-handler';
import { capitalizeFirstLetter, downloadHelper } from './string-utils';
import {
  Accuracy,
  CustomDictElement,
  Language,
  LanguageShort,
  Separation,
  Stage
} from './transcribe-elements';

export type MaxDelayMode = 'fixed' | 'flexible';
export type LanguageDomain = 'default' | 'finance';
export type EntitiesForm = 'written' | 'spoken';
export type RealTimeFlowStage = 'form' | 'starting' | 'running' | 'error' | 'stopping' | 'stopped';

const defaultURL = 'ws://localhost:8080';
class RtConfigurationStore {
  language: LanguageShort;
  outputLocale: 'en-GB' | 'en-US'; //todo
  seperation: Separation;
  accuracy: Accuracy;
  partialsEnabled: boolean;
  maxDelayMode: MaxDelayMode;
  maxDelay: number;
  maxSpeakers: number = 20;
  customDictionary: [];
  entitiesEnabled: boolean;
  languageDomain: LanguageDomain;
  punctuationOverrides: [];
  punctuationSensitivitity: number = 0.5;

  constructor() {
    makeAutoObservable(this);
  }

  getTranscriptionConfig() {
    const config = {
      language: this.language,
      output_locale: this.language == 'en' ? this.outputLocale : '',
      operating_point: this.accuracy,
      additional_vocab: this.customDictionary?.map((el: CustomDictElement) => ({
        content: el.content,
        sounds_like: el.soundslike
      })),
      enable_partials: this.partialsEnabled,
      max_delay: this.maxDelay,
      max_delay_mode: this.maxDelayMode,
      enable_entities: this.entitiesEnabled,
      domain: this.languageDomain
    } as any;

    if (this.seperation == 'speaker') {
      config.diarization = 'speaker';
      config.speaker_diarization_config = {
        max_speakers: this.maxSpeakers
      };
    }

    if (this.punctuationOverrides && this.punctuationOverrides.length > 0) {
      config.transcription_config.punctuation_overrides = {
        permitted_marks: this.punctuationOverrides,
        sensitivity: this.punctuationSensitivitity
      };
    }

    return config;
  }

  reset() {
    this.language = 'en';
    this.outputLocale = 'en-GB';
    this.seperation = 'none';
    this.accuracy = 'enhanced';
    this.partialsEnabled = true;
    this.maxDelayMode = 'fixed';
    this.maxDelay = 5;
    this.customDictionary = [];
    this.entitiesEnabled = true;
    this.languageDomain = 'default';
    this.punctuationOverrides = [];
  }

  onDownloadConfig = () => {
    downloadHelper(
      JSON.stringify(this.getTranscriptionConfig()),
      'real-time-configuration.json',
      'application/json'
    );
  };
}

class RtTranscriptionStore {
  constructor(
    configurationStore: RtConfigurationStore,
    displayOptions: RealtimeDisplayOptionsStore
  ) {
    makeAutoObservable(this);

    this.configurationStore = configurationStore;
    this.displayOptions = displayOptions;
    this.reset();
  }

  private _json: TranscriptResult[] = [];
  get json(): TranscriptResult[] {
    return this._json;
  }
  set json(value: TranscriptResult[]) {
    this._json = value;
  }

  private _html: string = '';
  get html(): string {
    return this._html;
  }
  set html(value: string) {
    this._html = value;
  }

  private _text: string = '';
  get text(): string {
    return this._text;
  }
  set text(value: string) {
    this._text = value;
  }

  private _jsxArray: JSX.Element[] = [];
  get jsxArray(): JSX.Element[] {
    return this._jsxArray;
  }
  set jsxArray(value: JSX.Element[]) {
    this._jsxArray = value;
  }

  getJsxElement(): JSX.Element {
    return <>{this.jsxArray}</>
  }

  partialTranscript: string = '';

  configurationStore: RtConfigurationStore;
  displayOptions: RealtimeDisplayOptionsStore;

  prevSpeaker = '';
  speaker = '';
  speakerHtml = '';
  prevChannel = '';
  channel = '';
  channelHtml = '';
  speakerJsx: JSX.Element = null;
  channelJsx: JSX.Element = null;

  reset() {
    this.html = null;
    this.jsxArray = null;
    this.json = [];
    this.text = '';
    this.prevSpeaker = '';
    this.speaker = '';
    this.speakerHtml = '';
    this.speakerJsx = null;
    this.prevChannel = '';
    this.channel = '';
    this.channelHtml = '';
    this.channelJsx = null;
  }

  onFullReceived = (data: RealtimeTranscriptionResponse) => {
    data.results.forEach(this.appendToTranscription);
    this.partialTranscript = '';
  };

  onPartialReceived = (data: RealtimeTranscriptionResponse) => {
    this.partialTranscript = data.results.reduce(
      (prev, curr) => `${prev} ${curr.alternatives[0].content}`,
      ''
    );
  };

  private appendToTranscription = (result: TranscriptResult) => {
    //    this.text += (result.type == 'word' ? ' ' : '') + result.alternatives[0].content;
    this.json.push(result);

    const { speaker, content } = result.alternatives?.[0];

    if (this.configurationStore.seperation == 'speaker' && this.prevSpeaker != speaker) {
      this.speaker = speaker.replace('S', 'Speaker ');
      this.speakerHtml = `<span class='speakerChangeLabel'>${this.speaker}:</span>`;
      this.speakerJsx = <Inline className='speakerChangeLabel'>{this.speaker}</Inline>;
      this.speaker = `\n${this.speaker}: `;
      this.prevSpeaker = speaker;
    }

    if (this.configurationStore.seperation == 'channel' && this.prevChannel != result.channel) {
      this.channel = capitalizeFirstLetter(result.channel?.replace('_', ' '));
      this.channelHtml = `<span class='channelLabel'>${this.channel}:</span>`;
      this.channelJsx = <Inline className='channelLabel'>{this.channel}</Inline>
      this.channel = `\n${this.channel}\n`;
      this.prevChannel = result.channel;
    }

    const separtor = result.type == 'punctuation' ? '' : ' ';
    this.html = `${this.html}${this.channelHtml}${this.speakerHtml}${separtor}<span>${content}</span>`;
    this.text = `${this.text}${this.channel}${this.speaker}${separtor}${content}`;
    this.jsxArray = [
      ...this.jsxArray,
      <React.Fragment key={`${result.start_time}${content}`}>
        {this.channelJsx}{this.speakerJsx}{separtor}
        <Inline>{content}</Inline>
      </React.Fragment>
    ]


    this.speakerHtml = '';
    this.speaker = '';
    this.channelHtml = '';
    this.channel = '';
    this.speakerJsx = null;
    this.channelJsx = null;
  };

  onCopyCallback = () => {
    navigator.clipboard.writeText(this.text);
  };

  onDownloadAsText = () => {
    downloadHelper(this.text, 'Real-time-transcript.txt', 'text/plain');
  };

  onDownloadAsJson = () => {
    downloadHelper(JSON.stringify(this.json), 'Real-time-transcript.json', 'application/json');
  };
}

class RealtimeDisplayOptionsStore {
  isDisplayingConfidence = false;
  isShowingProfanities = true;
  isShowingDisfluencies = true;
  isShowingCustomDictionaryWords = false;
  entitiesForm: EntitiesForm = 'written';

  constructor() {
    makeAutoObservable(this);
  }
}

class RealtimeStoreFlow {
  configuration: RtConfigurationStore;
  transcription: RtTranscriptionStore;
  socketHandler: RealtimeSocketHandler;
  audioHandler: AudioRecorder;
  transcriptDisplayOptions: RealtimeDisplayOptionsStore;

  errors: { error: string; data: any }[] = [];

  constructor() {
    makeAutoObservable(this);

    this.configuration = new RtConfigurationStore();
    this.transcriptDisplayOptions = new RealtimeDisplayOptionsStore();
    this.transcription = new RtTranscriptionStore(
      this.configuration,
      this.transcriptDisplayOptions
    );

    this.socketHandler = new RealtimeSocketHandler(process.env.REAL_TIME_SOCKET_URL || defaultURL, {
      onRecognitionStart: this.recognitionStart,
      onRecognitionEnd: this.recognitionEnd,
      onFullReceived: this.transcription.onFullReceived,
      onPartialReceived: this.transcription.onPartialReceived,
      onError: this.errorHandler,
      onDisconnect: this.connectionEnded
    });

    this.audioHandler = new AudioRecorder(this.socketHandler.audioDataHandler);
  }

  set stage(value: RealTimeFlowStage) {
    console.log('set stage', value);
    this._stage = value;
  }
  get stage(): RealTimeFlowStage {
    return this._stage;
  }
  _stage: RealTimeFlowStage = 'form';

  recognitionStart = () => {
    this.stage = 'running';
  };

  recognitionEnd = () => {
    this.stage = 'stopped';
  };

  connectionEnded = () => {
    this.stage = 'stopped';
  };

  errorHandler = (data: any) => {
    this.audioHandler.stopRecording();
    this.errors = [...this.errors, { error: 'Service Unavailable', data }];
    console.error('socket error', data);
  };

  startTranscription = async () => {
    this.stage = 'starting';
    this.audioHandler.startRecording().then(
      () => {
        this.socketHandler
          .connect()
          .then(() => {
            return this.socketHandler.startRecognition(this.configuration.getTranscriptionConfig());
          })
          .then(
            () => {
              this.startCountdown(this.stopTranscription);
            },
            (recognitionError) => console.error('recognition error', recognitionError)
          )
          .catch((socketError) => console.error('socket error', socketError));
      },
      (audioError) => {
        console.error('audio error', audioError);
      }
    );
  };

  stopTranscription = async () => {
    this.stage = 'stopping';
    await this.audioHandler.stopRecording();
    await this.socketHandler.stopRecognition();
    await this.socketHandler.disconnect();
    this.stopCountdown();
    this.stage = 'stopped';
  };

  startOver = async () => {
    this.audioHandler.stopRecording();
    this.reset();
  };

  async cleanUp() {
    try {
      this.transcription.reset();
      this.configuration.reset();
      this.audioHandler.stopRecording();
      if (this.stage == 'running') await this.socketHandler.stopRecognition();
      if (this.inStages('starting', 'running')) await this.socketHandler.disconnect();
      this.errors = [];
    } catch (err) {
      console.info(err);
    }
  }

  get inTranscriptionStage() {
    return (
      this.stage == 'starting' ||
      this.stage == 'running' ||
      this.stage == 'error' ||
      this.stage == 'stopped' ||
      this.stage == 'stopping'
    );
  }

  inStages(...stages: RealTimeFlowStage[]) {
    return stages.includes(this.stage);
  }

  audioDeviceSelected = (deviceId: string) => {
    this.audioHandler.audioDeviceId = deviceId;
  };

  reset() {
    this.stage = 'form';
    this.configuration.reset();
    this.transcription.reset();
    this.timeLeft = 120;
    this.errors = [];
    this.stopCountdown();
  }

  stopCountdown = () => {
    window.clearInterval(this.interval);
  };

  interval = null;
  startCountdown = (endCallback: () => void) => {
    this.interval = window.setInterval(() => {
      this.timeLeft -= 1;
      if (this.timeLeft == 0) {
        endCallback();
        window.clearInterval(this.interval);
      }
    }, 1000);
  };

  private _timeLeft: number = 120;
  get timeLeft(): number {
    return this._timeLeft;
  }
  set timeLeft(value: number) {
    this._timeLeft = value;
  }
}

const realtimeStore = new RealtimeStoreFlow();

export default realtimeStore;
