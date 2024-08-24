import { RequestStatuses } from "../../typings/api";
import BaseError from "../BaseError";

export default class APIRequestError extends BaseError{
    constructor(message: string, status: RequestStatuses){
        super(`[${status}] ${message}`);
    }
}