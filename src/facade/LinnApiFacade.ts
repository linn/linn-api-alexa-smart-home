import ILinnApiFacade, { InvalidAuthorizationCredentialError,NoSuchEndpointError, EndpointUnreachableError, EndpointInternalError } from "./ILinnApiFacade";
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

function headers(token : string) {
    return {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
}

class LinnApiFacade implements ILinnApiFacade {
    constructor(private apiRoot : string) {
    }

    async list(token : string): Promise<IEndpoint[]> {
        let devices = await webRequest.json<AssociatedDevice[]>(`${this.apiRoot}/devices/`, headers(token));
        
        return devices.map(d => new SpeakerEndpoint(d.id, d.name, d.model));
    }

    async setStandby(deviceId : string, value : boolean, token : string): Promise<void> {
        if (value) {
            await apiPut(`${this.apiRoot}/devices/${deviceId}/standby`, token);
        } else {
            await apiDelete(`${this.apiRoot}/devices/${deviceId}/standby`, token);
        }
    }

    async play(deviceId : string, token : string) : Promise<void> {
        await apiPut(`${this.apiRoot}/players/${deviceId}/play`, token);
    }

    async pause(deviceId : string, token : string) : Promise<void> {
        await apiPut(`${this.apiRoot}/players/${deviceId}/pause`, token);
    }

    async stop(deviceId : string, token : string) : Promise<void> {
        await apiPut(`${this.apiRoot}/players/${deviceId}/stop`, token);
    }

    async next(deviceId : string, token : string) : Promise<void> {
        await apiPost(`${this.apiRoot}/players/${deviceId}/next`, token);
    }

    async prev(deviceId : string, token : string) : Promise<void> {
        await apiPost(`${this.apiRoot}/players/${deviceId}/prev`, token);
    }

    async setMute(deviceId : string, value : boolean, token : string) : Promise<void> {
        if (value) {
            await apiPut(`${this.apiRoot}/players/${deviceId}/mute`, token);
        } else {
            await apiDelete(`${this.apiRoot}/players/${deviceId}/mute`, token);
        }
    }

    async adjustVolume(deviceId : string, steps : number, token : string) : Promise<void> {
        await apiPost(`${this.apiRoot}/players/${deviceId}/volume?steps=${steps}`, token);
    }

    async setVolume(deviceId : string, level : number, token : string) : Promise<void> {
        await apiPut(`${this.apiRoot}/players/${deviceId}/volume?level=${level}`, token);
    }
}

async function apiPut(uri : string, token : string) {
    var response = await webRequest.put(uri, headers(token));
    if (response.statusCode >= 400) {
        switch (response.statusCode) {
            case 401:
            case 403:
                throw new InvalidAuthorizationCredentialError();
            case 404:
                throw new NoSuchEndpointError();
            case 504:
                throw new EndpointUnreachableError();
            default:
                throw new EndpointInternalError();
        }
    }
}

async function apiDelete(uri : string, token : string) {
    await webRequest.delete(uri, headers(token));
}

async function apiPost(uri : string, token : string) {
    await webRequest.post(uri, headers(token));
}

export default LinnApiFacade