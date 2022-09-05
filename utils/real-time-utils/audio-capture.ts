export class AudioRecorder {
  streamBeingCaptured: MediaStream;
  mediaRecorder: MediaRecorder;
  checkingPermission: boolean = false;
  audioContext: AudioContext;
  mediaStreamSource: MediaStreamAudioSourceNode;
  scriptProcessor: ScriptProcessorNode;
  dataHandlerCallback?: (data: Float32Array) => void;
  onMicrophoneBlocked?: (err: any, denied: boolean) => void;
  onMicrophoneAllowed?: () => void;
  openPermissionsModal?: () => void;

  constructor(
    dataHandlerCallback: (data: Float32Array) => void,
    onMicrophoneBlocked: (err: any, denied: boolean) => void,
    onMicrophoneAllowed: () => void,
    openPermissionsModal: () => void
  ) {
    this.dataHandlerCallback = dataHandlerCallback;
    this.onMicrophoneAllowed = onMicrophoneAllowed;
    this.onMicrophoneBlocked = onMicrophoneBlocked;
    this.openPermissionsModal = openPermissionsModal;
  }

  async startRecording() {
    const AudioContext = globalThis.window?.AudioContext;
    if (AudioContext) this.audioContext = new AudioContext();
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      return Promise.reject(
        new Error('mediaDevices API or getUserMedia method is not supported in this browser.')
      );
    } else {
      // { audio: {deviceId: micDeviceId} }
      let audio: boolean | { deviceId: string } = true;
      if (this.audioDeviceId) audio = { deviceId: this.audioDeviceId };

      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // this timeout gives the system a brief window to check if the user already has permission
      let checking = true;
      setTimeout(() => {
        if (checking) this.openPermissionsModal();
      }, 500);
      return navigator.mediaDevices
        .getUserMedia({ audio })
        .then(async (stream) => {
          // If we haven't already got devices, do it now in the background
          if (!this.devices.length) {
            this.getAudioInputs(false);
          }
          checking = false;
          console.log(`getUserMedia stream`, stream);

          this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
          this.mediaStreamSource.connect(this.scriptProcessor);
          this.scriptProcessor.connect(this.audioContext.destination);
          this.scriptProcessor.addEventListener('audioprocess', (ev: AudioProcessingEvent) => {
            this.dataHandlerCallback?.(ev.inputBuffer.getChannelData(0));
          });

          this.streamBeingCaptured = stream;
          this.onMicrophoneAllowed();
        })
        .catch((err) => {
          checking = false;
          this.onMicrophoneBlocked(err, true);
          throw err;
        });
    }
  }

  async stopRecording() {
    // this.mediaRecorder?.stop();

    this.mediaStreamSource?.disconnect();
    this.scriptProcessor?.disconnect();

    this.stopStream();

    this.resetRecordingProperties();
  }

  private stopStream() {
    this.streamBeingCaptured?.getTracks().forEach((track) => track.stop()); //stop each one
  }

  private resetRecordingProperties() {
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;
    this.mediaStreamSource = null;
    this.scriptProcessor = null;
  }

  async getPermissions() {
    if (!!navigator?.permissions) {
      return (
        navigator.permissions
          // @ts-ignore - ignore because microphone is not in the enum of name for all browsers
          ?.query({ name: 'microphone' })
          .then((result) => result.state)
          .catch((err) => {
            return 'prompt';
          })
      );
    }
    return 'prompt';
  }

  async getAudioInputs(openModal = true) {
    let success = true;
    if (this.devices.length === 0 && (await this.getPermissions()) === 'prompt') {
      let checking = true;
      setTimeout(() => {
        checking && openModal && this.openPermissionsModal();
      }, 400);
      success = await navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          checking = false;
          stream.getTracks().forEach((track) => track.stop());
          this.onMicrophoneAllowed();
          return true;
        })
        .catch((err) => {
          checking = false;
          console.log(err);
          this.onMicrophoneBlocked?.(err, true);
          return false;
        });
    }

    if (!success) return null;

    return await navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
      const filtered = devices.filter((device: MediaDeviceInfo) => {
        return device.kind == 'audioinput';
      });

      // If labels are null, try opening streams to get labels (this is a Firefox issue)
      if (!filtered[0].label) {
        return this.getAudioInputsOpenStreams();
      }

      this.devices = filtered;

      if (!this.audioDeviceId) this.audioDeviceId = filtered[0].deviceId;

      return filtered;
    });
  }

  // NOTE: this function opens streams as Firefox only allows read access to open streams
  // - we do this just to populate the streams list and then close them
  async getAudioInputsOpenStreams() {
    let success = true;
    // get and open streams
    if (this.devices.length === 0) {
      success = await navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          stream.getAudioTracks().forEach((track) => (track.enabled = true));
          this.onMicrophoneAllowed();
          return true;
        })
        .catch((err) => {
          console.log(err);
          this.onMicrophoneBlocked?.(err, true);
          return false;
        });
    }

    if (!success) return null;

    // actually enumerate devices
    let filtered = await navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        const filtered = devices.filter((device: MediaDeviceInfo) => {
          return device.kind == 'audioinput';
        });

        this.devices = filtered;

        if (!this.audioDeviceId) this.audioDeviceId = filtered[0].deviceId;

        return filtered;
      });

    // Close the audio streams
    await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    return filtered;
  }

  devices: MediaDeviceInfo[] = [];

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
