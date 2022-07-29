import { makeAutoObservable } from 'mobx';
import { Language, LanguageShort } from './transcribe-elements';

class RealtimeConfiguration {
  language: LanguageShort;
  seperation;
  accuracy;
  partialsEnabled: boolean;
  maxDelayMode;
  maxDelay: number;
  customDictionary: [];
  entitiesEnabled: boolean;
  languageDomain;
  punctuationOverrides: [];

  constructor() {
    makeAutoObservable(this);
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
