import { IAlexaRequest, IAlexaResponse, IDiscoveryResponsePayload, IDiscoveryRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';

class DiscoveryHandler extends AlexaRequestHandler<IDiscoveryRequestPayload, IDiscoveryResponsePayload> {
    async handle(request: IAlexaRequest<IDiscoveryRequestPayload>) : Promise<IAlexaResponse<IDiscoveryResponsePayload>> {
        if (request.directive.header.name === 'Discover') {
            let endpoints = await this.facade.list(request.directive.payload.scope.token);

            return this.generateDiscoveryResponse(request, { endpoints });
        }
    }
}

export default DiscoveryHandler;