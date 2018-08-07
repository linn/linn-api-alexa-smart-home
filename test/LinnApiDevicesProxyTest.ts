import LinnApiDevicesProxy from '../src/proxies/LinnApiDevicesProxy';
import ILinnApiDevicesProxy from '../src/proxies/ILinnApiDevicesProxy';
import { IEndpoint } from '../src/models/Alexa';
import * as nock from 'nock';

describe('LinnApiDevicesProxy', () => {
    let sut : ILinnApiDevicesProxy;
    let fakeApiRoot = 'https://test';
    let deviceApi : nock.Scope;

    beforeEach(() => {
        nock.cleanAll();
        sut = new LinnApiDevicesProxy(fakeApiRoot);    
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
            let interfaces = endpoints[0].capabilities.map(c => c.interface);
            expect(interfaces).toContain("Alexa");
            expect(interfaces).toContain("Alexa.PowerController");
            expect(interfaces).toContain("Alexa.Speaker");
            expect(interfaces).toContain("Alexa.StepSpeaker");
            expect(interfaces).toContain("Alexa.PlaybackController");
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
});