import BaseError from "../BaseError";

export default class QueueEmptyError extends BaseError {
    constructor(message: string = "Queue is empty") {
        super(message);
    }
}