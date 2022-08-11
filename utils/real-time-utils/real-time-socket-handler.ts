/**
 * Speech service main api class
 */

import { TranscriptResult } from '../../custom';

export const enum MessageType {
  RECOGNITION_STARTED = 'RecognitionStarted',
  ADD_PARTIAL_TRANSCRIPT = 'AddPartialTranscript',
  ADD_DYNAMIC_TRANSCRIPT = 'AddDynamicTranscript',
  ADD_TRANSCRIPT = 'AddTranscript',
  AUDIO_ADDED = 'AudioAdded',
  END_OF_STREAM = 'EndOfStream',
  END_OF_TRANSCRIPT = 'EndOfTranscript',
  ERROR = 'Error',
  INFO = 'Info',
  WARNING = 'Warning',
  START_RECOGNITION = 'StartRecognition',
  SET_RECOGNITION_CONFIG = 'SetRecognitionConfig',
  ADD_AUDIO = 'AddAudio'
}

export type Sub = {
  onRecognitionStart: () => void;
  onRecognitionEnd: () => void;
  onFullReceived: (data: any) => void;
  onPartialReceived: (data: any) => void;
  onWarning?: (data: any) => void;
  onError?: (data: any) => void;
  onInfo?: (data: any) => void;
  onDisconnect?: () => void;
};

export class RealtimeSocketHandler {
  private socketWrap: ISocketWrapper;

  private seqNoIn: number = 0;

  private startRecognitionResolve?: (value?: any) => void;
  private stopRecognitionResolve?: (value?: any) => void;
  private rejectPromise?: (error?: any | Error) => void; //used on both: start & stop

  private sub: Sub;

  constructor(sub: Sub) {
    this.sub = sub;
    this.socketWrap = new WebSocketWrapper();

    this.socketWrap.onMessage = this.onSocketMessage;
    this.socketWrap.onError = this.onSocketError;
    this.socketWrap.onDisconnect = this.onSocketDisconnect;
  }

  audioDataHandler = async (data: Blob) => {
    const arrayBuffer = await data.arrayBuffer();
    try {
      this.sendAudioBuffer(new Float32Array(arrayBuffer));
    } catch (err) {}
  };

  async connect(runtimeURL: string, runtimeKey?: string): Promise<void> {
    this.seqNoIn = 0;
    return this.socketWrap.connect(runtimeURL + (runtimeKey ? '?jwt=' + runtimeKey : ''));
  }

  async disconnect(): Promise<void> {
    return this.socketWrap.disconnect();
  }

  isConnected(): boolean {
    return this.socketWrap.isOpen();
  }

  sendAudioBuffer(pcmData: Float32Array): void {
    this.socketWrap.sendAudioBuffer(pcmData.buffer);
  }

  async startRecognition(transcriptionConfig: TranscriptionConfig): Promise<void> {
    const config = this.constructConfigMessage(transcriptionConfig);
    this.socketWrap.sendMessage(JSON.stringify(config));

    this.seqNoIn = 0;

    return new Promise((resolve, reject): void => {
      this.startRecognitionResolve = resolve;
      this.rejectPromise = reject;
    });
  }

  async stopRecognition(): Promise<void> {
    console.log('SSC stopRecognition');
    if (!this.socketWrap.isOpen()) {
      return;
    }

    const stopMessage: string = JSON.stringify({
      message: MessageType.END_OF_STREAM,
      last_seq_no: this.seqNoIn
    });

    this.socketWrap.sendMessage(stopMessage);

    return new Promise((resolve, reject): void => {
      this.stopRecognitionResolve = resolve;
      this.rejectPromise = reject;
    });
  }

  private onSocketMessage = (data: TranscriptionResponse): void => {
    switch (data.message) {
      case MessageType.RECOGNITION_STARTED:
        this.sub?.onRecognitionStart?.();
        this.startRecognitionResolve?.();
        break;

      case MessageType.AUDIO_ADDED:
        this.seqNoIn = data.seq_no || 0;
        break;

      case MessageType.WARNING:
        this.sub?.onWarning?.(data);
        break;

      case MessageType.ADD_TRANSCRIPT:
        this.seqNoIn++;
        this.sub?.onFullReceived?.(data);
        break;

      case MessageType.ADD_PARTIAL_TRANSCRIPT:
        this.sub?.onPartialReceived?.(data);
        break;

      case MessageType.END_OF_TRANSCRIPT:
        this.stopRecognitionResolve?.();
        this.sub?.onRecognitionEnd?.();
        break;

      case MessageType.ERROR:
        this.sub?.onError?.(data);
        this.rejectPromise?.(data as Error);
        break;

      case MessageType.INFO:
        this.sub?.onInfo?.(data);
        break;

      default:
        throw new Error('Unexpected message');
    }
  };

  updateLiveConfig({ maxDelay = undefined, enablePartials = undefined, maxDelayMode = undefined }) {
    this.socketWrap.sendMessage(
      JSON.stringify({
        message: MessageType.SET_RECOGNITION_CONFIG,
        transcription_config: {
          max_delay: maxDelay,
          enable_partials: enablePartials,
          max_delay_mode: maxDelayMode
        }
      })
    );
  }

