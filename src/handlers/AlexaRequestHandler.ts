import { IAlexaRequest, IAlexaResponse, IAlexaResponseContext } from '../models/Alexa';
import ILinnApiFacade from '../facade/ILinnApiFacade';
import IAlexaHandler from './IAlexaHandler';

abstract class AlexaRequestHandler<T,V> implements IAlexaHandler<T,V> {
    constructor(protected facade : ILinnApiFacade) {
    }

    protected generateDiscoveryResponse(request : IAlexaRequest<T>, payload : V) : IAlexaResponse<V> {
        return this._generateResponse(request, "Discover.Response", "Alexa.Discovery", payload);
    }

    protected generateResponse(request : IAlexaRequest<T>, payload : V, context? : IAlexaResponseContext) : IAlexaResponse<V> {
        return this._generateResponse(request, "Response", "Alexa", payload, context);
    }

    private _generateResponse(request : IAlexaRequest<T>, name: string, namespace: string, payload : V, context? : IAlexaResponseContext) : IAlexaResponse<V> {
        return {
            context: context,
            event: {
                header: {
                    name: name,
                    namespace: namespace,
                    correlationToken: request.directive.header.correlationToken,
                    messageId: request.directive.header.messageId + "-R",
                    payloadVersion: "3"
                },
                endpoint: request.directive.endpoint,
                payload: payload
            }
        };
    }

    abstract handle(request: IAlexaRequest<T>) : Promise<IAlexaResponse<V>>;

    abstract token(request: IAlexaRequest<T>) : string;
}

export default AlexaRequestHandler;