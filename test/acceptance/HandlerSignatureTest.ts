// The handler signature the Lambda runtime will accept, asserted here because nothing else can.
//
// Lambda removed callback-style handlers in Node.js 24 and refuses to start any handler that declares
// a third parameter, before a single line of the function runs. Every other test calls the handler
// directly, so all of them pass either way - the only thing that reports the fault is invoking the
// deployed function, which happens after a deploy has already happened.
import { handler } from '../../src/Handler';

describe('The Lambda handler signature', () => {
    it('Should declare two parameters, because Node.js 24 rejects a callback-style handler', () => {
        expect(handler.length).toBe(2);
    });

    it('Should answer through its returned promise rather than through a callback', async () => {
        // Awaited, and the RESOLVED VALUE asserted. `toBeInstanceOf(Promise)` on the call would pass
        // for the callback-style handler too - that one was also `async`, so it returned a promise
        // as well, resolving to undefined once it had signalled through the callback. Only the
        // fulfilled response distinguishes the two contracts.
        const response = await handler({} as any, { awsRequestId: 'signature' } as any);

        expect(response?.event?.header?.namespace).toBe('Alexa');
    });
});
