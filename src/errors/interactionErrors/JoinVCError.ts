import BaseError from "../BaseError";

export default class JoinVCError extends BaseError {
    constructor(message: string = "Join a voice channel") {
        super(message);
    }
}