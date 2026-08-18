// Applied to every project, and it is the difference between a suite that can fail and one that cannot.
//
// nock intercepts what it was told to intercept and lets everything else through to the real network.
// Both acceptance suites point at https://api.linn.co.uk, so before this file any request a test did not
// anticipate left CI for PRODUCTION - and the fixture token is expired, so production answers 401, which
// is exactly what several of the error-mapping rows assert. A test could therefore have been passing on
// production's answer rather than on ours, indistinguishably.
//
// disableNetConnect turns that from silent into a named failure. It belongs here rather than in each file
// so a new test file cannot forget it.
import nock from 'nock';

beforeAll(() => {
    nock.disableNetConnect();
});

afterAll(() => {
    nock.enableNetConnect();
});
