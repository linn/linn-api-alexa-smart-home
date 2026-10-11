// Two projects, because they answer different questions and are run at different times.
//
// unit       - the handlers and the facade in isolation, HTTP intercepted with nock.
// acceptance - the Lambda entry point, exercised exactly as Alexa calls it: a directive in, a response
//              out, over a mocked Linn API. It imports src/Handler and nothing else, so it is blind to
//              how the code inside is arranged. It does NOT load the built artefact from dist/. What
//              proves the shipped zip runs is scripts/smoke-test.sh, which invokes the deployed function.
//
// Both projects load test/setup.ts, which blocks any request nock was not told to intercept. Without it
// an unanticipated request leaves CI for the real production API.
//
// Vitest strips types without checking them; `npm run typecheck` (tsconfig.test.json) is what fails the
// build on a type error in a test.
import { defineConfig } from 'vitest/config';

const shared = {
    environment: 'node',
    globals: true,
    setupFiles: ['test/setup.ts'],
    clearMocks: true,
};

export default defineConfig({
    test: {
        projects: [
            { test: { ...shared, name: 'unit', include: ['test/*Test.ts'] } },
            { test: { ...shared, name: 'acceptance', include: ['test/acceptance/*Test.ts'] } },
        ],
    },
});
