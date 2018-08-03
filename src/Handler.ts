import DiscoveryHandler from './handlers/DiscoveryHandler';
import PowerControlHandler from './handlers/PowerControlHandler';
import { AlexaRequest, IAlexaContext, DiscoveryRequestPayload } from './models/Alexa';
import LinnApiDevicesProxy from './proxies/LinnApiDevicesProxy';

function handler(request: AlexaRequest<any>, context: IAlexaContext) {
    let proxy = new LinnApiDevicesProxy("https://api.linn.co.uk");

    if (request.directive.header.namespace === "Alexa.Discovery" && request.directive.header.name === 'Discover') {
        log("Debug", "Discover request",  request);
        let handler = new DiscoveryHandler(proxy);
        handler.handle(request, context);
    } else if (request.directive.header.namespace === "Alexa.PowerController") {
        log("Debug", "PowerController request",  request);
        let handler = new PowerControlHandler(proxy);
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