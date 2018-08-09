import { IEndpoint } from '../models/Alexa';

interface ILinnApiFacade {
    list(token : string) : Promise<IEndpoint[]>,
    setStandby(deviceId : string, value : boolean, token : string) : Promise<void>
    play(deviceId : string, token : string) : Promise<void>
    pause(deviceId : string, token : string) : Promise<void>
    stop(deviceId : string, token : string) : Promise<void>
    prev(deviceId : string, token : string) : Promise<void>
    next(deviceId : string, token : string) : Promise<void>
}

export default ILinnApiFacade;