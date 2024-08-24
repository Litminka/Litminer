import BaseError from "../BaseError";

export default class ConnectionError extends BaseError {
    constructor(message: string = "I'm not connected") {
        super(message);
    }
}