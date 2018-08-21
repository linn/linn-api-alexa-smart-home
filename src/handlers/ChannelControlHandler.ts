import { IAlexaRequest, IAlexaResponse, IChannelRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import { InvalidDirectiveError, InvalidValueError } from '../facade/ILinnApiFacade';

class ChannelControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: IAlexaRequest<IChannelRequestPayload>) : Promise<IAlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "ChangeChannel":
                let pinId = Number(request.directive.payload.channel.number);
                if (isNaN(pinId)) {
                    throw new InvalidValueError();
                }
                await this.facade.invokeDevicePin(request.directive.endpoint.endpointId, pinId, request.directive.endpoint.scope.token);
                break;
            default:
                throw new InvalidDirectiveError();
        }

        return this.generateResponse(request, {});
    }
}

export default ChannelControlHandler;