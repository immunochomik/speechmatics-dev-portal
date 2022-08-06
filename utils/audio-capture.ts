export class AudioRecorder {
  streamBeingCaptured: MediaStream;
  mediaRecorder: MediaRecorder;

  dataHandlerCallback?: (data) => void;

  constructor(callback: (data: Blob) => void) {
    this.dataHandlerCallback = callback;
  }

  assignCallback(callback: (data: Blob) => void) {
    this.dataHandlerCallback = callback;
    return this;
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

      return navigator.mediaDevices.getUserMedia({ audio }).then((stream) => {
        console.log(`getUserMedia stream`, stream);

        this.streamBeingCaptured = stream;

        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
          this.dataHandlerCallback?.(event.data);
        });

        this.mediaRecorder.start(300);
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
