import { AlexaRequest, AlexaResponse, IAlexaContext, DiscoveryResponsePayload, DiscoveryRequestPayload } from '../models/Alexa';
import ILinnApiFacade from '../facade/ILinnApiFacade';

class PlaybackControlHandler {
    constructor(private facade : ILinnApiFacade) {
    }
    async handle(request: AlexaRequest<any>, context: IAlexaContext) {
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

export default PlaybackControlHandler;