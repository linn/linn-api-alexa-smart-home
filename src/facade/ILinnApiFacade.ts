import { IEndpoint } from '../models/Alexa';

interface ILinnApiFacade {
    list(token : string) : Promise<IEndpoint[]>,
    setStandby(deviceId : string, value : boolean, token : string) : Promise<void>
    play(deviceId : string, token : string) : Promise<void>
    pause(deviceId : string, token : string) : Promise<void>
    stop(deviceId : string, token : string) : Promise<void>
    prev(deviceId : string, token : string) : Promise<void>
    next(deviceId : string, token : string) : Promise<void>
    setMute(deviceId : string, value : boolean, token : string) : Promise<void>
    adjustVolume(deviceId : string, steps : number, token : string) : Promise<void>
    setVolume(deviceId : string, level : number, token : string) : Promise<void>
}

class InvalidValueError extends Error
{
    constructor() {
        super();

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidValueError.prototype);
    }
}

class InvalidDirectiveError extends Error
{
    constructor() {
        super();

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidDirectiveError.prototype);
    }
}

class InvalidAuthorizationCredentialError extends Error
{
    constructor() {
        super();

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidAuthorizationCredentialError.prototype);
    }
}

class NoSuchEndpointError extends Error
{
    constructor() {
        super();

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NoSuchEndpointError.prototype);
    }
}

class EndpointUnreachableError extends Error
{
    constructor() {
        super();

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, EndpointUnreachableError.prototype);
    }
}

class EndpointInternalError extends Error
{
    constructor() {
        super();

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, EndpointInternalError.prototype);
    }}

export default ILinnApiFacade;
export { InvalidAuthorizationCredentialError, NoSuchEndpointError, EndpointUnreachableError, EndpointInternalError, InvalidDirectiveError, InvalidValueError };