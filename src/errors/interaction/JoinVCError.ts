import BaseError from "../baseError";

export default class JoinVCError extends BaseError {
    constructor(message: string = "Join a voice channel") {
        super(message);
    }
}