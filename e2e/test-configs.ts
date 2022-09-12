interface E2ETestConfigs {
  msToWait: number, // microseconds to wait after some action
  transcriptionTests: {
    checkTranscriberState: boolean, // use provisioning API to assert if transcribers are being utilized. WARNING: the cluster must NOT be in use!

  }
}

const configs : E2ETestConfigs = {
  msToWait: 2500,
  transcriptionTests: {
    checkTranscriberState: false
  }
}

export default configs;