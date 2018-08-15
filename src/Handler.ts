import DiscoveryHandler from './handlers/DiscoveryHandler';
import PowerControlHandler from './handlers/PowerControlHandler';
import { IAlexaRequest, IAlexaContext, IAlexaResponse, IErrorPayload } from './models/Alexa';
import LinnApiFacade from './facade/LinnApiFacade';
import PlaybackControlHandler from './handlers/PlaybackControlHandler';
import SpeakerControlHandler from './handlers/SpeakerControlHandler';
import { InvalidAuthorizationCredentialError, EndpointUnreachableError, NoSuchEndpointError, InvalidDirectiveError, InvalidValueError } from './facade/ILinnApiFacade';

let handlers = {
    "Alexa.Discovery": DiscoveryHandler,
    "Alexa.PowerController": PowerControlHandler,
    "Alexa.PlaybackController": PlaybackControlHandler,
    "Alexa.Speaker": SpeakerControlHandler
}

async function handler(request: IAlexaRequest<any>, context: IAlexaContext, callback: (error? : Error, result? : any) => void) {
    log("Debug", "Request Directive", context, toRequestProperties(request));

    let Handler = handlers[request.directive.header.namespace];
    
    try {
        if (Handler) {
            let facade = new LinnApiFacade("https://api.linn.co.uk");
            let handler = new Handler(facade);

            let response : IAlexaResponse<any> = await handler.handle(request);

            log("Debug", "Response Event", context, toResponseProperties(response));

            callback(null, response);
        } else {
            throw new InvalidDirectiveError();
        }
    }
    catch (error) {
        let response = generateErrorResponse(request, error);

        log("Debug", "Response Error Event", context, toResponseProperties(response));

        callback(null, response);
    }
}

function generateErrorResponse(request : IAlexaRequest<any>, error : Error) : IAlexaResponse<IErrorPayload> {
    let errorType : string = "INTERNAL_ERROR";

    if (error instanceof InvalidAuthorizationCredentialError) {
        errorType = "INVALID_AUTHORIZATION_CREDENTIAL";
    } else if (error instanceof EndpointUnreachableError) {
        errorType = "ENDPOINT_UNREACHABLE";
    } else if (error instanceof NoSuchEndpointError) {
        errorType = "NO_SUCH_ENDPOINT";
    } else if (error instanceof InvalidDirectiveError) {
        errorType = "INVALID_DIRECTIVE";
    } else if (error instanceof InvalidValueError) {
        errorType = "INVALID_VALUE";
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

function toResponseProperties(response : IAlexaResponse<any>) : any
{
    let logProperties = { header: response.event.header, payload: response.event.payload };

    if (response.event.endpoint) {
        logProperties["endPointId"] = response.event.endpoint.endpointId;
    }

    return logProperties;
}

function toRequestProperties(request : IAlexaRequest<any>) : any
{
    let logProperties = { header: request.directive.header };

    if (request.directive.endpoint) {
        logProperties["endpointId"] = request.directive.endpoint.endpointId;
        logProperties["payload"] = request.directive.payload;
    }

    return logProperties;
}

function log(level: string, message: string, context : IAlexaContext, properties?: object) {
    if (properties) {
        console.log(`LOG RequestId: ${context.awsRequestId} Level: ${level} Message: ${message} Properties: ${JSON.stringify(properties)}`);
    } else {
        console.log(`LOG RequestId: ${context.awsRequestId} Level: ${level} Message: ${message}`);
    }
}

export { handler };