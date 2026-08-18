import { IAlexaRequest, IAlexaContext, IAlexaResponse } from './models/Alexa';
import { handleError, createHandler } from './handlers';
import Logger from './Logger';
import { jwtDecode } from "jwt-decode";

async function handler(request: IAlexaRequest<any>, context: IAlexaContext, callback: (error? : Error, result? : IAlexaResponse<any>) => void) {
    let logger = new Logger(context);

    try {
        // INSIDE the try. Outside it, a payload with no `directive` threw in Logger before the try was
        // entered: the handler's promise rejected, Alexa received nothing, and NOTHING was logged - not
        // even the request that caused it. An invocation with no record at all is the worst outcome
        // available here, and it was reachable from a console test invoke or any future message shape.
        logger.logRequest(request);

        let handler = createHandler(request);

        // Called for its throw, not its value: a token that is not a JWT is rejected here rather
        // than spent on a round trip to the API. handleError maps the resulting InvalidTokenError to
        // INVALID_AUTHORIZATION_CREDENTIAL, the same code a 401 from the API produces, so the skill
        // behaves identically either way - this only decides whether we find out locally.
        //
        // The decoded subject is deliberately discarded. It identifies the account, these responses
        // are logged to CloudWatch, and nothing downstream would ask whether a log may carry it.
        jwtDecode(handler.token(request));

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