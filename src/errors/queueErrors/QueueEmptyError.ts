import BaseError from "../baseError";

export default class QueueEmptyError extends BaseError {
    constructor(message: string = "Queue is empty") {
        super(message);
    }
}