import { AlexaRequest, AlexaResponse, StepSpeakerRequestPayload } from '../models/Alexa';
import ILinnApiFacade from '../facade/ILinnApiFacade';
import IAlexaHandler from './IAlexaHandler';

class StepSpeakerControlHandler implements IAlexaHandler<{}, {}> {
    constructor(private facade : ILinnApiFacade) {
    }
    async handle(request: AlexaRequest<StepSpeakerRequestPayload>) : Promise<AlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "AdjustVolume":
                await this.facade.adjustVolume(request.directive.endpoint.endpointId, request.directive.payload.volumeSteps, request.directive.endpoint.scope.token);
                break;
            case "SetMute":
                await this.facade.setMute(request.directive.endpoint.endpointId, request.directive.payload.mute, request.directive.endpoint.scope.token);
                break;
        }

        return {
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
    }
}

export default StepSpeakerControlHandler;