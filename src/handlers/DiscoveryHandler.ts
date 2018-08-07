import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiDevicesFacade from '../facade/ILinnApiFacade';

class DiscoveryHandler {
    constructor(private apiFacade : ILinnApiDevicesFacade) {
    }
    async handle(request: AlexaRequest<DiscoveryRequestPayload>, context: IAlexaContext) {
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
        context.succeed(response);
    }
}

export default DiscoveryHandler;