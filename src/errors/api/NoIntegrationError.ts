import { RequestStatuses } from "../../typings/api";
import APIRequestError from "./ApiRequestError";

export default class NoIntegrationError extends APIRequestError {
    constructor(message: string = "You have no integration with Litminka.ru") {
        super(message, RequestStatuses.BadRequest);
    }
}