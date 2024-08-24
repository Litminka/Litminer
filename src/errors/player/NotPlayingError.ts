import BaseError from "../BaseError";

export default class NotPlayingError extends BaseError {
    constructor(message: string = "I'm not playing anything") {
        super(message);
    }
}