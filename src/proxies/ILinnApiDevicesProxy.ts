import { IEndpoint } from '../models/IEndpoint';

interface ILinnApiDevicesProxy {
    list(token : string) : Promise<IEndpoint[]>
}

export { ILinnApiDevicesProxy };