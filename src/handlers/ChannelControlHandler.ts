import { IAlexaRequest, IAlexaResponse, IChannelRequestPayload, IAlexaResponseContext } from '../models/Alexa';
import AlexaRequestHandler from './AlexaRequestHandler';
import { InvalidDirectiveError, InvalidValueError } from '../facade/ILinnApiFacade';

class ChannelControlHandler extends AlexaRequestHandler<{}, {}> {
    async handle(request: IAlexaRequest<IChannelRequestPayload>) : Promise<IAlexaResponse<{}>> {
        switch(request.directive.header.name) {
            case "ChangeChannel":
                let pinId : number;

                if (request.directive.payload.channel) {
                    pinId = Number(request.directive.payload.channel.number);
                }

                if (!pinId && request.directive.payload.channelMetadata && request.directive.payload.channelMetadata.name) {
                    let pinMatch = request.directive.payload.channelMetadata.name.match(/\d+/);
                    if (pinMatch) {
                        pinId = Number(pinMatch[0]);
                    }
                }

                if (isNaN(pinId)) {
                    throw new InvalidValueError(`Invalid PIN: ${pinId}`);
                }

                await this.facade.invokeDevicePin(request.directive.endpoint.endpointId, pinId, request.directive.endpoint.scope.token);

                return this.generateResponse(request, {}, generateResponseContext(pinId));
            default:
                throw new InvalidDirectiveError(`Unsupported operation: ${request.directive.header.name}`);
        }
    }

    token(request: IAlexaRequest<IChannelRequestPayload>) : string {
        return request.directive.endpoint.scope.token;
    }
}

function generateResponseContext(pinId: number) : IAlexaResponseContext {
    return { 
        properties: [{
            name: "channel",
            namespace: "Alexa.ChannelController",
            timeOfSample: new Date().toISOString(),
            uncertaintyInMilliseconds: 0,
            value: {
                number: `${pinId}`,
                callSign: `PIN ${pinId}`,
                affiliateCallSign: `PIN ${pinId}`,
            }
        }]
    };
}

export default ChannelControlHandler;