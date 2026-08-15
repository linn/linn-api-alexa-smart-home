import ILinnApiFacade, { InvalidAuthorizationCredentialError,NoSuchEndpointError, EndpointUnreachableError, EndpointInternalError, InvalidValueError } from "./ILinnApiFacade";
import { SpeakerEndpoint, IEndpoint } from "../models/Alexa";

// The Linn API is reached with the runtime's own fetch. It replaced the web-request package, which
// was last published in 2017, pulled Node type definitions of its own into the compile, and did
// nothing here that fetch does not - leaving this service with a single runtime dependency.

interface IAssociatedDeviceResource {
    id: string;
    serialNumber: string;
    category: string;
    model: string;
    name: string;
    links: ILinkResource[];
}

interface IDeviceSourceResource {
    id: string;
    name: string;
    visible: boolean;
}

interface IPlayerResource {
    id: string;
    name: string;
    sources: IDeviceSourceResource[];
    links: ILinkResource[];
}

interface ILinkResource {
    rel: string;
    href: string;
}

interface IApiResponse {
    statusCode : number;
    content : string | null;
}

function headers(token : string) {
    return {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function apiJson<T>(uri : string, token : string) : Promise<T> {
    let response = await fetch(uri, { headers: headers(token) });
    return await response.json() as T;
}

async function apiRequest(method : string, uri : string, token : string) : Promise<IApiResponse> {
    let response = await fetch(uri, { method, headers: headers(token) });
    let content = await response.text();
    return { statusCode: response.status, content: content.length > 0 ? content : null };
}

class LinnApiFacade implements ILinnApiFacade {
    constructor(private apiRoot : string) {
    }

    async list(token : string): Promise<IEndpoint[]> {
        let devicesPromise = apiJson<IAssociatedDeviceResource[]>(`${this.apiRoot}/devices/`, token);
        let playersPromise = apiJson<IPlayerResource[]>(`${this.apiRoot}/players/`, token);

        let devices = await devicesPromise;
        let players = await playersPromise;

        return devices
          .map((d) => {
            let player = players.find((p) => p.id === d.id);
            if (player) {
              let playerSources = player.sources || [];
              let sources = playerSources
                .filter((s) => s.visible)
                .map((s) => {
                  return { name: s.name };
                });
              return new SpeakerEndpoint(d.id, d.name, d.model, sources);
            }
            return null;
          })
          .filter((x) => x !== null);
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

    async setSource(deviceId : string, sourceId : string, token : string) : Promise<void> {
        await apiPut(`${this.apiRoot}/players/${deviceId}/source?sourceId=${sourceId}`, token);
    }

    async invokeDevicePin(deviceId: string, pinId : number, token : string) : Promise<void> {
        await apiPut(`${this.apiRoot}/players/${deviceId}/play?pinId=${pinId}`, token);
    }
}

async function apiPut(uri : string, token : string) {
    checkForErrors(await apiRequest('PUT', uri, token));
}

async function apiDelete(uri : string, token : string) {
    checkForErrors(await apiRequest('DELETE', uri, token));
}

async function apiPost(uri : string, token : string) {
    checkForErrors(await apiRequest('POST', uri, token));
}

function checkForErrors(response : IApiResponse) {
    if (response.statusCode >= 400) {
        let body : { error : string } = response.content ? JSON.parse(response.content) : null;
        switch (response.statusCode) {
            case 401:
            case 403:
                throw new InvalidAuthorizationCredentialError(generateErrorMessage(body, response.statusCode));
            case 404:
                if (body.error === 'ClientPlayerNotFoundException' || body.error === 'ClientDeviceNotFoundException') {
                    throw new NoSuchEndpointError(generateErrorMessage(body, response.statusCode));
                } else {
                    throw new InvalidValueError(generateErrorMessage(body, response.statusCode));
                }
            case 504:
                throw new EndpointUnreachableError(generateErrorMessage(body, response.statusCode));
            default:
                throw new EndpointInternalError(generateErrorMessage(body, response.statusCode));
        }
    }
}

function generateErrorMessage(body : { error : string }, statusCode : number) : string {
    return body && body.error 
        ? `Linn API Error: ${body.error}, Status Code: ${statusCode}`
        : `Linn API Error: Status Code: ${statusCode}`
}

export default LinnApiFacade