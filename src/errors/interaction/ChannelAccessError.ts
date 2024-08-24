import BaseError from "../BaseError";

export default class ChannelAccessError extends BaseError {
    constructor(message: string = "I am not able to join your channel / speak in there.") {
        super(message);
    }
}