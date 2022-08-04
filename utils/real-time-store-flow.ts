import { action, computed, makeAutoObservable, makeObservable, observable } from 'mobx';
import { clearInterval } from 'timers';
import { RealtimeTranscriptionResponse, TranscriptResult } from '../custom';
import audioRecorder, { AudioRecorder } from './audio-capture';
import { RealtimeSocketHandler } from './real-time-socket-handler';
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
}

class RtTranscriptionStore {
  private _transcriptionJSON: TranscriptResult[] = [];
  get transcriptionJSON(): TranscriptResult[] {
    return this._transcriptionJSON;
  }
  set transcriptionJSON(value: TranscriptResult[]) {
    this._transcriptionJSON = value;
  }
  private _transcriptionHTML: string = '';
  get transcriptionHTML(): string {
    return this._transcriptionHTML;
  }
  set transcriptionHTML(value: string) {
    this._transcriptionHTML = value;
  }

  partialTranscript: string;

  private _timeLeft: number = 120;
  get timeLeft(): number {
    return this._timeLeft;
  }
  set timeLeft(value: number) {
    this._timeLeft = value;
  }

  configurationStore: RtConfigurationStore;

  constructor(configurationStore: RtConfigurationStore) {
    makeAutoObservable(this);

    this.configurationStore = configurationStore;
  }

  reset() {
    this.transcriptionHTML = null;
    this.transcriptionJSON = null;
    this.timeLeft = 120;
    window.clearInterval(this.interval);
  }

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

  private appendToTranscriptionHTML = (result: TranscriptResult) => {
    this.transcriptionHTML += (result.type == 'word' ? ' ' : '') + result.alternatives[0].content;
  };

  onFullReceived = (data: RealtimeTranscriptionResponse) => {
    data.results.forEach(this.appendToTranscriptionHTML);
    this.partialTranscript = '';
  };

  onPartialReceived = (data: RealtimeTranscriptionResponse) => {
    this.partialTranscript = data.results.reduce(
      (prev, curr) => `${prev} ${curr.alternatives[0].content}`,
      ''
    );
  };
}

class RealtimeTranscriptDisplayOptions {
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
  transcriptDisplayOptions: RealtimeTranscriptDisplayOptions;

  errors: { error: string; data: any }[] = [];

  constructor() {
    makeAutoObservable(this);

    this.configuration = new RtConfigurationStore();
    this.transcription = new RtTranscriptionStore(this.configuration);

    this.socketHandler = new RealtimeSocketHandler(process.env.REAL_TIME_SOCKET_URL || defaultURL, {
      onRecognitionStart: this.recognitionStart,
      onRecognitionEnd: this.recognitionEnd,
      onFullReceived: this.transcription.onFullReceived,
      onPartialReceived: this.transcription.onPartialReceived,
      onError: this.errorHandler,
      onDisconnect: this.connectionEnded
    });

    this.audioHandler = new AudioRecorder(this.socketHandler.audioDataHandler);

    this.transcriptDisplayOptions = new RealtimeTranscriptDisplayOptions();
  }

  set stage(value: RealTimeFlowStage) {
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
    this.errors = [...this.errors, { error: 'Service Unavailable', data }];
    console.error('socket error', data);
  };

  startTranscription = async () => {
    this.stage = 'starting';
    await this.audioHandler.startRecording();
    await this.socketHandler.connect().catch(console.error);
    await this.socketHandler.startRecognition(this.configuration.getTranscriptionConfig());
    this.transcription.startCountdown(this.stopTranscription);
  };

  stopTranscription = async () => {
    this.stage = 'stopping';
    this.audioHandler.stopRecording();
    await this.socketHandler.stopRecognition();
    await this.socketHandler.disconnect();
    this.stage = 'stopped';
  };

  startOver = async () => {
    this.reset();
  };

  async cleanUp() {
    try {
      this.transcription.reset();
      this.configuration.reset();
      this.audioHandler.stopRecording();
      await this.socketHandler.stopRecognition();
      await this.socketHandler.disconnect();
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

  reset() {
    this.stage = 'form';
    this.configuration.reset();
    this.transcription.reset();
    this.errors = [];
  }
}

const realtimeStore = new RealtimeStoreFlow();

export default realtimeStore;

/*audio_format: {
        type: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 44100, //
      }*/
