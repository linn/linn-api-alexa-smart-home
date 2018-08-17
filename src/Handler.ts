import { IAlexaRequest, IAlexaContext, IAlexaResponse } from './models/Alexa';
import { handleError, createHandler } from './handlers';
import Logger from './Logger';

async function handler(request: IAlexaRequest<any>, context: IAlexaContext, callback: (error? : Error, result? : IAlexaResponse<any>) => void) {
    let logger = new Logger(context);

    logger.logRequest(request);

    try {
        let handler = createHandler(request);

        let response = await handler.handle(request);

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