import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiFacade from '../facade/ILinnApiFacade';

class PowerControlHandler {
    constructor(private facade : ILinnApiFacade) {
    }
    async handle(request: AlexaRequest<any>, context: IAlexaContext) {
        let shouldBeInStandby = request.directive.header.name === "TurnOff";
        await this.facade.setStandby(request.directive.endpoint.endpointId, shouldBeInStandby, request.directive.endpoint.scope.token);
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