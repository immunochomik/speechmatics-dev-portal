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
      return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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

  stopStream() {
    this.streamBeingCaptured?.getTracks().forEach((track) => track.stop()); //stop each one
  }

  resetRecordingProperties() {
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;
  }
}

export default AudioRecorder;
