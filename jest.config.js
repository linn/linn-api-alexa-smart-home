// Two projects, because they answer different questions and are run at different times.
//
// unit       - the handlers and the facade in isolation, HTTP intercepted with nock.
// acceptance - the built Lambda entry point, exercised exactly as Alexa calls it: a directive in,
//              a response out, over a mocked Linn API. It imports Handler and nothing else, so it
//              is blind to how the code inside is arranged.
const ts = ['ts-jest', { tsconfig: { esModuleInterop: true, target: 'es2023', lib: ['es2023'], types: ['node', 'jest'] } }];

module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/*Test.ts'],
      transform: { '^.+\\.ts$': ts },
      clearMocks: true,
    },
    {
      displayName: 'acceptance',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/acceptance/*Test.ts'],
      transform: { '^.+\\.ts$': ts },
      clearMocks: true,
    },
  ],
};
