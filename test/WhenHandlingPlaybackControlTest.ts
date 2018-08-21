import PlaybackControlHandler from '../src/handlers/PlaybackControlHandler';
import { IAlexaRequest, IAlexaResponse } from '../src/models/Alexa';
import ILinnApiFacade, { InvalidDirectiveError } from '../src/facade/ILinnApiFacade';

describe('PlaybackControlHandler', () => {
    let alexaRequest : IAlexaRequest<any>;
    let alexaResponse : IAlexaResponse<any>;
    let requestedDeviceId : string;
    let actionCalled : string;
    let requestedToken : string;
    let fakeFacade : ILinnApiFacade = {
        list: async (token : string) => { return null; },
        setStandby: async (deviceId : string, value : boolean, token : string) => { return null; },
        play: async (deviceId : string, token : string) => { requestedDeviceId = deviceId, actionCalled = "play", requestedToken = token },
        pause: async (deviceId : string, token : string) => { requestedDeviceId = deviceId, actionCalled = "pause", requestedToken = token },
        stop: async (deviceId : string, token : string) => { requestedDeviceId = deviceId, actionCalled = "stop", requestedToken = token },
        next: async (deviceId : string, token : string) => { requestedDeviceId = deviceId, actionCalled = "next", requestedToken = token },
        prev: async (deviceId : string, token : string) => { requestedDeviceId = deviceId, actionCalled = "prev", requestedToken = token },
        setMute: async (deviceId : string, value : boolean, token : string) => { return null; },
        adjustVolume: async (deviceId : string, steps : number, token : string) => { return null; },
        setVolume: async (deviceId : string, volume : number, token : string) => { return null; },
        setSource: async (deviceId : string, input : string, token : string) => { return null; },
        invokeDevicePin: async (deviceId : string, pinId : number, token : string) => { return null; }
    }

    let sut = new PlaybackControlHandler(fakeFacade);

    function generateRequest(name : string) : IAlexaRequest<any> {
        return {
            "directive": {
                "header": {
                    "namespace": "Alexa.PlaybackController",
                    "name": name,
                    "messageId": "abc-123-def-456",
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
                "payload": {}
            }
        };
    }

    describe('#Play', () => {
        beforeEach(async () => {
            alexaRequest = generateRequest("Play");
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(actionCalled).toBe("play");
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

    describe('#Pause', () => {
        beforeEach(async () => {
            alexaRequest = generateRequest("Pause");
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(actionCalled).toBe("pause");
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

    describe('#Stop', () => {
        beforeEach(async () => {
            alexaRequest = generateRequest("Stop");
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(actionCalled).toBe("stop");
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

    describe('#Next', () => {     
        beforeEach(async () => {
            alexaRequest = generateRequest("Next");
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(actionCalled).toBe("next");
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

    describe('#Previous', () => {     
        beforeEach(async () => {
            alexaRequest = generateRequest("Previous");
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(actionCalled).toBe("prev");
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
