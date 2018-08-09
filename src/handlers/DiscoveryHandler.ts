import { AlexaRequest, AlexaResponse, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiDevicesFacade from '../facade/ILinnApiFacade';
import IAlexaHandler from './IAlexaHandler';

class DiscoveryHandler implements IAlexaHandler<DiscoveryRequestPayload, DiscoveryResponsePayload> {
    constructor(private apiFacade : ILinnApiDevicesFacade) {
    }
    async handle(request: AlexaRequest<DiscoveryRequestPayload>) : Promise<AlexaResponse<DiscoveryResponsePayload>> {
        if (request.directive.header.name === 'Discover') {
            let endpoints = await this.apiFacade.list(request.directive.payload.scope.token);
            return {
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
        }
    }
}

export default DiscoveryHandler;