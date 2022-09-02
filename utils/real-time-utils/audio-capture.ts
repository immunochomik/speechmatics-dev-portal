export class AudioRecorder {
  streamBeingCaptured: MediaStream;
  mediaRecorder: MediaRecorder;

  audioContext: AudioContext;
  mediaStreamSource: MediaStreamAudioSourceNode;
  scriptProcessor: ScriptProcessorNode;

  dataHandlerCallback?: (data: Float32Array) => void;
  onMicrophoneBlocked?: (err: any) => void;
  onMicrophoneAllowed?: () => void;

  constructor(
    dataHandlerCallback: (data: Float32Array) => void,
    onMicrophoneBlocked: (err: any) => void,
    onMicrophoneAllowed: () => void
  ) {
    this.dataHandlerCallback = dataHandlerCallback;
    this.onMicrophoneAllowed = onMicrophoneAllowed;
    this.onMicrophoneBlocked = onMicrophoneBlocked;
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

      return navigator.mediaDevices.getUserMedia({ audio }).then((stream) => {
        console.log(`getUserMedia stream`, stream);

        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        this.mediaStreamSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);
        this.scriptProcessor.addEventListener('audioprocess', (ev: AudioProcessingEvent) => {
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
            return;
          })
      );
    }
    return;
  }

  async promptPermissions() {
    if (this.devices === null) {
      return await navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
          this.onMicrophoneAllowed();
          return true;
        })
        .catch((err) => {
          console.log(err);
          this.onMicrophoneBlocked?.(err);
          return false;
        });
    }
  }

  async getAudioInputs() {
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
    if (this.devices === null) {
      success = await navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          stream.getAudioTracks().forEach((track) => (track.enabled = true));
          this.onMicrophoneAllowed();
          return true;
        })
        .catch((err) => {
          console.log(err);
          this.onMicrophoneBlocked?.(err);
          return false;
        });
    }

    if (!success) return [];

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
