import ILinnApiFacade from "./ILinnApiFacade";
import { SpeakerEndpoint, IEndpoint } from "../models/Alexa";
import * as webRequest from 'web-request';

interface AssociatedDevice {
    id: string;
    serialNumber: string;
    category: string;
    model: string;
    name: string;
    links: LinkResource[];
}

interface LinkResource {
    rel: string;
    href: string;
}

class LinnApiFacade implements ILinnApiFacade {
    constructor(private apiRoot : string) {
    }

    private headers(token : string) {
        return {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
    }

    async list(token : string): Promise<IEndpoint[]> {
        let devices = await webRequest.json<AssociatedDevice[]>(`${this.apiRoot}/devices/`, this.headers(token));
        
        return devices.map(d => new SpeakerEndpoint(d.id, d.name, d.model));
    }

    async setStandby(deviceId : string, value : boolean, token : string): Promise<void> {
        if (value) {
            await webRequest.put(`${this.apiRoot}/devices/${deviceId}/standby`, this.headers(token));
        } else {
            await webRequest.delete(`${this.apiRoot}/devices/${deviceId}/standby`, this.headers(token));
        }
    }

    async play(deviceId : string, token : string) : Promise<void> {
        await webRequest.put(`${this.apiRoot}/players/${deviceId}/play`, this.headers(token));
    }

    async pause(deviceId : string, token : string) : Promise<void> {
        await webRequest.put(`${this.apiRoot}/players/${deviceId}/pause`, this.headers(token));
    }

    async stop(deviceId : string, token : string) : Promise<void> {
        await webRequest.put(`${this.apiRoot}/players/${deviceId}/stop`, this.headers(token));
    }

    async next(deviceId : string, token : string) : Promise<void> {
        await webRequest.post(`${this.apiRoot}/players/${deviceId}/next`, this.headers(token));
    }

    async prev(deviceId : string, token : string) : Promise<void> {
        await webRequest.post(`${this.apiRoot}/players/${deviceId}/prev`, this.headers(token));
    }

    async setMute(deviceId : string, value : boolean, token : string) : Promise<void> {
        if (value) {
            await webRequest.put(`${this.apiRoot}/players/${deviceId}/mute`, this.headers(token));
        } else {
            await webRequest.delete(`${this.apiRoot}/players/${deviceId}/mute`, this.headers(token));
        }
    }

    async adjustVolume(deviceId : string, steps : number, token : string) : Promise<void> {
        await webRequest.post(`${this.apiRoot}/players/${deviceId}/volume?steps=${steps}`, this.headers(token));
    }

    async setVolume(deviceId : string, level : number, token : string) : Promise<void> {
        await webRequest.put(`${this.apiRoot}/players/${deviceId}/volume?level=${level}`, this.headers(token));
    }
}

export default LinnApiFacade