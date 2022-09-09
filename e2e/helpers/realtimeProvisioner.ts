/***
 * This file provisions functions that wrap the RT Provisioner API endpoint.
 *
 * At the moment, only implements functionality to probe transcribers
 * by language, type, and status.
 *
 ***/
import fetch from "node-fetch"

export type TranscriberStatus = "idle" | "busy";
export type TranscriberLanguage = "en";
export type TranscriberType = "realtime";

export class RTProvisioner {
  endpoint: string;
  constructor(realtimeProvisionerEndpoint: string) {
    this.endpoint = realtimeProvisionerEndpoint;
  }
  async getTranscribers(lang: TranscriberLanguage, type: TranscriberType, status: TranscriberStatus) {
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
      throw new Error("API call to RT Provisioner failed!");
    }
  }
  async getNumTranscribers(lang: TranscriberLanguage, type: TranscriberType) {
    const nIdle = (await this.getTranscribers(lang, type, 'idle')).length;
    const nBusy = (await this.getTranscribers(lang, type, 'busy')).length;
    return {
      idle: <number> nIdle,
      busy: <number> nBusy
    }
  }
}

export default () => new RTProvisioner(<string>process.env.RUNTIME_PROVISION_API_URL);