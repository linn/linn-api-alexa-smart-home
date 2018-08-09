import SpeakerControlHandler from '../src/handlers/SpeakerControlHandler';
import { AlexaRequest, AlexaResponse, SpeakerRequestPayload } from '../src/models/Alexa';
import ILinnApiFacade from '../src/facade/ILinnApiFacade';

describe('SpeakerControl', () => {
    let alexaRequest : AlexaRequest<any>;
    let alexaResponse : AlexaResponse<any>;
    let requestedDeviceId : string;
    let requestedVolumeSteps : number;
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
        adjustVolume: async (deviceId : string, steps : number, token : string) => { requestedDeviceId = deviceId, requestedVolumeSteps = steps, requestedToken = token }
    }

    let sut = new SpeakerControlHandler(fakeFacade);

    function generateRequest<T>(command : string, payload : T) : AlexaRequest<T> {
        return {
            "directive": {
                "header": {
                    "namespace": "Alexa.StepSpeaker",
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
                    "endpointId": "stepSpeaker1",
                    "cookie": {}
                },
                "payload": payload
            }
        }
    }

    describe('#AdjustVolume', () => {
        let volumeRequest = 20;

        beforeEach(async () => {
            alexaRequest = generateRequest<SpeakerRequestPayload>("AdjustVolume", { volume: volumeRequest });
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

    describe('#IncreaseVolumeDefault', () => {
        let volumeRequest = 10;

        beforeEach(async () => {
            alexaRequest = generateRequest<SpeakerRequestPayload>("AdjustVolume", { volume: volumeRequest, volumeDefault: true });
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
            alexaRequest = generateRequest<SpeakerRequestPayload>("AdjustVolume", { volume: volumeRequest, volumeDefault: true });
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
            alexaRequest = generateRequest<SpeakerRequestPayload>("SetMute", { mute: muteRequest });
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
});
