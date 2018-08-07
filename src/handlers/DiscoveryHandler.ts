import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiDevicesFacade from '../facade/ILinnApiFacade';

class DiscoveryHandler {
    constructor(private apiFacade : ILinnApiDevicesFacade) {
    }
    async handle(request: AlexaRequest<DiscoveryRequestPayload>, context: IAlexaContext) {
        if (request.directive.header.name === 'Discover') {
            let endpoints = await this.apiFacade.list(request.directive.payload.scope.token);
            let response : AlexaResponse<DiscoveryResponsePayload> = {
                event: {
                    header: {
                        name: "Discover.Response",
                        namespace: "Alexa.Discovery",
                        correlationToken: request.directive.header.correlationToken,
                        messageId: request.directive.header.messageId + "-R",
                        payloadVersion: "3"
                    },
                    payload: {
                        endpoints: endpoints
                    }
                }
            };

            log("Debug", "Response", response);
            
            context.succeed(response);
        }
    }
}

function log(level: string, message: string, properties: object) {
    if (properties) {
        console.log(`LOG Level: ${level} Message: ${message} Properties: ${JSON.stringify(properties)}`);
    } else {
        console.log(`LOG Level: ${level} Message: ${message}`);
    }
}

export default DiscoveryHandler;