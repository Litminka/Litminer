import { RequestStatuses } from "../../typings/api";
import APIRequestError from "./ApiRequestError";

export default class NotFoundError extends APIRequestError {
    constructor(message: unknown = "Not found") {
        super(message, RequestStatuses.NotFound);
    }
}