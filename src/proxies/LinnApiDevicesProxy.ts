import ILinnApiDevicesProxy from "./ILinnApiDevicesProxy";
import { SpeakerEndpoint, IEndpoint } from "../models/Alexa";
import * as webRequest from 'web-request';

interface AssociatedDevice {
    id: string;
    serialNumber: string;
    category: string;
    model: string;
    name: string;
    links: LinkResource[];
}

interface LinkResource {
    rel: string;
    href: string;
}

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

        let devices = await webRequest.json<AssociatedDevice[]>(`${this.apiRoot}/devices/`, options);
        
        return devices.map(d => new SpeakerEndpoint(d.id, d.name, d.model));
    }
    async setStandby(deviceId : string, value : boolean, token : string): Promise<void> {
    }
}

export default LinnApiDevicesProxy