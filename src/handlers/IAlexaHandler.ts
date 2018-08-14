import { IAlexaRequest, IAlexaResponse } from '../models/Alexa';

interface IAlexaHandler<T,V> {
    handle(request : IAlexaRequest<T>) : Promise<IAlexaResponse<V>>
}

export default IAlexaHandler;