import BaseError from "../BaseError";

export default class NoIntegrationError extends BaseError {
    constructor(message: string = "You have no integration with Litminka.ru") {
        super(message);
    }
}