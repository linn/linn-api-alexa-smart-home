import { IAlexaRequest, IAlexaResponse } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import { InvalidDirectiveError } from '../facade/ILinnApiFacade';

class PowerControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: IAlexaRequest<{}>) : Promise<IAlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "TurnOn":
                await this.facade.setStandby(request.directive.endpoint.endpointId, false, request.directive.endpoint.scope.token);
                break;
            case "TurnOff":
                await this.facade.setStandby(request.directive.endpoint.endpointId, true, request.directive.endpoint.scope.token);
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

export default PowerControlHandler;