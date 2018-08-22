interface IAlexaContext {
    awsRequestId: string;
}

interface IRequestDirectiveHeader {
    namespace: string;
    name: string;
    messageId: string;
    correlationToken?: string;
    payloadVersion: string;
}

interface IScope {
    type: string;
    token: string;
}

interface IRequestDirectiveEndpoint {
    scope: IScope;
    endpointId: string;
    cookie?: any;
}

interface RequestDirective<T> {
    header: IRequestDirectiveHeader;
    payload: T;
    endpoint?: IRequestDirectiveEndpoint;
}

interface IAlexaRequest<T> {
    directive: RequestDirective<T>;
}

interface IPayload {}

interface IErrorPayload extends IPayload {
    type: string;
    message? : string;
}

interface IDiscoveryRequestPayload extends IPayload {
    scope: IScope;
}

interface IDiscoveryResponsePayload extends IPayload {
    endpoints: IEndpoint[];
}

interface IInputRequestPayload extends IPayload {
    input: string;
}

interface IChannelRequestPayload extends IPayload {
    channel?: {
        number : string;
        callSign?: string;
    },
    channelMetadata?: {
        name: string;
    }}

interface ISpeakerRequestPayload extends IPayload {
    mute?: boolean;
    volume?: number;
    volumeDefault?: boolean;
}

interface IAlexaEvent<T> {
    header: IRequestDirectiveHeader,
    endpoint?: IRequestDirectiveEndpoint,
    payload: T
}

interface IAlexaResponseContext {
    properties: IAlexaResponseContextProperty[],
}

interface IAlexaResponseContextProperty {
    namespace: string,
    name: string,
    value: any,
    timeOfSample: string,
    uncertaintyInMilliseconds: number
}

interface IAlexaResponse<T> {
    context?: IAlexaResponseContext,
    event: IAlexaEvent<T>
}

interface IAlexaCapability {
    interface: string,
    version: string,
    type: string,
    supportedOperations?: string[],
    inputs?: ISource[],
    properties?: {
        supported: { name: string }[]
    }
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

class AlexaPlaybackController implements IAlexaCapability {
    interface = "Alexa.PlaybackController";
    type = "AlexaInterface";
    version = "3";
    supportedOperations = [ "Play", "Pause", "Stop", "Previous", "Next" ];
}

class AlexaChannelController implements IAlexaCapability {
    interface = "Alexa.ChannelController";
    type = "AlexaInterface";
    version = "3";
    properties = { supported: [ { name: "channel" } ] };
}

interface ISource {
    name: string;
}

class AlexaInputController implements IAlexaCapability {
    constructor(public inputs : ISource[])
    {
    }
    interface = "Alexa.InputController";
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
    constructor(public endpointId: string, public friendlyName: string, public description: string, sources: ISource[]) {
        this.capabilities = [
            new AlexaCapability(),
            new AlexaPowerController(),
            new AlexaSpeaker(),
            new AlexaPlaybackController(),
            new AlexaInputController(sources),
            new AlexaChannelController()
        ];
    }
}

export { IPayload, IEndpoint, SpeakerEndpoint, IAlexaContext, IAlexaRequest, IAlexaResponse, IAlexaResponseContext, IDiscoveryResponsePayload, IDiscoveryRequestPayload, ISpeakerRequestPayload, IInputRequestPayload, IChannelRequestPayload, IErrorPayload }