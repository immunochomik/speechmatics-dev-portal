export class AudioRecorder {
  streamBeingCaptured: MediaStream;
  mediaRecorder: MediaRecorder;

  audioContext: AudioContext;

  dataHandlerCallback?: (data) => void;

  constructor(callback: (data: Float32Array) => void) {
    this.dataHandlerCallback = callback;
    const AudioContext = globalThis.window?.AudioContext;
    if (AudioContext) this.audioContext = new AudioContext();
  }

  async startRecording() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      return Promise.reject(
        new Error('mediaDevices API or getUserMedia method is not supported in this browser.')
      );
    } else {
      // { audio: {deviceId: micDeviceId} }
      let audio: boolean | { deviceId: string } = true;
      if (this.audioDeviceId) audio = { deviceId: this.audioDeviceId };

      const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      return navigator.mediaDevices.getUserMedia({ audio }).then((stream) => {
        console.log(`getUserMedia stream`, stream);

        const mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        mediaStreamSource.connect(scriptProcessor);
        scriptProcessor.connect(this.audioContext.destination);
        scriptProcessor.addEventListener('audioprocess', (ev: AudioProcessingEvent) => {
          this.dataHandlerCallback?.(ev.inputBuffer.getChannelData(0));
        });

        this.streamBeingCaptured = stream;

        /*
        this.mediaRecorder = new MediaRecorder(stream, {
          audioBitsPerSecond: 128000
        });

        this.mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
          this.dataHandlerCallback?.(event.data);
        });

        this.mediaRecorder.start(1000);
        */
      });
    }
  }

  async stopRecording() {
    this.mediaRecorder?.stop();

    this.stopStream();

    this.resetRecordingProperties();
  }

  private stopStream() {
    this.streamBeingCaptured?.getTracks().forEach((track) => track.stop()); //stop each one
  }

  private resetRecordingProperties() {
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;
  }

  async getAudioInputs() {
    if (this.devices === null) {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
    }
    return navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
      this.devices = devices;
      return devices.filter((device: MediaDeviceInfo) => {
        return device.kind == 'audioinput';
      });
    });
  }

  private devices: MediaDeviceInfo[] = null;

  private _audioDeviceId: string;
  get audioDeviceId(): string {
    return this._audioDeviceId;
  }
  set audioDeviceId(value: string) {
    this._audioDeviceId = value;
  }

  getAudioInputName() {
    return this.devices?.find((dev) => dev.deviceId == this.audioDeviceId)?.label;
  }
}

export default AudioRecorder;
