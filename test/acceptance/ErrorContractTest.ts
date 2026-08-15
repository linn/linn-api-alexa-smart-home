// How a Linn API failure reaches Alexa.
//
// Alexa only distinguishes failures it recognises: an error with the right type re-prompts the
// customer usefully ("that device isn't responding", "I couldn't find that device"), and anything
// else collapses into a generic apology. So the mapping from our API's status codes to Alexa's error
// taxonomy is customer-visible behaviour, and it is asserted here at the boundary rather than in the
// facade, because the whole chain - facade error, handler, envelope - has to survive for it to work.
import nock from 'nock';
import { API_ROOT, DEVICE_ID, CORRELATION_TOKEN, controlDirective, invoke } from './fixtures';

describe('Failures reaching Alexa', () => {
    beforeEach(() => { nock.cleanAll(); });
    afterEach(() => { nock.cleanAll(); });

    describe.each([
        [401, { error: 'AccessTokenAuthenticationFailureException' }, "INVALID_AUTHORIZATION_CREDENTIAL"],
        [403, { error: 'AccessTokenMissingClaimException' }, "INVALID_AUTHORIZATION_CREDENTIAL"],
        [404, { error: 'ClientPlayerNotFoundException' }, "NO_SUCH_ENDPOINT"],
        [404, { error: 'SomethingElseException' }, "INVALID_VALUE"],
        [504, { error: 'DeviceServiceTimeoutException' }, "ENDPOINT_UNREACHABLE"],
        [502, { error: 'DeviceServiceException' }, "INTERNAL_ERROR"],
    ])('a %s from the Linn API', (status, body, expectedType) => {
        beforeEach(() => {
            nock(API_ROOT).put(`/players/${DEVICE_ID}/volume?level=11`).reply(status as number, body);
        });

        it(`is reported to Alexa as ${expectedType}`, async () => {
            const response = await invoke(controlDirective("Alexa.Speaker", "SetVolume", { volume: 11 }));
            expect(response.event.header.name).toBe("ErrorResponse");
            expect(response.event.payload.type).toBe(expectedType);
        });

        // An error response Alexa cannot address is worse than no response: it loses the correlation
        // and the customer gets a generic failure with nothing to trace it by.
        it('is still a well-formed, correctly addressed Alexa event', async () => {
            const response = await invoke(controlDirective("Alexa.Speaker", "SetVolume", { volume: 11 }));
            expect(response.event.header.namespace).toBe("Alexa");
            expect(response.event.header.payloadVersion).toBe("3");
            expect(response.event.header.correlationToken).toBe(CORRELATION_TOKEN);
            expect(response.event.endpoint.endpointId).toBe(DEVICE_ID);
            expect(typeof response.event.payload.message).toBe("string");
        });
    });

    it('rejects a directive in a namespace the skill does not handle', async () => {
        const response = await invoke(controlDirective("Alexa.ThermostatController", "SetTargetTemperature"));
        expect(response.event.header.name).toBe("ErrorResponse");
        expect(response.event.payload.type).toBe("INVALID_DIRECTIVE");
    });

    it('rejects a known namespace carrying an unknown directive name', async () => {
        const response = await invoke(controlDirective("Alexa.PlaybackController", "NotACommand"));
        expect(response.event.header.name).toBe("ErrorResponse");
        expect(response.event.payload.type).toBe("INVALID_DIRECTIVE");
    });

    // The token is never verified here - it is forwarded to the Linn API, and decoded only to log the
    // subject. A token that is not a JWT at all must therefore fail as a credential problem rather
    // than as an internal error, which is what tells Alexa to send the customer to re-link.
    it('reports an unparseable bearer token as a credential failure, not an internal error', async () => {
        const directive = controlDirective("Alexa.PowerController", "TurnOn");
        directive.directive.endpoint.scope.token = "not-a-jwt";
        const response = await invoke(directive);
        expect(response.event.header.name).toBe("ErrorResponse");
        expect(response.event.payload.type).toBe("INVALID_AUTHORIZATION_CREDENTIAL");
    });
});
