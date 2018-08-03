import { IEndpoint } from '../models/Alexa';

interface ILinnApiDevicesProxy {
    list(token : string) : Promise<IEndpoint[]>
}

export default ILinnApiDevicesProxy;