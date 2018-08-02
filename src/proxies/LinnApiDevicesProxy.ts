import { ILinnApiDevicesProxy } from "./ILinnApiDevicesProxy";
import { SpeakerEndpoint, IEndpoint } from "../models/IEndpoint";
import * as WebRequest from 'web-request';
import { AssociatedDevice } from "../models/AssociatedDevice";

class LinnApiDevicesProxy implements ILinnApiDevicesProxy {
    constructor(private apiRoot : string) {
    }
    async list(token : string): Promise<IEndpoint[]> {

        let options = {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        let devices = await WebRequest.json<AssociatedDevice[]>(`${this.apiRoot}/devices/`, options);
        
        return devices.map(d => new SpeakerEndpoint(d.id, d.name, d.model));
    }
}

export { LinnApiDevicesProxy }