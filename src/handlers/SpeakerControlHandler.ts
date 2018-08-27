import { IAlexaRequest, IAlexaResponse, ISpeakerRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import { InvalidDirectiveError, InvalidValueError } from '../facade/ILinnApiFacade';

const DEFAULT_VOLUME_INCREMENT = 3;
const DEFAULT_VOLUME_DECREMENT = -5;

function isNumber(value: string | number): boolean
{
    return value && !isNaN(Number(value.toString()));
}

class SpeakerControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: IAlexaRequest<ISpeakerRequestPayload>) : Promise<IAlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "AdjustVolume":
                if (request.directive.payload.volumeDefault) {
                    if (request.directive.payload.volume > 0) {
                        await this.facade.adjustVolume(request.directive.endpoint.endpointId, DEFAULT_VOLUME_INCREMENT, request.directive.endpoint.scope.token);
                    } else {
                        await this.facade.adjustVolume(request.directive.endpoint.endpointId, DEFAULT_VOLUME_DECREMENT, request.directive.endpoint.scope.token);
                    }
                } else {
                    if (!isNumber(request.directive.payload.volume)) {
                        throw new InvalidValueError(`Volume must be a number: ${request.directive.payload.volume}`);
                    }
                    await this.facade.adjustVolume(request.directive.endpoint.endpointId, request.directive.payload.volume, request.directive.endpoint.scope.token);
                }
                break;
            case "SetMute":
                await this.facade.setMute(request.directive.endpoint.endpointId, request.directive.payload.mute, request.directive.endpoint.scope.token);
                break;
            case "SetVolume":
                if (!isNumber(request.directive.payload.volume)) {
                    throw new InvalidValueError(`Volume must be a number: ${request.directive.payload.volume}`);
                }
                await this.facade.setVolume(request.directive.endpoint.endpointId, request.directive.payload.volume, request.directive.endpoint.scope.token);
                break;
            default:
                throw new InvalidDirectiveError(`Unsupported operation: ${request.directive.header.name}`);
        }

        return this.generateResponse(request, {});
    }
}

export default SpeakerControlHandler;