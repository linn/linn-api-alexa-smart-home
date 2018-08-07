import DiscoveryHandler from './handlers/DiscoveryHandler';
import PowerControlHandler from './handlers/PowerControlHandler';
import { AlexaRequest, IAlexaContext, DiscoveryRequestPayload } from './models/Alexa';
import LinnApiFacade from './facade/LinnApiFacade';
import PlaybackControlHandler from './handlers/PlaybackControlHandler';

function handler(request: AlexaRequest<any>, context: IAlexaContext) {
    let facade = new LinnApiFacade("https://api.linn.co.uk");

    if (request.directive.header.namespace === "Alexa.Discovery" && request.directive.header.name === 'Discover') {
        log("Debug", "Discover request",  request);
        let handler = new DiscoveryHandler(facade);
        handler.handle(request, context);
    } else if (request.directive.header.namespace === "Alexa.PowerController") {
        log("Debug", "PowerController request",  request);
        let handler = new PowerControlHandler(facade);
        handler.handle(request, context);
    } else if (request.directive.header.namespace === "Alexa.PlaybackController") {
        log("Debug", "PlaybackController request",  request);
        let handler = new PlaybackControlHandler(facade);
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