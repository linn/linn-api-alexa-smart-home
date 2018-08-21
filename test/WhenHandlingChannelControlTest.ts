import ChannelControlHandler from '../src/handlers/ChannelControlHandler';
import { IAlexaRequest, IAlexaResponse } from '../src/models/Alexa';
import ILinnApiFacade, { InvalidDirectiveError, InvalidValueError } from '../src/facade/ILinnApiFacade';

describe('ChannelControlHandler', () => {
    let alexaRequest : IAlexaRequest<any>;
    let alexaResponse : IAlexaResponse<any>;
    let requestedDeviceId : string;
    let requestedPinId : number;
    let requestedToken : string;
    let fakeFacade : ILinnApiFacade = {
        list: async (token : string) => { return null; },
        setStandby: async (deviceId : string, value : boolean, token : string) => { return null; },
        play: async (deviceId : string, token : string) => { return null; },
        pause: async (deviceId : string, token : string) => { return null; },
        stop: async (deviceId : string, token : string) => { return null; },
        next: async (deviceId : string, token : string) => { return null; },
        prev: async (deviceId : string, token : string) => { return null; },
        setMute: async (deviceId : string, value : boolean, token : string) => { return null; },
        adjustVolume: async (deviceId : string, steps : number, token : string) => { return null; },
        setVolume: async (deviceId : string, volume : number, token : string) => { return null; },
        setSource: async (deviceId : string, input : string, token : string) => { return null; },
        invokeDevicePin: async(deviceId: string, pinId : number, token : string) => { requestedDeviceId = deviceId, requestedPinId = pinId, requestedToken = token }
    }

    let sut = new ChannelControlHandler(fakeFacade);

    function generateRequest(directive : string, channelNumber : string) : IAlexaRequest<any> {
        return {
            "directive": {
              "header": {
                "namespace": "Alexa.ChannelController",
                "name": directive,
                "messageId": "abc-123-def-456",
                "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg==",
                "payloadVersion": "3"
              },
              "endpoint": {
                "scope": {
                  "type": "BearerToken",
                  "token": "access-token-from-skill"
                },
                "endpointId": "device-001",
                "cookie": {}
              },
              "payload": {
                "channel": {
                    "number": channelNumber,
                    "callSign": "TESTSTATION1",
                    "affiliateCallSign": "TESTSTATION2",
                    "uri": "someUrl"
                },
                "channelMetadata": {
                    "name": "Alternate Channel Name",
                    "image": "urlToImage"
                }
              }
            }
          };
    }

    describe('#ChangeChannel', () => {
        describe('for pin 3', () => {
            beforeEach(async () => {
                alexaRequest = generateRequest("ChangeChannel", "3");
                alexaResponse = await sut.handle(alexaRequest);
            });

            test('Should invoke facade', () => {
                expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
                expect(requestedPinId).toBe(3);
                expect(requestedToken).toBe(alexaRequest.directive.endpoint.scope.token);
            });

            test('Should respond with expected endpoints', () => {
                expect(alexaResponse.event.header.name).toBe("Response");
                expect(alexaResponse.event.header.namespace).toBe("Alexa");
                expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
                expect(alexaResponse.event.header.payloadVersion).toBe("3");
                expect(alexaResponse.event.header.messageId).toBe(`${alexaRequest.directive.header.messageId}-R`);
                expect(alexaResponse.event.endpoint.scope.type).toBe(alexaRequest.directive.endpoint.scope.type);
                expect(alexaResponse.event.endpoint.scope.token).toBe(alexaRequest.directive.endpoint.scope.token);
                expect(alexaResponse.event.endpoint.endpointId).toBe(alexaRequest.directive.endpoint.endpointId)
            });
        });

        describe('for invalid pin', () => {
            let thrownError : Error;

            beforeEach(async () => {
                alexaRequest = generateRequest("ChangeChannel", "invalid");
                try {
                    await sut.handle(alexaRequest);
                } catch (e) {
                    thrownError = e;
                }
            });

            test('Should throw error', () => {
                expect(thrownError).toBeDefined();
                expect(thrownError).toBeInstanceOf(InvalidValueError);
            });
        });
    });

    describe('#Invalid', () => {
        let thrownError : Error;
        beforeEach(async () => {
            alexaRequest = generateRequest("Invalid", "hdmi1");
            try {
                await sut.handle(alexaRequest);
            } catch (e) {
                thrownError = e;
            }
        });

        test('Should throw error', () => {
            expect(thrownError).toBeDefined();
            expect(thrownError).toBeInstanceOf(InvalidDirectiveError);
        });
    });
});
