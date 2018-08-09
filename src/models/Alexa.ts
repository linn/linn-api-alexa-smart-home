interface IAlexaContext {
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

interface Scope {
    type: string;
    token: string;
}

interface RequestDirectiveEndpoint {
    scope: Scope;
    endpointId: string;
    cookie?: any;
}

interface RequestDirective<T> {
    header: RequestDirectiveHeader;
    payload: T;
    endpoint?: RequestDirectiveEndpoint;
}

interface AlexaRequest<T> {
    directive: RequestDirective<T>;
}

interface Payload {}

interface DiscoveryRequestPayload extends Payload {
    scope: Scope
}

interface DiscoveryResponsePayload extends Payload {
    endpoints: IEndpoint[]
}

interface AlexaEvent<T> {
    header: RequestDirectiveHeader,
    endpoint?: RequestDirectiveEndpoint,
    payload: T
}

interface AlexaResponse<T> {
    event: AlexaEvent<T>
}

interface IAlexaCapability {
    interface: string,
    version: string,
    type: string,
    supportedOperations?: string[]
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
    supportedOperations = [ "Play", "Pause", "Stop", "Previous", "Next" ];
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

export { IEndpoint, SpeakerEndpoint, IAlexaContext, AlexaRequest, AlexaResponse, DiscoveryResponsePayload, DiscoveryRequestPayload }