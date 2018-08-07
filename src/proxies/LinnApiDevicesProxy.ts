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

    private headers(token : string) {
        return {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
    }

    async list(token : string): Promise<IEndpoint[]> {
        let devices = await webRequest.json<AssociatedDevice[]>(`${this.apiRoot}/devices/`, this.headers(token));
        
        return devices.map(d => new SpeakerEndpoint(d.id, d.name, d.model));
    }

    async setStandby(deviceId : string, value : boolean, token : string): Promise<void> {
        if (value) {
            await webRequest.put(`${this.apiRoot}/devices/${deviceId}/standby`, this.headers(token));
        } else {
            await webRequest.delete(`${this.apiRoot}/devices/${deviceId}/standby`, this.headers(token));
        }
    }
}

export default LinnApiDevicesProxy