import BaseError from "../baseError";

export default class ChannelAccessError extends BaseError {
    constructor(message: string = "I am not able to join your channel / speak in there.") {
        super(message);
    }
}