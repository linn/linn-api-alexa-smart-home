import { AlexaRequest, AlexaResponse } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';

class PlaybackControlHandler extends AlexaRequestHandler<{}, {}> {
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
        
        return this.generateResponse(request, {});
    }
}

export default PlaybackControlHandler;