import { IAlexaResponse, IAlexaRequest, IAlexaContext } from "./models/Alexa";

function toResponseProperties(response : IAlexaResponse<any>) : any
{
    let logProperties = { header: response.event.header, payload: response.event.payload };

    if (response.event.endpoint) {
        logProperties["endPointId"] = response.event.endpoint.endpointId;
    }

    return logProperties;
}

function toRequestProperties(request : IAlexaRequest<any>) : any
{
    let logProperties = { header: request.directive.header };

    if (request.directive.endpoint) {
        logProperties["endpointId"] = request.directive.endpoint.endpointId;
        logProperties["payload"] = request.directive.payload;
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