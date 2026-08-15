import { IAlexaRequest, IAlexaContext, IAlexaResponse } from './models/Alexa';
import { handleError, createHandler } from './handlers';
import Logger from './Logger';
import { jwtDecode } from "jwt-decode";

async function handler(request: IAlexaRequest<any>, context: IAlexaContext, callback: (error? : Error, result? : IAlexaResponse<any>) => void) {
    let logger = new Logger(context);

    let jwt : { sub : string } = { sub : "" };

    logger.logRequest(request);

    try {
        let handler = createHandler(request);

        jwt = jwtDecode<{ sub : string }>(handler.token(request)) || jwt;

        let response = await handler.handle(request);

        logger.logResponse(response, jwt.sub);

        callback(null, response);
    }
    catch (error) {
         let response = handleError(request, error);

         logger.logError(response, jwt.sub);

         callback(null, response);
    }
}

export { handler };