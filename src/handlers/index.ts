import {
    EndpointUnreachableError,
    InvalidAuthorizationCredentialError,
    InvalidDirectiveError,
    InvalidValueError,
    NoSuchEndpointError,
} from '../facade/ILinnApiFacade';
import LinnApiFacade from '../facade/LinnApiFacade';
import type { IAlexaRequest, IAlexaResponse, IErrorPayload } from '../models/Alexa';
import type AlexaRequestHandler from './AlexaRequestHandler';
import ChannelControlHandler from './ChannelControlHandler';
import DiscoveryHandler from './DiscoveryHandler';
import InputControlHandler from './InputControlHandler';
import PlaybackControlHandler from './PlaybackControlHandler';
import PowerControlHandler from './PowerControlHandler';
import SpeakerControlHandler from './SpeakerControlHandler';

const handlers = {
    'Alexa.Discovery': DiscoveryHandler,
    'Alexa.PowerController': PowerControlHandler,
    'Alexa.PlaybackController': PlaybackControlHandler,
    'Alexa.Speaker': SpeakerControlHandler,
    'Alexa.InputController': InputControlHandler,
    'Alexa.ChannelController': ChannelControlHandler,
};

function createHandler(request: IAlexaRequest<any>): AlexaRequestHandler<any, any> {
    const Handler = handlers[request.directive.header.namespace];

    if (Handler) {
        // Defaulted rather than required: an unset variable would otherwise take the whole skill
        // down, and the production value is the one this has always used. A sys deployment sets it
        // to the beta API so it can be exercised without touching customer devices.
        const facade = new LinnApiFacade(process.env.LINN_API_ROOT || 'https://api.linn.co.uk');
        return new Handler(facade);
    } else {
        throw new InvalidDirectiveError(`No handler for ${request.directive.header.namespace}`);
    }
}

function handleError(request: IAlexaRequest<any>, error: Error): IAlexaResponse<IErrorPayload> {
    let errorType: string = 'INTERNAL_ERROR';

    if (error.name === 'InvalidTokenError' || error instanceof InvalidAuthorizationCredentialError) {
        errorType = 'INVALID_AUTHORIZATION_CREDENTIAL';
    } else if (error instanceof EndpointUnreachableError) {
        errorType = 'ENDPOINT_UNREACHABLE';
    } else if (error instanceof NoSuchEndpointError) {
        errorType = 'NO_SUCH_ENDPOINT';
    } else if (error instanceof InvalidDirectiveError) {
        errorType = 'INVALID_DIRECTIVE';
    } else if (error instanceof InvalidValueError) {
        errorType = 'INVALID_VALUE';
    }

    // READ DEFENSIVELY, because this is the last thing standing between a malformed invocation and no
    // response at all. Alexa always sends `directive`, but a console test invoke or a warm-up ping need
    // not - and this function used to dereference request.directive.header unconditionally, so for those
    // it threw INSIDE the catch that called it. The handler's promise then never settled: Alexa received
    // nothing and the log carried only the throw. An error response missing a correlationToken is
    // imperfect; producing none at all is the failure this exists to prevent.
    const directive = request?.directive;
    const header = directive?.header;

    return {
        event: {
            header: {
                name: 'ErrorResponse',
                namespace: 'Alexa',
                correlationToken: header?.correlationToken,
                messageId: header?.messageId ? `${header.messageId}-R` : 'unknown-R',
                payloadVersion: '3',
            },
            endpoint: directive?.endpoint,
            payload: {
                type: errorType,
                message: error.message,
            },
        },
    };
}

export { createHandler, handleError };
