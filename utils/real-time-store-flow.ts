import { makeAutoObservable } from 'mobx';
import {
  Accuracy,
  CustomDictElement,
  Language,
  LanguageShort,
  Separation
} from './transcribe-elements';

export type MaxDelayMode = 'fixed' | 'flexible';
export type LanguageDomain = 'default' | 'finance';

class RtConfigurationStore {
  language: LanguageShort;
  outputLocale; //todo
  seperation: Separation;
  accuracy: Accuracy;
  partialsEnabled: boolean;
  maxDelayMode: MaxDelayMode;
  maxDelay: number;
  customDictionary: [];
  entitiesEnabled: boolean;
  languageDomain: LanguageDomain;
  punctuationOverrides: [];

  constructor() {
    makeAutoObservable(this);
  }

  getTranscriptionConfig() {
    return {
      language: this.language,
      output_locale: this.language == 'en' ? this.outputLocale : '',
      additional_vocab: this.customDictionary?.map((el: CustomDictElement) => ({
        content: el.content,
        sounds_like: el.soundslike
      })),
      enable_partials: this.partialsEnabled,
      max_delay: this.maxDelay,
      max_delay_mode: this.maxDelayMode,
      enable_entities: this.entitiesEnabled,
      domain: this.languageDomain
    };
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
  transcriptionJSON;
  transcriptionHTML;

  timeLeft: number = 180;

  reset() {
    this.transcriptionHTML = null;
    this.transcriptionJSON = null;
    this.timeLeft = 0;
  }
}

class RealtimeStoreFlow {
  configuration: RtConfigurationStore = new RtConfigurationStore();

  transcription: RtTranscriptionStore = new RtTranscriptionStore();

  stage: 'form' | 'starting' | 'running' | 'error' | 'stopped' = 'form';

  constructor() {
    makeAutoObservable(this);
  }

  startTranscription() {
    this.stage = 'starting';
  }

  stopTranscription() {
    this.stage = 'form';
  }

  get inTranscriptionStage() {
    return (
      this.stage == 'starting' ||
      this.stage == 'running' ||
      this.stage == 'error' ||
      this.stage == 'stopped'
    );
  }

  reset() {
    this.stage = 'form';
    this.configuration.reset();
    this.transcription.reset();
  }
}

const realtimeStore = new RealtimeStoreFlow();

export default realtimeStore;

/*audio_format: {
        type: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 44100, //
      }*/
