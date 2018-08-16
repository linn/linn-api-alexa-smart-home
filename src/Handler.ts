import { IAlexaRequest, IAlexaContext, IAlexaResponse, IErrorPayload } from './models/Alexa';
import { handleError, createHandler } from './handlers';
import Logger from './Logger';

async function handler(request: IAlexaRequest<any>, context: IAlexaContext, callback: (error? : Error, result? : any) => void) {
    let logger = new Logger(context);

    logger.logRequest(request);

    try {
        let handler = createHandler(request);

        let response : IAlexaResponse<any> = await handler.handle(request);

        logger.logResponse(response);

        callback(null, response);
    }
    catch (error) {
        let response = handleError(request, error);

        logger.logError(response);

        callback(null, response);
    }
}

export { handler };