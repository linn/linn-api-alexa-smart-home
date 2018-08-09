import { AlexaRequest, AlexaResponse, SpeakerRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';

const DEFAULT_VOLUME_INCREMENT = 3;
const DEFAULT_VOLUME_DECREMENT = -5;

class SpeakerControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: AlexaRequest<SpeakerRequestPayload>) : Promise<AlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "AdjustVolume":
                if (request.directive.payload.volumeDefault) {
                    if (request.directive.payload.volume > 0) {
                        await this.facade.adjustVolume(request.directive.endpoint.endpointId, DEFAULT_VOLUME_INCREMENT, request.directive.endpoint.scope.token);
                    } else {
                        await this.facade.adjustVolume(request.directive.endpoint.endpointId, DEFAULT_VOLUME_DECREMENT, request.directive.endpoint.scope.token);
                    }
                } else {
                    await this.facade.adjustVolume(request.directive.endpoint.endpointId, request.directive.payload.volume, request.directive.endpoint.scope.token);
                }
                break;
            case "SetMute":
                await this.facade.setMute(request.directive.endpoint.endpointId, request.directive.payload.mute, request.directive.endpoint.scope.token);
                break;
            case "SetVolume":
                await this.facade.setVolume(request.directive.endpoint.endpointId, request.directive.payload.volume, request.directive.endpoint.scope.token);
                break;
        }

        return this.generateResponse(request, {});
    }
}

export default SpeakerControlHandler;