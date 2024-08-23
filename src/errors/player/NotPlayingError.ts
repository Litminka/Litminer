import BaseError from "../baseError";

export default class NotPlayingError extends BaseError {
    constructor(message: string = "I'm not playing anything") {
        super(message);
    }
}