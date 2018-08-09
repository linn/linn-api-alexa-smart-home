import { AlexaRequest, AlexaResponse } from '../models/Alexa';

interface AlexaHandler<T,V> {
    handle(request : AlexaRequest<T>) : Promise<AlexaResponse<V>>
}

export default AlexaHandler;