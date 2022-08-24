export type Stage = 'form' | 'pendingFile' | 'pendingTranscription' | 'failed' | 'complete';
export type Accuracy = 'enhanced' | 'standard';
export type Separation = 'none' | 'speaker' | 'channel';
export type JobStatus = 'running' | 'done' | 'rejected' | '';
export type TranscriptFormat = 'json-v2' | 'text' | 'srv';

export const separation: readonly {
  label: string;
  value: Separation;
  default?: boolean;
}[] = [
  { label: 'None', value: 'none', default: true },
  { label: 'Speaker', value: 'speaker' }
  // { label: 'Channel', value: 'channel' }
] as const;

export const accuracyModels: readonly {
  label: string;
  value: Accuracy;
  default?: boolean;
}[] = [
  { label: 'Enhanced', value: 'enhanced', default: true },
  { label: 'Standard', value: 'standard' }
] as const;

export const enum FlowError {
  CouldntFetchSecret,
  FileTooBig,
  FileWrongType,
  ServerFileReceivedWrong,
  ServerJobFailed,
  BeyondFreeQuota,
  BeyondAllowedQuota,
  ContractExpired,
  UndefinedForbiddenError,
  UndefinedError
}

export const checkIfFileCorrectType = (file: File) =>
  [
    'audio/mp4',
    'audio/m4a',
    'audio/mpeg',
    'audio/x-wav',
    'audio/wav',
    'application/ogg',
    'audio/x-m4a',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/amr',
    'video/mpeg',
    'video/mp4'
  ].includes(file.type);

const languages = [
  { label: 'Arabic', value: 'ar' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Catalan', value: 'ca' },
  { label: 'Danish', value: 'da' },
  { label: 'English', value: 'en', default: true },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Polish', value: 'pl' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Spanish', value: 'es' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Mandarin', value: 'cmn' },
  { label: 'Norwegian', value: 'no' },
  { label: 'Bulgarian', value: 'bg' },
  { label: 'Czech', value: 'cs' },
  { label: 'Finnish', value: 'fi' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Croatian', value: 'hr' },
  { label: 'Lithuanian', value: 'lt' },
  { label: 'Latvian', value: 'lv' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Slovak', value: 'sk' },
  { label: 'Slovenian', value: 'sl' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Malay', value: 'ms' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Cantonese', value: 'yue' },
  { label: 'Greek', value: 'el' }
] as const;

export type LanguageShort = typeof languages[number]['value'];

export type Language = { label: string; value: LanguageShort; default?: boolean };

export const languagesData = languages as readonly Language[];

export const getFullLanguageName = (value: LanguageShort) =>
  languagesData.find((el) => el.value == value)?.label;

export const partialsData = [
  { label: 'Enabled', value: true, default: true },
  { label: 'Disabled', value: false }
];

export const languageDomains = [
  { label: 'Default', value: 'default', default: true },
  { label: 'Finance', value: 'finance' }
];

export type CustomDictElement = {
  content: string;
  soundslike?: string[];
};