  private constructConfigMessage(config: any) {
    let configMessage: TransciptionMessageConfig = {
      message: MessageType.START_RECOGNITION,
      audio_format: {
        type: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 44100 //
      },
      transcription_config: config
    };

    return configMessage;
  }

  private onSocketDisconnect = () => {
    this.sub.onDisconnect?.();
  };

  private onSocketError = (event: Event) => {
    this.sub.onError?.(event);
    this.rejectPromise?.(event);
  };
}

interface ISocketWrapper {
  onMessage?: (data: any) => void;
  onError?: (event: ErrorEvent) => void;
  onDisconnect?: () => void;
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  sendAudioBuffer(buffer: ArrayBuffer): void;
  sendMessage(message: any): void;
  isOpen(): boolean;
}

/**
 * Wraps the socket api to be more useful in async/await kind of scenarios
 */
export class WebSocketWrapper implements ISocketWrapper {
  private socket?: WebSocket;
  private connectResolve?: () => void;
  private connectReject?: (event: Event) => void;
  private disconnectResolve?: () => void;

  onDisconnect?: () => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;

  constructor() {}

  async connect(url: string): Promise<void> {
    try {
      this.socket = new window.WebSocket(url);
    } catch (error) {
      return Promise.reject(error);
    }

    this.socket.binaryType = 'arraybuffer';

    this.socket.addEventListener('open', this.handleSocketOpen);
    this.socket.addEventListener('error', this.handleSocketError);
    this.socket.addEventListener('close', this.handleSocketClose);
    this.socket.addEventListener('message', this.handleSocketMessage);

    window.addEventListener('onbeforeunload', this.windowOnBeforeUnload);

    return new Promise((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;
    });
  }

  async disconnect(): Promise<void> {
    if (this.socket && this.isOpen()) this.socket.close();
    else throw new Error('Error. Socket not opened.');

    return new Promise((resolve) => {
      this.disconnectResolve = resolve;
    });
  }

  sendAudioBuffer(buffer: ArrayBuffer): void {
    if (this.socket && this.isOpen()) {
      this.socket.send(buffer);
    } else {
      throw new Error('Error. Socket not opened.');
    }
  }

  sendMessage(message: string): void {
    if (this.socket && this.isOpen()) {
      this.socket.send(message);
    } else throw new Error('Error. Socket not opened.');
  }

  isOpen(): boolean {
    return (
      this.socket !== null &&
      this.socket !== undefined &&
      this.socket.readyState === window.WebSocket.OPEN
    );
  }

  private handleSocketOpen = (event: Event): void => {
    this.connectResolve?.();
  };

  private handleSocketError = (event: Event): void => {
    console.log('socket error', event);
    this.connectReject?.(event);
    this.onError?.(event);
  };

  private handleSocketClose = (event: CloseEvent): void => {
    console.log('socket close', event);
    if (this.socket) {
      this.socket.removeEventListener('open', this.handleSocketOpen);
      this.socket.removeEventListener('error', this.handleSocketError);
      this.socket.removeEventListener('close', this.handleSocketClose);
      this.socket.removeEventListener('message', this.handleSocketMessage);
    }

    this.onDisconnect?.();
    this.disconnectResolve?.();
  };

  private handleSocketMessage = (event: MessageEvent): void => {
    this.onMessage?.(JSON.parse(event.data));
  };

  private windowOnBeforeUnload = (event: Event): void => {
    this.socket?.close();
  };
}

type InputAudioFormat = {
  ['type']: string | 'raw';
  encoding: string | 'pcm_f32le';
  sample_rate: number;
};

export type TransciptionMessageConfig = {
  message: MessageType;
  last_seq_no?: number;
  audio_format?: InputAudioFormat;
  transcription_config: TranscriptionConfig;
};

export type TranscriptionConfig = {
  language: string;
  output_locale: string;
  additional_vocab?: { content: string }[];
  enable_partials: boolean;
  max_delay?: number;
  diarization?: 'speaker' | 'speaker_change' | 'none';
  speaker_change_sensitivity?: number;
  speaker_diarization_config?: { max_speakers: number };
  punctuation_overrides?: { permitted_marks: string[]; sensitivity: number };
  operating_point?: 'standard' | 'enhanced';
  max_delay_mode?: 'fixed' | 'flexible';
  enable_entities?: boolean;
  domain?: 'finance';
};

export type TransciptionLiveSocketConfig = {
  message: MessageType;
  last_seq_no?: number;
  audio_format?: InputAudioFormat;
  transcription_config?: TranscriptionConfig;
};

export type TranscriptionResponse = {
  message: MessageType;
  reason?: string;
  seq_no?: number;
  metadata?: {
    start_time?: number;
    end_time?: number;
    transcript: string;
  };
  results?: TranscriptResult[];
};
