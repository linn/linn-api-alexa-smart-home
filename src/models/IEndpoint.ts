import { IAlexaCapability, AlexaCapability, AlexaPowerController, AlexaSpeaker, AlexaStepSpeaker, AlexaPlaybackController } from "./IAlexaCapability";

interface IEndpoint {
    endpointId: string,
    friendlyName: string,
    description: string,
    manufacturerName: string,
    displayCategories: string[],
    cookie: any,
    capabilities: IAlexaCapability[]
}

class SpeakerEndpoint implements IEndpoint {
    manufacturerName = "Linn Products Ltd.";
    displayCategories = [ "SPEAKER" ];
    cookie = {};
    capabilities: IAlexaCapability[];
    constructor(public endpointId: string, public friendlyName: string, public description: string) {
        this.capabilities = [
            new AlexaCapability(),
            new AlexaPowerController(),
            new AlexaSpeaker(),
            new AlexaStepSpeaker(),
            new AlexaPlaybackController()
        ];
    }
}

export { IEndpoint }
export { SpeakerEndpoint }