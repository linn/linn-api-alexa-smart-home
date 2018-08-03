import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiDevicesProxy from '../proxies/ILinnApiDevicesProxy';

class DiscoveryHandler {
    constructor(private deviceProxy : ILinnApiDevicesProxy) {
    }
    async handle(request: AlexaRequest<DiscoveryRequestPayload>, context: IAlexaContext) {
        let endpoints = await this.deviceProxy.list(request.directive.payload.scope.token);
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