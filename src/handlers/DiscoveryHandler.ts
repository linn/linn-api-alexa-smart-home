import { AlexaRequest, AlexaResponse, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';

class DiscoveryHandler extends AlexaRequestHandler<DiscoveryRequestPayload, DiscoveryResponsePayload> {
    async handle(request: AlexaRequest<DiscoveryRequestPayload>) : Promise<AlexaResponse<DiscoveryResponsePayload>> {
        if (request.directive.header.name === 'Discover') {
            let endpoints = await this.facade.list(request.directive.payload.scope.token);

            return this.generateDiscoveryResponse(request, { endpoints: endpoints });
        }
    }
}

export default DiscoveryHandler;