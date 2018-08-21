import LinnApiFacade from '../src/facade/LinnApiFacade';
import ILinnApiFacade, { InvalidAuthorizationCredentialError,NoSuchEndpointError, EndpointUnreachableError, EndpointInternalError, InvalidValueError } from "../src/facade/ILinnApiFacade";
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
        let playersApi : nock.Scope;

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

            playersApi = nock(fakeApiRoot).get('/players/').reply(200, [
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

            endpoints = await sut.list(token);
        });

        it('Should call /devices/ API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });

        it('Should call /players/ API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });

        it('Should provide expected endpoint', () => {
            expect(endpoints).toHaveLength(1);
            expect(endpoints[0].endpointId).toBe("device0");
            expect(endpoints[0].manufacturerName).toBe("Linn Products Ltd.");
            expect(endpoints[0].friendlyName).toBe("Morning Room");
            expect(endpoints[0].description).toBe("Akurate DSM");
            expect(endpoints[0].capabilities).toHaveLength(6);
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa")).toBeTruthy();
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa.PowerController")).toBeTruthy();
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa.Speaker")).toBeTruthy();
            expect(endpoints[0].capabilities.find(c => c.interface == "Alexa.ChannelController")).toBeTruthy();
            let inputController = endpoints[0].capabilities.find(c => c.interface == "Alexa.InputController");
            expect(inputController).toBeTruthy();
            let inputs = inputController.inputs.map(s => s.name);
            expect(inputs).toHaveLength(1);
            expect(inputs[0]).toBe("Television");
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

    describe('When setting volume', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/volume?level=11').reply(200);

            await sut.setVolume(deviceId, 11, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });    
    });

    describe('When setting source', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/source?sourceId=television').reply(200);

            await sut.setSource(deviceId, 'television', token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });
    });

    describe('When invoking device pin', () => {
        let token : string;
        let deviceId : string;

        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/play?pinId=3').reply(200);

            await sut.invokeDevicePin(deviceId, 3, token);
        });

        it('Should call API', () => {
            expect(deviceApi.isDone()).toBeTruthy();
        });
    });

    describe('When the API returns status code 401', () => {
        let token : string;
        let deviceId : string;
        let error : any;
        
        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/volume?level=11').reply(401, { error: 'AccessTokenAuthenticationFailureException' });

            try {
                await sut.setVolume(deviceId, 11, token);
            }
            catch (e) {
                error = e;
            }
        });

        it('Should throw exception', async () => {
            expect(error).toBeInstanceOf(InvalidAuthorizationCredentialError);
        });
    });

    describe('When the API returns status code 403', () => {
        let token : string;
        let deviceId : string;
        let error : any;
        
        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/volume?level=11').reply(403, { error: 'AccessTokenMissingClaimException' });

            try {
                await sut.setVolume(deviceId, 11, token);
            }
            catch (e) {
                error = e;
            }
        });

        it('Should throw exception', async () => {
            expect(error).toBeInstanceOf(InvalidAuthorizationCredentialError);
        });
    });

    describe('When the API returns status code 404', () => {
        describe('#ClientPlayerNotFoundException', () => {
            let token : string;
            let deviceId : string;
            let error : any;

            beforeEach(async () => {
                token = "VALID_TOKEN";
                deviceId = "device0";

                deviceApi = nock(fakeApiRoot).put('/players/device0/volume?level=11').reply(404, { error: 'ClientPlayerNotFoundException' });

                try {
                    await sut.setVolume(deviceId, 11, token);
                }
                catch (e) {
                    error = e;
                }
            });

            it('Should throw exception', async () => {
                expect(error).toBeInstanceOf(NoSuchEndpointError);
            });
        });

        describe('#ClientDeviceSourceNotFoundException', () => {
            let token : string;
            let deviceId : string;
            let error : any;

            beforeEach(async () => {
                token = "VALID_TOKEN";
                deviceId = "device0";

                deviceApi = nock(fakeApiRoot).put('/players/device0/source?sourceId=unknown').reply(404, { error: 'ClientDeviceSourceNotFoundException' });

                try {
                    await sut.setSource(deviceId, "unknown", token);
                }
                catch (e) {
                    error = e;
                }
            });

            it('Should throw exception', async () => {
                expect(error).toBeInstanceOf(InvalidValueError);
            });
        });
    });

    describe('When the API returns status code 504', () => {
        let token : string;
        let deviceId : string;
        let error : any;
        
        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/volume?level=11').reply(504, { error: 'DeviceServiceTimeoutException' });

            try {
                await sut.setVolume(deviceId, 11, token);
            }
            catch (e) {
                error = e;
            }
        });

        it('Should throw exception', async () => {
            expect(error).toBeInstanceOf(EndpointUnreachableError);
        });
    });

    describe('When the API returns status code 502', () => {
        let token : string;
        let deviceId : string;
        let error : any;
        
        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/volume?level=11').reply(502, { error: 'DeviceServiceException' });

            try {
                await sut.setVolume(deviceId, 11, token);
            }
            catch (e) {
                error = e;
            }
        });

        it('Should throw exception', async () => {
            expect(error).toBeInstanceOf(EndpointInternalError);
        });
    });

    describe('When the API returns status code 400', () => {
        let token : string;
        let deviceId : string;
        let error : any;
        
        beforeEach(async () => {
            token = "VALID_TOKEN";
            deviceId = "device0";

            deviceApi = nock(fakeApiRoot).put('/players/device0/volume?level=11').reply(400, { error: 'ClientDomainException' });

            try {
                await sut.setVolume(deviceId, 11, token);
            }
            catch (e) {
                error = e;
            }
        });

        it('Should throw exception', async () => {
            expect(error).toBeInstanceOf(EndpointInternalError);
        });
    });
});