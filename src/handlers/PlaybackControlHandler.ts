import { IAlexaRequest, IAlexaResponse } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import { InvalidDirectiveError } from '../facade/ILinnApiFacade';

class PlaybackControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: IAlexaRequest<{}>) : Promise<IAlexaResponse<{}>> {
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
            default:
                throw new InvalidDirectiveError(`Unsupported operation: ${request.directive.header.name}`);
        }

        return this.generateResponse(request, {});
    }

    token(request: IAlexaRequest<{}>) : string {
        return request.directive.endpoint.scope.token;
    }
}

export default PlaybackControlHandler;