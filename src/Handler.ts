import DiscoveryHandler from './handlers/DiscoveryHandler';
import PowerControlHandler from './handlers/PowerControlHandler';
import { AlexaRequest, IAlexaContext, DiscoveryRequestPayload } from './models/Alexa';
import LinnApiFacade from './facade/LinnApiFacade';
import PlaybackControlHandler from './handlers/PlaybackControlHandler';

function handler(request: AlexaRequest<any>, context: IAlexaContext) {
    let facade = new LinnApiFacade("https://api.linn.co.uk");
    let handler;

    log("Debug", "Request",  request);

    switch(request.directive.header.namespace) {
        case "Alexa.Discovery":
            handler = new DiscoveryHandler(facade);
            break;
        case "Alexa.PowerController":
            log("Debug", "PowerController request",  request);
            handler = new PowerControlHandler(facade);
            break;
        case "Alexa.PlaybackController":
            log("Debug", "PlaybackController request",  request);
            handler = new PlaybackControlHandler(facade);
            break;
    }
    
    if (handler) {
        handler.handle(request, context);
    }
}

function log(level: string, message: string, properties: object) {
    if (properties) {
        console.log(`LOG Level: ${level} Message: ${message} Properties: ${JSON.stringify(properties)}`);
    } else {
        console.log(`LOG Level: ${level} Message: ${message}`);
    }
}

export { handler };