import DiscoveryHandler from './handlers/DiscoveryHandler';
import PowerControlHandler from './handlers/PowerControlHandler';
import { AlexaRequest, IAlexaContext, AlexaResponse, ErrorPayload } from './models/Alexa';
import LinnApiFacade from './facade/LinnApiFacade';
import PlaybackControlHandler from './handlers/PlaybackControlHandler';
import SpeakerControlHandler from './handlers/SpeakerControlHandler';
import { InvalidAuthorizationCredentialError, EndpointUnreachableError, NoSuchEndpointError } from './facade/ILinnApiFacade';

let handlers = {
    "Alexa.Discovery": DiscoveryHandler,
    "Alexa.PowerController": PowerControlHandler,
    "Alexa.PlaybackController": PlaybackControlHandler,
    "Alexa.Speaker": SpeakerControlHandler
}

async function handler(request: AlexaRequest<any>, context: IAlexaContext, callback: (error? : Error, result? : any) => void) {
    log("Debug", "Request",  request);

    let Handler = handlers[request.directive.header.namespace];
    
    if (Handler) {
        let facade = new LinnApiFacade("https://api.linn.co.uk");
        let handler = new Handler(facade);       

        try {
            let response = await handler.handle(request);
            
            log("Debug", "Response", response);
            
            callback(null, response);
        }
        catch (error) {
            let response = generateErrorResponse(request, error);

            log("Debug", "Error Response", response);

            callback(null, response);
        }
    }
    else {
        callback(new Error("No Handler"));
    }
}

function generateErrorResponse(request : AlexaRequest<any>, error : Error) : AlexaResponse<ErrorPayload> {
    let errorType : string = "INTERNAL_ERROR";

    if (error instanceof InvalidAuthorizationCredentialError) {
        errorType = "INVALID_AUTHORIZATION_CREDENTIAL";
    } else if (error instanceof EndpointUnreachableError) {
        errorType = "ENDPOINT_UNREACHABLE";
    } else if (error instanceof NoSuchEndpointError) {
        errorType = "NO_SUCH_ENDPOINT";
    }

    return {
        event: {
            header: {
                name: "ErrorResponse",
                namespace: "Alexa",
                correlationToken: request.directive.header.correlationToken,
                messageId: request.directive.header.messageId + "-R",
                payloadVersion: "3"
            },
            endpoint: request.directive.endpoint,
            payload: {
                type: errorType
            }
        }
    }
};

function log(level: string, message: string, properties?: object) {
    if (properties) {
        console.log(`LOG Level: ${level} Message: ${message} Properties: ${JSON.stringify(properties)}`);
    } else {
        console.log(`LOG Level: ${level} Message: ${message}`);
    }
}

export { handler };