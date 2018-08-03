interface AlexaContext {
    succeed(result?: AlexaResponse<Payload>): void;
    fail(error?: Error): void;
    done(error?: Error, result?: Object): void; // result must be JSON.stringifyable
    getRemainingTimeInMillis(): number;
}

interface RequestDirectiveHeader {
    namespace: string;
    name: string;
    messageId: string;
    correlationToken?: string;
    payloadVersion: string;
}

interface PayloadScope {
    type: string;
    token: string;
}

interface RequestDirectivePayload {
    scope: PayloadScope;
}

interface RequestDirective {
    header: RequestDirectiveHeader;
    payload: RequestDirectivePayload;
}

interface AlexaRequest {
    directive: RequestDirective;
}

interface Payload {}

interface DiscoveryPayload extends Payload {
    endpoints: IEndpoint[]
}

interface AlexaEvent<T> {
    header: RequestDirectiveHeader,
    payload: T
}

interface AlexaResponse<T> {
    event: AlexaEvent<T>
}

interface IAlexaCapability {
    interface: string,
    version: string,
    type: string
}

class AlexaCapability implements IAlexaCapability {
    interface = "Alexa";
    type = "AlexaInterface";
    version = "3";
}

class AlexaPowerController implements IAlexaCapability {
    interface = "Alexa.PowerController";
    type = "AlexaInterface";
    version = "3";
}

class AlexaSpeaker implements IAlexaCapability {
    interface = "Alexa.Speaker";
    type = "AlexaInterface";
    version = "3";
}

class AlexaStepSpeaker implements IAlexaCapability {
    interface = "Alexa.StepSpeaker";
    type = "AlexaInterface";
    version = "3";
}

class AlexaPlaybackController implements IAlexaCapability {
    interface = "Alexa.PlaybackController";
    type = "AlexaInterface";
    version = "3";
}

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

export { IEndpoint, SpeakerEndpoint, AlexaContext, AlexaRequest, AlexaResponse, DiscoveryPayload }