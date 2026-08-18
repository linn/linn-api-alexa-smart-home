// Directive builders for the acceptance suite. These describe what Alexa actually sends, so the
// suite can be read against Amazon's documentation rather than against our own models.
import { handler } from '../../src/Handler';
import { IAlexaRequest, IAlexaResponse } from '../../src/models/Alexa';

export const API_ROOT = "https://api.linn.co.uk";
export const DEVICE_ID = "device0";

// A structurally valid, signature-meaningless RS256 token. Nothing in this service verifies a signature;
// jwtDecode is called for its THROW, so that a token which is not a JWT is rejected here rather than
// spent on a round trip - the decoded value is discarded and no longer logged anywhere.
//
// The sub is an all-zero UUID, deliberately and obviously synthetic. An earlier version of this fixture
// carried a real-shaped Linn external account id and a comment asserting that it WAS one - which, if it
// had been lifted from a real token or a log line, would have put a customer identifier in git with
// unbounded retention: the one store ADR-034 cannot bound after the fact.
export const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIvYXV0aC9leHRlcm5hbC1hY2NvdW50cy8wMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDAifQ.c2lnbmF0dXJl";

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
