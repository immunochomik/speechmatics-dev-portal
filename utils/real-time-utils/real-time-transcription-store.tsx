import { makeAutoObservable } from "mobx";
import React from "react";
import { Inline } from "../../components/common";
import { TranscriptResult, RealtimeTranscriptionResponse } from "../../custom";
import { downloadHelper, capitalizeFirstLetter } from "../string-utils";
import { LanguageShort, Separation, Accuracy, CustomDictElement } from "../transcribe-elements";
import { MaxDelayMode, LanguageDomain, EntitiesForm } from "./real-time-store-flow";

export class RtConfigurationStore {
  language: LanguageShort;
  outputLocale: 'en-GB' | 'en-US'; //todo
  seperation: Separation;
  accuracy: Accuracy;
  partialsEnabled: boolean;
  maxDelayMode: MaxDelayMode;
  maxDelay: number;
  maxSpeakers: number = 20;
  customDictionary: CustomDictElement[];
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

export class RtTranscriptionStore {
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

    if (this.configurationStore.entitiesEnabled &&
      this.displayOptions.entitiesForm == 'spoken' &&
      result.spoken_form) {
      result.spoken_form.forEach(this.appendToTranscription)
      return;
    } else {
      this.json.push(result);
    }


    const { speaker, content, confidence, tags } = result.alternatives?.[0];

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
      ...(this.jsxArray || []),
      <React.Fragment key={`${result.start_time}${content}`}>
        {this.channelJsx}{this.speakerJsx}{separtor}
        <Inline className={`\
        ${this.confidenceScore(confidence)}\ 
        ${this.customWordMark(content)}\
        ${this.isDisfluenceWord(tags)}`}>
          {this.isProfanityWord(content, tags)}
        </Inline>
      </React.Fragment>
    ]


    this.speakerHtml = '';
    this.speaker = '';
    this.channelHtml = '';
    this.channel = '';
    this.speakerJsx = null;
    this.channelJsx = null;
  };

  private confidenceScore = (confidence: number) => {
    if (!this.displayOptions.isDisplayingConfidence) return '';
    if (confidence < 0.2) return 'wordConfidence02'
    if (confidence < 0.4) return 'wordConfidence24'
    if (confidence < 0.6) return 'wordConfidence46'
    if (confidence < 0.8) return 'wordConfidence68'
    return 'wordConfidence1'
  }

  private customWordMark = (word: string) => {
    if (this.displayOptions.isShowingCustomDictionaryWords &&
      this.configurationStore.customDictionary.some((dictWord) => dictWord.content == word))
      return 'wordCustomDict';
    else return ''
  }

  private isDisfluenceWord = (tags: string[]) => {
    if (this.displayOptions.isShowingDisfluencies && tags?.includes('disfluency')) return 'wordDisfluency'
  }

  private isProfanityWord = (word: string, tags: string[]) => {
    if (this.displayOptions.isShowingProfanities && tags?.includes('profanity')) {
      return `${word[0]}**${word[word.length - 1]}`
    } else return word;
  }

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

export class RealtimeDisplayOptionsStore {
  isDisplayingConfidence = false;
  isShowingProfanities = true;
  isShowingDisfluencies = true;
  isShowingCustomDictionaryWords = false;
  entitiesForm: EntitiesForm = 'written';

  constructor() {
    makeAutoObservable(this);
  }

  setDisplayingConfidence = (val: boolean) => this.isDisplayingConfidence = val;
  setShowingProfanities = (val: boolean) => this.isShowingProfanities = val;
  setShowingDisfluencies = (val: boolean) => this.isShowingDisfluencies = val;
  setShowingCustomDictionaryWords = (val: boolean) => this.isShowingCustomDictionaryWords = val;
  setEntitiesForm = (val: EntitiesForm) => this.entitiesForm = val;

}