import { AlexaRequest, AlexaResponse } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';

class PowerControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: AlexaRequest<{}>) : Promise<AlexaResponse<{}>> {
        let shouldBeInStandby = request.directive.header.name === "TurnOff";

        await this.facade.setStandby(request.directive.endpoint.endpointId, shouldBeInStandby, request.directive.endpoint.scope.token);

        return this.generateResponse(request, {});
    }
}

export default PowerControlHandler;