// Directive builders for the acceptance suite. These describe what Alexa actually sends, so the
// suite can be read against Amazon's documentation rather than against our own models.
import { handler } from '../../src/Handler';
import { IAlexaRequest, IAlexaResponse } from '../../src/models/Alexa';

export const API_ROOT = "https://api.linn.co.uk";
export const DEVICE_ID = "device0";

// A structurally valid, expired, signature-meaningless RS256 token whose sub is a Linn external
// account id. Nothing in this service verifies a signature - it forwards the token to the Linn API
// and decodes it only to log the subject - so a real one would add risk and prove nothing.
export const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIvYXV0aC9leHRlcm5hbC1hY2NvdW50cy9lMWUwZGU2MC1kMDk1LTQ2MTQtYTBmZC1lNmI1NjhlMTJmZGMifQ.c2lnbmF0dXJl";

export const MESSAGE_ID = "34ffca11-b668-49c6-abcb-89789fa70428";
export const CORRELATION_TOKEN = "correlation-token-abc";

// Discovery carries its token in the payload scope; every control directive carries it in the
// endpoint scope. Getting that wrong is invisible until a real skill call fails, so the builders
// keep the two shapes apart rather than letting a test invent either.
export function discoveryDirective() : IAlexaRequest<any> {
    return {
        directive: {
            header: { namespace: "Alexa.Discovery", name: "Discover", payloadVersion: "3", messageId: MESSAGE_ID },
            payload: { scope: { type: "BearerToken", token: TOKEN } }
        }
    } as IAlexaRequest<any>;
}

export function controlDirective(namespace : string, name : string, payload : any = {}) : IAlexaRequest<any> {
    return {
        directive: {
            header: { namespace, name, payloadVersion: "3", messageId: MESSAGE_ID, correlationToken: CORRELATION_TOKEN },
            endpoint: { endpointId: DEVICE_ID, scope: { type: "BearerToken", token: TOKEN } },
            payload
        }
    } as IAlexaRequest<any>;
}

// The Lambda signature is callback-style, which is how Alexa invokes it. Awaiting the callback keeps
// the tests honest about that contract instead of quietly testing a promise the runtime never sees.
export function invoke(request : IAlexaRequest<any>) : Promise<IAlexaResponse<any>> {
    return new Promise((resolve, reject) => {
        handler(request, { awsRequestId: 'acceptance' } as any, (error?: Error, result?: IAlexaResponse<any>) => {
            if (error) { reject(error); } else { resolve(result as IAlexaResponse<any>); }
        });
    });
}
