import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiDevicesProxy from '../proxies/ILinnApiDevicesProxy';

class PowerControlHandler {
    constructor(private deviceProxy : ILinnApiDevicesProxy) {
    }
    async handle(request: AlexaRequest<any>, context: IAlexaContext) {
        let shouldBeInStandby = request.directive.header.name === "TurnOff";
        await this.deviceProxy.setStandby(request.directive.endpoint.endpointId, shouldBeInStandby, request.directive.endpoint.scope.token);
        let response : AlexaResponse<any> = {
            event: {
                header: {
                    name: "Response",
                    namespace: "Alexa",
                    correlationToken: request.directive.header.correlationToken,
                    messageId: request.directive.header.messageId + "-R",
                    payloadVersion: "3"
                },
                endpoint: request.directive.endpoint,
                payload: {}
            }
        };
        context.succeed(response);
    }
}

export default PowerControlHandler;