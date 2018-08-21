import PowerControlHandler from '../src/handlers/PowerControlHandler';
import { IAlexaRequest, IAlexaResponse } from '../src/models/Alexa';
import ILinnApiFacade, { InvalidDirectiveError } from '../src/facade/ILinnApiFacade';

describe('PowerControlHandler', () => {
    let alexaRequest : IAlexaRequest<any>;
    let alexaResponse : IAlexaResponse<any>;
    let requestedDeviceId : string;
    let requestedStandbyState : boolean;
    let requestedToken : string;
    let fakeFacade : ILinnApiFacade = {
        list: async (token : string) => { return null; },
        setStandby: async (deviceId : string, value : boolean, token : string) => { requestedDeviceId = deviceId, requestedStandbyState = value, requestedToken = token },
        play: async (deviceId : string, token : string) => { return null; },
        pause: async (deviceId : string, token : string) => { return null; },
        stop: async (deviceId : string, token : string) => { return null; },
        next: async (deviceId : string, token : string) => { return null; },
        prev: async (deviceId : string, token : string) => { return null; },
        setMute: async (deviceId : string, value : boolean, token : string) => { return null; },
        adjustVolume: async (deviceId : string, steps : number, token : string) => { return null; },
        setVolume: async (deviceId : string, volume : number, token : string) => { return null; },
        setSource: async (deviceId : string, input : string, token : string) => { return null; },
        invokeDevicePin: async (deviceId : string, pinId : number, token : string) => { return null; }
    }

    let sut = new PowerControlHandler(fakeFacade);

    function generateRequest(command : string) : IAlexaRequest<any> {
        return {
            "directive": {
                "header": {
                    "namespace": "Alexa.PowerController",
                    "name": command,
                    "payloadVersion": "3",
                    "messageId": "1bd5d003-31b9-476f-ad03-71d471922820",
                    "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": "access-token-from-skill"
                    },
                    "endpointId": "appliance-001",
                    "cookie": {}
                },
                "payload": {}
            }
        };
    }

    describe('#TurnOff', () => {
        beforeEach(async () => {
            alexaRequest = generateRequest("TurnOff");
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(requestedStandbyState).toBe(true);
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

    describe('#TurnOn', () => {
        beforeEach(async () => {
            alexaRequest = generateRequest("TurnOn");
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(requestedStandbyState).toBe(false);
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

    describe('#Invalid', () => {
        let thrownError : Error;
        beforeEach(async () => {
            alexaRequest = generateRequest("Invalid");
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
