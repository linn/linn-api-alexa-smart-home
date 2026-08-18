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

// `redirect: 'manual'` and a timeout, on both call sites, for reasons that only apply since the move
// to fetch.
//
// REDIRECTS ARE NOT FOLLOWED. The library this replaced did not follow them on any method; fetch
// follows them on all of them. So a 302 on a PUT was re-issued against the redirect target, the final
// status was that target's 200, and the skill told the customer the command had succeeded - having sent
// it somewhere else. Not following means checkForErrors sees the 3xx and can refuse it.
//
// THE TIMEOUT IS THE ONLY THING THAT PRODUCES A DIAGNOSABLE FAILURE FROM A HUNG API. undici's default
// is 300s, far outside the function's 7s ceiling, so a Linn API that accepts the connection and stalls
// used to end as `Task timed out`: the catch in Handler.ts never runs, so there is no ErrorResponse for
// Alexa and NO log line at all - the invocation vanishes. 5s leaves room to map the AbortError to
// ENDPOINT_UNREACHABLE in timedFetch below and write that line inside the 7s budget. InputControlHandler issues two
// sequential calls, so this is per-call rather than per-invocation and the worst case is still bounded
// by the function timeout rather than by this value.
const REQUEST_TIMEOUT_MS = 5000;

// The timeout is only worth having if it produces an Alexa error rather than an unrecognised throw.
// AbortSignal.timeout rejects with a DOMException named TimeoutError; an abort from any other cause is
// named AbortError. Neither is anything checkForErrors can see, because fetch never returns - so without
// this they reach Handler's catch as an unmapped error and the customer is told INTERNAL_ERROR, which
// invites them to retry a device that is fine. ENDPOINT_UNREACHABLE is the truthful answer and the one
// Alexa words usefully.
async function timedFetch(uri : string, init : RequestInit) : Promise<Response> {
    try {
        return await fetch(uri, { ...init, redirect: 'manual', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    }
    catch (error) {
        let name = (error as { name? : string }).name;
        if (name === 'TimeoutError' || name === 'AbortError') {
            throw new EndpointUnreachableError(`The Linn API did not respond within ${REQUEST_TIMEOUT_MS}ms`);
        }
        throw error;
    }
}

async function apiJson<T>(uri : string, token : string) : Promise<T> {
    let response = await timedFetch(uri, { headers: headers(token) });
    let content = await response.text();

    // Checked before parsing, so that a failure on the listing endpoints maps to the same Alexa error
    // as a failure anywhere else. Without this a 401 while discovering devices reaches Alexa as
    // INTERNAL_ERROR - the response body is not the array the caller expects, so mapping over it
    // throws - and the customer is told something went wrong rather than being asked to re-link
    // their account, which is the only action that would fix it.
    checkForErrors({ statusCode: response.status, content: content.length > 0 ? content : null });

    return JSON.parse(content) as T;
}

async function apiRequest(method : string, uri : string, token : string) : Promise<IApiResponse> {
    let response = await timedFetch(uri, { method, headers: headers(token) });
    let content = await response.text();
    return { statusCode: response.status, content: content.length > 0 ? content : null };
}

class LinnApiFacade implements ILinnApiFacade {
    constructor(private apiRoot : string) {
    }

    async list(token : string): Promise<IEndpoint[]> {
        // Both are awaited together rather than one after the other. They are issued in parallel, so
        // awaiting them in sequence leaves the second promise's rejection UNHANDLED whenever the first
        // one fails - and an unhandled rejection terminates the process on Node 22, turning a plain
        // 401 while discovering devices into a dead invocation instead of an error Alexa can act on.
        let [devices, players] = await Promise.all([
            apiJson<IAssociatedDeviceResource[]>(`${this.apiRoot}/devices/`, token),
            apiJson<IPlayerResource[]>(`${this.apiRoot}/players/`, token)
        ]);

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
    // NON-2xx, not >= 400. A 3xx used to pass as success: with redirects no longer followed, a redirect
    // reaches here as a 3xx, and a 302 carrying no Location reached here as one even before that. Either
    // way the command did not arrive at the device, and answering Alexa with a plain `Response` tells the
    // customer it did. There is no status below 200 the API can return, so this reads as "anything that
    // is not a success is a failure" rather than as two separate bounds.
    if (response.statusCode < 200 || response.statusCode >= 300) {
        // The body is advisory and the status code is not. Anything in front of the API - a gateway,
        // a proxy, a load balancer - can answer with HTML or with nothing at all, and letting an
        // unparseable body throw would erase the very status code being mapped, turning every such
        // failure into INTERNAL_ERROR.
        let body : { error : string } | null = null;
        if (response.content) {
            try {
                body = JSON.parse(response.content);
            } catch {
                body = null;
            }
        }

        switch (response.statusCode) {
            case 401:
            case 403:
                throw new InvalidAuthorizationCredentialError(generateErrorMessage(body, response.statusCode));
            case 404:
                if (body?.error === 'ClientPlayerNotFoundException' || body?.error === 'ClientDeviceNotFoundException') {
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