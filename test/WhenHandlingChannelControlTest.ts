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

    function generateNumberRequest(directive : string, channelNumber : string) : IAlexaRequest<any> {
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
                    "number": channelNumber
                }
              }
            }
          };
    }

    function generateNameRequest(directive : string, channelNumber : string) : IAlexaRequest<any> {
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
                "channelMetadata": {
                    "name": `PIN ${channelNumber}`
                }
              }
            }
          };
    }

    describe('#ChangeChannel', () => {
        describe('for pin 3 by number', () => {
            beforeEach(async () => {
                alexaRequest = generateNumberRequest("ChangeChannel", "3");
                alexaResponse = await sut.handle(alexaRequest);
            });

            test('Should invoke facade', () => {
                expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
                expect(requestedPinId).toBe(3);
                expect(requestedToken).toBe(alexaRequest.directive.endpoint.scope.token);
            });

            test('Should respond correctly', () => {
                expect(alexaResponse.event.header.name).toBe("Response");
                expect(alexaResponse.event.header.namespace).toBe("Alexa");
                expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
                expect(alexaResponse.event.header.payloadVersion).toBe("3");
                expect(alexaResponse.event.header.messageId).toBe(`${alexaRequest.directive.header.messageId}-R`);
                expect(alexaResponse.event.endpoint.scope.type).toBe(alexaRequest.directive.endpoint.scope.type);
                expect(alexaResponse.event.endpoint.scope.token).toBe(alexaRequest.directive.endpoint.scope.token);
                expect(alexaResponse.event.endpoint.endpointId).toBe(alexaRequest.directive.endpoint.endpointId);
                expect(alexaResponse.context.properties).toHaveLength(1);
                expect(alexaResponse.context.properties[0].namespace).toBe("Alexa.ChannelController");
                expect(alexaResponse.context.properties[0].name).toBe("channel");
                expect(alexaResponse.context.properties[0].timeOfSample).toBeTruthy();
                expect(alexaResponse.context.properties[0].uncertaintyInMilliseconds).toBe(0);
                expect(alexaResponse.context.properties[0].value.number).toBe("3");
                expect(alexaResponse.context.properties[0].value.callSign).toBe("PIN 3");
                expect(alexaResponse.context.properties[0].value.affiliateCallSign).toBe("PIN 3");
            });
        });

        describe('for pin 3 by name', () => {
            beforeEach(async () => {
                alexaRequest = generateNameRequest("ChangeChannel", "PIN 3");
                alexaResponse = await sut.handle(alexaRequest);
            });

            test('Should invoke facade', () => {
                expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
                expect(requestedPinId).toBe(3);
                expect(requestedToken).toBe(alexaRequest.directive.endpoint.scope.token);
            });

            test('Should respond correctly', () => {
                expect(alexaResponse.event.header.name).toBe("Response");
                expect(alexaResponse.event.header.namespace).toBe("Alexa");
                expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
                expect(alexaResponse.event.header.payloadVersion).toBe("3");
                expect(alexaResponse.event.header.messageId).toBe(`${alexaRequest.directive.header.messageId}-R`);
                expect(alexaResponse.event.endpoint.scope.type).toBe(alexaRequest.directive.endpoint.scope.type);
                expect(alexaResponse.event.endpoint.scope.token).toBe(alexaRequest.directive.endpoint.scope.token);
                expect(alexaResponse.event.endpoint.endpointId).toBe(alexaRequest.directive.endpoint.endpointId);
                expect(alexaResponse.context.properties).toHaveLength(1);
                expect(alexaResponse.context.properties[0].namespace).toBe("Alexa.ChannelController");
                expect(alexaResponse.context.properties[0].name).toBe("channel");
                expect(alexaResponse.context.properties[0].timeOfSample).toBeTruthy();
                expect(alexaResponse.context.properties[0].uncertaintyInMilliseconds).toBe(0);
                expect(alexaResponse.context.properties[0].value.number).toBe("3");
                expect(alexaResponse.context.properties[0].value.callSign).toBe("PIN 3");
                expect(alexaResponse.context.properties[0].value.affiliateCallSign).toBe("PIN 3");
            });
        });

        describe('for invalid pin', () => {
            describe('for pin 3 by number', () => {
                let thrownError : Error;

                beforeEach(async () => {
                    alexaRequest = generateNumberRequest("ChangeChannel", "invalid");
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
            describe('for pin 3 by name', () => {
                let thrownError : Error;

                beforeEach(async () => {
                    alexaRequest = generateNameRequest("ChangeChannel", "invalid");
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
    });

    describe('#Invalid', () => {
        let thrownError : Error;
        beforeEach(async () => {
            alexaRequest = generateNumberRequest("Invalid", "hdmi1");
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
