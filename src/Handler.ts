import { jwtDecode } from 'jwt-decode';
import { createHandler, handleError } from './handlers';
import Logger from './Logger';
import type { IAlexaContext, IAlexaRequest, IAlexaResponse } from './models/Alexa';

async function handler(request: IAlexaRequest<any>, context: IAlexaContext): Promise<IAlexaResponse<any>> {
    const logger = new Logger(context);

    try {
        // INSIDE the try. Outside it, a payload with no `directive` threw in Logger before the try was
        // entered: the handler's promise rejected, Alexa received nothing, and NOTHING was logged - not
        // even the request that caused it. An invocation with no record at all is the worst outcome
        // available here, and it was reachable from a console test invoke or any future message shape.
        logger.logRequest(request);

        const handler = createHandler(request);

        // Called for its throw, not its value: a token that is not a JWT is rejected here rather
        // than spent on a round trip to the API. handleError maps the resulting InvalidTokenError to
        // INVALID_AUTHORIZATION_CREDENTIAL, the same code a 401 from the API produces, so the skill
        // behaves identically either way - this only decides whether we find out locally.
        //
        // The decoded subject is deliberately discarded. It identifies the account, these responses
        // are logged to CloudWatch, and nothing downstream would ask whether a log may carry it.
        jwtDecode(handler.token(request));

        const response = await handler.handle(request);

        logger.logResponse(response);

        return response;
    } catch (error) {
        const response = handleError(request, error);

        logger.logError(response);

        return response;
    }
}

export { handler };
