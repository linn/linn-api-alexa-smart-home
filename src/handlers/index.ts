import DiscoveryHandler from './DiscoveryHandler';
import PowerControlHandler from './PowerControlHandler';
import PlaybackControlHandler from './PlaybackControlHandler';
import SpeakerControlHandler from './SpeakerControlHandler';
import InputControlHandler from './InputControlHandler';
import ChannelControlHandler from './ChannelControlHandler';

import { IAlexaRequest, IAlexaResponse, IErrorPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import LinnApiFacade from '../facade/LinnApiFacade';
import { InvalidAuthorizationCredentialError, EndpointUnreachableError, NoSuchEndpointError, InvalidDirectiveError, InvalidValueError } from '../facade/ILinnApiFacade';

let handlers = {
    "Alexa.Discovery": DiscoveryHandler,
    "Alexa.PowerController": PowerControlHandler,
    "Alexa.PlaybackController": PlaybackControlHandler,
    "Alexa.Speaker": SpeakerControlHandler,
    "Alexa.InputController": InputControlHandler,
    "Alexa.ChannelController": ChannelControlHandler
}

function createHandler(request : IAlexaRequest<any>) : AlexaRequestHandler<any, any>
{
    let Handler = handlers[request.directive.header.namespace];

    if (Handler) {
        // Defaulted rather than required: an unset variable would otherwise take the whole skill
        // down, and the production value is the one this has always used. A sys deployment sets it
        // to the beta API so it can be exercised without touching customer devices.
        let facade = new LinnApiFacade(process.env.LINN_API_ROOT || "https://api.linn.co.uk");
        return new Handler(facade);
    } else {
        throw new InvalidDirectiveError(`No handler for ${request.directive.header.namespace}`);;
    }
}

function handleError(request : IAlexaRequest<any>, error : Error) : IAlexaResponse<IErrorPayload> {
    let errorType : string = "INTERNAL_ERROR";

    if (error.name == "InvalidTokenError" || error instanceof InvalidAuthorizationCredentialError) {
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
                type: errorType,
                message: error.message
            }
        }
    }
};

export { createHandler, handleError };