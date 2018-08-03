import DiscoveryHandler from '../src/handlers/DiscoveryHandler';
import { AlexaRequest, AlexaResponse, DiscoveryPayload } from '../src/models/Alexa';
import ILinnApiDevicesProxy from '../src/proxies/ILinnApiDevicesProxy';
import { SpeakerEndpoint, IEndpoint } from '../src/models/Alexa';

describe('DiscoveryHandler', () => {
    let alexaRequest : AlexaRequest;
    let alexaResponse : AlexaResponse<DiscoveryPayload>;
    let endpoints : IEndpoint[] = [ new SpeakerEndpoint("SPEAKER_ID", "SPEAKER_NAME", "SPEAKER_DESCRIPTION") ]
    let fakeProxy : ILinnApiDevicesProxy = {
        list: async (token : string) => {
             return endpoints;
        }
    }
    let sut = new DiscoveryHandler(fakeProxy);
    beforeEach((callback) => {
        alexaRequest = { directive: { header: { namespace: "Alexa.Discovery", name: "Discover", payloadVersion: "3", messageId: "34ffca11-b668-49c6-abcb-89789fa70428" }, payload: { scope: { type: "BearerToken", token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE1MzMyNDY1NzEsImV4cCI6MTUzMzI1MDE3MSwiaXNzIjoiaHR0cHM6Ly93d3cubGlubi5jby51ay9hdXRoIiwiYXVkIjpbImh0dHBzOi8vd3d3Lmxpbm4uY28udWsvYXV0aC9yZXNvdXJjZXMiLCJsaW5uX2FwaSJdLCJjbGllbnRfaWQiOiI5ZTNkYzY4OC05ZjM5LTQ4ZDQtODNjNS1hMTM4ZTQyZWRlMTciLCJzdWIiOiIvYXV0aC9leHRlcm5hbC1hY2NvdW50cy9lMWUwZGU2MC1kMDk1LTQ2MTQtYTBmZC1lNmI1NjhlMTJmZGMiLCJhdXRoX3RpbWUiOjE1MzI5NTQ4MjQsImlkcCI6ImxvY2FsIiwicGxheWVyLWluZm9ybWF0aW9uIjoidHJ1ZSIsImRldmljZS1jb250cm9sIjoidHJ1ZSIsInZvbHVtZS1jb250cm9sIjoidHJ1ZSIsImxpc3QtcGxheWxpc3RzIjoidHJ1ZSIsInJlYWQtcGxheWxpc3QiOiJ0cnVlIiwic2NvcGUiOlsib3BlbmlkIiwiZGV2aWNlX2NvbnRyb2wiLCJ2b2x1bWVfY29udHJvbCIsImxpc3RfcGxheWxpc3RzIiwicGxheWVyX2luZm9ybWF0aW9uIiwicmVhZF9wbGF5bGlzdHMiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl19.VL0dPChGKv55JJgDtSCD3cp8pW3sO_1q8TUzbzR_5AK4qQo7GVl4r8C57ojWeWSahPvnmSVnTuMfZpM6ukBSj1BTnbyCRaV4kS-OAyDSX2zphO4mlBY7nzn2d5oxtN6QwztEA3E9c7J7rycJEh__x1lgKo9lYVRxgDAX45ISEPxRnpqUNkKBMtYsavGMuhdsRVvdX--Xe4shwLBMrI6lRU4FvQHQ_oW604NR9V_MwPPCiJy7HcEfjlKZ2atRpMyJuphROE2-mLm8JhzK9d5kKN0v78e-QnUZOaC0-GM1Kuu8ic-PxBaG_NP1v6LshKSgpWijUDbjsF1caXLEHOIwMQ" } } } };
        let testContext = {
            succeed: (result : AlexaResponse<DiscoveryPayload>) => {
                alexaResponse = result;
                callback();
            },
            fail: (error?: Error) => callback(error),
            done: (error?: Error, result?: Object) => callback(error, result),
            getRemainingTimeInMillis: () => 1000
        };
        sut.handle(alexaRequest, testContext);
    });
    test('Should respond with expected endpoints', () => {
        expect(alexaResponse.event.header.name).toBe("Discover.Response");
        expect(alexaResponse.event.header.namespace).toBe("Alexa.Discovery");
        expect(alexaResponse.event.header.correlationToken).toBe(alexaRequest.directive.header.correlationToken);
        expect(alexaResponse.event.header.payloadVersion).toBe("3");
        expect(alexaResponse.event.header.messageId).toBe(`${alexaRequest.directive.header.messageId}-R`);
        expect(alexaResponse.event.payload.endpoints).toHaveLength(1);
        expect(alexaResponse.event.payload.endpoints[0].endpointId).toBe("SPEAKER_ID");
    });
});
