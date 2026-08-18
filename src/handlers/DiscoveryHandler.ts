import { IAlexaRequest, IAlexaResponse, IDiscoveryResponsePayload, IDiscoveryRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import { InvalidDirectiveError } from '../facade/ILinnApiFacade';

class DiscoveryHandler extends AlexaRequestHandler<IDiscoveryRequestPayload, IDiscoveryResponsePayload> {
    async handle(request: IAlexaRequest<IDiscoveryRequestPayload>) : Promise<IAlexaResponse<IDiscoveryResponsePayload>> {
        // Every other handler throws InvalidDirectiveError for a name it does not recognise; this one
        // fell off the end and returned undefined, and the caller then logged that - so the customer got
        // INTERNAL_ERROR carrying the text "Cannot read properties of undefined (reading 'event')", an
        // internal exception message shipped to Amazon. Not reachable from Alexa today, which is why it
        // survived.
        if (request.directive.header.name !== 'Discover') {
            throw new InvalidDirectiveError(`Unsupported operation: ${request.directive.header.name}`);
        }

        let endpoints = await this.facade.list(request.directive.payload.scope.token);

        return this.generateDiscoveryResponse(request, { endpoints });
    }

    token(request: IAlexaRequest<IDiscoveryRequestPayload>) : string {
        return request.directive.payload.scope.token;
    }
}

export default DiscoveryHandler;