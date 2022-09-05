import fetch from "node-fetch"

export type TranscriberStatus = "idle" | "busy";
export type TranscriberLanguage = "en";
export type TranscriberType = "realtime";

class RTProvisioner {
  endpoint: string;
  constructor(realtimeProvisionerEndpoint: string) {
    this.endpoint = realtimeProvisionerEndpoint;
  }
  async getNumTranscribers(lang: TranscriberLanguage, type: TranscriberType, status: TranscriberStatus) {
    const response = await fetch(`${this.endpoint}/transcribers?lang=${lang}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TEST_TOKEN}`,
        Accept: "application/json"
      },
      
    });
    const responseBody = await response.json();
    if (response.status === 200) {
      return responseBody.transcribers.filter((t)=>{
        const _type = type ? t.type === type : true;
        const _status = status ? t.status === status : true;
        return _type && _status;
      })
    } else {
      throw new Error("API call failed!");
    }
  }
}

export default () => new RTProvisioner(process.env.RUNTIME_PROVISION_API_URL)