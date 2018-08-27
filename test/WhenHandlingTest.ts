import { handler } from '../src/Handler';
import { IAlexaRequest, IAlexaResponse } from '../src/models/Alexa';
import * as nock from 'nock';

describe('Handler', () => {
    let alexaRequest : IAlexaRequest<any>;
    let alexaResponse : IAlexaResponse<any>;
    let apiRoot = "https://api.linn.co.uk";

    beforeEach(() => {
        nock.cleanAll();
    });

    describe('And a discovery handler runs', () => {
        beforeEach((done) => {
            nock(apiRoot).get('/devices/').reply(200, [
                {
                  "id": "device0",
                  "serialNumber": "1001",
                  "category": "ds",
                  "model": "Akurate DSM",
                  "name": "Morning Room",
                  "links": [
                    { "rel": "player", "href": "/players/device0/" }
                  ]
                }
            ]);
            nock(apiRoot).get('/players/').reply(200, [
                {
                  "id": "device0",
                  "name": "Morning Room",
                  "sources": [
                    { 
                        "id": "HDMI 1", 
                        "name": "Television", 
                        "visible": true
                    },
                    { 
                        "id": "Analog 1", 
                        "name": "Analog 1", 
                        "visible": false
                    }
                  ]
                }
            ]);
            alexaRequest = { directive: { header: { namespace: "Alexa.Discovery", name: "Discover", payloadVersion: "3", messageId: "34ffca11-b668-49c6-abcb-89789fa70428" }, payload: { scope: { type: "BearerToken", token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE1MzMyNDY1NzEsImV4cCI6MTUzMzI1MDE3MSwiaXNzIjoiaHR0cHM6Ly93d3cubGlubi5jby51ay9hdXRoIiwiYXVkIjpbImh0dHBzOi8vd3d3Lmxpbm4uY28udWsvYXV0aC9yZXNvdXJjZXMiLCJsaW5uX2FwaSJdLCJjbGllbnRfaWQiOiI5ZTNkYzY4OC05ZjM5LTQ4ZDQtODNjNS1hMTM4ZTQyZWRlMTciLCJzdWIiOiIvYXV0aC9leHRlcm5hbC1hY2NvdW50cy9lMWUwZGU2MC1kMDk1LTQ2MTQtYTBmZC1lNmI1NjhlMTJmZGMiLCJhdXRoX3RpbWUiOjE1MzI5NTQ4MjQsImlkcCI6ImxvY2FsIiwicGxheWVyLWluZm9ybWF0aW9uIjoidHJ1ZSIsImRldmljZS1jb250cm9sIjoidHJ1ZSIsInZvbHVtZS1jb250cm9sIjoidHJ1ZSIsImxpc3QtcGxheWxpc3RzIjoidHJ1ZSIsInJlYWQtcGxheWxpc3QiOiJ0cnVlIiwic2NvcGUiOlsib3BlbmlkIiwiZGV2aWNlX2NvbnRyb2wiLCJ2b2x1bWVfY29udHJvbCIsImxpc3RfcGxheWxpc3RzIiwicGxheWVyX2luZm9ybWF0aW9uIiwicmVhZF9wbGF5bGlzdHMiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl19.VL0dPChGKv55JJgDtSCD3cp8pW3sO_1q8TUzbzR_5AK4qQo7GVl4r8C57ojWeWSahPvnmSVnTuMfZpM6ukBSj1BTnbyCRaV4kS-OAyDSX2zphO4mlBY7nzn2d5oxtN6QwztEA3E9c7J7rycJEh__x1lgKo9lYVRxgDAX45ISEPxRnpqUNkKBMtYsavGMuhdsRVvdX--Xe4shwLBMrI6lRU4FvQHQ_oW604NR9V_MwPPCiJy7HcEfjlKZ2atRpMyJuphROE2-mLm8JhzK9d5kKN0v78e-QnUZOaC0-GM1Kuu8ic-PxBaG_NP1v6LshKSgpWijUDbjsF1caXLEHOIwMQ" } } } };
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.header.name).not.toBe("ErrorResponse");
        });
    });

    describe('And a request handler runs without error', () => {
        beforeEach((done) => {
            nock(apiRoot).put('/players/device-001/play').reply(200);
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.header.name).not.toBe("ErrorResponse");
        });
    });

    describe('And a request handler fails due to a 401', () => {
        beforeEach((done) => {
            nock(apiRoot).put('/players/device-001/play').reply(401, { error: 'Error' });
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.payload.message).toBeTruthy();
        });
    });

    describe('And a request handler fails due to a 404', () => {
        describe('caused by a device no longer being available', () => {
            beforeEach((done) => {
                nock(apiRoot).put('/players/device-001/play').reply(404, { error: 'ClientPlayerNotFoundException' });
                alexaRequest = generateRequest("Play");
                handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
                expect(alexaResponse.event.payload.message).toBeTruthy();
            });
        });

        describe('caused by an invalid value', () => {
            beforeEach((done) => {
                nock(apiRoot).put('/players/device-001/play').reply(404, { error: 'PlaylistVersionDeletedException' });
                alexaRequest = generateRequest("Play");
                handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
                expect(alexaResponse.event.payload.message).toBeTruthy();
            });
        });
    });

    describe('And a request handler fails due to a 504', () => {
        beforeEach((done) => {
            nock(apiRoot).put('/players/device-001/play').reply(504, { error: 'Error' });
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.payload.message).toBeTruthy();
        });
    });

    describe('And a request handler fails due to a 400', () => {
        beforeEach((done) => {
            nock(apiRoot).put('/players/device-001/play').reply(400, { error: 'Error' });
            alexaRequest = generateRequest("Play");
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.payload.message).toBeTruthy();
        });
    });

    describe('And a request handler fails due to no supporting handler', () => {
        beforeEach((done) => {
            alexaRequest = generateRequest("Play", "Alexa.MissingHandler");
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.payload.message).toBeTruthy();
        });
    });

    describe('And a request handler fails due to no supported command', () => {
        beforeEach((done) => {
            alexaRequest = generateRequest("NotACommand");
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.payload.message).toBeTruthy();
        });
    });

    describe('And a request handler fails due to an invalid value', () => {
        beforeEach((done) => {
            alexaRequest = generateRequest("SetVolume", "Alexa.Speaker");
            handler(alexaRequest, { awsRequestId: 'test' }, (error, result) => {
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
            expect(alexaResponse.event.payload.message).toBeTruthy();
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