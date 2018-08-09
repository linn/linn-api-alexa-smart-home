import { AlexaRequest, AlexaResponse, StepSpeakerRequestPayload } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';

class StepSpeakerControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: AlexaRequest<StepSpeakerRequestPayload>) : Promise<AlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "AdjustVolume":
                await this.facade.adjustVolume(request.directive.endpoint.endpointId, request.directive.payload.volumeSteps, request.directive.endpoint.scope.token);
                break;
            case "SetMute":
                await this.facade.setMute(request.directive.endpoint.endpointId, request.directive.payload.mute, request.directive.endpoint.scope.token);
                break;
        }

        return this.generateResponse(request, {});
    }
}

export default StepSpeakerControlHandler;