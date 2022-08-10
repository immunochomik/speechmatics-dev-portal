import { makeAutoObservable } from 'mobx';
import { runtimeAuthFlow } from '../runtime-auth-flow';
import { AudioRecorder } from './audio-capture';
import { RealtimeSocketHandler } from './real-time-socket-handler';
import { RtConfigurationStore, RtTranscriptionStore, RealtimeDisplayOptionsStore } from './real-time-transcription-store';

export type MaxDelayMode = 'fixed' | 'flexible';
export type LanguageDomain = 'default' | 'finance';
export type EntitiesForm = 'written' | 'spoken';
export type RealTimeFlowStage = 'form' | 'starting' | 'running' | 'error' | 'stopping' | 'stopped';

const realtimeURI = process.env.REALTIME_URI || 'wss://debby.zennzei2.p5.tiktalik.io:8080';

class RealtimeStoreFlow {
  config: RtConfigurationStore;
  transcription: RtTranscriptionStore;
  socketHandler: RealtimeSocketHandler;
  audioHandler: AudioRecorder;
  transcriptDisplayOptions: RealtimeDisplayOptionsStore;

  errors: { error: string; data: any }[] = [];

  constructor() {
    makeAutoObservable(this);

    this.config = new RtConfigurationStore();
    this.transcriptDisplayOptions = new RealtimeDisplayOptionsStore();
    this.transcription = new RtTranscriptionStore(
      this.config,
      this.transcriptDisplayOptions
    );

    this.socketHandler = new RealtimeSocketHandler(realtimeURI, {
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
    this.stage = 'error';
  };

  startTranscription = async () => {
    this.stage = 'starting';
    await runtimeAuthFlow.refreshToken(); //todo handle error from obtaining the token

    this.audioHandler.startRecording().then(
      () => {
        this.socketHandler
          .connect(runtimeAuthFlow.store.secretKey)
          .then(() => {
            return this.socketHandler.startRecognition(this.config.getTranscriptionConfig());
          })
          .then(
            () => {
              this.startCountdown(this.stopTranscription);
            },
            (recognitionError) => {
              console.error('recognition error', recognitionError)
              this.errorHandler(recognitionError);
            }
          )
          .catch((socketError) => {
            console.error('socket error', socketError);
            this.errorHandler(socketError);
          });
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
      this.config.reset();
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
    this.config.reset();
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
