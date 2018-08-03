import { IEndpoint } from '../models/Alexa';

interface ILinnApiDevicesProxy {
    list(token : string) : Promise<IEndpoint[]>,
    setStandby(deviceId : string, value : boolean, token : string) : Promise<void>
}

export default ILinnApiDevicesProxy;