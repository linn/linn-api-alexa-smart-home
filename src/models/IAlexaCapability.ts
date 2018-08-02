interface IAlexaCapability {
    interface: string,
    version: string,
    type: string
}

class AlexaCapability implements IAlexaCapability {
    interface = "Alexa";
    type = "AlexaInterface";
    version = "3";
}

class AlexaPowerController implements IAlexaCapability {
    interface = "Alexa.PowerController";
    type = "AlexaInterface";
    version = "3";
}

class AlexaSpeaker implements IAlexaCapability {
    interface = "Alexa.Speaker";
    type = "AlexaInterface";
    version = "3";
}

class AlexaStepSpeaker implements IAlexaCapability {
    interface = "Alexa.StepSpeaker";
    type = "AlexaInterface";
    version = "3";
}

class AlexaPlaybackController implements IAlexaCapability {
    interface = "Alexa.PlaybackController";
    type = "AlexaInterface";
    version = "3";
}

export { IAlexaCapability }
export { AlexaCapability }
export { AlexaPowerController }
export { AlexaPlaybackController }
export { AlexaSpeaker }
export { AlexaStepSpeaker }