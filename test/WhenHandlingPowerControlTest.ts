import PowerControlHandler from '../src/handlers/PowerControlHandler';
import { AlexaRequest, AlexaResponse, IAlexaContext } from '../src/models/Alexa';
import ILinnApiDevicesProxy from '../src/proxies/ILinnApiDevicesProxy';

describe('PowerControlHandler', () => {
    let alexaRequest : AlexaRequest<any>;
    let alexaResponse : AlexaResponse<any>;
    let requestedDeviceId : string;
    let requestedStandbyState : boolean;
    let requestedToken : string;
    let fakeProxy : ILinnApiDevicesProxy = {
        list: async (token : string) => { return null; },
        setStandby: async (deviceId : string, value : boolean, token : string) => { requestedDeviceId = deviceId, requestedStandbyState = value, requestedToken = token }
    }
    let testContext : IAlexaContext;
    let sut = new PowerControlHandler(fakeProxy);
    describe('#TurnOff', () => {     
        beforeEach((callback) => {
            alexaRequest = {
                "directive": {
                    "header": {
                        "namespace": "Alexa.PowerController",
                        "name": "TurnOff",
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
        test('Should invoke proxy', () => {
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
        beforeEach((callback) => {
            alexaRequest = {
                "directive": {
                    "header": {
                        "namespace": "Alexa.PowerController",
                        "name": "TurnOn",
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
        test('Should invoke proxy', () => {
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
});
