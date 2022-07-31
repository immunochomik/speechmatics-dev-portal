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

class RealtimeConfiguration {
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
      max_delay: this.maxDelay, //maxDelayMode != 'flexible' ? maxDelay : undefined,
      //change none or false to undefined so it wouldn't be included and maintain backwards compatible
      max_delay_mode: this.maxDelayMode,
      enable_entities: this.entitiesEnabled,
      domain: this.languageDomain
    };
  }
}

class RealtimeStore {
  configuration: RealtimeConfiguration;

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
  }
}

const realtimeStore = new RealtimeStore();

export default realtimeStore;

/*audio_format: {
        type: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 44100, //
      }*/
