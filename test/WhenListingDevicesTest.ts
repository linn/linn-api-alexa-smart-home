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
        sut = new LinnApiDevicesProxy(fakeApiRoot);    
    });

    describe('Listing with valid token', () => {
        let token : string;
        let endpoints : IEndpoint[];

        beforeEach(async () => {
            token = "VALID_TOKEN";
            endpoints = await sut.list(token);
        });

        test('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });

        test('Should provide expected endpoint', () => {
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
    })
});