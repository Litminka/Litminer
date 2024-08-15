import BaseError from "../baseError";

export default class NoTracksError extends BaseError {
    constructor(message: string = "No tracks found") {
        super(message);
    }
}