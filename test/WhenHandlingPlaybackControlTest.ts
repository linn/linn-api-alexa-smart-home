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
        pause: async (deviceId : string, token : string) => { requestedDeviceId = deviceId, actionCalled = "pause", requestedToken = token }
    }

    let testContext : IAlexaContext;
    let sut = new PlaybackControlHandler(fakeFacade);

    describe('#Play', () => {     
        beforeEach((callback) => {
            alexaRequest = {
                "directive": {
                  "header": {
                    "namespace": "Alexa.PlaybackController",
                    "name": "Play",
                    "messageId": "abc-123-def-456",
                    "payloadVersion": "3"
                  },
                  "endpoint": {
                    "scope": {
                      "type": "BearerToken",
                      "token": "access-token-from-skill"
                    },
                    "endpointId": "device-001",
                    "cookie": {         
                    }
                  },
                  "payload": {
                  }
                }
              };
            testContext = {
                succeed: (result : AlexaResponse<any>) => {
                    alexaResponse = result;
                    callback();
                },
                fail: (error?: Error) => callback(error),
                done: (error?: Error, result?: Object) => callback(error, result),
                getRemainingTimeInMillis: () => 1000
            };
            sut.handle(alexaRequest, testContext);
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
            alexaRequest = {
                "directive": {
                  "header": {
                    "namespace": "Alexa.PlaybackController",
                    "name": "Pause",
                    "messageId": "abc-123-def-456",
                    "payloadVersion": "3"
                  },
                  "endpoint": {
                    "scope": {
                      "type": "BearerToken",
                      "token": "access-token-from-skill"
                    },
                    "endpointId": "device-001",
                    "cookie": {
              
                    }
                  },
                  "payload": {}
                }
              };
            testContext = {
                succeed: (result : AlexaResponse<any>) => {
                    alexaResponse = result;
                    callback();
                },
                fail: (error?: Error) => callback(error),
                done: (error?: Error, result?: Object) => callback(error, result),
                getRemainingTimeInMillis: () => 1000
            };
            sut.handle(alexaRequest, testContext);
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
});
