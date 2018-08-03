import { DiscoveryHandler } from './handlers/DiscoveryHandler';
import { AlexaRequest, AlexaContext } from './models/Alexa';
import { LinnApiDevicesProxy } from './proxies/LinnApiDevicesProxy';

function handler(request: AlexaRequest, context: AlexaContext) {
    if (request.directive.header.namespace == "Alexa.Discovery" && request.directive.header.name === 'Discover') {
        log("Debug", "Discover request",  request);
        let proxy = new LinnApiDevicesProxy("https://api.linn.co.uk");
        let discoveryHandler = new DiscoveryHandler(proxy);
        discoveryHandler.handle(request, context);
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