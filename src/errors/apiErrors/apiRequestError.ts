import { RequestStatuses } from "../../typings/api";
import BaseError from "../baseError";

export default class APIRequestError extends BaseError{
    constructor(message: any, status: RequestStatuses){
        super(`[${status}] ${message}`);
    }
}