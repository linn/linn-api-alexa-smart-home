import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiFacade from '../facade/ILinnApiFacade';
import IAlexaHandler from './IAlexaHandler';

class PlaybackControlHandler implements IAlexaHandler<{}, {}> {
    constructor(private facade : ILinnApiFacade) {
    }
    async handle(request: AlexaRequest<{}>) : Promise<AlexaResponse<{}>> {
        switch(request.directive.header.name){
            case "Play":
                await this.facade.play(request.directive.endpoint.endpointId, request.directive.endpoint.scope.token);
                break;
            case "Pause":
                await this.facade.pause(request.directive.endpoint.endpointId, request.directive.endpoint.scope.token);
                break;
            case "Stop":
                await this.facade.stop(request.directive.endpoint.endpointId, request.directive.endpoint.scope.token);
                break;
            case "Next":
                await this.facade.next(request.directive.endpoint.endpointId, request.directive.endpoint.scope.token);
                break;
            case "Previous":
                await this.facade.prev(request.directive.endpoint.endpointId, request.directive.endpoint.scope.token);
                break;
        }

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
                payload: { sdfsdf: 3434, sdfsdfds: 43543 }
            }
        };
    }
}

export default PlaybackControlHandler;