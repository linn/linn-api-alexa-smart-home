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

    it('Should return a promise rather than signalling through a callback', () => {
        expect(handler({} as any, { awsRequestId: 'signature' } as any)).toBeInstanceOf(Promise);
    });
});
