import PlaybackControlHandler from '../src/handlers/PlaybackControlHandler';
import { AlexaRequest, AlexaResponse, IAlexaContext } from '../src/models/Alexa';
import ILinnApiFacade from '../src/facade/ILinnApiFacade';

describe('PlaybackControlHandler', () => {
    let alexaRequest : AlexaRequest<any>;
    let alexaResponse : AlexaResponse<any>;
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
    }

    let sut = new PlaybackControlHandler(fakeFacade);

    function generateRequest(name : string) : AlexaRequest<any> {
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

    function generateContext(callback) : IAlexaContext {
        return {
            succeed: (result : AlexaResponse<any>) => {
                alexaResponse = result;
                callback();
            },
            fail: (error?: Error) => callback(error),
            done: (error?: Error, result?: Object) => callback(error, result),
            getRemainingTimeInMillis: () => 1000
        };
    }

    describe('#Play', () => {
        beforeEach((callback) => {
            alexaRequest = generateRequest("Play");
            sut.handle(alexaRequest, generateContext(callback));
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
        beforeEach((callback) => {
            alexaRequest = generateRequest("Pause");
            sut.handle(alexaRequest, generateContext(callback));
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
        beforeEach((callback) => {
            alexaRequest = generateRequest("Stop");
            sut.handle(alexaRequest, generateContext(callback));
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
        beforeEach((callback) => {
            alexaRequest = generateRequest("Next");
            sut.handle(alexaRequest, generateContext(callback));
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
        beforeEach((callback) => {
            alexaRequest = generateRequest("Previous");
            sut.handle(alexaRequest, generateContext(callback));
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
});
