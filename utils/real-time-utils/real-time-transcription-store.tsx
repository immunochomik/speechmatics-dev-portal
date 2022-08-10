import { jsx } from "@emotion/react";
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
  customDictionary: Map<string, string[]> = new Map//CustomDictElement[];
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
      additional_vocab: Array.from(this.customDictionary).map(([content, soundsLike]) => ({
        content: content,
        sounds_like: soundsLike
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
    this.customDictionary.clear();
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

  partialTranscript: JSX.Element = null;

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
    data.results.forEach(r => this.appendToTranscription(r));
    this.partialTranscript = null;
  };

  onPartialReceived = (data: RealtimeTranscriptionResponse) => {
    this.partialTranscript = <>{data.results.map(
      ({ alternatives: [{ content, tags }] }) => (this.displayOptions.isFilteringProfanities &&
        tags.includes('profanity')) ?
        <>{content[0]}
          <Inline className="profanity-inner">
            {content.slice(1, content.length - 2)}
          </Inline>
          {content[content.length - 1]}</> :
        content
    )}</>
  };

  private appendToTranscription = (result: TranscriptResult, entitiesForm?: EntitiesForm) => {

    if (this.configurationStore.entitiesEnabled && result.type == 'entity') {
      result.spoken_form?.forEach(r => this.appendToTranscription(r, 'spoken'))
      result.written_form?.forEach(r => this.appendToTranscription(r, 'written'))
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
      result.type == 'word' ? (
        <React.Fragment key={`${result.start_time}${content}`}>
          {this.channelJsx}{this.speakerJsx}{separtor}
          <Inline className={`\
              ${this.confidenceScore(confidence)}\ 
              ${this.customWordMark(content)}\
              ${this.isDisfluenceWord(tags)}
              ${entitiesForm !== undefined ? `entity-${entitiesForm}` : ''}`}>
            {this.isProfanityWord(content, tags)}
          </Inline>
        </React.Fragment>
      ) :
        <React.Fragment key={`${result.start_time}${content}`}>{content}</React.Fragment>
    ]


    this.speakerHtml = '';
    this.speaker = '';
    this.channelHtml = '';
    this.channel = '';
    this.speakerJsx = null;
    this.channelJsx = null;
  };

  private confidenceScore = (confidence: number) => {
    if (confidence < 0.2) return 'word-confidence-02'
    if (confidence < 0.4) return 'word-confidence-24'
    if (confidence < 0.6) return 'word-confidence-46'
    if (confidence < 0.8) return 'word-confidence-68'
    return 'word-confidence-1'
  }

  private customWordMark = (word: string) => {
    return this.configurationStore.customDictionary.get(word) !== undefined ? 'word-custom-dict' : ''
  }

  private isDisfluenceWord = (tags: string[]) => {
    return tags?.includes('disfluency') ? 'word-disfluency' : ''
  }

  private isProfanityWord = (word: string, tags: string[]) => {
    if (tags?.includes('profanity')) {
      return <>{word[0]}
        <Inline className="profanity-inner">
          {word.slice(1, word.length - 2)}
        </Inline>
        {word[word.length - 1]}</>
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
  isFilteringProfanities = false;
  isShowingDisfluencies = false;
  isMarkingCustomDictionaryWords = false;
  entitiesForm: EntitiesForm = 'written';


  constructor() {
    makeAutoObservable(this);
  }

  setDisplayingConfidence = (val: boolean) => {
    this.isDisplayingConfidence = val
  };
  setFilteringProfanities = (val: boolean) => {
    this.isFilteringProfanities = val
  };
  setShowingDisfluencies = (val: boolean) => {
    this.isShowingDisfluencies = val
  };
  setMarkingCustomDictionaryWords = (val: boolean) => {
    this.isMarkingCustomDictionaryWords = val
  };
  setEntitiesForm = (val: EntitiesForm) => {
    this.entitiesForm = val
  };

  getDepArray() {
    return [
      this.isDisplayingConfidence,
      this.isFilteringProfanities,
      this.isShowingDisfluencies,
      this.isMarkingCustomDictionaryWords,
      this.entitiesForm
    ]
  }

}