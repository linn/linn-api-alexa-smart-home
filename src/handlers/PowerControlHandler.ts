import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiFacade from '../facade/ILinnApiFacade';
import IAlexaHandler from './IAlexaHandler';

class PowerControlHandler implements IAlexaHandler<{}, {}> {
    constructor(private facade : ILinnApiFacade) {
    }
    async handle(request: AlexaRequest<{}>) : Promise<AlexaResponse<{}>> {
        let shouldBeInStandby = request.directive.header.name === "TurnOff";
        await this.facade.setStandby(request.directive.endpoint.endpointId, shouldBeInStandby, request.directive.endpoint.scope.token);
        return {
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
    }
}

export default PowerControlHandler;