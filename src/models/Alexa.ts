interface AlexaContext {
    succeed(result?: AlexaResponse): void;
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

interface AlexaEvent {
    header: RequestDirectiveHeader,
    payload: any
}

interface AlexaResponse {
    event: AlexaEvent
}

export { AlexaContext }
export { AlexaRequest }
export { AlexaResponse }