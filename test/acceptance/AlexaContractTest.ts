// The Alexa response envelope, asserted at the Lambda boundary.
//
// These are the invariants Amazon enforces and that a customer feels when they break: a response
// that is well-formed but wrongly addressed makes Alexa answer "that device isn't responding" with
// nothing wrong in our logs. The unit tests cover what each handler decides; this suite covers
// whether the thing we hand back is addressed correctly, for every namespace the skill accepts.
import nock from 'nock';
import { API_ROOT, DEVICE_ID, MESSAGE_ID, CORRELATION_TOKEN, discoveryDirective, controlDirective, invoke } from './fixtures';

describe('Alexa response envelope', () => {
    beforeEach(() => { nock.cleanAll(); });
    afterEach(() => { nock.cleanAll(); });

    describe('Discovery', () => {
        beforeEach(() => {
            nock(API_ROOT).get('/devices/').reply(200, [
                { id: DEVICE_ID, serialNumber: "1001", category: "ds", model: "Akurate DSM", name: "Morning Room", links: [] }
            ]);
            nock(API_ROOT).get('/players/').reply(200, [
                { id: DEVICE_ID, name: "Morning Room", sources: [{ id: "HDMI 1", name: "Television", visible: true }], links: [] }
            ]);
        });

        it('answers in the Alexa.Discovery namespace, not the Alexa one', async () => {
            const response = await invoke(discoveryDirective());
            expect(response.event.header.namespace).toBe("Alexa.Discovery");
            expect(response.event.header.name).toBe("Discover.Response");
        });

        it('reports the device as an endpoint Alexa can address', async () => {
            const response = await invoke(discoveryDirective());
            const endpoints = response.event.payload.endpoints;
            expect(endpoints).toHaveLength(1);
            expect(endpoints[0].endpointId).toBe(DEVICE_ID);
        });
    });

    // One representative directive per namespace the skill claims to support. A namespace that stops
    // being routed fails here rather than in a customer's living room.
    describe.each([
        ["Alexa.PowerController", "TurnOn", {}, 'put', `/devices/${DEVICE_ID}/standby`],
        ["Alexa.PlaybackController", "Play", {}, 'put', `/players/${DEVICE_ID}/play`],
        ["Alexa.Speaker", "SetVolume", { volume: 11 }, 'put', `/players/${DEVICE_ID}/volume?level=11`],
        ["Alexa.InputController", "SelectInput", { input: "Television" }, 'put', `/players/${DEVICE_ID}/source?sourceId=Television`],
    ])('%s %s', (namespace, name, payload, method, path) => {
        beforeEach(() => {
            const scope = nock(API_ROOT);
            // Standby is the one that inverts: TurnOn deletes the standby state rather than setting it.
            if (namespace === "Alexa.PowerController") {
                scope.delete(path).reply(200);
            } else {
                (scope as any)[method](path).reply(200);
            }

            // Selecting an input also starts playback - two calls, not one. Mocking only the first
            // leaves the second unmatched and the directive fails, which is how this was found.
            if (namespace === "Alexa.InputController") {
                nock(API_ROOT).put(`/players/${DEVICE_ID}/play`).reply(200);
            }
            nock(API_ROOT).get('/players/').reply(200, [
                { id: DEVICE_ID, name: "Morning Room", sources: [{ id: "Television", name: "Television", visible: true }], links: [] }
            ]);
        });

        it('is not an error, and is addressed back to the same endpoint and correlation', async () => {
            const response = await invoke(controlDirective(namespace, name, payload));
            expect(response.event.header.name).not.toBe("ErrorResponse");
            expect(response.event.header.namespace).toBe("Alexa");
            expect(response.event.header.correlationToken).toBe(CORRELATION_TOKEN);
            expect(response.event.endpoint.endpointId).toBe(DEVICE_ID);
        });

        it('speaks payload version 3 and carries a message id derived from the directive', async () => {
            const response = await invoke(controlDirective(namespace, name, payload));
            expect(response.event.header.payloadVersion).toBe("3");
            expect(response.event.header.messageId).toBe(`${MESSAGE_ID}-R`);
        });
    });
});
