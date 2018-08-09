import { AlexaRequest, AlexaResponse } from '../models/Alexa';

interface IAlexaHandler<T,V> {
    handle(request : AlexaRequest<T>) : Promise<AlexaResponse<V>>
}

export default IAlexaHandler;