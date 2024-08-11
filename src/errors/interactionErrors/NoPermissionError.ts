import BaseError from "../BaseError";

export default class NoPermissionError extends BaseError {
    constructor(message: string = "You have no permission to use this command") {
        super(message);
    }
}