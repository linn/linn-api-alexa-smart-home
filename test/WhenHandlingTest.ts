import { handler } from '../src/Handler';
import { IAlexaRequest, IAlexaResponse } from '../src/models/Alexa';
import * as nock from 'nock';

describe('Handler', () => {
    let alexaRequest : IAlexaRequest<any>;
    let alexaResponse : IAlexaResponse<any>;
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

    describe('And a request handler fails due to no supporting handler', () => {
        beforeEach((done) => {
            alexaRequest = generateRequest("Play", "Alexa.MissingHandler");
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
            expect(alexaResponse.event.payload.type).toBe("INVALID_DIRECTIVE");
        });
    });

    describe('And a request handler fails due to no supported command', () => {
        beforeEach((done) => {
            alexaRequest = generateRequest("NotACommand");
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
            expect(alexaResponse.event.payload.type).toBe("INVALID_DIRECTIVE");
        });
    });

    describe('And a request handler fails due to an invalid value', () => {
        beforeEach((done) => {
            alexaRequest = generateRequest("SetVolume", "Alexa.Speaker");
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
            expect(alexaResponse.event.payload.type).toBe("INVALID_VALUE");
        });
    });
});

function generateRequest(name : string, namespace : string = "Alexa.PlaybackController") : IAlexaRequest<any> {
    return {
        "directive": {
            "header": {
                "namespace": namespace,
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