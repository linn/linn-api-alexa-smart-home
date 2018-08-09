import DiscoveryHandler from './handlers/DiscoveryHandler';
import PowerControlHandler from './handlers/PowerControlHandler';
import { AlexaRequest, IAlexaContext, DiscoveryRequestPayload } from './models/Alexa';
import LinnApiFacade from './facade/LinnApiFacade';
import PlaybackControlHandler from './handlers/PlaybackControlHandler';
import SpeakerControlHandler from './handlers/SpeakerControlHandler';

let handlers = {
    "Alexa.Discovery": DiscoveryHandler,
    "Alexa.PowerController": PowerControlHandler,
    "Alexa.PlaybackController": PlaybackControlHandler,
    "Alexa.Speaker": SpeakerControlHandler
}

async function handler(request: AlexaRequest<any>, context: IAlexaContext) {
    log("Debug", "Request",  request);

    let Handler = handlers[request.directive.header.namespace];
    
    if (Handler) {
        let facade = new LinnApiFacade("https://api.linn.co.uk");
        let handler = new Handler(facade);       

        let response = await handler.handle(request);

        log("Debug", "Response", response);
        
        context.succeed(response);
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