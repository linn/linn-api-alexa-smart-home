import { IAlexaRequest, IAlexaResponse, IInputRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import { InvalidDirectiveError } from '../facade/ILinnApiFacade';

class InputControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: IAlexaRequest<IInputRequestPayload>) : Promise<IAlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "SelectInput":
                await this.facade.setSource(request.directive.endpoint.endpointId, request.directive.payload.input, request.directive.endpoint.scope.token);
                await this.facade.play(request.directive.endpoint.endpointId, request.directive.endpoint.scope.token);
                break;
            default:
                throw new InvalidDirectiveError();
        }

        return this.generateResponse(request, {});
    }
}

export default InputControlHandler;