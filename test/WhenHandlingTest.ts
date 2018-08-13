import { handler } from '../src/Handler';
import { AlexaRequest, AlexaResponse } from '../src/models/Alexa';
import * as nock from 'nock';

describe('Handler', () => {
    let alexaRequest : AlexaRequest<any>;
    let alexaResponse : AlexaResponse<any>;
    let deviceApi : nock.Scope;
    let apiRoot = "https://api.linn.co.uk";

    beforeEach(() => {
        nock.cleanAll();
    });

    describe('And a request handler runs without error', () => {
        beforeEach((done) => {
            deviceApi = nock(apiRoot).put('/players/device-001/play').reply(200);
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, null, (error, result) => {
                if (error) {
                    done(error);
                } else {
                    alexaResponse = result;
                    done();
                }
            });
        });

        it('Should set Alexa Response', () => {
            expect(alexaResponse).toBeTruthy();
        });
    });

    describe('And a request handler fails due to a 401', () => {
        beforeEach((done) => {
            deviceApi = nock(apiRoot).put('/players/device-001/play').reply(401);
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, null, (error, result) => {
                if (error) {
                    done(error);
                } else {
                    alexaResponse = result;
                    done();
                }
            });
        });

        it('Should set Alexa Error Response', () => {
            expect(alexaResponse.event.header.namespace).toBe("Alexa");
            expect(alexaResponse.event.header.name).toBe("ErrorResponse");
            expect(alexaResponse.event.header.messageId).toBe(alexaRequest.directive.header.messageId + "-R");
            expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
            expect(alexaResponse.event.header.payloadVersion).toBe("3");
            expect(alexaResponse.event.endpoint.endpointId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(alexaResponse.event.payload.type).toBe("INVALID_AUTHORIZATION_CREDENTIAL");
        });
    });

    describe('And a request handler fails due to a 404', () => {
        beforeEach((done) => {
            deviceApi = nock(apiRoot).put('/players/device-001/play').reply(404);
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, null, (error, result) => {
                if (error) {
                    done(error);
                } else {
                    alexaResponse = result;
                    done();
                }
            });
        });

        it('Should set Alexa Error Response', () => {
            expect(alexaResponse.event.header.namespace).toBe("Alexa");
            expect(alexaResponse.event.header.name).toBe("ErrorResponse");
            expect(alexaResponse.event.header.messageId).toBe(alexaRequest.directive.header.messageId + "-R");
            expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
            expect(alexaResponse.event.header.payloadVersion).toBe("3");
            expect(alexaResponse.event.endpoint.endpointId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(alexaResponse.event.payload.type).toBe("NO_SUCH_ENDPOINT");
        });
    });

    describe('And a request handler fails due to a 504', () => {
        beforeEach((done) => {
            deviceApi = nock(apiRoot).put('/players/device-001/play').reply(504);
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, null, (error, result) => {
                if (error) {
                    done(error);
                } else {
                    alexaResponse = result;
                    done();
                }
            });
        });

        it('Should set Alexa Error Response', () => {
            expect(alexaResponse.event.header.namespace).toBe("Alexa");
            expect(alexaResponse.event.header.name).toBe("ErrorResponse");
            expect(alexaResponse.event.header.messageId).toBe(alexaRequest.directive.header.messageId + "-R");
            expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
            expect(alexaResponse.event.header.payloadVersion).toBe("3");
            expect(alexaResponse.event.endpoint.endpointId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(alexaResponse.event.payload.type).toBe("ENDPOINT_UNREACHABLE");
        });
    });

    describe('And a request handler fails due to a 400', () => {
        beforeEach((done) => {
            deviceApi = nock(apiRoot).put('/players/device-001/play').reply(400);
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, null, (error, result) => {
                if (error) {
                    done(error);
                } else {
                    alexaResponse = result;
                    done();
                }
            });
        });

        it('Should set Alexa Error Response', () => {
            expect(alexaResponse.event.header.namespace).toBe("Alexa");
            expect(alexaResponse.event.header.name).toBe("ErrorResponse");
            expect(alexaResponse.event.header.messageId).toBe(alexaRequest.directive.header.messageId + "-R");
            expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
            expect(alexaResponse.event.header.payloadVersion).toBe("3");
            expect(alexaResponse.event.endpoint.endpointId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(alexaResponse.event.payload.type).toBe("INTERNAL_ERROR");
        });
    });
});

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