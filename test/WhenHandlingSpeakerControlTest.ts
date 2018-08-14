import SpeakerControlHandler from '../src/handlers/SpeakerControlHandler';
import { IAlexaRequest, IAlexaResponse, ISpeakerRequestPayload } from '../src/models/Alexa';
import ILinnApiFacade, { InvalidDirectiveError, InvalidValueError } from '../src/facade/ILinnApiFacade';

describe('SpeakerControl', () => {
    let alexaRequest : IAlexaRequest<any>;
    let alexaResponse : IAlexaResponse<any>;
    let requestedDeviceId : string;
    let requestedVolumeSteps : number;
    let requestedVolume : number;
    let requestedMuteSettings : boolean;
    let requestedToken : string;
    let fakeFacade : ILinnApiFacade = {
        list: async (token : string) => { return null; },
        setStandby: async (deviceId : string, value : boolean, token : string) => { return null; },
        play: async (deviceId : string, token : string) => { return null; },
        pause: async (deviceId : string, token : string) => { return null; },
        stop: async (deviceId : string, token : string) => { return null; },
        next: async (deviceId : string, token : string) => { return null; },
        prev: async (deviceId : string, token : string) => { return null; },
        setMute: async (deviceId : string, value : boolean, token : string) => { requestedDeviceId = deviceId, requestedMuteSettings = value, requestedToken = token },
        adjustVolume: async (deviceId : string, steps : number, token : string) => { requestedDeviceId = deviceId, requestedVolumeSteps = steps, requestedToken = token },
        setVolume: async (deviceId : string, volume : number, token : string) => { requestedDeviceId = deviceId, requestedVolume = volume, requestedToken = token }
    }

    let sut = new SpeakerControlHandler(fakeFacade);

    function generateRequest<T>(command : string, payload : T) : IAlexaRequest<T> {
        return {
            "directive": {
                "header": {
                    "namespace": "Alexa.Speaker",
                    "name": command,
                    "messageId": "c8d53423-b49b-48ee-9181-f50acedf2870",
                    "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg==",
                    "payloadVersion": "3"
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token":"access-token-from-skill"
                    },
                    "endpointId": "speaker1",
                    "cookie": {}
                },
                "payload": payload
            }
        }
    }

    describe('#SetVolume', () => {
        describe('With valid payload', () => {
            let volumeRequest = 11;

            beforeEach(async () => {
                alexaRequest = generateRequest<ISpeakerRequestPayload>("SetVolume", { volume: volumeRequest });
                alexaResponse = await sut.handle(alexaRequest);
            });

            test('Should invoke facade', () => {
                expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
                expect(requestedVolume).toBe(volumeRequest);
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

        describe('With invalid payload', () => {
            let thrownError : Error;

            beforeEach(async () => {
                alexaRequest = generateRequest<{}>("SetVolume", {});
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

    describe('#AdjustVolume', () => {
        describe('With valid payload', () => {
            let volumeRequest = 20;

            beforeEach(async () => {
                alexaRequest = generateRequest<ISpeakerRequestPayload>("AdjustVolume", { volume: volumeRequest });
                alexaResponse = await sut.handle(alexaRequest);
            });

            test('Should invoke facade', () => {
                expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
                expect(requestedVolumeSteps).toBe(volumeRequest);
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

        describe('With invalid payload', () => {
            let thrownError : Error;

            beforeEach(async () => {
                alexaRequest = generateRequest<{}>("AdjustVolume", {});
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

    describe('#IncreaseVolumeDefault', () => {
        let volumeRequest = 10;

        beforeEach(async () => {
            alexaRequest = generateRequest<ISpeakerRequestPayload>("AdjustVolume", { volume: volumeRequest, volumeDefault: true });
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade, and increase by 3', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(requestedVolumeSteps).toBe(3);
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

    describe('#DecreaseVolumeDefault', () => {
        let volumeRequest = -10;

        beforeEach(async () => {
            alexaRequest = generateRequest<ISpeakerRequestPayload>("AdjustVolume", { volume: volumeRequest, volumeDefault: true });
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade, and decrease by 5', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(requestedVolumeSteps).toBe(-5);
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

    describe('#SetMute', () => {
        let muteRequest = true;

        beforeEach(async () => {
            alexaRequest = generateRequest<ISpeakerRequestPayload>("SetMute", { mute: muteRequest });
            alexaResponse = await sut.handle(alexaRequest);
        });

        test('Should invoke facade', () => {
            expect(requestedDeviceId).toBe(alexaRequest.directive.endpoint.endpointId);
            expect(requestedMuteSettings).toBe(muteRequest);
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
            alexaRequest = generateRequest<{}>("Invalid", {});
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
