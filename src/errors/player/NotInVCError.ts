import BaseError from "../BaseError";

export default class NotInVCError extends BaseError {
    constructor(message: string = "You need to be in my Voice Channel") {
        super(message);
    }
}