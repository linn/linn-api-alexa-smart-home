import { IAlexaResponse, IAlexaRequest, IAlexaContext } from "./models/Alexa";

// The account's subject identifier is deliberately absent. It identifies a person, these lines go to
// CloudWatch, and nothing downstream asks whether a log may carry it - so the only safe place to
// decide is here. Requests are correlated by awsRequestId and, where present, by endpoint id, both of
// which describe the device rather than its owner.
// THE PAYLOAD IS NOT LOGGED, in either direction, and the two directions are barred for different
// reasons.
//
// A Discover.Response payload is the account's whole device inventory, each entry carrying a
// friendlyName - free text the customer typed in the Linn app, routinely a person's name ("Sarah's
// Bedroom"). That is neither pseudonymous nor ours to keep: CLAUDE.md forbids logging a name, forbids
// content and behavioural data, and forbids a whole response body. An earlier version of this file
// removed the account subject on exactly that reasoning and left this in place, which had it removing
// the pseudonymous identifier while retaining the non-pseudonymous one.
//
// An ERROR payload's message is worse, because it is not ours to predict: it is whatever the thrown
// error said. Observed while testing this change, an error message carried the request's own headers
// including `Authorization: Bearer <customer token>` - so logging the payload verbatim is a channel by
// which a CREDENTIAL can reach CloudWatch, from any library that happens to include request context in
// a message. The error TYPE is what diagnosis needs and it is a closed set of Alexa's own values.
//
// What is kept is what identifies the device and the exchange: the header, the endpoint id, and for a
// discovery the number of endpoints - enough to see "this account discovered nothing" without naming
// what it owns.
function toResponseProperties(response : IAlexaResponse<any>) : any
{
    let logProperties : any = { header: response.event.header };

    let payload = response.event.payload;

    if (payload && payload.type) {
        logProperties["errorType"] = payload.type;
    }

    if (payload && Array.isArray(payload.endpoints)) {
        logProperties["endpointCount"] = payload.endpoints.length;
        logProperties["endpointIds"] = payload.endpoints.map((endpoint : any) => endpoint.endpointId);
    }

    if (response.event.endpoint) {
        logProperties["endPointId"] = response.event.endpoint.endpointId;
    }

    return logProperties;
}

// THE PAYLOAD IS THE ONE FIELD THAT MUST NEVER BE LOGGED HERE, and until now it was - for every
// control directive. A control payload is what the customer just asked their house to do, which is
// behavioural data.
//
// It is also where the credential lives for exactly one namespace. Alexa.Discovery carries its token at
// directive.payload.scope.token; every control directive carries it at directive.endpoint.scope.token.
// The previous version of this function logged the payload only when an endpoint was present, and
// Discovery is the one directive with no endpoint - so the token stayed out of the logs by the shape of
// the guard rather than by anything that said so. That was one edit away from a live credential in
// CloudWatch: "log the payload for Discovery too, so we can see what was asked" is a natural change and
// nothing would have stopped it. Not logging the payload at all removes the question.
function toRequestProperties(request : IAlexaRequest<any>) : any
{
    let logProperties : any = { header: request.directive.header };

    if (request.directive.endpoint) {
        logProperties["endpointId"] = request.directive.endpoint.endpointId;
    }

    return logProperties;
}

function log(level: string, message: string, awsRequestId : string, properties?: object) {
    if (properties) {
        console.log(`LOG RequestId: ${awsRequestId} Level: ${level} Message: ${message} Properties: ${JSON.stringify(properties)}`);
    } else {
        console.log(`LOG RequestId: ${awsRequestId} Level: ${level} Message: ${message}`);
    }
}

export default class {
    constructor(private context : IAlexaContext) {
    }
    logRequest(request : IAlexaRequest<any>) {
        log("Debug", "Request Directive", this.context.awsRequestId, toRequestProperties(request));
    }
    logResponse(response : IAlexaResponse<any>) {
        log("Debug", "Response Event", this.context.awsRequestId, toResponseProperties(response));
    }
    logError(response : IAlexaResponse<any>) {
        log("Debug", "Response Error Event", this.context.awsRequestId, toResponseProperties(response));
    }
}