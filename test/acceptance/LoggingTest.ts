// What may and may not appear in CloudWatch, asserted at the boundary.
//
// These lines go to a log group with 7-day retention and no other control on them. CLAUDE.md § PII in
// logs forbids a name, forbids content and behavioural data, and forbids a whole request or response
// body; ADR-034 is why. None of that is enforced by anything downstream, so it is enforced here - a
// logging regression has no failing behaviour to give it away, and by the time anyone reads the log the
// data is already in it.
import nock from 'nock';
import { API_ROOT, DEVICE_ID, TOKEN, controlDirective, discoveryDirective, invoke } from './fixtures';

describe('What reaches the log', () => {
    let lines : string[];
    let spy : jest.SpyInstance;

    // A name a customer would plausibly type, and the reason friendlyName is not pseudonymous.
    const FRIENDLY_NAME = "Sarah's Bedroom";

    beforeEach(() => {
        nock.cleanAll();
        lines = [];
        spy = jest.spyOn(console, 'log').mockImplementation((line : any) => { lines.push(String(line)); });
    });

    afterEach(() => {
        spy.mockRestore();
        nock.cleanAll();
    });

    function logged() : string {
        return lines.join('\n');
    }

    describe('after a discovery', () => {
        beforeEach(async () => {
            nock(API_ROOT).get('/devices/').reply(200, [
                { id: DEVICE_ID, serialNumber: "1001", category: "ds", model: "Akurate DSM", name: FRIENDLY_NAME, links: [{ rel: "player", href: `/players/${DEVICE_ID}/` }] }
            ]);
            nock(API_ROOT).get('/players/').reply(200, [
                { id: DEVICE_ID, name: FRIENDLY_NAME, sources: [{ id: "HDMI 1", name: "Television", visible: true }], links: [] }
            ]);
            await invoke(discoveryDirective());
        });

        // Discovery is the one directive whose token sits in the payload rather than the endpoint, so it
        // is the case that would leak a credential if the payload were ever logged again.
        it('never contains the bearer token', () => {
            expect(logged()).not.toContain(TOKEN);
            expect(logged()).not.toContain('Bearer');
        });

        it('never contains a customer-authored device name', () => {
            expect(logged()).not.toContain(FRIENDLY_NAME);
        });

        // The counterpart: refusing to log the inventory must not leave the line useless. "This account
        // discovered nothing" is the symptom that matters and it has to remain visible.
        it('still says how many endpoints were discovered, and which', () => {
            expect(logged()).toContain('endpointCount');
            expect(logged()).toContain(DEVICE_ID);
        });
    });

    describe('after a failure', () => {
        beforeEach(async () => {
            // An error whose MESSAGE carries the request's own headers. Observed for real from an
            // intercepting library, and the reason an error payload cannot be logged verbatim: the
            // message is whatever the thrower chose, and one of the things it can choose is the
            // Authorization header.
            nock(API_ROOT).put(`/players/${DEVICE_ID}/volume?level=11`)
                .replyWithError(new Error(`upstream refused: {"authorization":"Bearer ${TOKEN}"}`));
            await invoke(controlDirective("Alexa.Speaker", "SetVolume", { volume: 11 }));
        });

        it('never contains the bearer token, whatever the error message said', () => {
            expect(logged()).not.toContain(TOKEN);
            expect(logged()).not.toContain('Bearer');
        });

        it('still names the Alexa error type, which is what diagnosis needs', () => {
            expect(logged()).toContain('errorType');
        });
    });
});
