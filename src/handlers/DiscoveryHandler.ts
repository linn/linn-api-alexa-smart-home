import { AlexaRequest, AlexaResponse, AlexaContext } from '../models/Alexa';
import { ILinnApiDevicesProxy } from '../proxies/ILinnApiDevicesProxy';

class DiscoveryHandler {
    constructor(private deviceProxy : ILinnApiDevicesProxy) {
    }
    async handle(request: AlexaRequest, context: AlexaContext) : Promise<void> {
        let endpoints = await this.deviceProxy.list(request.directive.payload.scope.token);
        context.succeed({
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
        });
    }
}

export { DiscoveryHandler };