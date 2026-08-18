// Two projects, because they answer different questions and are run at different times.
//
// unit       - the handlers and the facade in isolation, HTTP intercepted with nock.
// acceptance - the Lambda entry point, exercised exactly as Alexa calls it: a directive in, a response
//              out, over a mocked Linn API. It imports src/Handler and nothing else, so it is blind to
//              how the code inside is arranged. It does NOT load the built artefact from dist/ - an
//              earlier version of this comment said it did. What proves the shipped zip runs is
//              scripts/smoke-test.sh, which invokes the deployed function.
//
// Both projects load test/setup.ts, which blocks any request nock was not told to intercept. Without it
// an unanticipated request leaves CI for the real production API.
const ts = ['ts-jest', { tsconfig: { esModuleInterop: true, target: 'es2023', lib: ['es2023'], types: ['node', 'jest'] } }];

module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/*Test.ts'],
      transform: { '^.+\\.ts$': ts },
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      clearMocks: true,
    },
    {
      displayName: 'acceptance',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/acceptance/*Test.ts'],
      transform: { '^.+\\.ts$': ts },
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      clearMocks: true,
    },
  ],
};
