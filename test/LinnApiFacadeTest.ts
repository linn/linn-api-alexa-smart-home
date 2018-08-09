import LinnApiFacade from '../src/facade/LinnApiFacade';
import ILinnApiFacade from '../src/facade/ILinnApiFacade';
import { IEndpoint } from '../src/models/Alexa';
import * as nock from 'nock';

describe('LinnApiFacade', () => {
    let sut : ILinnApiFacade;
    let fakeApiRoot = 'https://test';
    let deviceApi : nock.Scope;

    beforeEach(() => {
        nock.cleanAll();
        sut = new LinnApiFacade(fakeApiRoot);    
    });

    describe('Listing Devices', () => {
        let token : string;
        let endpoints : IEndpoint[];

        beforeEach(async () => {
            token = "VALID_TOKEN";

            deviceApi = nock(fakeApiRoot).get('/devices/').reply(200, [
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

            endpoints = await sut.list(token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });

        it('Should provide expected endpoint', () => {
            expect(endpoints).toHaveLength(1);
            expect(endpoints[0].endpointId).toBe("device0");
            expect(endpoints[0].manufacturerName).toBe("Linn Products Ltd.");
            expect(endpoints[0].friendlyName).toBe("Morning Room");
            expect(endpoints[0].description).toBe("Akurate DSM");
            expect(endpoints[0].capabilities).toHaveLength(5);
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa")).toBeTruthy();
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa.PowerController")).toBeTruthy();
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa.Speaker")).toBeTruthy();
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa.StepSpeaker")).toBeTruthy();
            let playbackController = endpoints[0].capabilities.find(c => c.interface == "Alexa.PlaybackController");
            expect(playbackController).toBeTruthy();
            expect(playbackController.supportedOperations).toContain("Play");
            expect(playbackController.supportedOperations).toContain("Pause");
            expect(playbackController.supportedOperations).toContain("Stop");
            expect(playbackController.supportedOperations).toContain("Next");
            expect(playbackController.supportedOperations).toContain("Previous");
        });
    });

    describe('Setting Standby', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/devices/device0/standby').reply(200);

            await sut.setStandby(deviceId, true, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });
    });

    describe('Coming out of Standby', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).delete('/devices/device0/standby').reply(200);

            await sut.setStandby(deviceId, false, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });
    });

    describe('Starting Playback', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/play').reply(200);

            await sut.play(deviceId, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('Pausing Playback', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/pause').reply(200);

            await sut.pause(deviceId, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('Stopping Playback', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/stop').reply(200);

            await sut.stop(deviceId, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('Skipping to the next track', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).post('/players/device0/next').reply(200);

            await sut.next(deviceId, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('Skipping to the previous track', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).post('/players/device0/prev').reply(200);

            await sut.prev(deviceId, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('Adjusting Volume', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).post('/players/device0/volume?steps=20').reply(200);

            await sut.adjustVolume(deviceId, 20, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('When muting', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/mute').reply(200);

            await sut.setMute(deviceId, true, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('When unmuting', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).delete('/players/device0/mute').reply(200);

            await sut.setMute(deviceId, false, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });
});